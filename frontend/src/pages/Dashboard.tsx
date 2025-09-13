import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigation } from '../components/Navigation';
import './Dashboard.css';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export function Dashboard() {
  const { currentUser, signOut } = useAuth();
  const [todos, setTodos] = useState<TodoItem[]>([
    { id: '1', text: 'Complete Math homework', completed: false, priority: 'high' },
    { id: '2', text: 'Review Biology notes', completed: true, priority: 'medium' },
    { id: '3', text: 'Prepare for Chemistry exam', completed: false, priority: 'high' },
    { id: '4', text: 'Read assigned literature', completed: false, priority: 'low' },
    { id: '5', text: 'Submit project proposal', completed: true, priority: 'medium' },
  ]);
  const [newTodo, setNewTodo] = useState('');

  const addTodo = () => {
    if (newTodo.trim()) {
      const todo: TodoItem = {
        id: Date.now().toString(),
        text: newTodo.trim(),
        completed: false,
        priority: 'medium'
      };
      setTodos([...todos, todo]);
      setNewTodo('');
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ff6b6b';
      case 'medium': return '#ffa726';
      case 'low': return '#66bb6a';
      default: return '#9e9e9e';
    }
  };

  return (
    <>
      <Navigation />
      <div className="dashboard-container">
        {/* Welcome Message */}
        <div className="dashboard-welcome">
          <h1>Welcome, {currentUser?.displayName || currentUser?.email}!</h1>
        </div>

      {/* Main Dashboard Content */}
      <div className="dashboard-content">
        {/* To-Do List Section */}
        <div className="dashboard-section todo-section">
          <div className="section-header">
            <h2>📝 To-Do List</h2>
            <div className="todo-input">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                placeholder="Add a new task..."
                className="todo-input-field"
              />
              <button onClick={addTodo} className="primary-button">
                Add
              </button>
            </div>
          </div>
          <div className="todo-list">
            {todos.map(todo => (
              <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                <div className="todo-content">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="todo-checkbox"
                  />
                  <span className="todo-text">{todo.text}</span>
                  <div 
                    className="todo-priority"
                    style={{ backgroundColor: getPriorityColor(todo.priority) }}
                  >
                    {todo.priority}
                  </div>
                </div>
                <button 
                  onClick={() => deleteTodo(todo.id)}
                  className="todo-delete"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Schedule Section */}
        <div className="dashboard-section schedule-section">
          <div className="section-header">
            <h2>📅 Weekly Schedule</h2>
          </div>
          <div className="schedule-grid">
            {['Mon', 'Tue', 'Wed'].map(day => (
              <div key={day} className="schedule-day">
                <div className="day-header">{day}</div>
                <div className="day-events">
                  <div className="event wake-up">7:00 AM - Wake Up</div>
                  <div className="event study">9:00 AM - Math Study</div>
                  <div className="event class">11:00 AM - Biology Class</div>
                  <div className="event study">2:00 PM - Chemistry Study</div>
                  <div className="event bedtime">11:00 PM - Bedtime</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Section */}
        <div className="dashboard-section analytics-section">
          <div className="section-header">
            <h2>Study Analytics</h2>
          </div>
          <div className="analytics-container">
            {/* Top Row - Key Metrics */}
            <div className="analytics-top-row">
              <div className="metric-card primary-metric">
                <div className="metric-header">
                  <h3>Study Time Today</h3>
                  <div className="metric-trend positive">+15%</div>
                </div>
                <div className="metric-value">4h 30m</div>
                <div className="metric-subtitle">vs yesterday</div>
              </div>
              <div className="metric-card">
                <div className="metric-header">
                  <h3>Tasks Completed</h3>
                  <div className="metric-trend neutral">67%</div>
                </div>
                <div className="metric-value">8/12</div>
                <div className="metric-subtitle">completion rate</div>
              </div>
              <div className="metric-card">
                <div className="metric-header">
                  <h3>Weekly Progress</h3>
                  <div className="metric-trend positive">85%</div>
                </div>
                <div className="metric-value">85%</div>
                <div className="metric-subtitle">on track</div>
              </div>
              <div className="metric-card">
                <div className="metric-header">
                  <h3>Current Streak</h3>
                  <div className="metric-trend positive">7 days</div>
                </div>
                <div className="metric-value">7</div>
                <div className="metric-subtitle">days strong</div>
              </div>
            </div>

            {/* Bottom Row - Data Visualizations */}
            <div className="analytics-bottom-row">
              <div className="chart-container">
                <div className="chart-header">
                  <h3>Study Hours This Week</h3>
                  <div className="chart-legend">
                    <div className="legend-item">
                      <div className="legend-color study"></div>
                      <span>Study Time</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color break"></div>
                      <span>Break Time</span>
                    </div>
                  </div>
                </div>
                <div className="bar-chart">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                    <div key={day} className="bar-group">
                      <div className="bar-label">{day}</div>
                      <div className="bar-container">
                        <div 
                          className="bar study-bar" 
                          style={{ height: `${Math.random() * 60 + 20}%` }}
                        ></div>
                        <div 
                          className="bar break-bar" 
                          style={{ height: `${Math.random() * 30 + 10}%` }}
                        ></div>
                      </div>
                      <div className="bar-value">{Math.floor(Math.random() * 4 + 2)}h</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="chart-container">
                <div className="chart-header">
                  <h3>Subject Distribution</h3>
                </div>
                <div className="pie-chart">
                  <div className="pie-slice math" style={{ '--percentage': '35%' }}>
                    <span className="pie-label">Math</span>
                    <span className="pie-percentage">35%</span>
                  </div>
                  <div className="pie-slice biology" style={{ '--percentage': '25%' }}>
                    <span className="pie-label">Biology</span>
                    <span className="pie-percentage">25%</span>
                  </div>
                  <div className="pie-slice chemistry" style={{ '--percentage': '20%' }}>
                    <span className="pie-label">Chemistry</span>
                    <span className="pie-percentage">20%</span>
                  </div>
                  <div className="pie-slice literature" style={{ '--percentage': '20%' }}>
                    <span className="pie-label">Literature</span>
                    <span className="pie-percentage">20%</span>
                  </div>
                </div>
              </div>

              <div className="chart-container">
                <div className="chart-header">
                  <h3>Productivity Trend</h3>
                </div>
                <div className="line-chart">
                  <div className="line-chart-container">
                    <svg viewBox="0 0 200 100" className="line-svg">
                      <polyline
                        points="10,80 30,70 50,60 70,45 90,55 110,40 130,35 150,25 170,30 190,20"
                        fill="none"
                        stroke="var(--accent-color)"
                        strokeWidth="2"
                      />
                      <circle cx="190" cy="20" r="3" fill="var(--accent-color)" />
                    </svg>
                  </div>
                  <div className="line-chart-labels">
                    <span>Week 1</span>
                    <span>Week 2</span>
                    <span>Week 3</span>
                    <span>Week 4</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
