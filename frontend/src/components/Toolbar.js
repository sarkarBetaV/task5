import React from 'react';
import axios from 'axios';

const Toolbar = ({ selectedUsers, onUsersUpdate, onMessage, currentUser }) => {
  // Important: Check if current user is in selection
  const isCurrentUserSelected = selectedUsers.includes(currentUser.id);

  // Note: Handle block users
  const handleBlock = async () => {
    if (selectedUsers.length === 0) {
      onMessage('Please select users to block.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/users/block', 
        { userIds: selectedUsers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      onMessage('Users blocked successfully.');
      onUsersUpdate();
    } catch (error) {
      if (error.response?.data?.redirectToLogin) {
        handleAuthFailure();
      } else {
        onMessage('Failed to block users.');
      }
    }
  };

  // Nota bene: Handle unblock users
  const handleUnblock = async () => {
    if (selectedUsers.length === 0) {
      onMessage('Please select users to unblock.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/users/unblock', 
        { userIds: selectedUsers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      onMessage('Users unblocked successfully.');
      onUsersUpdate();
    } catch (error) {
      if (error.response?.data?.redirectToLogin) {
        handleAuthFailure();
      } else {
        onMessage('Failed to unblock users.');
      }
    }
  };

  // Important: Handle delete users
  const handleDelete = async () => {
    if (selectedUsers.length === 0) {
      onMessage('Please select users to delete.');
      return;
    }

    if (isCurrentUserSelected) {
      if (!window.confirm('You are about to delete your own account. Continue?')) {
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/users/delete', 
        { userIds: selectedUsers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      onMessage('Users deleted successfully.');
      
      // Note: If current user was deleted, log them out
      if (isCurrentUserSelected) {
        handleAuthFailure();
      } else {
        onUsersUpdate();
      }
    } catch (error) {
      if (error.response?.data?.redirectToLogin) {
        handleAuthFailure();
      } else {
        onMessage('Failed to delete users.');
      }
    }
  };

  // Important: Handle delete unverified users
  const handleDeleteUnverified = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/users/delete-unverified', 
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      onMessage('Unverified users deleted successfully.');
      onUsersUpdate();
    } catch (error) {
      if (error.response?.data?.redirectToLogin) {
        handleAuthFailure();
      } else {
        onMessage('Failed to delete unverified users.');
      }
    }
  };

  // Note: Handle authentication failure
  const handleAuthFailure = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  // Important: Toolbar button disabled states
  const isBlockDisabled = selectedUsers.length === 0;
  const isUnblockDisabled = selectedUsers.length === 0;
  const isDeleteDisabled = selectedUsers.length === 0;

  return (
    <div className="d-flex gap-2 mb-3 p-3 bg-light rounded">
      <button
        className="btn btn-warning"
        onClick={handleBlock}
        disabled={isBlockDisabled}
        title="Block selected users"
      >
        Block
      </button>
      
      <button
        className="btn btn-success"
        onClick={handleUnblock}
        disabled={isUnblockDisabled}
        title="Unblock selected users"
      >
        <i className="bi bi-unlock"></i> Unblock
      </button>
      
      <button
        className="btn btn-danger"
        onClick={handleDelete}
        disabled={isDeleteDisabled}
        title="Delete selected users"
      >
        <i className="bi bi-trash"></i> Delete
      </button>
      
      <button
        className="btn btn-outline-danger"
        onClick={handleDeleteUnverified}
        title="Delete all unverified users"
      >
        <i className="bi bi-trash"></i> Delete Unverified
      </button>
      
      <div className="ms-auto text-muted">
        {selectedUsers.length} user(s) selected
      </div>
    </div>
  );
};

export default Toolbar;