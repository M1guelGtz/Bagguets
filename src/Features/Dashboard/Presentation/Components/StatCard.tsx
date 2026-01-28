import React from 'react';
import './StatCard.css';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
}) => {
  const getChangeClass = () => {
    if (change === undefined || change === 0) return 'neutral';
    return change > 0 ? 'positive' : 'negative';
  };

  const getChangeSymbol = () => {
    if (change === undefined || change === 0) return '';
    return change > 0 ? '↑' : '↓';
  };

  return (
    <div className="stat-card">
      {icon && <div className="stat-icon">{icon}</div>}
      <h3>{title}</h3>
      <div className="value">{value}</div>
      {change !== undefined && (
        <div className={`change ${getChangeClass()}`}>
          <span>{getChangeSymbol()}</span>
          <span>{Math.abs(change).toFixed(2)}%</span>
          {changeLabel && <span>{changeLabel}</span>}
        </div>
      )}
    </div>
  );
};
