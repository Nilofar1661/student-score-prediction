import React, { useState } from 'react';
import { 
  BookOpen, 
  Smartphone, 
  HeartPulse, 
  UserCheck, 
  Sparkles, 
  RotateCcw
} from 'lucide-react';

export default function PredictionForm({ formData, setFormData, onSubmit, isLoading, onReset }) {
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const errs = {};
    if (formData.study_hours_per_day < 0 || formData.study_hours_per_day > 24) {
      errs.study_hours_per_day = 'Study hours must be between 0 and 24.';
    }
    if (formData.attendance_percentage < 0 || formData.attendance_percentage > 100) {
      errs.attendance_percentage = 'Attendance must be between 0% and 100%.';
    }
    if (formData.social_media_hours < 0) {
      errs.social_media_hours = 'Social media hours cannot be negative.';
    }
    if (formData.netflix_hours < 0) {
      errs.netflix_hours = 'Streaming hours cannot be negative.';
    }
    if (formData.sleep_hours < 2 || formData.sleep_hours > 16) {
      errs.sleep_hours = 'Sleep hours must be between 2 and 16.';
    }
    if (formData.age < 15 || formData.age > 35) {
      errs.age = 'Age must be between 15 and 35.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="prediction-form" id="student-prediction-form">
      <div className="form-vertical-container">
        {/* Section 1: Academic Engagement */}
        <div className="form-group-card">
          <div className="group-header">
            <div className="group-icon">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="group-title">Academic Engagement</h3>
            </div>
          </div>

          {/* Daily Study Hours */}
          <div className="input-field-wrapper">
            <div className="field-label-row">
              <label className="field-label" htmlFor="study_hours">Daily Study Hours</label>
              <span className="field-unit">{Number(formData.study_hours_per_day).toFixed(1)} hrs/day</span>
            </div>
            <div className="slider-wrapper">
              <input
                id="study_hours"
                type="range"
                min="0.0"
                max="16.0"
                step="0.1"
                className="slider-input"
                value={formData.study_hours_per_day}
                onChange={(e) => handleChange('study_hours_per_day', parseFloat(e.target.value))}
              />
              <span className="slider-value-badge">{Number(formData.study_hours_per_day).toFixed(1)}h</span>
            </div>
            {errors.study_hours_per_day && <p className="field-error">{errors.study_hours_per_day}</p>}
          </div>

          {/* Attendance Percentage */}
          <div className="input-field-wrapper">
            <div className="field-label-row">
              <label className="field-label" htmlFor="attendance">Attendance Percentage</label>
              <span className="field-unit">{Number(formData.attendance_percentage).toFixed(1)}%</span>
            </div>
            <div className="slider-wrapper">
              <input
                id="attendance"
                type="range"
                min="50.0"
                max="100.0"
                step="0.5"
                className="slider-input"
                value={formData.attendance_percentage}
                onChange={(e) => handleChange('attendance_percentage', parseFloat(e.target.value))}
              />
              <span className="slider-value-badge">{Number(formData.attendance_percentage).toFixed(1)}%</span>
            </div>
            {errors.attendance_percentage && <p className="field-error">{errors.attendance_percentage}</p>}
          </div>

          {/* Extracurricular Participation */}
          <div className="input-field-wrapper" style={{ marginBottom: 0 }}>
            <div className="field-label-row">
              <label className="field-label">Extracurricular Activities</label>
            </div>
            <div className="radio-pill-group">
              <button
                type="button"
                className={`radio-pill-btn ${formData.extracurricular_participation === 'Yes' ? 'selected' : ''}`}
                onClick={() => handleChange('extracurricular_participation', 'Yes')}
              >
                Yes
              </button>
              <button
                type="button"
                className={`radio-pill-btn ${formData.extracurricular_participation === 'No' ? 'selected' : ''}`}
                onClick={() => handleChange('extracurricular_participation', 'No')}
              >
                No
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Daily Habits */}
        <div className="form-group-card">
          <div className="group-header">
            <div className="group-icon" style={{ background: 'rgba(129, 140, 248, 0.1)', color: '#818cf8' }}>
              <Smartphone size={20} />
            </div>
            <div>
              <h3 className="group-title">Daily Habits</h3>
            </div>
          </div>

          {/* Social Media Hours */}
          <div className="input-field-wrapper">
            <div className="field-label-row">
              <label className="field-label" htmlFor="social_media">Social Media Usage</label>
              <span className="field-unit">{Number(formData.social_media_hours).toFixed(1)} hrs/day</span>
            </div>
            <div className="slider-wrapper">
              <input
                id="social_media"
                type="range"
                min="0.0"
                max="8.0"
                step="0.1"
                className="slider-input"
                value={formData.social_media_hours}
                onChange={(e) => handleChange('social_media_hours', parseFloat(e.target.value))}
              />
              <span className="slider-value-badge">{Number(formData.social_media_hours).toFixed(1)}h</span>
            </div>
          </div>

          {/* Netflix / Streaming Hours */}
          <div className="input-field-wrapper">
            <div className="field-label-row">
              <label className="field-label" htmlFor="netflix_hours">Streaming & Video Time</label>
              <span className="field-unit">{Number(formData.netflix_hours).toFixed(1)} hrs/day</span>
            </div>
            <div className="slider-wrapper">
              <input
                id="netflix_hours"
                type="range"
                min="0.0"
                max="6.0"
                step="0.1"
                className="slider-input"
                value={formData.netflix_hours}
                onChange={(e) => handleChange('netflix_hours', parseFloat(e.target.value))}
              />
              <span className="slider-value-badge">{Number(formData.netflix_hours).toFixed(1)}h</span>
            </div>
          </div>

          {/* Part-time Job */}
          <div className="input-field-wrapper" style={{ marginBottom: 0 }}>
            <div className="field-label-row">
              <label className="field-label">Part-Time Job</label>
            </div>
            <div className="radio-pill-group">
              <button
                type="button"
                className={`radio-pill-btn ${formData.part_time_job === 'Yes' ? 'selected' : ''}`}
                onClick={() => handleChange('part_time_job', 'Yes')}
              >
                Yes
              </button>
              <button
                type="button"
                className={`radio-pill-btn ${formData.part_time_job === 'No' ? 'selected' : ''}`}
                onClick={() => handleChange('part_time_job', 'No')}
              >
                No
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Health & Well-being */}
        <div className="form-group-card">
          <div className="group-header">
            <div className="group-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <HeartPulse size={20} />
            </div>
            <div>
              <h3 className="group-title">Health & Well-being</h3>
            </div>
          </div>

          {/* Mental Health Rating */}
          <div className="input-field-wrapper">
            <div className="field-label-row">
              <label className="field-label" htmlFor="mental_health">Mental Well-being</label>
              <span className="field-unit" style={{ color: '#10b981' }}>{formData.mental_health_rating} / 10</span>
            </div>
            <div className="slider-wrapper">
              <input
                id="mental_health"
                type="range"
                min="1"
                max="10"
                step="1"
                className="slider-input"
                value={formData.mental_health_rating}
                onChange={(e) => handleChange('mental_health_rating', parseInt(e.target.value))}
              />
              <span className="slider-value-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                {formData.mental_health_rating}/10
              </span>
            </div>
          </div>

          {/* Sleep Hours */}
          <div className="input-field-wrapper">
            <div className="field-label-row">
              <label className="field-label" htmlFor="sleep_hours">Sleep Duration</label>
              <span className="field-unit">{Number(formData.sleep_hours).toFixed(1)} hrs/night</span>
            </div>
            <div className="slider-wrapper">
              <input
                id="sleep_hours"
                type="range"
                min="3.0"
                max="10.0"
                step="0.5"
                className="slider-input"
                value={formData.sleep_hours}
                onChange={(e) => handleChange('sleep_hours', parseFloat(e.target.value))}
              />
              <span className="slider-value-badge">{Number(formData.sleep_hours).toFixed(1)}h</span>
            </div>
            {errors.sleep_hours && <p className="field-error">{errors.sleep_hours}</p>}
          </div>

          {/* Exercise Frequency - arranged vertically */}
          <div className="input-field-wrapper">
            <div className="field-label-row">
              <label className="field-label" htmlFor="exercise">Exercise Frequency</label>
            </div>
            <select
              id="exercise"
              className="input-control"
              value={formData.exercise_frequency}
              onChange={(e) => handleChange('exercise_frequency', parseInt(e.target.value))}
            >
              {[0, 1, 2, 3, 4, 5, 6, 7].map(d => (
                <option key={d} value={d}>{d} {d === 1 ? 'day' : 'days'} per week</option>
              ))}
            </select>
          </div>

          {/* Diet Quality - arranged vertically below Exercise */}
          <div className="input-field-wrapper" style={{ marginBottom: 0 }}>
            <div className="field-label-row">
              <label className="field-label" htmlFor="diet">Diet Quality</label>
            </div>
            <select
              id="diet"
              className="input-control"
              value={formData.diet_quality}
              onChange={(e) => handleChange('diet_quality', e.target.value)}
            >
              <option value="Poor">Poor</option>
              <option value="Fair">Fair</option>
              <option value="Good">Good</option>
            </select>
          </div>
        </div>

        {/* Section 4: Background & Environment */}
        <div className="form-group-card">
          <div className="group-header">
            <div className="group-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
              <UserCheck size={20} />
            </div>
            <div>
              <h3 className="group-title">Background & Environment</h3>
            </div>
          </div>

          {/* Age - arranged vertically */}
          <div className="input-field-wrapper">
            <div className="field-label-row">
              <label className="field-label" htmlFor="age">Age</label>
              <span className="field-unit">17–25 years</span>
            </div>
            <input
              id="age"
              type="number"
              min="17"
              max="25"
              className="input-control"
              value={formData.age}
              onChange={(e) => handleChange('age', parseInt(e.target.value) || 20)}
            />
            {errors.age && <p className="field-error">{errors.age}</p>}
          </div>

          {/* Gender - arranged vertically below Age */}
          <div className="input-field-wrapper">
            <div className="field-label-row">
              <label className="field-label" htmlFor="gender">Gender</label>
            </div>
            <select
              id="gender"
              className="input-control"
              value={formData.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Parental Education Level - arranged vertically */}
          <div className="input-field-wrapper">
            <div className="field-label-row">
              <label className="field-label" htmlFor="parental_edu">Parental Education Level</label>
            </div>
            <select
              id="parental_edu"
              className="input-control"
              value={formData.parental_education_level}
              onChange={(e) => handleChange('parental_education_level', e.target.value)}
            >
              <option value="No formal education">No Formal Education</option>
              <option value="High School">High School</option>
              <option value="Bachelor">Bachelor's Degree</option>
              <option value="Master">Master's Degree</option>
            </select>
          </div>

          {/* Internet Quality - arranged vertically */}
          <div className="input-field-wrapper" style={{ marginBottom: 0 }}>
            <div className="field-label-row">
              <label className="field-label" htmlFor="internet">Internet Quality</label>
            </div>
            <select
              id="internet"
              className="input-control"
              value={formData.internet_quality}
              onChange={(e) => handleChange('internet_quality', e.target.value)}
            >
              <option value="Poor">Poor</option>
              <option value="Average">Average</option>
              <option value="Good">Good</option>
            </select>
          </div>
        </div>

        {/* Form Action Buttons */}
        <div className="form-actions-row">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onReset}
            disabled={isLoading}
          >
            <RotateCcw size={16} />
            Reset
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            style={{ minWidth: '180px' }}
          >
            {isLoading ? (
              <>
                <div className="status-dot" style={{ background: '#ffffff', width: '8px', height: '8px' }} />
                Predicting...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Predict Score
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
