import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './components/Login';
import Register from './components/Register';
import UserTable from './components/UserTable';
//import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');

  // Important: Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setCurrentView('dashboard');
    }
  }, []);

  // Note: Handle login
  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentView('dashboard');
  };

  // Nota bene: Handle logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentView('login');
    setMessage('Logged out successfully.');
  };

  // Important: Show message with timeout
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="App">
      {message && (
        <div className="alert alert-info alert-dismissible fade show" role="alert">
          {message}
          <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
        </div>
      )}

      {currentView === 'login' && (
        <Login 
          onLogin={handleLogin}
          onSwitchToRegister={() => setCurrentView('register')}
          onMessage={showMessage}
        />
      )}

      {currentView === 'register' && (
        <Register 
          onSwitchToLogin={() => setCurrentView('login')}
          onMessage={showMessage}
        />
      )}

      {currentView === 'dashboard' && user && (
        <div>
          <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">
              <span className="navbar-brand">THE APP</span>
              <div className="navbar-nav ms-auto">
                <span className="navbar-text me-3">
                  Welcome, {user.name}
                </span>
                <button 
                  className="btn btn-outline-light btn-sm"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </nav>
          <div className="container mt-4">
            <UserTable currentUser={user} onMessage={showMessage} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;