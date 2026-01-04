import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarks();
  }, []);

  const fetchMarks = async () => {
    try {
      const response = await axios.get('/api/marks/my-marks');
      setMarks(response.data);
    } catch (error) {
      console.error('Error fetching marks:', error);
    } finally {
      setLoading(false);
    }
  };

  const courses = [
    { code: '25ECSC301', name: 'Software Engineering' },
    { code: '24ECSP304', name: 'Web Technologies Lab' },
    { code: '24ECSC303', name: 'Computer Networks' }
  ];

  const getCourseMarks = (courseCode) => {
    return marks.find(m => m.courseCode === courseCode);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Student Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.name}</span>
          <span className="student-id">USN: {user?.usn}</span>
          {user?.division && (
            <span className="student-info">Division {user.division} | Semester {user.semester}</span>
          )}
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Your Internal Assessment Marks</h2>
          <p>View your marks for all courses below</p>
        </div>

        {loading ? (
          <div className="loading">Loading your marks...</div>
        ) : (
          <div className="marks-grid">
            {courses.map(course => {
              const courseMarks = getCourseMarks(course.code);
              return (
                <div key={course.code} className="marks-card">
                  <div className="card-header">
                    <h3>{course.code}</h3>
                    <p className="course-name">{course.name}</p>
                  </div>
                  <div className="card-body">
                    {courseMarks ? (
                      <>
                        <div className="marks-display">
                          <div className="marks-value">
                            <span className="marks-number">{courseMarks.marks}</span>
                            <span className="marks-label">/ 100</span>
                          </div>
                          <div className={`grade-badge grade-${courseMarks.grade}`}>
                            Grade: {courseMarks.grade}
                          </div>
                        </div>
                        <div className="marks-details">
                          <div className="detail-item">
                            <span className="detail-label">Assessment Type:</span>
                            <span className="detail-value">{courseMarks.assessmentType}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Last Updated:</span>
                            <span className="detail-value">
                              {new Date(courseMarks.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="no-marks">
                        <p>Marks not yet uploaded for this course</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {marks.length > 0 && (
          <div className="summary-section">
            <h3>Summary</h3>
            <div className="summary-stats">
              <div className="summary-item">
                <span className="summary-label">Total Courses:</span>
                <span className="summary-value">{courses.length}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Marks Available:</span>
                <span className="summary-value">{marks.length}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Average Marks:</span>
                <span className="summary-value">
                  {(marks.reduce((sum, m) => sum + m.marks, 0) / marks.length).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;

