import React from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

const Toolbar = ({ selectedUsers, onUsersUpdate, onMessage, currentUser }) => {
  const isCurrentUserSelected = selectedUsers.includes(currentUser.id);

  const handleBlock = async () => {
    if (selectedUsers.length === 0) {
      onMessage('Please select users to block.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/users/block`, 
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

  const handleUnblock = async () => {
    if (selectedUsers.length === 0) {
      onMessage('Please select users to unblock.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/users/unblock`, 
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
      await axios.post(`${API_BASE_URL}/api/users/delete`, 
        { userIds: selectedUsers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      onMessage('Users deleted successfully.');
      
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

  const handleDeleteUnverified = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/users/delete-unverified`, 
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

  const handleAuthFailure = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  const isBlockDisabled = selectedUsers.length === 0;
  const isUnblockDisabled = selectedUsers.length === 0;
  const isDeleteDisabled = selectedUsers.length === 0;

  return (
    <div className="d-flex gap-2 mb-3 p-3 bg-light rounded align-items-center">
      <button
        className="btn btn-warning d-flex align-items-center gap-2"
        onClick={handleBlock}
        disabled={isBlockDisabled}
        title="Block selected users"
      >
        <i className="fas fa-ban"></i>
        Block
      </button>
      
      <button
        className="btn btn-success d-flex align-items-center gap-2"
        onClick={handleUnblock}
        disabled={isUnblockDisabled}
        title="Unblock selected users"
      >
        <i className="fas fa-check-circle"></i>
        Unblock
      </button>
      
      <button
        className="btn btn-danger d-flex align-items-center gap-2"
        onClick={handleDelete}
        disabled={isDeleteDisabled}
        title="Delete selected users"
      >
        <i className="fas fa-trash"></i>
        Delete
      </button>
      
      <button
        className="btn btn-outline-danger d-flex align-items-center gap-2"
        onClick={handleDeleteUnverified}
        title="Delete all unverified users"
      >
        <i className="fas fa-user-times"></i>
        Delete Unverified
      </button>
      
      <div className="ms-auto text-muted d-flex align-items-center gap-2">
        <i className="fas fa-users"></i>
        {selectedUsers.length} user(s) selected
      </div>
    </div>
  );
};

export default Toolbar;