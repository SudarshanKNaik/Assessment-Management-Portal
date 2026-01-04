import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Register.css';

const StudentRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    usn: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    semester: '',
    division: '',
    academicYear: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];
  const divisions = ['A', 'B', 'C'];
  const academicYears = ['2021-2022', '2022-2023', '2023-2024', '2024-2025', '2025-2026'];

  // USN Format: 2 digits (institution) + 2 chars (admission category) + 2 digits (year) + 3 chars (program) + 3 digits (student ID)
  // Example: 1RV20CS001
  const validateUSN = (usn) => {
    const usnPattern = /^\d{2}[A-Z]{2}\d{2}[A-Z]{3}\d{3}$/;
    return usnPattern.test(usn.toUpperCase());
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full Name is required';
    }

    if (!formData.usn.trim()) {
      newErrors.usn = 'USN is required';
    } else {
      const usnUpper = formData.usn.toUpperCase().trim();
      if (usnUpper.length !== 12) {
        newErrors.usn = 'USN must be exactly 12 characters';
      } else if (!validateUSN(usnUpper)) {
        newErrors.usn = 'Invalid USN format. Format: 2 digits + 2 letters + 2 digits + 3 letters + 3 digits (e.g., 01AB20CSE001)';
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

    if (!formData.semester) {
      newErrors.semester = 'Semester is required';
    }

    if (!formData.division) {
      newErrors.division = 'Division is required';
    }

    if (!formData.academicYear) {
      newErrors.academicYear = 'Academic Year is required';
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
        role: 'student',
        usn: formData.usn.toUpperCase().trim(), // Ensure USN is uppercase
        username: formData.usn.toUpperCase().trim() // Use USN as username
      };

      await axios.post('/api/auth/register', payload);
      
      // Auto-login after successful registration
      const loginResult = await login(formData.usn, formData.password);
      
      if (loginResult.success) {
        navigate('/student-dashboard');
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
    // Convert USN to uppercase as user types
    const processedValue = name === 'usn' ? value.toUpperCase() : value;
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
        <h1>Internal Assessment Portal</h1>
        <h2>Student Registration</h2>
        
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
            <label htmlFor="usn">USN</label>
            <input
              type="text"
              id="usn"
              name="usn"
              value={formData.usn}
              onChange={handleChange}
              className={errors.usn ? 'error' : ''}
              placeholder="e.g., 01AB20CSE001"
              maxLength={12}
              style={{ textTransform: 'uppercase' }}
            />
            {errors.usn && <span className="error-message">{errors.usn}</span>}
            <small className="help-text">
              Format: 2 digits (institution) + 2 letters (category) + 2 digits (year) + 3 letters (program) + 3 digits (ID)
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
            <label htmlFor="semester">Semester</label>
            <select
              id="semester"
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              className={errors.semester ? 'error' : ''}
            >
              <option value="">Select Semester</option>
              {semesters.map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
            {errors.semester && <span className="error-message">{errors.semester}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="division">Division</label>
            <select
              id="division"
              name="division"
              value={formData.division}
              onChange={handleChange}
              className={errors.division ? 'error' : ''}
            >
              <option value="">Select Division</option>
              {divisions.map(div => (
                <option key={div} value={div}>Division {div}</option>
              ))}
            </select>
            {errors.division && <span className="error-message">{errors.division}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="academicYear">Academic Year</label>
            <select
              id="academicYear"
              name="academicYear"
              value={formData.academicYear}
              onChange={handleChange}
              className={errors.academicYear ? 'error' : ''}
            >
              <option value="">Select Academic Year</option>
              {academicYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            {errors.academicYear && <span className="error-message">{errors.academicYear}</span>}
          </div>

          {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>

          <div className="login-link">
            <p>Already have an account? <Link to="/">Login here</Link></p>
            <p>Are you a faculty? <Link to="/register/faculty">Faculty Registration</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentRegister;

