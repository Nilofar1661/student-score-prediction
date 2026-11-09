import React from 'react';
import { History, Trash2, Clock, ArrowRight } from 'lucide-react';

export default function PredictionHistory({ history, onDeleteItem, onClearAll, onLoadIntoForm }) {
  const gradeColorMap = {
    'A': '#34d399',
    'B': '#38bdf8',
    'C': '#fbbf24',
    'D': '#fb923c',
    'F': '#f43f5e'
  };

  const formatDate = (isoStr) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' • ' + d.toLocaleDateString();
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="history-section" id="prediction-history-section">
      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={20} style={{ color: '#38bdf8' }} />
              Prediction History
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '2px' }}>
              Saved predictions from this session.
            </p>
          </div>

          {history && history.length > 0 && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onClearAll}
              style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }}
            >
              <Trash2 size={14} />
              Clear All
            </button>
          )}
        </div>
      </div>

      {(!history || history.length === 0) ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Clock size={44} style={{ color: '#64748b', margin: '0 auto 16px', opacity: 0.5 }} />
          <h4 style={{ fontSize: '1.05rem', color: '#94a3b8', marginBottom: '6px' }}>No Saved Predictions</h4>
          <p style={{ fontSize: '0.84rem', color: '#64748b', maxWidth: '380px', margin: '0 auto' }}>
            Submit a student profile in the Predict Scores tab to see predictions saved here.
          </p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item) => {
            const activeColor = gradeColorMap[item.letter_grade] || '#38bdf8';
            return (
              <div key={item.id} className="history-item-card">
                <div className="history-score-col">
                  <div>
                    <div className="history-score-badge" style={{ color: activeColor }}>
                      {Number(item.predicted_score).toFixed(1)}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', textAlign: 'center' }}>
                      Grade {item.letter_grade}
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.96rem', fontWeight: 700, color: '#f8fafc' }}>
                        {item.band}
                      </span>
                      <span style={{ fontSize: '0.74rem', padding: '2px 8px', borderRadius: '9999px', background: item.pass_probability >= 0.5 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)', color: item.pass_probability >= 0.5 ? '#34d399' : '#fb7185' }}>
                        {(item.pass_probability * 100).toFixed(0)}% Pass Chance
                      </span>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                      {item.student_summary}
                    </div>

                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                      {formatDate(item.timestamp)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => onLoadIntoForm(item.inputs)}
                    title="Load these inputs into predictor"
                  >
                    Load Inputs
                    <ArrowRight size={14} />
                  </button>

                  <button
                    type="button"
                    className="btn-icon-danger"
                    onClick={() => onDeleteItem(item.id)}
                    title="Delete record"
                    aria-label="Delete record"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
