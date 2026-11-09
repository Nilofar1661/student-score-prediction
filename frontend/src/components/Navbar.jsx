import React from 'react';
import { GraduationCap, BarChart3, History, Sparkles } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, healthStatus }) {
  return (
    <header className="navbar">
      <div className="brand">
        <div className="brand-icon-wrapper">
          <GraduationCap size={24} />
        </div>
        <div>
          <div className="brand-title">
            EduPredict
            <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '9999px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', verticalAlign: 'middle', marginLeft: '6px' }}>
              v1.0
            </span>
          </div>
          <div className="brand-subtitle">Student Score Predictor</div>
        </div>
      </div>

      <nav className="nav-tabs">
        <button
          className={`nav-tab-btn ${activeTab === 'predict' ? 'active' : ''}`}
          onClick={() => setActiveTab('predict')}
        >
          <Sparkles size={16} />
          Predict Scores
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 size={16} />
          Analytics
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <History size={16} />
          History
        </button>
      </nav>

      <div className="status-indicator" title={healthStatus?.status === 'healthy' ? 'Service is operational' : 'Connecting to API...'}>
        <div className="status-dot" style={{ background: healthStatus?.status === 'healthy' ? '#10b981' : '#f59e0b' }} />
        <span>{healthStatus?.status === 'healthy' ? 'Online' : 'Connecting...'}</span>
      </div>
    </header>
  );
}
