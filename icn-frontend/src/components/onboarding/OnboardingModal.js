import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OnboardingModal.css';

function OnboardingModal({ user, onComplete, onSkip }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState({
    userType: '',
    industries: [],
    companySize: '',
    searchRadius: '50'
  });

  // Debug logging
  useEffect(() => {
    console.log('OnboardingModal mounted');
    console.log('User:', user);
    console.log('Current Step:', currentStep);
    console.log('Preferences:', preferences);
  }, [user, currentStep, preferences]);

  const questions = [
    {
      id: 'userType',
      title: 'Welcome! How will you use ICN Navigator?',
      type: 'single',
      options: [
        { 
          value: 'buyer', 
          label: 'Finding suppliers', 
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
          )
        },
        { 
          value: 'supplier', 
          label: 'Listing my company', 
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          )
        },
        { 
          value: 'both', 
          label: 'Both', 
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            </svg>
          )
        }
      ]
    },
    {
      id: 'industries',
      title: 'Which industries interest you?',
      subtitle: 'Select up to 3',
      type: 'multiple',
      maxSelect: 3,
      options: [
        { value: 'Manufacturing', label: 'Manufacturing' },
        { value: 'Technology', label: 'Technology' },
        { value: 'Logistics', label: 'Logistics' },
        { value: 'Services', label: 'Services' },
        { value: 'Construction', label: 'Construction' },
        { value: 'Automotive', label: 'Automotive' }
      ]
    },
    {
      id: 'companySize',
      title: 'Preferred company size?',
      type: 'single',
      options: [
        { 
          value: 'small', 
          label: 'Small (1-99)', 
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          )
        },
        { 
          value: 'medium', 
          label: 'Medium (100-499)', 
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
          )
        },
        { 
          value: 'large', 
          label: 'Large (500+)', 
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18"/>
              <path d="M5 21V7l8-4v18"/>
              <path d="M19 21V11l-6-4"/>
            </svg>
          )
        },
        { 
          value: 'any', 
          label: 'Any size', 
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          )
        }
      ]
    },
    {
      id: 'searchRadius',
      title: 'How far should we search?',
      type: 'slider',
      min: 5,
      max: 200,
      step: 5,
      unit: 'km'
    }
  ];

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleSingleSelect = (value) => {
    console.log('Single select:', value);
    setPreferences({
      ...preferences,
      [currentQuestion.id]: value
    });
  };

  const handleMultipleSelect = (value) => {
    console.log('Multiple select:', value);
    const current = preferences[currentQuestion.id] || [];
    const maxSelect = currentQuestion.maxSelect || 999;
    
    if (current.includes(value)) {
      setPreferences({
        ...preferences,
        [currentQuestion.id]: current.filter(v => v !== value)
      });
    } else if (current.length < maxSelect) {
      setPreferences({
        ...preferences,
        [currentQuestion.id]: [...current, value]
      });
    }
  };

  const handleSliderChange = (e) => {
    const value = e.target.value;
    console.log('Slider change:', value);
    setPreferences({
      ...preferences,
      [currentQuestion.id]: value
    });
  };

  const handleNext = () => {
    console.log('Next clicked, current step:', currentStep);
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    console.log('Back clicked');
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    console.log('Skip clicked');
    if (onSkip) {
      onSkip();
    } else {
      // Fallback if onSkip is not provided
      navigate('/');
    }
  };

  const completeOnboarding = () => {
    console.log('Completing onboarding with preferences:', preferences);
    if (onComplete) {
      onComplete(preferences);
    } else {
      // Fallback if onComplete is not provided
      navigate('/');
    }
  };

  const isCurrentAnswered = () => {
    const value = preferences[currentQuestion.id];
    if (currentQuestion.type === 'multiple') {
      return value && value.length > 0;
    }
    return value !== undefined && value !== '';
  };

  return (
    <div className="onboarding-overlay" style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div className="onboarding-modal" style={{
        background: 'white',
        borderRadius: '20px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Header */}
        <div className="onboarding-header" style={{ padding: '20px 20px 0', position: 'relative' }}>
          <div className="progress-bar" style={{
            height: '4px',
            background: '#E5E5E5',
            borderRadius: '2px',
            overflow: 'hidden',
            marginBottom: '16px'
          }}>
            <div className="progress-fill" style={{
              height: '100%',
              background: '#F6CA8B',
              transition: 'width 0.3s ease',
              borderRadius: '2px',
              width: `${progress}%`
            }} />
          </div>
          <button 
            className="skip-btn"
            onClick={handleSkip}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'none',
              border: 'none',
              color: '#666',
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Skip for now
          </button>
        </div>

        {/* Question Content */}
        <div className="question-content" style={{ padding: '32px 20px', minHeight: '300px' }}>
          <h2 style={{ fontSize: '24px', color: '#003366', marginBottom: '8px', textAlign: 'center' }}>
            {currentQuestion.title}
          </h2>
          {currentQuestion.subtitle && (
            <p style={{ color: '#666', textAlign: 'center', marginBottom: '32px', fontSize: '14px' }}>
              {currentQuestion.subtitle}
            </p>
          )}

          {/* Single Choice Options */}
          {currentQuestion.type === 'single' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginTop: '32px' }}>
              {currentQuestion.options.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleSingleSelect(option.value)}
                  style={{
                    background: preferences[currentQuestion.id] === option.value ? '#FEECD2' : 'white',
                    border: `2px solid ${preferences[currentQuestion.id] === option.value ? '#F6CA8B' : '#E5E5E5'}`,
                    borderRadius: '12px',
                    padding: '24px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {option.icon && <span style={{ fontSize: '32px' }}>{option.icon}</span>}
                  <span style={{ fontSize: '14px', color: '#333', fontWeight: '500' }}>{option.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Multiple Choice Options */}
          {currentQuestion.type === 'multiple' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: '32px' }}>
              {currentQuestion.options.map(option => {
                const isSelected = (preferences[currentQuestion.id] || []).includes(option.value);
                const isDisabled = !isSelected && (preferences[currentQuestion.id] || []).length >= currentQuestion.maxSelect;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => !isDisabled && handleMultipleSelect(option.value)}
                    disabled={isDisabled}
                    style={{
                      background: isSelected ? '#F6CA8B' : 'white',
                      border: `2px solid ${isSelected ? '#F6CA8B' : '#E5E5E5'}`,
                      borderRadius: '24px',
                      padding: '12px 20px',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      color: isSelected ? 'white' : '#333',
                      opacity: isDisabled ? 0.5 : 1,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: isSelected ? 'white' : '#E5E5E5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: isSelected ? '#F6CA8B' : '#666'
                    }}>
                      {isSelected ? '✓' : '+'}
                    </span>
                    {option.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Slider Option */}
          {currentQuestion.type === 'slider' && (
            <div style={{ padding: '32px 24px' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <span style={{ fontSize: '48px', fontWeight: 'bold', color: '#1B3E6F' }}>
                  {preferences[currentQuestion.id] || currentQuestion.min}
                </span>
                <span style={{ fontSize: '24px', color: '#666', marginLeft: '8px' }}>
                  {currentQuestion.unit}
                </span>
              </div>
              <input
                type="range"
                min={currentQuestion.min}
                max={currentQuestion.max}
                step={currentQuestion.step}
                value={preferences[currentQuestion.id] || currentQuestion.min}
                onChange={handleSliderChange}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  background: '#E5E5E5',
                  outline: 'none',
                  WebkitAppearance: 'none'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: '#999' }}>
                <span>{currentQuestion.min}{currentQuestion.unit}</span>
                <span>{currentQuestion.max}{currentQuestion.unit}</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ padding: '0 20px 20px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          {currentStep > 0 && (
            <button 
              onClick={handleBack}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                border: '2px solid #E5E5E5',
                borderRadius: '8px',
                color: '#666',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Back
            </button>
          )}
          <button 
            onClick={handleNext}
            disabled={!isCurrentAnswered()}
            style={{
              padding: '12px 32px',
              background: isCurrentAnswered() ? '#F6CA8B' : '#ccc',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontWeight: '600',
              cursor: isCurrentAnswered() ? 'pointer' : 'not-allowed',
              minWidth: '120px'
            }}
          >
            {currentStep === questions.length - 1 ? 'Get Started' : 'Next'}
          </button>
        </div>

        {/* Step Indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '20px' }}>
          {questions.map((_, index) => (
            <span 
              key={index}
              style={{
                width: index === currentStep ? '24px' : '8px',
                height: '8px',
                borderRadius: index === currentStep ? '4px' : '50%',
                background: index === currentStep ? '#F6CA8B' : index < currentStep ? '#B6D289' : '#E5E5E5',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default OnboardingModal;