import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import Toolbar from './Toolbar';

const UserTable = ({ currentUser, onMessage }) => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/users`, {
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  const handleUserSelect = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(new Set(users.map(user => user.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const isAllSelected = users.length > 0 && selectedUsers.size === users.length;

  const formatLastSeen = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'less than a minute ago';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return 'bg-success';
      case 'blocked': return 'bg-danger';
      case 'unverified': return 'bg-warning';
      default: return 'bg-secondary';
    }
  };

  // Mock data based on your image - remove this when you have real API data
  const mockUsers = [
    {
      id: 1,
      name: 'Clare, Alex',
      email: 'a_clare42@gmail.com',
      status: 'active',
      last_login_time: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      block: false
    },
    {
      id: 2,
      name: 'Morrison, Jim',
      email: 'dmtimer9@dealyaari.com',
      status: 'active',
      last_login_time: new Date().toISOString(),
      block: 'CFQ, Meta Platforms, Inc.'
    },
    {
      id: 3,
      name: 'Simone, Nina',
      email: 'marishabelin@giftcode-ao.com',
      status: 'blocked',
      last_login_time: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      block: 'Regional Manager, Amazon.com, Inc.'
    },
    {
      id: 4,
      name: 'Zappa, Frank',
      email: 'zappa_f@citybank.com',
      status: 'unverified',
      last_login_time: new Date().toISOString(),
      block: 'Architect, Meta Platforms, Inc.'
    }
  ];

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
              <th>Block</th>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Last seen</th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map(user => (
              <tr key={user.id}>
                <td>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={selectedUsers.has(user.id)}
                    onChange={() => handleUserSelect(user.id)}
                  />
                </td>
                <td className="align-middle">
                  {user.block || 'N/A'}
                </td>
                <td className="align-middle">{user.name}</td>
                <td className="align-middle">{user.email}</td>
                <td className="align-middle">
                  <span className={`badge ${getStatusBadge(user.status)}`}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </td>
                <td className="align-middle">{formatLastSeen(user.last_login_time)}</td>
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