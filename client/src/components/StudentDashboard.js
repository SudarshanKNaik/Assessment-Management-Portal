import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import './StudentDashboard.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

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

  // Prepare data for bar chart (course marks)
  const getBarChartData = () => {
    const courseLabels = courses.map(c => `${c.code}\n${c.name}`);
    const courseTotals = courses.map(course => {
      const courseMarks = getCourseMarks(course.code);
      return courseMarks ? (courseMarks.total || courseMarks.marks || 0) : 0;
    });

    return {
      labels: courseLabels,
      datasets: [
        {
          label: 'Total Marks (out of 100)',
          data: courseTotals,
          backgroundColor: [
            'rgba(102, 126, 234, 0.8)',
            'rgba(118, 75, 162, 0.8)',
            'rgba(54, 162, 235, 0.8)'
          ],
          borderColor: [
            'rgba(102, 126, 234, 1)',
            'rgba(118, 75, 162, 1)',
            'rgba(54, 162, 235, 1)'
          ],
          borderWidth: 2
        }
      ]
    };
  };

  // Prepare data for pie chart (ISA 1, ISA 2, ESA breakdown)
  const getPieChartData = () => {
    const totalISA1 = marks.reduce((sum, m) => sum + (m.isa1 || 0), 0);
    const totalISA2 = marks.reduce((sum, m) => sum + (m.isa2 || 0), 0);
    const totalESA = marks.reduce((sum, m) => sum + (m.esa || 0), 0);

    return {
      labels: ['ISA 1', 'ISA 2', 'ESA'],
      datasets: [
        {
          label: 'Marks Distribution',
          data: [totalISA1, totalISA2, totalESA],
          backgroundColor: [
            'rgba(102, 126, 234, 0.8)',
            'rgba(118, 75, 162, 0.8)',
            'rgba(54, 162, 235, 0.8)'
          ],
          borderColor: [
            'rgba(102, 126, 234, 1)',
            'rgba(118, 75, 162, 1)',
            'rgba(54, 162, 235, 1)'
          ],
          borderWidth: 2
        }
      ]
    };
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      title: {
        display: true,
        text: 'Marks by Course',
        font: {
          size: 18,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Total: ${context.parsed.y}/100`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value;
          }
        },
        title: {
          display: true,
          text: 'Marks (out of 100)'
        }
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      },
      title: {
        display: true,
        text: 'Assessment Marks Distribution (All Courses)',
        font: {
          size: 18,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} marks (${percentage}%)`;
          }
        }
      }
    }
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
          <>
            {marks.length > 0 ? (
              <div className="charts-section">
                <div className="chart-container">
                  <div className="chart-wrapper">
                    <Bar data={getBarChartData()} options={barChartOptions} />
                  </div>
                </div>
                <div className="chart-container">
                  <div className="chart-wrapper">
                    <Pie data={getPieChartData()} options={pieChartOptions} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-charts-message">
                <p>Charts will appear here once marks are uploaded for your courses.</p>
              </div>
            )}
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
                        <div className="marks-breakdown">
                          <div className="breakdown-item">
                            <span className="breakdown-label">ISA 1:</span>
                            <span className="breakdown-value">
                              {courseMarks.isa1 !== undefined && courseMarks.isa1 !== null ? `${courseMarks.isa1}/20` : '-'}
                            </span>
                          </div>
                          <div className="breakdown-item">
                            <span className="breakdown-label">ISA 2:</span>
                            <span className="breakdown-value">
                              {courseMarks.isa2 !== undefined && courseMarks.isa2 !== null ? `${courseMarks.isa2}/20` : '-'}
                            </span>
                          </div>
                          <div className="breakdown-item">
                            <span className="breakdown-label">ESA:</span>
                            <span className="breakdown-value">
                              {courseMarks.esa !== undefined && courseMarks.esa !== null ? `${courseMarks.esa}/60` : '-'}
                            </span>
                          </div>
                        </div>
                        <div className="marks-display">
                          <div className="marks-value">
                            <span className="marks-number">{courseMarks.total || courseMarks.marks || 0}</span>
                            <span className="marks-label">/ 100</span>
                          </div>
                          {courseMarks.grade ? (
                            <div className={`grade-badge grade-${courseMarks.grade}`}>
                              Grade: {courseMarks.grade}
                            </div>
                          ) : (
                            <div style={{ color: '#999', fontSize: '14px' }}>Grade: Not Available</div>
                          )}
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
          </>
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
                  {(marks.reduce((sum, m) => sum + (m.total || m.marks || 0), 0) / marks.length).toFixed(2)}%
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

