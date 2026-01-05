import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setErrors({});
    setUsername('');
    setPassword('');
  }, [role]);

  const validate = () => {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setLoading(true);
    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      navigate(`/${role}-dashboard`);
    } else {
      setErrors({ submit: result.message });
    }
  };

  return (
    <div className="login-page">
      {/* Left Section - Welcome Panel */}
      <div className="login-welcome-panel">
        <div className="welcome-content">
          <div className="welcome-text-section">
            <h1 className="welcome-heading">Internal Assessment Portal</h1>
            
            <div className="feature-cards">
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11l3 3L22 4"/>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                </div>
                <h3>Track Progress</h3>
                <p>Monitor your academic performance</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <line x1="9" y1="3" x2="9" y2="21"/>
                    <line x1="3" y1="9" x2="21" y2="9"/>
                  </svg>
                </div>
                <h3>View Marks</h3>
                <p>Access detailed assessment results</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <h3>Stay Informed</h3>
                <p>Get real-time academic updates</p>
              </div>
            </div>
            </div>

          <div className="welcome-graphics">
            <div className="graphic-shape shape-1"></div>
            <div className="graphic-shape shape-2"></div>
            <div className="graphic-shape shape-3"></div>
            <div className="graphic-shape shape-4"></div>
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="login-form-panel">
        <div className="form-wrapper">
          <h2 className="form-title">User Login</h2>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="role-selector">
                Select your role
                <span className="label-hint">Choose Student or Faculty to continue</span>
              </label>
              <div className="role-selector" id="role-selector">
                <button
                  type="button"
                  className={`role-btn ${role === 'student' ? 'active' : ''}`}
                  onClick={() => setRole('student')}
                  aria-label="Login as Student"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Student
                </button>
                <button
                  type="button"
                  className={`role-btn ${role === 'faculty' ? 'active' : ''}`}
                  onClick={() => setRole('faculty')}
                  aria-label="Login as Faculty"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  Faculty
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="username">
                {role === 'student' ? 'USN' : 'Faculty ID'}
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={errors.username ? 'error' : ''}
                  placeholder={role === 'student' ? 'Enter your USN' : 'Enter your Faculty ID'}
                  aria-label={role === 'student' ? 'University Seat Number' : 'Faculty ID'}
                  required
                />
              </div>
              {errors.username && (
                <span className="error-message" role="alert">{errors.username}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? 'error' : ''}
                  placeholder="Enter your password"
                  aria-label="Password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link to="#" className="forgot-link">Forgot password?</Link>
            </div>

            {errors.submit && (
              <div className="error-message submit-error">{errors.submit}</div>
            )}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  <span>Logging in...</span>
                </>
              ) : (
                'LOGIN'
              )}
            </button>

            <div className="signup-link">
              <span>Don't have an account?</span>
              <Link to={role === 'student' ? '/register/student' : '/register/faculty'} className="signup-link-text">
                Sign Up Now
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
