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
  const [focused, setFocused] = useState({ username: false, password: false });
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Clear errors when role changes
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
      <div className="login-container">
        <div className="header">
          <h1>Internal Assessment Portal</h1>
          <p>Please enter login details below</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Role</label>
            <div className="role-selector">
              <button
                type="button"
                className={`role-btn ${role === 'student' ? 'active' : ''}`}
                onClick={() => setRole('student')}
              >
                Student
              </button>
              <button
                type="button"
                className={`role-btn ${role === 'faculty' ? 'active' : ''}`}
                onClick={() => setRole('faculty')}
              >
                Faculty
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="username">
              {role === 'student' ? 'USN' : 'Faculty ID'}
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setFocused({ ...focused, username: true })}
              onBlur={() => setFocused({ ...focused, username: false })}
              className={errors.username ? 'error' : ''}
              placeholder={role === 'student' ? 'Enter your USN' : 'Enter your Faculty ID'}
              required
            />
            {errors.username && (
              <span className="error-message">{errors.username}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused({ ...focused, password: true })}
              onBlur={() => setFocused({ ...focused, password: false })}
              className={errors.password ? 'error' : ''}
              placeholder="Enter your password"
              required
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <div className="forgot-password">
            <Link to="#" className="forgot-link">Forgot password?</Link>
          </div>

          {errors.submit && (
            <div className="error-message submit-error">{errors.submit}</div>
          )}

          <button type="submit" className="sign-in-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Signing in...</span>
              </>
            ) : (
              'Sign in'
            )}
          </button>

          <div className="signup-link">
            <span>Don't have an account?</span>
            <Link to={role === 'student' ? '/register/student' : '/register/faculty'} className="signup-link-text">
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
