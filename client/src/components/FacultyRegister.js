import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Register.css';

const FacultyRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    facultyId: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    subject: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Faculty ID Format: 2 digits (institution) + 2 chars (department) + 2 digits (year) + 1 char (role) + 4 digits (faculty ID)
  // Example: 1RVCSE20F0001
  const validateFacultyID = (facultyId) => {
    const facultyIdPattern = /^\d{2}[A-Z]{2}\d{2}[A-Z]\d{4}$/;
    return facultyIdPattern.test(facultyId.toUpperCase());
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full Name is required';
    }

    if (!formData.facultyId.trim()) {
      newErrors.facultyId = 'Faculty ID is required';
    } else {
      const facultyIdUpper = formData.facultyId.toUpperCase().trim();
      if (facultyIdUpper.length !== 11) {
        newErrors.facultyId = 'Faculty ID must be exactly 11 characters';
      } else if (!validateFacultyID(facultyIdUpper)) {
        newErrors.facultyId = 'Invalid Faculty ID format. Format: 2 digits + 2 letters + 2 digits + 1 letter + 4 digits (e.g., 01CSE20F0001)';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject to teach is required';
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
    try {
      const { confirmPassword, ...registerData } = formData;
      const payload = {
        ...registerData,
        role: 'faculty',
        facultyId: formData.facultyId.toUpperCase().trim(), // Ensure Faculty ID is uppercase
        username: formData.facultyId.toUpperCase().trim(), // Use facultyId as username
        subject: formData.subject.trim()
      };

      await axios.post('/api/auth/register', payload);
      
      // Auto-login after successful registration
      const loginResult = await login(formData.facultyId, formData.password);
      
      if (loginResult.success) {
        navigate('/faculty-dashboard');
      } else {
        setErrors({ submit: 'Registration successful but login failed. Please try logging in.' });
      }
    } catch (error) {
      setErrors({ 
        submit: error.response?.data?.message || 'Registration failed. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Convert Faculty ID to uppercase as user types
    const processedValue = name === 'facultyId' ? value.toUpperCase() : value;
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="header">
          <h1>Welcome!</h1>
          <h2>Create your faculty account</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
              placeholder="Enter your full name"
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="facultyId">Faculty ID</label>
            <input
              type="text"
              id="facultyId"
              name="facultyId"
              value={formData.facultyId}
              onChange={handleChange}
              className={errors.facultyId ? 'error' : ''}
              placeholder="e.g., 01CSE20F0001"
              maxLength={11}
              style={{ textTransform: 'uppercase' }}
            />
            {errors.facultyId && <span className="error-message">{errors.facultyId}</span>}
            <small className="help-text">
              Format: 2 digits (institution) + 2 letters (department) + 2 digits (year) + 1 letter (role) + 4 digits (ID)
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="Create a password (min. 6 characters)"
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'error' : ''}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="department">Department</label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={errors.department ? 'error' : ''}
              placeholder="Enter your department"
            />

            {errors.department && <span className="error-message">{errors.department}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject to Teach</label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className={errors.subject ? 'error' : ''}
            >
              <option value="">Select a subject</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Web Technologies Lab">Web Technologies Lab</option>
              <option value="Computer Networks">Computer Networks</option>
            </select>
            {errors.subject && <span className="error-message">{errors.subject}</span>}
          </div>

          {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>

          <div className="login-link">
            <p>Already have an account? <Link to="/">Login here</Link></p>
            <p>Are you a student? <Link to="/register/student">Student Registration</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FacultyRegister;

