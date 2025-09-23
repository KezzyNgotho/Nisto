import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const PortfolioChart = ({ data }) => {
  const { theme } = useTheme();

  return (
    <div className="chart-container" style={{
      background: theme.colors.background?.secondary || theme.colors.background,
      borderRadius: '1rem',
      padding: '1.5rem',
      border: `1px solid ${theme.colors.border.primary}`
    }}>
      <h3 style={{ 
        color: theme.colors.text.primary,
        fontSize: '1rem',
        fontWeight: '600',
        marginBottom: '1rem'
      }}>
        Portfolio Performance
      </h3>
      
      {/* Chart placeholder - to be replaced with actual chart library */}
      <div style={{
        width: '100%',
        height: '100%',
        minHeight: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.colors.text.secondary
      }}>
        Chart visualization coming soon...
      </div>
    </div>
  );
};

export default PortfolioChart;