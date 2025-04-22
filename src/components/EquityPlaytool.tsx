import { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Tooltip as RechartsTooltip } from 'recharts';
import './EquityPlaytool.css';

interface FundingRound {
  name: string;
  dilution: number;
  valuation: number;
}

const Tooltip = ({ content }: { content: string }) => (
  <div className="tooltip">
    <div className="tooltip-icon">?</div>
    <div className="tooltip-content">{content}</div>
  </div>
);

export default function EquityPlaytool() {
  const [initialEquity, setInitialEquity] = useState(0.3);
  const [fundingRounds, setFundingRounds] = useState<FundingRound[]>([
    { name: 'Seed', dilution: 20, valuation: 25_000_000 },
    { name: 'Series A', dilution: 25, valuation: 75_000_000 },
    { name: 'Series B', dilution: 20, valuation: 200_000_000 },
    { name: 'Series C', dilution: 15, valuation: 500_000_000 },
    { name: 'Series D: Unicorn', dilution: 10, valuation: 1_000_000_000 },
    { name: 'Series E: Mega Success', dilution: 10, valuation: 50_000_000_000 },
  ]);

  const calculateEquityOverTime = () => {
    let currentEquity = initialEquity;
    return fundingRounds.map(round => {
      currentEquity *= (100 - round.dilution) / 100;
      return {
        stage: round.name,
        equity: currentEquity,
        value: (currentEquity / 100) * round.valuation,
        valuation: round.valuation,
      };
    });
  };

  const equityData = calculateEquityOverTime();

  const formatCurrency = (value: number, currency: 'USD' | 'INR' = 'USD') => {
    const options: Intl.NumberFormatOptions = {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 2,
    };
    
    if (currency === 'INR') {
      // Convert USD to INR (using approximate rate)
      value = value * 82.5;
    }
    
    return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'en-IN', options).format(value);
  };

  const formatValuation = (value: number) => {
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(1)}B`;
    }
    return `$${(value / 1_000_000).toFixed(0)}M`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(3)}%`;
  };

  // Custom log scale formatter for Y-axis
  const logScaleFormatter = (value: number) => {
    if (value === 0) return '0';
    const exp = Math.floor(Math.log10(value));
    if (exp < 6) return formatValuation(value);
    const base = value / Math.pow(10, exp);
    return `${base.toFixed(1)}e${exp}`;
  };

  return (
    <div className="equity-playtool">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <header className="header">
            <h1 className="title">Equity Playtool</h1>
            <p className="subtitle">Visualize your equity journey through each funding round</p>
          </header>

          {/* Initial Equity Input */}
          <div className="card">
            <div className="input-group">
              <label className="input-label">
                Initial Equity Percentage
                <Tooltip content="The percentage of company ownership you start with. For early employees, this typically ranges from 0.1% to 1%." />
                <span className="input-value">
                  (Current: {formatPercentage(initialEquity)})
                </span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={initialEquity}
                onChange={(e) => setInitialEquity(parseFloat(e.target.value))}
                className="range-input"
              />
              <div className="range-labels">
                <span>0%</span>
                <span>1%</span>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="card">
            <h2 className="section-title">
              Journey Visualization
              <Tooltip content="Track your equity percentage, company valuation, and your equity value through different funding stages." />
            </h2>
            <div className="chart-grid">
              {/* Equity Percentage Chart */}
              <div className="chart-card">
                <h3 className="chart-title">
                  Your Equity Percentage
                  <Tooltip content="Shows how your ownership percentage changes with each funding round due to dilution." />
                </h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={equityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <XAxis dataKey="stage" stroke="#000202" />
                      <YAxis tickFormatter={formatPercentage} stroke="#AA3BFF" />
                      <RechartsTooltip formatter={(value: number) => formatPercentage(value)} />
                      <Line
                        type="monotone"
                        dataKey="equity"
                        stroke="#AA3BFF"
                        strokeWidth={2}
                        name="Equity"
                        dot={{ stroke: '#AA3BFF', strokeWidth: 2, r: 3, fill: '#F6FBFF' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Company Valuation Chart */}
              <div className="chart-card">
                <h3 className="chart-title">
                  Company Valuation
                  <Tooltip content="Shows how the company's total value grows through different funding stages." />
                </h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={equityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <XAxis dataKey="stage" stroke="#000202" />
                      <YAxis
                        scale="log"
                        domain={['auto', 'auto']}
                        tickFormatter={logScaleFormatter}
                        stroke="#000202"
                      />
                      <RechartsTooltip formatter={(value: number) => formatValuation(value)} />
                      <Line
                        type="monotone"
                        dataKey="valuation"
                        stroke="#000202"
                        strokeWidth={2}
                        name="Valuation"
                        dot={{ stroke: '#000202', strokeWidth: 2, r: 3, fill: '#F6FBFF' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Your Value Chart */}
              <div className="chart-card">
                <h3 className="chart-title">
                  Your Equity Value
                  <Tooltip content="Shows the dollar value of your equity based on the company's valuation at each stage." />
                </h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={equityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <XAxis dataKey="stage" stroke="#000202" />
                      <YAxis
                        scale="log"
                        domain={['auto', 'auto']}
                        tickFormatter={logScaleFormatter}
                        stroke="#06B58D"
                      />
                      <RechartsTooltip
                        formatter={(value: number) => [
                          formatCurrency(value),
                          formatCurrency(value, 'INR')
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#06B58D"
                        strokeWidth={2}
                        name="Value"
                        dot={{ stroke: '#06B58D', strokeWidth: 2, r: 3, fill: '#F6FBFF' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Funding Rounds Table */}
          <div className="card">
            <h2 className="section-title">
              Funding Rounds Details
              <Tooltip content="Each funding round typically involves selling company shares to investors, which leads to dilution of existing shareholders." />
            </h2>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>
                      Stage
                      <Tooltip content="Different stages of company growth and funding, from early seed stage to potential unicorn status ($1B+ valuation)." />
                    </th>
                    <th>
                      Dilution
                      <Tooltip content="The percentage by which your ownership is reduced in each round. Typical dilution ranges from 15-25% per round." />
                    </th>
                    <th>
                      Valuation
                      <Tooltip content="The total value of the company at each stage. This typically increases significantly with each funding round." />
                    </th>
                    <th>
                      Your Equity
                      <Tooltip content="Your remaining ownership percentage after dilution from each funding round." />
                    </th>
                    <th>
                      Your Value
                      <Tooltip content="The dollar value of your equity based on the company's valuation at each stage." />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {equityData.map((round, index) => (
                    <tr key={round.stage}>
                      <td>{round.stage}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={fundingRounds[index].dilution}
                          onChange={(e) => {
                            const newRounds = [...fundingRounds];
                            newRounds[index].dilution = parseFloat(e.target.value);
                            setFundingRounds(newRounds);
                          }}
                          className="input-number"
                        />
                        <span className="percent-symbol">%</span>
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="1000000"
                          value={fundingRounds[index].valuation}
                          onChange={(e) => {
                            const newRounds = [...fundingRounds];
                            newRounds[index].valuation = parseFloat(e.target.value);
                            setFundingRounds(newRounds);
                          }}
                          className="input-number valuation"
                        />
                        <span className="valuation-format">({formatValuation(fundingRounds[index].valuation)})</span>
                      </td>
                      <td className="equity-value">{formatPercentage(round.equity)}</td>
                      <td>
                        <div className="value-cell">
                          <span className="value-usd">{formatCurrency(round.value)}</span>
                          <span className="value-inr">{formatCurrency(round.value, 'INR')}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card">
            <h2 className="section-title">Key Assumptions & Disclaimers</h2>
            <ul className="info-list" style={{ paddingLeft: '1rem', textAlign: 'left' }}>
              <li><strong style={{ color: '#AA3BFF' }}>Illustrative Valuation:</strong> Based on today’s valuation and exit assumptions.</li>
              <li><strong style={{ color: '#AA3BFF' }}>Vesting & Acceleration:</strong> Equity vests over 4 years with a 1 year cliff. Any unvested shares are forfeited if you leave early.</li>
              <li><strong style={{ color: '#AA3BFF' }}>Liquidity:</strong> Private shares remain illiquid until an exit event (e.g., IPO, acquisition) or company‑sponsored buyback.</li>
              <li><strong style={{ color: '#AA3BFF' }}>High‑Risk Nature:</strong> Startups may never reach a liquidity event. Your equity’s value depends on the company’s success and your confidence in it.</li>
              <li><strong style={{ color: '#AA3BFF' }}>Disclaimer:</strong> This tool is for educational purposes only and is not legally binding.</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
