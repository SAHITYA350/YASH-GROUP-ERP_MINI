import React from 'react';

export default function MetricCard({ label, value, sub, accent = 'green', barWidth = '100%' }) {
  return (
    <div className={`metric-card accent-${accent}`}>
      <span className="metric-label">{label}</span>
      <span className="metric-value">{value}</span>
      <span className="metric-sub">{sub}</span>
      <div className="metric-bar-container">
        <div className="metric-bar-fill" style={{ width: barWidth }}></div>
      </div>
    </div>
  );
}
