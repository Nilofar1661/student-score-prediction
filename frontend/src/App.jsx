import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import PredictionForm from './components/PredictionForm';
import PredictionResult from './components/PredictionResult';
import PerformanceAnalytics from './components/PerformanceAnalytics';
import PredictionHistory from './components/PredictionHistory';
import { AlertCircle } from 'lucide-react';

const DEFAULT_STUDENT = {
  age: 20,
  gender: 'Female',
  study_hours_per_day: 4.5,
  social_media_hours: 2.0,
  netflix_hours: 1.5,
  part_time_job: 'No',
  attendance_percentage: 85.0,
  sleep_hours: 7.0,
  diet_quality: 'Good',
  exercise_frequency: 3,
  parental_education_level: 'Bachelor',
  internet_quality: 'Good',
  mental_health_rating: 7,
  extracurricular_participation: 'No'
};

export default function App() {
  const [activeTab, setActiveTab] = useState('predict');
  const [formData, setFormData] = useState(DEFAULT_STUDENT);
  const [predictionResult, setPredictionResult] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [insights, setInsights] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Initial data loading
  useEffect(() => {
    fetchHealth();
    fetchMetadata();
    fetchInsights();
    fetchHistory();
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHealthStatus(data);
      }
    } catch (err) {
      console.warn('Health check error:', err);
    }
  };

  const fetchMetadata = async () => {
    try {
      const res = await fetch('/api/metadata');
      if (res.ok) {
        const data = await res.json();
        setMetadata(data);
      }
    } catch (err) {
      console.warn('Metadata fetch error:', err);
    }
  };

  const fetchInsights = async () => {
    try {
      const res = await fetch('/api/insights');
      if (res.ok) {
        const data = await res.json();
        setInsights(data);
      }
    } catch (err) {
      console.warn('Insights fetch error:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.warn('History fetch error:', err);
    }
  };

  const handlePredict = async (payload) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || errJson?.detail || 'Prediction failed. Please check inputs.');
      }

      const result = await res.json();
      setPredictionResult(result);
      fetchHistory(); // Refresh history
      
      // Smooth scroll to results
      setTimeout(() => {
        const resEl = document.getElementById('prediction-result-panel');
        if (resEl) {
          resEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err) {
      setApiError(err.message || 'Error connecting to prediction server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = (presetData) => {
    setFormData(presetData);
    setPredictionResult(null);
    setApiError(null);
    setActiveTab('predict');
  };

  const handleReset = () => {
    setFormData(DEFAULT_STUDENT);
    setPredictionResult(null);
    setApiError(null);
  };

  const handleDeleteHistory = async (id) => {
    try {
      const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHistory(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleClearHistory = async () => {
    try {
      const res = await fetch('/api/history', { method: 'DELETE' });
      if (res.ok) {
        setHistory([]);
      }
    } catch (err) {
      console.error('Clear history error:', err);
    }
  };

  const handleLoadIntoForm = (inputs) => {
    setFormData(inputs);
    setPredictionResult(null);
    setActiveTab('predict');
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        healthStatus={healthStatus}
      />

      {/* API Error Notification */}
      {apiError && (
        <div style={{ background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.35)', borderRadius: '12px', padding: '14px 18px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fb7185' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={20} />
            <div>
              <strong>Alert:</strong> {apiError}
            </div>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setApiError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Tab Content */}
      {activeTab === 'predict' && (
        <>
          <HeroBanner
            presets={metadata?.presets || []}
            onSelectPreset={handleSelectPreset}
          />

          <PredictionForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handlePredict}
            isLoading={isLoading}
            onReset={handleReset}
          />

          {predictionResult && (
            <PredictionResult
              result={predictionResult}
              onBackToForm={() => {
                const el = document.getElementById('student-prediction-form');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          )}
        </>
      )}

      {activeTab === 'analytics' && (
        <PerformanceAnalytics
          insights={insights}
          isOnline={healthStatus?.status === 'healthy'}
          onRefresh={() => {
            fetchHealth();
            fetchInsights();
          }}
        />
      )}

      {activeTab === 'history' && (
        <PredictionHistory
          history={history}
          onDeleteItem={handleDeleteHistory}
          onClearAll={handleClearHistory}
          onLoadIntoForm={handleLoadIntoForm}
        />
      )}

      {/* Footer */}
      <footer className="footer" style={{ marginTop: '60px', textAlign: 'center', padding: '24px 0', borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <p>
          <strong>EduPredict</strong> — Student Score Predictor
        </p>
      </footer>
    </div>
  );
}
