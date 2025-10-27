import React, { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuthService } from '../../services/serviceFactory';
import signUpImage from '../../assets/use_image/sign-up.png';
import OnboardingModal from '../../components/onboarding/OnboardingModal';
import './AuthPages.css';

function SignUpPage({ onSignUp }) {
  const navigate = useNavigate();
  const authService = getAuthService();
  const [showOnboarding, setShowOnboarding] = useState(false); 
  const [currentUser, setCurrentUser] = useState(null); 
  const [formData, setFormData] = useState({
    verificationCode: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isCountdownActive, setIsCountdownActive] = useState(false);

  useEffect(() => {
    let timer;
    console.log('Countdown effect triggered:', { countdown, isCountdownActive });
    if (isCountdownActive && countdown > 0) {
      timer = setTimeout(() => {
        console.log('Decrementing countdown from', countdown, 'to', countdown - 1);
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0 && isCountdownActive) {
      console.log('Countdown finished, disabling');
      setIsCountdownActive(false);
    }
    return () => clearTimeout(timer);
  }, [countdown, isCountdownActive]);

  const handleSendCode = async (e) => {
    e.preventDefault();
    
    if (!formData.email) {
      setErrors({ email: 'Email is required' });
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors({ email: 'Email is invalid' });
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      
      // Call real API to send verification code
      await authService.sendValidationCode(formData.email);
      
      // Start 60 second countdown
      setCountdown(60);
      setIsCountdownActive(true);
      
      // Clear email errors
      setErrors(prev => ({
        ...prev,
        email: ''
      }));
      
    } catch (error) {
      console.error('Error sending verification code:', error);
      
      // Better error handling based on learning version
      if (error.message.includes('Connection failed')) {
        setErrors({ email: 'Connection failed. Please check your internet connection.' });
      } else if (error.message.includes('Email service is taking too long')) {
        setErrors({ email: 'Email service is slow. Please wait and try again.' });
      } else if (error.message.includes('Invalid email address')) {
        setErrors({ email: 'Please enter a valid email address.' });
      } else if (error.message.includes('Server error')) {
        setErrors({ email: 'Email service is temporarily unavailable. Please try again later.' });
      } else {
        setErrors({ email: 'Failed to send verification code. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.verificationCode) {
      newErrors.verificationCode = 'Verification code is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      // Use real authService with verification code
      const userData = await authService.signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        verificationCode: formData.verificationCode
      });
      
      // Store user data
      localStorage.setItem('token', 'session-' + Date.now());
      localStorage.setItem('user', JSON.stringify(userData));
      
      setCurrentUser(userData);
      setShowOnboarding(true);
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ 
        submit: error.response?.data?.error || 
                 error.message || 
                 'Signup failed. Please check your verification code.' 
      });
    } finally {
      setLoading(false);
    }
  };

  // ADD THESE TWO HANDLERS
  const handleOnboardingComplete = (preferences) => {
    const updatedUser = {
      ...currentUser,
      preferences,
      onboardingComplete: true
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    if (onSignUp) {
      onSignUp(updatedUser);
    }
    navigate('/');
  };

  const handleOnboardingSkip = () => {
    const updatedUser = {
      ...currentUser,
      onboardingComplete: true,
      onboardingSkipped: true
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    if (onSignUp) {
      onSignUp(updatedUser);
    }
    navigate('/');
  };

  const handleSocialLogin = (provider) => {
    console.log(`Sign up with ${provider}`);
    // Implement social signup
  };

  return (
    <>  {/* ADD THIS WRAPPER */}
    <div className="auth-page signup-page">
      <div className="auth-container">
        {/* Left Side - Sign Up Form */}
        <div className="signup-form-container">
        <div className="auth-card">
          <div className="auth-header">
              <h1>Sign up</h1>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="name">User name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                  placeholder="Enter your user name"
                className={errors.name ? 'error' : ''}
                disabled={loading}
              />
              <span className="error-text">{errors.name || ''}</span>
            </div>

            <div className="form-group">
                <label htmlFor="email">Email address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                  placeholder="Enter your email address"
                className={errors.email ? 'error' : ''}
                disabled={loading}
              />
              <span className="error-text">{errors.email || ''}</span>
            </div>

            <div className="form-group">
                <label htmlFor="verificationCode">Email Verification</label>
                <div className="verification-input-wrapper">
                  <input
                    type="text"
                    id="verificationCode"
                    name="verificationCode"
                    value={formData.verificationCode}
                    onChange={handleChange}
                    placeholder="Enter verification code"
                    className={errors.verificationCode ? 'error' : ''}
                    disabled={loading}
                  />
                  <button 
                    type="button" 
                    className="send-btn"
                    onClick={handleSendCode}
                    disabled={isCountdownActive || loading}
                  >
                    {isCountdownActive ? `${countdown}s` : 'Send'}
                  </button>
                </div>
                <span className="error-text">{errors.verificationCode || ''}</span>
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                    placeholder="Enter your password"
                  className={errors.password ? 'error' : ''}
                  disabled={loading}
                />
                <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                    )}
                </button>
              </div>
              <span className="error-text">{errors.password || ''}</span>
            </div>

            <div className="form-group">
                <label htmlFor="confirmPassword">Confirm your password</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                    placeholder="Enter your password again"
                  className={errors.confirmPassword ? 'error' : ''}
                  disabled={loading}
                />
                <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex="-1"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                    {showConfirmPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    )}
                </button>
              </div>
              <span className="error-text">{errors.confirmPassword || ''}</span>
            </div>

              <div className="password-hint">
                <p>Use 8 or more characters with a mix of letters, numbers & symbols</p>
              </div>

              {/* REMOVE THIS DUPLICATE SHOW PASSWORD CHECKBOX */}
              {/* <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                    name="showPassword" 
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                  />
                  <span>Show password</span>
              </label>
              </div> */}

              {/* ADD TERMS & CONDITIONS CHECKBOX */}
              <div className="form-group">
                <label className="checkbox-label terms-checkbox">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <span>
                    I agree to the <Link to="/terms" className="link-primary">Terms and Conditions</Link> and <Link to="/privacy" className="link-primary">Privacy Policy</Link>
                  </span>
                </label>
                {errors.agreeTerms && (
                  <span className="error-text" style={{ display: 'block', marginTop: '4px' }}>
                    {errors.agreeTerms}
                  </span>
                )}
              </div>

              <div className="auth-footer">
                <p>
                  Already have an account? 
                  <Link to="/login" className="link-primary"> log in instead</Link>
                </p>
            </div>

            <div className="error-message">{errors.submit || ''}</div>

            <button 
              type="submit" 
              className="btn-submit"
                disabled={loading}
            >
                {loading ? 'Creating account...' : 'Create an account'}
            </button>
          </form>

            <div className="auth-divider">
              <span>Or continue with</span>
            </div>

            <div className="social-buttons">
              <button 
                className="social-btn facebook"
                onClick={() => handleSocialLogin('facebook')}
                disabled={loading}
              >
                <svg className="social-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              <button 
                className="social-btn apple"
                onClick={() => handleSocialLogin('apple')}
                disabled={loading}
              >
                <svg className="social-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              </button>
              <button 
                className="social-btn google"
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
              >
                <svg className="social-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </button>
              <button 
                className="social-btn twitter"
                onClick={() => handleSocialLogin('twitter')}
                disabled={loading}
              >
                <svg className="social-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Promotional Image */}
        <div className="signup-image-container">
          <div className="signup-image-wrapper">
            <img 
              src={signUpImage} 
              alt="Find capable local suppliers" 
              className="signup-promo-image"
            />
            <div className="signup-overlay">
              <div className="signup-overlay-content">
                <div className="signup-overlay-circle"></div>
                <h2>Find capable local suppliers</h2>
                <p>Search 2,700+ ICN-verified companies</p>
                <p>by sector, capability and distance.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* ADD ONBOARDING MODAL */}
    {showOnboarding && currentUser && (
      <OnboardingModal
        user={currentUser}
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    )}
    </>
  );
}

export default SignUpPage;