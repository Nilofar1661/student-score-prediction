import React from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Lightbulb, 
  ArrowLeft, 
  Info,
  Sliders,
  Sparkles
} from 'lucide-react';

export default function PredictionResult({ result, onBackToForm }) {
  if (!result) return null;

  const score = result.predicted_score;
  const grade = result.letter_grade || 'C';
  const band = result.band || 'Satisfactory';
  const passInfo = result.pass_fail || { passed: true, pass_probability: 0.85 };
  const interval = result.statistical_interval_95;

  // Radial progress calculations (circle with r=74 -> circumference = 2 * PI * 74 ~ 465)
  const radius = 74;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  // Grade color map
  const gradeColorMap = {
    'A': '#34d399',
    'B': '#38bdf8',
    'C': '#fbbf24',
    'D': '#fb923c',
    'F': '#f43f5e'
  };
  const activeColor = gradeColorMap[grade] || '#38bdf8';

  return (
    <div className="results-container" id="prediction-result-panel">
      {/* Top Banner with Score Gauge and Key Verdict */}
      <div className="score-hero-card">
        <div className="score-main-grid">
          {/* Radial Gauge */}
          <div className="gauge-wrapper">
            <svg className="gauge-svg" viewBox="0 0 180 180">
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor={activeColor} />
                </linearGradient>
              </defs>
              <circle
                className="gauge-bg-circle"
                cx="90"
                cy="90"
                r={radius}
              />
              <circle
                className="gauge-progress-circle"
                cx="90"
                cy="90"
                r={radius}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="gauge-center-content">
              <div className="gauge-score-num">{score.toFixed(1)}</div>
              <div className="gauge-scale-lbl">Scale: 0–100</div>
              <div className={`grade-badge grade-${grade.toLowerCase()}`}>
                Grade {grade}
              </div>
            </div>
          </div>

          {/* Verdict and Performance Details */}
          <div className="score-details-col">
            <div className="score-title-row">
              <div>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                  Predicted Result
                </span>
                <h2 className="band-title">{band} Performance</h2>
              </div>

              <div className={`pass-fail-badge ${passInfo.passed ? 'pass' : 'fail'}`}>
                {passInfo.passed ? <CheckCircle size={18} /> : <XCircle size={18} />}
                <span>{passInfo.passed ? 'Passing Likely' : 'Support Needed'}</span>
                <span style={{ opacity: 0.8, fontSize: '0.8rem' }}>({(passInfo.pass_probability * 100).toFixed(0)}% chance)</span>
              </div>
            </div>

            {/* Estimated Score Range */}
            {interval && (
              <div className="prediction-interval-box">
                <div className="interval-header">
                  <span>Estimated Score Range</span>
                </div>
                <div className="interval-range-text">
                  [{interval.lower.toFixed(1)} — {interval.upper.toFixed(1)} marks]
                </div>
                <div className="interval-subtext">
                  Expected score range based on student profile.
                </div>
              </div>
            )}

            {/* Warnings if out-of-distribution */}
            {result.warnings && result.warnings.length > 0 && (
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.82rem', color: '#fbbf24', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                <div>
                  {result.warnings.map((w, i) => (
                    <div key={i}>{w}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Drivers and Recommendations */}
      <div className="glass-card drivers-card">
        <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lightbulb size={20} style={{ color: '#38bdf8' }} />
          Key Factors & Recommendations
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px' }}>
          Insights based on this student's profile:
        </p>

        <ul className="drivers-list">
          {result.insights && result.insights.map((insight, idx) => (
            <li key={idx} className="driver-item">
              <Sparkles size={16} className="driver-icon" />
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Submitted Inputs Summary Breakdown */}
      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={18} style={{ color: '#818cf8' }} />
          Submitted Profile
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Daily Study Time</span>
            <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#38bdf8' }}>{result.submitted_inputs?.study_hours_per_day} hrs/day</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Attendance Rate</span>
            <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#f8fafc' }}>{result.submitted_inputs?.attendance_percentage}%</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Mental Well-being</span>
            <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#10b981' }}>{result.submitted_inputs?.mental_health_rating} / 10</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Screen Time (Social + Video)</span>
            <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#f8fafc' }}>
              {(Number(result.submitted_inputs?.social_media_hours || 0) + Number(result.submitted_inputs?.netflix_hours || 0)).toFixed(1)} hrs/day
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Sleep Duration</span>
            <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#f8fafc' }}>{result.submitted_inputs?.sleep_hours} hrs/night</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Exercise & Diet</span>
            <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#f8fafc' }}>
              {result.submitted_inputs?.exercise_frequency} days/wk • {result.submitted_inputs?.diet_quality}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation & Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onBackToForm}
        >
          <ArrowLeft size={16} />
          Adjust Inputs
        </button>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            onBackToForm();
          }}
        >
          <Sparkles size={16} />
          New Prediction
        </button>
      </div>

      {/* Simple Disclaimer */}
      <div className="disclaimer-box">
        <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Note:</strong> Predicted scores are estimates to assist study planning and do not guarantee actual exam results.
        </div>
      </div>
    </div>
  );
}
