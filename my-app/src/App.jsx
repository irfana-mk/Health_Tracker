import { useState, useEffect } from 'react';
import './App.css';

const API_BASE = 'http://localhost:8000/api';

function App() {
  const [habits, setHabits] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [activeView, setActiveView] = useState('home');
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    frequency: 'daily',
    category: 'health',
    startDate: new Date().toISOString().split('T')[0]
  });

  
  useEffect(() => {
    fetchHabits();
  }, []);

  
  useEffect(() => {
    document.title = 'Habit Hero';
  }, []);

  const fetchHabits = async () => {
    try {
      const response = await fetch(`${API_BASE}/habits/`);
      if (response.ok) {
        const data = await response.json();
        setHabits(data);
      }
    } catch (error) {
      console.error('Error fetching habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  
  const dataToSend = {
    name: formData.name,
    frequency: formData.frequency,
    category: formData.category,
    start_date: formData.startDate  
  };
  
  try {
    const response = await fetch(`${API_BASE}/habits/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend)  
    });
    
    if (response.ok) {
      const newHabit = await response.json();
      setHabits([...habits, newHabit]);
      setFormData({
        name: '',
        frequency: 'daily',
        category: 'health',
        startDate: new Date().toISOString().split('T')[0]
      });
      setShowForm(false);
    } else {
      
      const errorData = await response.json();
      console.error('Error creating habit:', errorData);
      alert('Error creating habit: ' + JSON.stringify(errorData));
    }
  } catch (error) {
    console.error('Error creating habit:', error);
    alert('Network error. Please try again.');
  }
};

  const handleCheckIn = async (habitId, date) => {
    const dateStr = date || new Date().toISOString().split('T')[0];
    
    try {
      const response = await fetch(`${API_BASE}/habits/${habitId}/checkin/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: dateStr })
      });
      
      if (response.ok) {
        
        await fetchHabits();
      }
    } catch (error) {
      console.error('Error checking in:', error);
    }
  };

  const addNote = async (habitId, note) => {
    if (!note.trim()) return;
    
    try {
      const response = await fetch(`${API_BASE}/habits/${habitId}/add_note/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: note })
      });
      
      if (response.ok) {
        
        await fetchHabits();
      }
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const deleteHabit = async (habitId) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      try {
        const response = await fetch(`${API_BASE}/habits/${habitId}/`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          const newHabits = habits.filter(habit => habit.id !== habitId);
          setHabits(newHabits);
          setSelectedHabit(null);
          setActiveView('home');
        }
      } catch (error) {
        console.error('Error deleting habit:', error);
      }
    }
  };

  const calculateStreak = (habit) => {
    const checkIns = habit.checkins || [];
    if (checkIns.length === 0) return 0;
    
    const sortedDates = checkIns
      .map(ci => ci.date)
      .sort((a, b) => new Date(b) - new Date(a));
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedDates.length; i++) {
      const checkDate = new Date(sortedDates[i]);
      checkDate.setHours(0, 0, 0, 0);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (checkDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const calculateSuccessRate = (habit) => {
    const startDate = new Date(habit.start_date);
    const today = new Date();
    const daysPassed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const checkIns = habit.checkins || [];
    
    if (daysPassed <= 0) return 0;
    return Math.round((checkIns.length / daysPassed) * 100);
  };

  const getBestDay = (habit) => {
    const checkIns = habit.checkins || [];
    if (checkIns.length === 0) return 'No data';
    
    const dayCounts = {};
    checkIns.forEach(ci => {
      const day = new Date(ci.date).toLocaleDateString('en-US', { weekday: 'long' });
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    
    let maxDay = '';
    let maxCount = 0;
    for (const [day, count] of Object.entries(dayCounts)) {
      if (count > maxCount) {
        maxCount = count;
        maxDay = day;
      }
    }
    
    return maxDay || 'No data';
  };

  const isCheckedToday = (habit) => {
    const today = new Date().toISOString().split('T')[0];
    return (habit.checkins || []).some(ci => ci.date === today);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      health: '💪',
      work: '💼',
      learning: '📚',
      fitness: '🏃',
      'mental health': '🧘',
      productivity: '⚡'
    };
    return icons[category] || '⭐';
  };

  const getCalendarDays = () => {
    const today = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      days.push(date);
    }
    return days;
  };

  const renderDashboard = () => (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Habits</h3>
          <p className="stat-number">{habits.length}</p>
        </div>
        <div className="stat-card">
          <h3>Completed Today</h3>
          <p className="stat-number">
            {habits.filter(h => isCheckedToday(h)).length}
          </p>
        </div>
        <div className="stat-card">
          <h3>Success Rate</h3>
          <p className="stat-number">
            {habits.length > 0 
              ? Math.round(habits.reduce((acc, h) => acc + calculateSuccessRate(h), 0) / habits.length)
              : 0}%
          </p>
        </div>
        <div className="stat-card">
          <h3>Best Streak</h3>
          <p className="stat-number">
            {habits.length > 0 
              ? Math.max(...habits.map(h => calculateStreak(h)), 0)
              : 0} days
          </p>
        </div>
      </div>

      <div className="habits-list">
        <div className="section-header">
          <h2>Your Habits</h2>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + Add Habit
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading habits...</div>
        ) : habits.length === 0 ? (
          <div className="empty-state">
            <p>No habits yet. Start building better routines!</p>
          </div>
        ) : (
          <div className="habit-cards">
            {habits.map(habit => (
              <div className="habit-card" key={habit.id}>
                <div className="habit-header">
                  <div className="habit-title">
                    <span className="category-icon">{getCategoryIcon(habit.category)}</span>
                    <h3>{habit.name}</h3>
                  </div>
                  <button
                    className={`check-btn ${isCheckedToday(habit) ? 'checked' : ''}`}
                    onClick={() => handleCheckIn(habit.id)}
                  >
                    {isCheckedToday(habit) ? '✓' : '○'}
                  </button>
                </div>

                <div className="habit-meta">
                  <span className="badge">{habit.frequency}</span>
                  <span className="badge">{habit.category}</span>
                </div>

                <div className="habit-stats">
                  <div className="stat-item">
                    <span className="stat-label">Streak</span>
                    <span className="stat-value">{calculateStreak(habit)} days</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Success</span>
                    <span className="stat-value">{calculateSuccessRate(habit)}%</span>
                  </div>
                </div>

                <button
                  className="btn-secondary"
                  onClick={() => {
                    setSelectedHabit(habit);
                    setActiveView('details');
                  }}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderCalendar = () => {
    const days = getCalendarDays();
    
    return (
      <div className="calendar-view">
        <h2>Weekly Calendar</h2>
        <div className="calendar-grid">
          {days.map(date => {
            const dateStr = date.toISOString().split('T')[0];
            return (
              <div key={dateStr} className="calendar-day">
                <div className="day-header">
                  <span className="day-name">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <span className="day-number">
                    {date.getDate()}
                  </span>
                </div>
                <div className="day-habits">
                  {habits.map(habit => {
                    const isChecked = (habit.checkins || []).some(ci => ci.date === dateStr);
                    return (
                      <div 
                        key={habit.id}
                        className={`calendar-habit ${isChecked ? 'checked' : ''}`}
                        onClick={() => handleCheckIn(habit.id, dateStr)}
                      >
                        <span>{getCategoryIcon(habit.category)}</span>
                        <span className="habit-name-short">{habit.name}</span>
                        {isChecked && <span className="check-mark">✓</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAnalytics = () => (
    <div className="analytics-view">
      <br />
      <h2>Analytics</h2>
      {habits.length === 0 ? (
        <div className="empty-state">
          <p>No habits to analyze yet.</p>
        </div>
      ) : (
        <div className="analytics-grid">
          {habits.map(habit => (
            <div key={habit.id} className="analytics-card">
              <div className="analytics-header">
                <span className="category-icon">{getCategoryIcon(habit.category)}</span>
                <h3>{habit.name}</h3>
              </div>
              <div className="analytics-stats">
                <div className="analytics-stat">
                  <span className="stat-label">Current Streak</span>
                  <span className="stat-value large">{calculateStreak(habit)} days</span>
                </div>
                <div className="analytics-stat">
                  <span className="stat-label">Success Rate</span>
                  <span className="stat-value large">{calculateSuccessRate(habit)}%</span>
                </div>
                <div className="analytics-stat">
                  <span className="stat-label">Total Check-ins</span>
                  <span className="stat-value large">{(habit.checkins || []).length}</span>
                </div>
                <div className="analytics-stat">
                  <span className="stat-label">Best Day</span>
                  <span className="stat-value large">{getBestDay(habit)}</span>
                </div>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${calculateSuccessRate(habit)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderDetails = () => {
    if (!selectedHabit) return null;
    
    return (
      <div className="details-view">
        <button 
          className="btn-back"
          onClick={() => {
            setSelectedHabit(null);
            setActiveView('home');
          }}
        >
          ← Back
        </button>
        
        <div className="details-header">
          <div>
            <span className="category-icon large">{getCategoryIcon(selectedHabit.category)}</span>
            <h2>{selectedHabit.name}</h2>
          </div>
          <button 
            className="btn-danger"
            onClick={() => deleteHabit(selectedHabit.id)}
          >
            Delete Habit
          </button>
        </div>

        <div className="details-meta">
          <span className="badge">{selectedHabit.frequency}</span>
          <span className="badge">{selectedHabit.category}</span>
          <span className="badge">Started: {new Date(selectedHabit.start_date).toLocaleDateString()}</span>
        </div>

        <div className="details-stats">
          <div className="stat-card">
            <h3>Current Streak</h3>
            <p className="stat-number">{calculateStreak(selectedHabit)} days</p>
          </div>
          <div className="stat-card">
            <h3>Success Rate</h3>
            <p className="stat-number">{calculateSuccessRate(selectedHabit)}%</p>
          </div>
          <div className="stat-card">
            <h3>Total Check-ins</h3>
            <p className="stat-number">{(selectedHabit.checkins || []).length}</p>
          </div>
          <div className="stat-card">
            <h3>Best Day</h3>
            <p className="stat-number">{getBestDay(selectedHabit)}</p>
          </div>
        </div>

        <div className="notes-section">
          <h3>Notes</h3>
          <div className="note-input">
            <input
              type="text"
              placeholder="Add a note..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addNote(selectedHabit.id, noteText);
                  setNoteText('');
                }
              }}
            />
            <button 
              className="btn-primary"
              onClick={() => {
                addNote(selectedHabit.id, noteText);
                setNoteText('');
              }}
            >
              Add
            </button>
          </div>
          <div className="notes-list">
            {(selectedHabit.notes || []).length === 0 ? (
              <p className="empty-notes">No notes yet.</p>
            ) : (
              selectedHabit.notes.map(note => (
                <div key={note.id} className="note-item">
                  <p>{note.text}</p>
                  <span className="note-date">{new Date(note.date).toLocaleDateString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <nav className="nav-bar">
        <div className="nav-left">
          <div className="header-content">
            <h1>Habit Hero</h1>
          </div>
        </div>
      </nav>

      <main className="main-content">
        {activeView === 'home' && (
          <>
            {renderDashboard()}
            {renderCalendar()}
            {renderAnalytics()}
          </>
        )}
        {activeView === 'analytics' && renderAnalytics()}
        {activeView === 'details' && renderDetails()}
      </main>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Habit</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Habit Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Morning Exercise"
                  required
                />
              </div>

              <div className="form-group">
                <label>Frequency</label>
                <select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleInputChange}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="health">Health</option>
                  <option value="work">Work</option>
                  <option value="learning">Learning</option>
                  <option value="fitness">Fitness</option>
                  <option value="mental health">Mental Health</option>
                  <option value="productivity">Productivity</option>
                </select>
              </div>

              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <footer className="app-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <h3>Habit Hero</h3>
            <p className="tagline">Build better routines and stay consistent</p>
          </div>

          <nav className="footer-nav" aria-label="Footer">
            <a href="#" onClick={(e) => e.preventDefault()}>Privacy</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Terms</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Contact</a>
          </nav>

          <div className="footer-copy">© {new Date().getFullYear()} Habit Hero. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

export default App;