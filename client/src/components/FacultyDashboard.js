import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './FacultyDashboard.css';

const FacultyDashboard = () => {
  const { user, logout } = useAuth();
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [studentMarksMap, setStudentMarksMap] = useState({});
  const [statistics, setStatistics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    usn: '',
    isa1: '',
    isa2: '',
    esa: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({
    courseCode: '',
    division: '',
    semester: ''
  });

  const courses = [
    { code: '25ECSC301', name: 'Software Engineering' },
    { code: '24ECSP304', name: 'Web Technologies Lab' },
    { code: '24ECSC303', name: 'Computer Networks' }
  ];

  const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];
  const divisions = ['A', 'B', 'C'];

  useEffect(() => {
    if (user && filters.division && filters.semester) {
      fetchStudents();
    }
    if (user && filters.courseCode && filters.division && filters.semester) {
      fetchMarks();
      fetchStatistics();
    }
  }, [filters, user]);

  useEffect(() => {
    // Create a map of USN to marks for easy lookup
    const map = {};
    marks.forEach(mark => {
      map[mark.usn] = mark;
    });
    setStudentMarksMap(map);
  }, [marks]);

  const fetchStudents = async () => {
    if (!filters.division || !filters.semester) {
      return;
    }
    try {
      const response = await axios.get(`/api/students/by-division-semester?division=${filters.division}&semester=${filters.semester}`);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchMarks = async () => {
    if (!filters.courseCode || !filters.division || !filters.semester) {
      return;
    }
    try {
      const response = await axios.get(`/api/marks/all?courseCode=${filters.courseCode}&division=${filters.division}&semester=${filters.semester}`);
      setMarks(response.data);
    } catch (error) {
      console.error('Error fetching marks:', error);
    }
  };

  const fetchStatistics = async () => {
    if (!filters.courseCode || !filters.division || !filters.semester) {
      return;
    }
    try {
      const response = await axios.get(`/api/statistics/course/${filters.courseCode}?division=${filters.division}&semester=${filters.semester}`);
      setStatistics([response.data]);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!filters.courseCode || !filters.division || !filters.semester) {
      alert('Please select Course, Division, and Semester from the filters above');
      return;
    }

    // Validate marks
    const isa1Num = parseFloat(formData.isa1);
    const isa2Num = parseFloat(formData.isa2);
    const esaNum = parseFloat(formData.esa);

    if (isNaN(isa1Num) || isNaN(isa2Num) || isNaN(esaNum)) {
      alert('Please enter valid numbers for all assessment marks');
      return;
    }

    if (isa1Num < 0 || isa1Num > 20) {
      alert('ISA 1 must be between 0 and 20');
      return;
    }

    if (isa2Num < 0 || isa2Num > 20) {
      alert('ISA 2 must be between 0 and 20');
      return;
    }

    if (esaNum < 0 || esaNum > 60) {
      alert('ESA must be between 0 and 60');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        usn: formData.usn.trim().toUpperCase(),
        courseCode: filters.courseCode,
        courseName: courses.find(c => c.code === filters.courseCode)?.name || '',
        isa1: parseFloat(formData.isa1),
        isa2: parseFloat(formData.isa2),
        esa: parseFloat(formData.esa),
        semester: filters.semester,
        division: filters.division.toUpperCase(),
        department: user.department || 'CSE'
      };

      if (editingId) {
        await axios.put(`/api/marks/update/${editingId}`, { 
          isa1: payload.isa1, 
          isa2: payload.isa2, 
          esa: payload.esa 
        });
      } else {
        await axios.post('/api/marks/upload', payload);
      }

      setShowForm(false);
      setFormData({ usn: '', isa1: '', isa2: '', esa: '' });
      setEditingId(null);
      fetchMarks();
      fetchStatistics();
      fetchStudents();
    } catch (error) {
      console.error('Error saving marks:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Error saving marks. Please check the console for details.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (mark) => {
    setFormData({
      usn: mark.usn,
      isa1: (mark.isa1 || 0).toString(),
      isa2: (mark.isa2 || 0).toString(),
      esa: (mark.esa || 0).toString()
    });
    setEditingId(mark._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete these marks?')) {
      try {
        await axios.delete(`/api/marks/delete/${id}`);
        fetchMarks();
        fetchStatistics();
        fetchStudents();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting marks');
      }
    }
  };

  const getCourseStats = () => {
    return statistics.length > 0 ? statistics[0] : {
      totalStudents: 0,
      average: 0,
      gradeDistribution: { S: 0, A: 0, B: 0, C: 0, D: 0, F: 0 }
    };
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Faculty Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.name}</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="filters-section">
          <h2>Select Filters</h2>
          <div className="filters-container">
            <div className="filter-group">
              <label htmlFor="courseFilter">Course</label>
              <select
                id="courseFilter"
                value={filters.courseCode}
                onChange={(e) => setFilters({ ...filters, courseCode: e.target.value })}
                className="filter-select"
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course.code} value={course.code}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="divisionFilter">Division</label>
              <select
                id="divisionFilter"
                value={filters.division}
                onChange={(e) => setFilters({ ...filters, division: e.target.value })}
                className="filter-select"
              >
                <option value="">Select Division</option>
                {divisions.map(div => (
                  <option key={div} value={div}>Division {div}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="semesterFilter">Semester</label>
              <select
                id="semesterFilter"
                value={filters.semester}
                onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                className="filter-select"
              >
                <option value="">Select Semester</option>
                {semesters.map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>
          </div>
          {filters.courseCode && filters.division && filters.semester && (
            <div className="active-filters">
              <span>Viewing: {filters.courseCode} | Division {filters.division} | Semester {filters.semester}</span>
            </div>
          )}
        </div>
        {filters.courseCode && filters.division && filters.semester && (
          <>
            <div className="stats-section">
              <h2>Course Statistics</h2>
              <div className="stats-grid">
                {(() => {
                  const stats = getCourseStats();
                  const course = courses.find(c => c.code === filters.courseCode);
                  return (
                    <div className="stat-card">
                      <h3>{filters.courseCode}</h3>
                      <p className="course-name">{course?.name || 'N/A'}</p>
                      <p className="course-details">Division {filters.division} | Semester {filters.semester}</p>
                      <div className="stat-details">
                        <div className="stat-item">
                          <span className="stat-label">Total Students:</span>
                          <span className="stat-value">{stats.totalStudents}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Students with Marks:</span>
                          <span className="stat-value">{stats.studentsWithMarks || 0}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Class Average:</span>
                          <span className="stat-value">{stats.average > 0 ? `${stats.average.toFixed(2)}%` : 'N/A'}</span>
                        </div>
                        <div className="grade-distribution">
                          <div className="grade-item">
                            <span className="grade-label">S:</span>
                            <span className="grade-count">{stats.gradeDistribution.S}</span>
                          </div>
                          <div className="grade-item">
                            <span className="grade-label">A:</span>
                            <span className="grade-count">{stats.gradeDistribution.A}</span>
                          </div>
                          <div className="grade-item">
                            <span className="grade-label">B:</span>
                            <span className="grade-count">{stats.gradeDistribution.B}</span>
                          </div>
                          <div className="grade-item">
                            <span className="grade-label">C:</span>
                            <span className="grade-count">{stats.gradeDistribution.C}</span>
                          </div>
                          <div className="grade-item">
                            <span className="grade-label">D:</span>
                            <span className="grade-count">{stats.gradeDistribution.D}</span>
                          </div>
                          <div className="grade-item">
                            <span className="grade-label">F:</span>
                            <span className="grade-count">{stats.gradeDistribution.F}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </>
        )}

        {filters.courseCode && filters.division && filters.semester ? (
          <div className="marks-section">
            <div className="section-header">
              <h2>Student Marks</h2>
              <div className="controls">
                <button onClick={() => {
                  setShowForm(true);
                  setFormData({ usn: '', isa1: '', isa2: '', esa: '' });
                  setEditingId(null);
                }} className="add-btn">
                  + Add Marks
                </button>
              </div>
            </div>

          {showForm && (
            <div className="form-modal">
              <div className="form-content">
                <h3>{editingId ? 'Update Marks' : 'Upload Marks'}</h3>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>USN</label>
                    <select
                      value={formData.usn}
                      onChange={(e) => setFormData({ ...formData, usn: e.target.value })}
                      required
                      disabled={!!editingId}
                    >
                      <option value="">Select Student</option>
                      {students.map(student => (
                        <option key={student.usn} value={student.usn}>
                          {student.usn} - {student.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Course</label>
                    <input
                      type="text"
                      value={`${filters.courseCode} - ${courses.find(c => c.code === filters.courseCode)?.name || ''}`}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label>Division & Semester</label>
                    <input
                      type="text"
                      value={`Division ${filters.division} - Semester ${filters.semester}`}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label>ISA 1 (Out of 20)</label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.01"
                      value={formData.isa1}
                      onChange={(e) => setFormData({ ...formData, isa1: e.target.value })}
                      required
                      placeholder="Enter ISA 1 marks"
                    />
                  </div>
                  <div className="form-group">
                    <label>ISA 2 (Out of 20)</label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.01"
                      value={formData.isa2}
                      onChange={(e) => setFormData({ ...formData, isa2: e.target.value })}
                      required
                      placeholder="Enter ISA 2 marks"
                    />
                  </div>
                  <div className="form-group">
                    <label>ESA (Out of 60)</label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      step="0.01"
                      value={formData.esa}
                      onChange={(e) => setFormData({ ...formData, esa: e.target.value })}
                      required
                      placeholder="Enter ESA marks"
                    />
                  </div>
                  <div className="form-group">
                    <label>Total (Auto-calculated)</label>
                    <input
                      type="text"
                      value={formData.isa1 && formData.isa2 && formData.esa 
                        ? (parseFloat(formData.isa1 || 0) + parseFloat(formData.isa2 || 0) + parseFloat(formData.esa || 0)).toFixed(2)
                        : '0'}
                      disabled
                      style={{ background: '#f5f5f5' }}
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" disabled={loading} className="submit-btn">
                      {loading ? 'Saving...' : editingId ? 'Update' : 'Upload'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setFormData({ usn: '', isa1: '', isa2: '', esa: '' });
                        setEditingId(null);
                      }}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="marks-table-container">
            <table className="marks-table">
              <thead>
                <tr>
                  <th>USN</th>
                  <th>Name</th>
                  <th>Course</th>
                  <th>ISA 1</th>
                  <th>ISA 2</th>
                  <th>ESA</th>
                  <th>Total</th>
                  <th>Grade</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="no-data">No students found for Division {filters.division} and Semester {filters.semester}</td>
                  </tr>
                ) : (
                  students.map(student => {
                    const mark = studentMarksMap[student.usn];
                    return (
                      <tr key={student.usn} className={!mark ? 'no-marks-row' : ''}>
                        <td>{student.usn}</td>
                        <td>{student.name}</td>
                        <td>{filters.courseCode}</td>
                        <td>
                          {mark ? (
                            `${mark.isa1 || 0}/20`
                          ) : (
                            <span className="no-marks-text">-</span>
                          )}
                        </td>
                        <td>
                          {mark ? (
                            `${mark.isa2 || 0}/20`
                          ) : (
                            <span className="no-marks-text">-</span>
                          )}
                        </td>
                        <td>
                          {mark ? (
                            `${mark.esa || 0}/60`
                          ) : (
                            <span className="no-marks-text">-</span>
                          )}
                        </td>
                        <td>
                          {mark ? (
                            <strong>{mark.total || mark.marks || 0}/100</strong>
                          ) : (
                            <span className="no-marks-text">-</span>
                          )}
                        </td>
                        <td>
                          {mark ? (
                            <span className={`grade-badge grade-${mark.grade}`}>
                              {mark.grade}
                            </span>
                          ) : (
                            <span className="no-marks-text">-</span>
                          )}
                        </td>
                        <td>
                          {mark ? (
                            <>
                              <button onClick={() => handleEdit(mark)} className="edit-btn">
                                Edit
                              </button>
                              <button onClick={() => handleDelete(mark._id)} className="delete-btn">
                                Delete
                              </button>
                            </>
                          ) : (
                            <button 
                      onClick={() => {
                        setFormData({ usn: student.usn, isa1: '', isa2: '', esa: '' });
                        setEditingId(null);
                        setShowForm(true);
                      }}
                              className="add-marks-btn"
                            >
                              Add Marks
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        ) : (
          <div className="marks-section">
            <div className="no-filters-message">
              <p>Please select Course, Division, and Semester from the filters above to view marks and statistics.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyDashboard;

