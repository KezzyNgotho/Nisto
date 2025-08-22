import React, { useState } from 'react';
import { FiSmartphone, FiMonitor, FiTablet, FiX, FiDownload } from 'react-icons/fi';

export default function PWAInstallGuide({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('mobile');

  if (!isOpen) return null;

  const deviceTypes = [
    { id: 'mobile', label: 'Mobile', icon: FiSmartphone },
    { id: 'desktop', label: 'Desktop', icon: FiMonitor },
    { id: 'tablet', label: 'Tablet', icon: FiTablet }
  ];

  const instructions = {
    mobile: {
      chrome: [
        'Open Chrome browser',
        'Tap the menu (⋮) in the top right',
        'Tap "Add to Home screen"',
        'Tap "Add" to confirm'
      ],
      safari: [
        'Open Safari browser',
        'Tap the share button (□↑)',
        'Tap "Add to Home Screen"',
        'Tap "Add" to confirm'
      ],
      firefox: [
        'Open Firefox browser',
        'Tap the menu (☰) in the top right',
        'Tap "Add to Home Screen"',
        'Tap "Add" to confirm'
      ]
    },
    desktop: {
      chrome: [
        'Open Chrome browser',
        'Click the install icon (⬇️) in the address bar',
        'Click "Install" in the popup',
        'Click "Install" to confirm'
      ],
      firefox: [
        'Open Firefox browser',
        'Click the menu (☰) in the top right',
        'Click "Install App"',
        'Click "Install" to confirm'
      ],
      edge: [
        'Open Edge browser',
        'Click the menu (⋯) in the top right',
        'Click "Apps" → "Install this site as an app"',
        'Click "Install" to confirm'
      ]
    },
    tablet: {
      chrome: [
        'Open Chrome browser',
        'Tap the menu (⋮) in the top right',
        'Tap "Add to Home screen"',
        'Tap "Add" to confirm'
      ],
      safari: [
        'Open Safari browser',
        'Tap the share button (□↑)',
        'Tap "Add to Home Screen"',
        'Tap "Add" to confirm'
      ]
    }
  };

  const getCurrentInstructions = () => {
    const device = deviceTypes.find(d => d.id === activeTab);
    if (!device) return [];

    const browser = navigator.userAgent.includes('Chrome') ? 'chrome' :
                   navigator.userAgent.includes('Firefox') ? 'firefox' :
                   navigator.userAgent.includes('Safari') ? 'safari' :
                   navigator.userAgent.includes('Edge') ? 'edge' : 'chrome';

    return instructions[activeTab][browser] || instructions[activeTab].chrome || [];
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(4px)',
      zIndex: 10001,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}
    onClick={onClose}
    >
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '80vh',
        overflow: 'auto',
        position: 'relative'
      }}
      onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ margin: 0, color: '#075B5E', fontSize: '1.5rem', fontWeight: 600 }}>
            Install Nesto App
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#6B7280',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '4px',
              fontSize: '1.25rem'
            }}
            onMouseEnter={(e) => e.target.style.background = '#F3F4F6'}
            onMouseLeave={(e) => e.target.style.background = 'none'}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Device Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid #E5E7EB',
          paddingBottom: '1rem'
        }}>
          {deviceTypes.map(device => {
            const IconComponent = device.icon;
            return (
              <button
                key={device.id}
                onClick={() => setActiveTab(device.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  background: activeTab === device.id ? '#075B5E' : 'transparent',
                  color: activeTab === device.id ? 'white' : '#6B7280',
                  border: '1px solid',
                  borderColor: activeTab === device.id ? '#075B5E' : '#E5E7EB',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== device.id) {
                    e.target.style.background = '#F3F4F6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== device.id) {
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                <IconComponent size={16} />
                {device.label}
              </button>
            );
          })}
        </div>

        {/* Instructions */}
        <div>
          <h3 style={{ margin: '0 0 1rem 0', color: '#374151', fontSize: '1.125rem' }}>
            Installation Steps
          </h3>
          <ol style={{
            margin: 0,
            paddingLeft: '1.5rem',
            color: '#4B5563',
            lineHeight: 1.6
          }}>
            {getCurrentInstructions().map((step, index) => (
              <li key={index} style={{ marginBottom: '0.5rem' }}>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Benefits */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: '#F0F9FF',
          border: '1px solid #BFDBFE',
          borderRadius: '8px'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#075985', fontSize: '1rem' }}>
            Benefits of Installing
          </h4>
          <ul style={{
            margin: 0,
            paddingLeft: '1.5rem',
            color: '#075985',
            fontSize: '0.875rem',
            lineHeight: 1.5
          }}>
            <li>Quick access from your home screen</li>
            <li>Works offline for basic features</li>
            <li>Native app-like experience</li>
            <li>Faster loading times</li>
            <li>No browser tabs needed</li>
          </ul>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          color: '#6B7280',
          fontSize: '0.875rem'
        }}>
          <p style={{ margin: 0 }}>
            Need help? Check your browser's help section for detailed instructions.
          </p>
        </div>
      </div>
    </div>
  );
}
