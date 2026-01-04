import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
    <div className="login-container">
      <div className="login-card">
        <h1>Internal Assessment Portal</h1>
        <h2>Login</h2>
        
        <form onSubmit={handleSubmit}>
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
              className={errors.username ? 'error' : ''}
              placeholder={role === 'student' ? 'Enter your USN' : 'Enter your Faculty ID'}
            />
            {errors.username && <span className="error-message">{errors.username}</span>}
            <small className="help-text">
              {role === 'student' 
                ? 'Use your University Seat Number (USN) as username' 
                : 'Use your Faculty ID as username'}
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="register-link">
            <p>Don't have an account? 
              <Link to="/register/faculty" style={{ marginLeft: '5px', marginRight: '10px' }}>Faculty Registration</Link>
              <span>|</span>
              <Link to="/register/student" style={{ marginLeft: '10px' }}>Student Registration</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

