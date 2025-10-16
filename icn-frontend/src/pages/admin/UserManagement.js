import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import './UserManagement.css';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterTier, setFilterTier] = useState('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
      // Mock data for demo
      setUsers([
        {
          id: 1,
          name: 'John Smith',
          email: 'john@example.com',
          tier: 'free',
          status: 'active',
          joinDate: '2024-01-10',
          lastActive: '2024-12-15'
        },
        {
          id: 2,
          name: 'Sarah Johnson',
          email: 'sarah@company.com',
          tier: 'premium',
          status: 'active',
          joinDate: '2024-02-15',
          lastActive: '2024-12-14'
        },
        {
          id: 3,
          name: 'Mike Chen',
          email: 'mike@business.com',
          tier: 'plus',
          status: 'inactive',
          joinDate: '2024-03-20',
          lastActive: '2024-11-30'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      if (currentStatus === 'active') {
        await adminService.deactivateUser(userId);
      } else {
        await adminService.reactivateUser(userId);
      }
      loadUsers();
    } catch (error) {
      alert('Failed to update user status');
    }
  };

  const filteredUsers = filterTier === 'all' 
    ? users 
    : users.filter(user => user.tier === filterTier);

  return (
    <div className="user-management">
      <h1>User Management</h1>
      
      <div className="user-stats">
        <div className="stat-card">
          <h3>{users.length}</h3>
          <p>Total Users</p>
        </div>
        <div className="stat-card">
          <h3>{users.filter(u => u.tier === 'premium').length}</h3>
          <p>Premium Users</p>
        </div>
        <div className="stat-card">
          <h3>{users.filter(u => u.tier === 'plus').length}</h3>
          <p>Plus Users</p>
        </div>
        <div className="stat-card">
          <h3>{users.filter(u => u.tier === 'free').length}</h3>
          <p>Free Users</p>
        </div>
      </div>

      <div className="user-filters">
        <select 
          value={filterTier}
          onChange={(e) => setFilterTier(e.target.value)}
          className="tier-filter"
        >
          <option value="all">All Tiers</option>
          <option value="free">Free</option>
          <option value="plus">Plus</option>
          <option value="premium">Premium</option>
        </select>
      </div>

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Tier</th>
              <th>Status</th>
              <th>Join Date</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`tier-badge tier-${user.tier}`}>
                    {user.tier}
                  </span>
                </td>
                <td>
                  <span className={`status-badge status-${user.status}`}>
                    {user.status}
                  </span>
                </td>
                <td>{user.joinDate}</td>
                <td>{user.lastActive}</td>
                <td>
                  <button 
                    className="btn-toggle"
                    onClick={() => handleStatusToggle(user.id, user.status)}
                  >
                    {user.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManagement;