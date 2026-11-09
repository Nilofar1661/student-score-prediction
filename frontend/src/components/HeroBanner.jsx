import React from 'react';
import { Sparkles, CheckCircle2, Target } from 'lucide-react';

export default function HeroBanner({ presets, onSelectPreset }) {
  return (
    <section className="hero-banner">
      <div className="hero-tag">
        <Sparkles size={14} />
        Score Prediction
      </div>

      <h1 className="hero-headline">
        Predict Student <span>Exam Scores</span>
      </h1>

      <p className="hero-lead">
        Enter study habits and lifestyle details to estimate exam performance.
      </p>

      {/* Preset Profiles Quick Action */}
      {presets && presets.length > 0 && (
        <div className="presets-bar">
          <span className="presets-label">
            <Target size={14} /> Demo Profiles:
          </span>
          {presets.map((preset) => (
            <button
              key={preset.id}
              className="preset-chip"
              onClick={() => onSelectPreset(preset.data)}
              title={preset.description}
            >
              <CheckCircle2 size={13} style={{ color: '#38bdf8' }} />
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
