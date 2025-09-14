import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigation } from '../components/Navigation';
import { DashboardWeeklySchedule } from '../components/DashboardWeeklySchedule';
import type { TodoItem } from '@shared/types/tasks';
import '../styles/Dashboard.css';
import axios from 'axios';

export function Dashboard() {
  const { currentUser } = useAuth();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTodoName, setEditTodoName] = useState('');
  const [editPriority, setEditPriority] = useState<'high' | 'medium' | 'low'>('medium');
  
  // Schedule data state removed - dashboard will always show empty state

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const userId = currentUser?.uid;
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/todos/${userId}`);
        const data = response.data as { success: boolean; todos: TodoItem[]; message: string };
        if (data.success) {
          setTodos(data.todos);
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error("Failed to fetch todos:", error);
      }
    };

    fetchTodos();
  }, [currentUser]);

  // Schedule data loading removed - dashboard will always show empty state

  const addTodo = async () => {
    if (newTodo.trim()) {
      if (!currentUser) {
        console.error("User not logged in, cannot add todo");
        return;
      }

      const todoData = {
        userId: currentUser?.uid,
        todoName: newTodo.trim(),
        priority: selectedPriority,
        completed: false,
      };
      try {
        console.log("Adding todo:", todoData);
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/todos`, todoData);
        const { success, todo } = response.data as { success: boolean; todo: TodoItem };
        if (success) {
          setTodos([...todos, todo]);
          setNewTodo('');
          setSelectedPriority('medium');
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
    setEditTodoName(todo.title);
    setEditPriority(todo.priority);
  };

  const saveEdit = async () => {
    if (editTodoName.trim() && editingId) {
      const updatedData = { todoName: editTodoName.trim(), priority: editPriority };
      try {
        await axios.put(`${import.meta.env.VITE_API_BASE_URL}/todos/${editingId}`, updatedData);
        setTodos(todos.map(todo =>
          todo.id === editingId ? { ...todo, ...updatedData } : todo
        ));
        cancelEdit();
      } catch (error) {
        console.error("Failed to save edit:", error);
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTodoName('');
    setEditPriority('medium');
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
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              placeholder="Add a new task..."
              className="todo-input-field"
            />
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as 'high' | 'medium' | 'low')}
              className="priority-selector"
            >
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
            <button onClick={addTodo} className="primary-button">
              Add
            </button>
          </div>
          <div className="todo-list">
            {todos.map(todo => (
              <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                {editingId === todo.id ? (
                  // Edit mode
                  <div className="todo-edit">
                    <input
                      type="text"
                      value={editTodoName}
                      onChange={(e) => setEditTodoName(e.target.value)}
                      className="edit-text-input"
                      onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                    />
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value as 'high' | 'medium' | 'low')}
                      className="edit-priority-selector"
                    >
                      <option value="high">🔴 High</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="low">🟢 Low</option>
                    </select>
                    <button onClick={saveEdit} className="save-button">
                      ✓
                    </button>
                    <button onClick={cancelEdit} className="cancel-button">
                      ×
                    </button>
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
                      <span className="todo-text">{todo.title}</span>
                      <div 
                        className="todo-priority"
                        style={{ backgroundColor: getPriorityColor(todo.priority) }}
                      >
                        {todo.priority}
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
          <div className="section-content">
            <DashboardWeeklySchedule />
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
