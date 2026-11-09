import React from 'react';
import { 
  BarChart, 
  TrendingUp, 
  Clock, 
  Smile, 
  Layers, 
  Info,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import FALLBACK_EDA from '../assets/eda_summary.json';

export default function PerformanceAnalytics({ insights, onRefresh, isOnline }) {
  // Use live API insights if available, otherwise use cohort baseline data
  const eda = insights?.eda_summary || FALLBACK_EDA;
  const scoreDist = eda?.score_distribution || [];
  const studyVsScore = eda?.study_hours_vs_score || [];
  const attVsScore = eda?.attendance_vs_score || [];
  const mhVsScore = eda?.mental_health_vs_score || [];
  const featureCoefs = eda?.feature_coefficients || [];
  const dsMetrics = eda?.dataset_metrics;

  const maxScoreCount = Math.max(...scoreDist.map(s => s.count), 1);
  const maxCoef = Math.max(...featureCoefs.map(c => Math.abs(c.coefficient)), 1);

  return (
    <div className="analytics-section" id="performance-analytics-section">
      {/* Offline / Connecting Notice */}
      {!isOnline && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '12px',
          padding: '12px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#fbbf24',
          fontSize: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>
              Backend is connecting. Displaying cohort baseline analytics.
            </span>
          </div>
          {onRefresh && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={onRefresh}
              style={{ fontSize: '0.78rem', padding: '4px 10px', gap: '5px' }}
            >
              <RefreshCw size={13} />
              Retry
            </button>
          )}
        </div>
      )}

      {/* Overview Metric Cards */}
      {dsMetrics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '28px' }}>
          <div className="glass-card" style={{ padding: '16px' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Cohort Size</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-heading)' }}>
              {dsMetrics.total_students.toLocaleString()} Students
            </div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>Student records</div>
          </div>

          <div className="glass-card" style={{ padding: '16px' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Average Score</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-heading)' }}>
              {dsMetrics.mean_exam_score} / 100
            </div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>Cohort average</div>
          </div>

          <div className="glass-card" style={{ padding: '16px' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Pass Rate</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-heading)' }}>
              {dsMetrics.pass_rate_pct}%
            </div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>Passing grades (≥ 50)</div>
          </div>

          <div className="glass-card" style={{ padding: '16px' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Average Study Time</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#818cf8', fontFamily: 'var(--font-heading)' }}>
              {dsMetrics.avg_study_hours} hrs/day
            </div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>Attendance: {dsMetrics.avg_attendance}%</div>
          </div>
        </div>
      )}

      {/* Grid: Score Distribution & Feature Coefficients */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        {/* Exam Score Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Score Distribution</h3>
              <p className="chart-subtitle">Number of students in each score range.</p>
            </div>
            <BarChart size={20} style={{ color: '#38bdf8' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '180px', paddingTop: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
            {scoreDist.map((item, i) => {
              const heightPct = ((item.count / maxScoreCount) * 100).toFixed(0);
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700, marginBottom: '4px' }}>
                    {item.count}
                  </span>
                  <div
                    style={{
                      width: '100%',
                      height: `${heightPct}%`,
                      background: 'linear-gradient(180deg, #38bdf8 0%, #0369a1 100%)',
                      borderRadius: '4px 4px 0 0',
                      minHeight: '4px',
                      transition: 'height 0.6s ease-out'
                    }}
                    title={`${item.bin}: ${item.count} students`}
                  />
                  <span style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '6px', whiteSpace: 'nowrap' }}>
                    {item.bin}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '8px' }}>
            <span>Score (0–100)</span>
            <span>Median: {dsMetrics?.median_exam_score || 70.5}</span>
          </div>
        </div>

        {/* Feature Weights */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Key Factors Influencing Scores</h3>
              <p className="chart-subtitle">Relative impact of each factor on the score.</p>
            </div>
            <Layers size={20} style={{ color: '#818cf8' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {featureCoefs.map((f, idx) => {
              const isPos = f.coefficient >= 0;
              const barWidth = ((Math.abs(f.coefficient) / maxCoef) * 100).toFixed(1);
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem' }}>
                  <div style={{ width: '170px', fontWeight: 600, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {f.feature}
                  </div>
                  <div style={{ flex: 1, height: '18px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${barWidth}%`,
                        background: isPos 
                          ? 'linear-gradient(90deg, #059669, #10b981)' 
                          : 'linear-gradient(90deg, #be123c, #f43f5e)',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                  <span style={{ minWidth: '55px', textAlign: 'right', fontWeight: 700, color: isPos ? '#34d399' : '#f43f5e' }}>
                    {isPos ? `+${f.coefficient}` : f.coefficient}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid: Study Hours vs Score & Attendance vs Score */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        {/* Study Hours Trend */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Study Hours vs Score</h3>
              <p className="chart-subtitle">Average score by daily study time.</p>
            </div>
            <Clock size={20} style={{ color: '#38bdf8' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {studyVsScore.map((b, i) => (
              <div key={i} className="bar-chart-row">
                <div className="bar-label">{b.bin}</div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${b.average_score}%`,
                      background: 'linear-gradient(90deg, #0284c7, #38bdf8)'
                    }}
                  >
                    {b.average_score} marks
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Trend */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Attendance vs Score</h3>
              <p className="chart-subtitle">Average score by attendance percentage.</p>
            </div>
            <TrendingUp size={20} style={{ color: '#10b981' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {attVsScore.map((a, i) => (
              <div key={i} className="bar-chart-row">
                <div className="bar-label">{a.bin}</div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${a.average_score}%`,
                      background: 'linear-gradient(90deg, #059669, #10b981)'
                    }}
                  >
                    {a.average_score} marks
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mental Health Rating vs Score */}
      <div className="chart-card">
        <div className="chart-header">
          <div>
            <h3 className="chart-title">Mental Well-being vs Score</h3>
            <p className="chart-subtitle">Average score by well-being rating (1 to 10).</p>
          </div>
          <Smile size={20} style={{ color: '#f59e0b' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '10px', height: '140px', alignItems: 'flex-end', paddingTop: '16px' }}>
          {mhVsScore.map((m, i) => {
            const h = ((m.average_score / 100) * 100).toFixed(0);
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '0.7rem', color: '#f8fafc', fontWeight: 700, marginBottom: '4px' }}>
                  {m.average_score}
                </span>
                <div
                  style={{
                    width: '100%',
                    height: `${h}%`,
                    background: 'linear-gradient(180deg, #f59e0b 0%, #b45309 100%)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.5s ease-out'
                  }}
                  title={`Rating ${m.rating}: ${m.average_score} marks`}
                />
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '6px' }}>
                  {m.rating}★
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="disclaimer-box info">
        <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Note:</strong> Charts are based on records from 1,000 students.
        </div>
      </div>
    </div>
  );
}
