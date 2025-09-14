import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigation } from '../components/Navigation';
import { OutputCalendar } from '../components/OutputCalendar';
import type { TodoItem } from '@shared/types/tasks';
import type { Activity } from '@shared/types/activities';
import '../styles/Dashboard.css';
import axios from 'axios';

export function Dashboard() {
  const { currentUser } = useAuth();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newTodo, setNewTodo] = useState({
    title: '',
    notes: '',
    dueDate: '',
    activityId: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    estimatedHours: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTodo, setEditTodo] = useState({
    title: '',
    notes: '',
    dueDate: '',
    activityId: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    estimatedHours: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = currentUser?.uid;
        
        // Fetch todos
        const todosResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/todos/${userId}`);
        const todosData = todosResponse.data as { success: boolean; todos: TodoItem[]; message: string };
        if (todosData.success) {
          setTodos(todosData.todos);
        } else {
          console.error(todosData.message);
        }

        // Fetch activities
        const activitiesResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/activities/${userId}`);
        const activitiesData = activitiesResponse.data as { success: boolean; activities: Activity[]; message: string };
        if (activitiesData.success) {
          setActivities(activitiesData.activities);
        } else {
          console.error(activitiesData.message);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, [currentUser]);

  const addTodo = async () => {
    if (newTodo.title.trim()) {
      if (!currentUser) {
        console.error("User not logged in, cannot add todo");
        return;
      }

      const todoData = {
        userId: currentUser?.uid,
        title: newTodo.title.trim(),
        notes: newTodo.notes.trim(),
        dueDate: newTodo.dueDate || 'TBD',
        activityId: newTodo.activityId.trim() || undefined,
        priority: newTodo.priority,
        estimatedHours: newTodo.estimatedHours ? parseInt(newTodo.estimatedHours) : undefined,
        completed: false,
      };
      try {
        console.log("Adding todo:", todoData);
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/todos`, todoData);
        const { success, todo } = response.data as { success: boolean; todo: TodoItem };
        if (success) {
          setTodos([...todos, todo]);
          setNewTodo({
            title: '',
            notes: '',
            dueDate: '',
            activityId: '',
            priority: 'medium',
            estimatedHours: ''
          });
          
          // Refresh activities list in case a new one was created
          try {
            const activitiesResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/activities/${currentUser?.uid}`);
            const activitiesData = activitiesResponse.data as { success: boolean; activities: Activity[] };
            if (activitiesData.success) {
              setActivities(activitiesData.activities);
            }
          } catch (error) {
            console.error("Failed to refresh activities:", error);
          }
          setShowAddForm(false);
        }
      } catch (error) {
        console.error("Failed to add todo:", error);
      }
    }
  };

  const toggleTodo = async (id: string) => {
    const todoToUpdate = todos.find(todo => todo.id === id);
    if (!todoToUpdate) return;

    const updatedTodo = { ...todoToUpdate, completed: !todoToUpdate.completed };

    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/todos/${id}`, { completed: updatedTodo.completed });
      setTodos(todos.map(todo => (todo.id === id ? updatedTodo : todo)));
    } catch (error) {
      console.error("Failed to toggle todo:", error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/todos/${id}`);
      const { success } = response.data as { success: boolean };

      if (success) {
        setTodos(todos.filter(todo => todo.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  };

  const startEdit = (todo: TodoItem) => {
    setEditingId(todo.id);
    // Find the activity name by ID
    const activity = activities.find(a => a.id === todo.activityId);
    setEditTodo({
      title: todo.title,
      notes: todo.notes,
      dueDate: todo.dueDate === 'TBD' ? '' : todo.dueDate,
      activityId: activity?.activityName || '',
      priority: todo.priority,
      estimatedHours: todo.estimatedHours?.toString() || ''
    });
  };

  const saveEdit = async () => {
    if (editTodo.title.trim() && editingId) {
      const updatedData = {
        title: editTodo.title.trim(),
        notes: editTodo.notes.trim(),
        dueDate: editTodo.dueDate || 'TBD',
        activityId: editTodo.activityId.trim() || undefined,
        priority: editTodo.priority,
        estimatedHours: editTodo.estimatedHours ? parseInt(editTodo.estimatedHours) : undefined,
        userId: currentUser?.uid
      };
      try {
        await axios.put(`${import.meta.env.VITE_API_BASE_URL}/todos/${editingId}`, updatedData);
        setTodos(todos.map(todo =>
          todo.id === editingId ? { ...todo, ...updatedData } : todo
        ));
        
        // Refresh activities list in case a new one was created
        try {
          const activitiesResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/activities/${currentUser?.uid}`);
          const activitiesData = activitiesResponse.data as { success: boolean; activities: Activity[] };
          if (activitiesData.success) {
            setActivities(activitiesData.activities);
          }
        } catch (error) {
          console.error("Failed to refresh activities:", error);
        }
        
        cancelEdit();
      } catch (error) {
        console.error("Failed to save edit:", error);
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTodo({
      title: '',
      notes: '',
      dueDate: '',
      activityId: '',
      priority: 'medium',
      estimatedHours: ''
    });
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
          </div>
          <div className="todo-input">
            {!showAddForm ? (
              <button 
                onClick={() => setShowAddForm(true)} 
                className="primary-button add-todo-button"
              >
                ➕ Add New Task
              </button>
            ) : (
              <div className="todo-form">
                <div className="form-row">
                  <input
                    type="text"
                    value={newTodo.title}
                    onChange={(e) => setNewTodo({...newTodo, title: e.target.value})}
                    placeholder="Task title..."
                    className="todo-input-field"
                  />
                  <select
                    value={newTodo.priority}
                    onChange={(e) => setNewTodo({...newTodo, priority: e.target.value as 'high' | 'medium' | 'low'})}
                    className="priority-selector"
                  >
                    <option value="high">🔴 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>
                <div className="form-row">
                  <input
                    type="text"
                    value={newTodo.activityId}
                    onChange={(e) => setNewTodo({...newTodo, activityId: e.target.value})}
                    placeholder="Activity (e.g., Math, Biology)..."
                    className="todo-input-field"
                    list="activities-list"
                  />
                  <datalist id="activities-list">
                    {activities.map((activity) => (
                      <option key={activity.id} value={activity.activityName} />
                    ))}
                  </datalist>
                  <input
                    type="date"
                    value={newTodo.dueDate}
                    onChange={(e) => setNewTodo({...newTodo, dueDate: e.target.value})}
                    className="todo-input-field"
                    title="Due Date"
                  />
                  <input
                    type="number"
                    value={newTodo.estimatedHours}
                    onChange={(e) => setNewTodo({...newTodo, estimatedHours: e.target.value})}
                    placeholder="Hours"
                    className="todo-input-field small"
                    min="0.5"
                    step="0.5"
                    title="Estimated Hours"
                  />
                </div>
                <div className="form-row">
                  <textarea
                    value={newTodo.notes}
                    onChange={(e) => setNewTodo({...newTodo, notes: e.target.value})}
                    placeholder="Additional notes..."
                    className="todo-textarea"
                    rows={2}
                  />
                </div>
                <div className="form-actions">
                  <button onClick={() => setShowAddForm(false)} className="cancel-button">
                    Cancel
                  </button>
                  <button onClick={addTodo} className="primary-button">
                    Add Task
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="todo-list">
            {todos.map(todo => (
              <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                {editingId === todo.id ? (
                  // Edit mode
                  <div className="todo-edit">
                    <div className="form-row">
                      <input
                        type="text"
                        value={editTodo.title}
                        onChange={(e) => setEditTodo({...editTodo, title: e.target.value})}
                        className="edit-text-input"
                        placeholder="Task title..."
                      />
                      <select
                        value={editTodo.priority}
                        onChange={(e) => setEditTodo({...editTodo, priority: e.target.value as 'high' | 'medium' | 'low'})}
                        className="edit-priority-selector"
                      >
                        <option value="high">🔴 High</option>
                        <option value="medium">🟡 Medium</option>
                        <option value="low">🟢 Low</option>
                      </select>
                    </div>
                    <div className="form-row">
                      <input
                        type="text"
                        value={editTodo.activityId}
                        onChange={(e) => setEditTodo({...editTodo, activityId: e.target.value})}
                        className="edit-text-input"
                        placeholder="Activity..."
                        list="edit-activities-list"
                      />
                      <datalist id="edit-activities-list">
                        {activities.map((activity) => (
                          <option key={activity.id} value={activity.activityName} />
                        ))}
                      </datalist>
                      <input
                        type="date"
                        value={editTodo.dueDate}
                        onChange={(e) => setEditTodo({...editTodo, dueDate: e.target.value})}
                        className="edit-text-input"
                      />
                      <input
                        type="number"
                        value={editTodo.estimatedHours}
                        onChange={(e) => setEditTodo({...editTodo, estimatedHours: e.target.value})}
                        className="edit-text-input small"
                        placeholder="Hours"
                        min="0.5"
                        step="0.5"
                      />
                    </div>
                    <div className="form-row">
                      <textarea
                        value={editTodo.notes}
                        onChange={(e) => setEditTodo({...editTodo, notes: e.target.value})}
                        className="edit-textarea"
                        placeholder="Notes..."
                        rows={2}
                      />
                    </div>
                    <div className="edit-actions">
                      <button onClick={saveEdit} className="save-button">
                        ✓ Save
                      </button>
                      <button onClick={cancelEdit} className="cancel-button">
                        × Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <>
                    <div className="todo-content">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                        className="todo-checkbox"
                      />
                      <div className="todo-main">
                        <div className="todo-header">
                          <span className="todo-text">{todo.title}</span>
                          <div className="todo-badges">
                            <div 
                              className="todo-priority"
                              style={{ backgroundColor: getPriorityColor(todo.priority) }}
                            >
                              {todo.priority}
                            </div>
                            {todo.activityId && (() => {
                              const activity = activities.find(a => a.id === todo.activityId);
                              return activity ? (
                                <div className="todo-activity">
                                  {activity.activityName}
                                </div>
                              ) : null;
                            })()}
                          </div>
                        </div>
                        <div className="todo-details">
                          {todo.dueDate && todo.dueDate !== 'TBD' && (
                            <span className="todo-due-date">📅 Due: {todo.dueDate}</span>
                          )}
                          {todo.estimatedHours && (
                            <span className="todo-hours">⏱️ {todo.estimatedHours}h</span>
                          )}
                        </div>
                        {todo.notes && (
                          <div className="todo-notes">💭 {todo.notes}</div>
                        )}
                      </div>
                    </div>
                    <div className="todo-actions">
                      <button 
                        onClick={() => startEdit(todo)}
                        className="todo-edit-btn"
                        title="Edit task"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => deleteTodo(todo.id)}
                        className="todo-delete"
                        title="Delete task"
                      >
                        ×
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Schedule Section */}
        <div className="dashboard-section schedule-section">
          <div className="section-header">
            <h2>📅 Weekly Schedule</h2>
          </div>
          <OutputCalendar userId={currentUser?.uid} />
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
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
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
                  <div className="pie-slice math" style={{ '--percentage': '35%' } as React.CSSProperties}>
                    <span className="pie-label">Math</span>
                    <span className="pie-percentage">35%</span>
                  </div>
                  <div className="pie-slice biology" style={{ '--percentage': '25%' } as React.CSSProperties}>
                    <span className="pie-label">Biology</span>
                    <span className="pie-percentage">25%</span>
                  </div>
                  <div className="pie-slice chemistry" style={{ '--percentage': '20%' } as React.CSSProperties}>
                    <span className="pie-label">Chemistry</span>
                    <span className="pie-percentage">20%</span>
                  </div>
                  <div className="pie-slice literature" style={{ '--percentage': '20%' } as React.CSSProperties}>
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
