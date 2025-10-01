 
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toolbar from './Toolbar';

const UserTable = ({ currentUser, onMessage }) => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Important: Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Note: Fetch users from API
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      if (error.response?.data?.redirectToLogin) {
        handleLogout();
      } else {
        onMessage('Failed to fetch users.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Nota bene: Handle logout on auth failure
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  // Important: Handle individual user selection
  const handleUserSelect = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  // Note: Handle select all/deselect all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(new Set(users.map(user => user.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  // Important: Check if all users are selected
  const isAllSelected = users.length > 0 && selectedUsers.size === users.length;

  // Note: Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Important: Get status badge class
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return 'bg-success';
      case 'blocked': return 'bg-danger';
      case 'unverified': return 'bg-warning';
      default: return 'bg-secondary';
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div>
      <Toolbar 
        selectedUsers={Array.from(selectedUsers)}
        onUsersUpdate={fetchUsers}
        onMessage={onMessage}
        currentUser={currentUser}
      />
      
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th style={{ width: '40px' }}>
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                />
              </th>
              <th>Name</th>
              <th>Email</th>
              <th>Last Login</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={selectedUsers.has(user.id)}
                    onChange={() => handleUserSelect(user.id)}
                  />
                </td>
                <td className="align-middle">{user.name}</td>
                <td className="align-middle">{user.email}</td>
                <td className="align-middle">{formatDate(user.last_login_time)}</td>
                <td className="align-middle">
                  <span className={`badge ${getStatusBadge(user.status)}`}>
                    {user.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {users.length === 0 && (
          <div className="text-center text-muted py-4">
            No users found.
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTable;