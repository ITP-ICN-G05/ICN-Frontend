import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuthService } from '../../services/serviceFactory';
import forgetPassImage from '../../assets/use_image/forget-pass.jpg';
import './AuthPages.css';

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const authService = getAuthService();
  const [formData, setFormData] = useState({
    email: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
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
    console.log('Send button clicked!', { email: formData.email, countdown, isCountdownActive });
    
    // Temporarily remove email validation for testing countdown functionality
    // if (!formData.email) {
    //   setErrors({ email: 'Email is required' });
    //   return;
    // }
    if (!formData.email) {
      setErrors({ email: 'Email is required' });
      return;
    }
    
    // if (!/\S+@\S+\.\S+/.test(formData.email)) {
    //   setErrors({ email: 'Email is invalid' });
    //   return;
    // }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors({ email: 'Email is invalid' });
      return;
    }
  
    try {
      console.log('Starting verification process...');
      setLoading(true);
      setErrors({});
      
      // Use real authService to send code
      await authService.sendValidationCode(formData.email);
      
      // Start countdown
      setCountdown(60);
      setIsCountdownActive(true);
      
    } catch (error) {
      console.error('Error sending verification code:', error);
      setErrors({ submit: 'Failed to send verification code. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.verificationCode) {
      newErrors.verificationCode = 'Verification code is required';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      // Use resetPassword method which handles verification code validation
      await authService.resetPassword(
        formData.email, 
        formData.verificationCode, 
        formData.newPassword
      );
      
      navigate('/login', { 
        state: { message: 'Password reset successfully. Please log in with your new password.' }
      });
    } catch (error) {
      console.error('Password reset error:', error);
      setErrors({ 
        submit: error.response?.data?.error || 
                 error.message || 
                 'Password reset failed. Please check your verification code.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page forgot-password-page">
      <div className="auth-container">
        {/* Left Side - Forgot Password Form */}
        <div className="forgot-password-form-container">
          <div className="auth-card">
            <div className="auth-header">
              <h1>Reset your password</h1>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
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
                    placeholder="Verify your email address"
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
                <label htmlFor="newPassword">Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Enter your new password"
                    className={errors.newPassword ? 'error' : ''}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    tabIndex="-1"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? (
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
                <span className="error-text">{errors.newPassword || ''}</span>
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

              <div className="error-message">{errors.submit || ''}</div>

              <button 
                type="submit" 
                className="btn-submit"
                disabled={loading}
              >
                {loading ? 'Resetting password...' : 'Confirm'}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Already have an account? 
                <Link to="/login" className="link-primary"> Log in</Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Promotional Image */}
        <div className="forgot-password-image-container">
          <div className="forgot-password-image-wrapper">
            <img 
              src={forgetPassImage} 
              alt="Showcase your company" 
              className="forgot-password-promo-image"
            />
            <div className="forgot-password-overlay">
              <div className="forgot-password-overlay-content">
                <div className="forgot-password-overlay-circle"></div>
                <h2>Showcase your company</h2>
                  <p>Claim your profile, add capabilities and</p>
                  <p>get discovered by buyers.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;