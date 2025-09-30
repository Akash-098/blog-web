import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Users, FileText, MessageCircle, BarChart3, Edit3, Trash2 } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, usersRes, blogsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        adminAPI.getBlogs({ page: 1, limit: 10 })
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setBlogs(blogsRes.data.blogs);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleBlogStatusChange = async (blogId, newStatus) => {
    try {
      await adminAPI.updateBlogStatus(blogId, newStatus);
      setBlogs(blogs.map(blog => 
        blog._id === blogId ? { ...blog, status: newStatus } : blog
      ));
    } catch (error) {
      console.error('Error updating blog status:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminAPI.deleteUser(userId);
        setUsers(users.filter(user => user._id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await adminAPI.deleteBlog(blogId);
        setBlogs(blogs.filter(blog => blog._id !== blogId));
      } catch (error) {
        console.error('Error deleting blog:', error);
      }
    }
  };

  if (loading) {
    return <div className="container loading">Loading dashboard...</div>;
  }

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>
      
      {/* Tabs */}
      <div style={{ marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
        <button 
          className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('users')}
          style={{ marginLeft: '10px' }}
        >
          Users
        </button>
        <button 
          className={`btn ${activeTab === 'blogs' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('blogs')}
          style={{ marginLeft: '10px' }}
        >
          Blogs
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && stats && (
        <div>
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <Users size={40} color="#007bff" />
              <h3>{stats.stats.totalUsers}</h3>
              <p>Total Users</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <FileText size={40} color="#28a745" />
              <h3>{stats.stats.totalBlogs}</h3>
              <p>Total Blogs</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <MessageCircle size={40} color="#ffc107" />
              <h3>{stats.stats.totalComments}</h3>
              <p>Total Comments</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <BarChart3 size={40} color="#dc3545" />
              <h3>{stats.stats.publishedBlogs}</h3>
              <p>Published Blogs</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="card">
              <h3>Recent Blogs</h3>
              {stats.recentBlogs.map(blog => (
                <div key={blog._id} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
                  <div style={{ fontWeight: 'bold' }}>{blog.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    By {blog.author?.username} • {new Date(blog.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="card">
              <h3>Recent Users</h3>
              {stats.recentUsers.map(user => (
                <div key={user._id} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
                  <div style={{ fontWeight: 'bold' }}>{user.username}</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    {user.email} • {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card">
          <h3>User Management</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>User</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Role</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Joined</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>{user.username}</td>
                  <td style={{ padding: '10px' }}>{user.email}</td>
                  <td style={{ padding: '10px' }}>
                    <select 
                      value={user.role} 
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="form-control"
                      style={{ width: 'auto' }}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={{ padding: '10px' }}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleDeleteUser(user._id)}
                      disabled={user.role === 'admin'} // Prevent deleting other admins
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Blogs Tab */}
      {activeTab === 'blogs' && (
        <div className="card">
          <h3>Blog Management</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Title</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Author</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Likes</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Comments</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Created</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map(blog => (
                <tr key={blog._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>
                    <div style={{ fontWeight: 'bold', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {blog.title}
                    </div>
                  </td>
                  <td style={{ padding: '10px' }}>{blog.author?.username}</td>
                  <td style={{ padding: '10px' }}>
                    <select 
                      value={blog.status} 
                      onChange={(e) => handleBlogStatusChange(blog._id, e.target.value)}
                      className="form-control"
                      style={{ width: 'auto' }}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </td>
                  <td style={{ padding: '10px' }}>{blog.likesCount}</td>
                  <td style={{ padding: '10px' }}>{blog.commentsCount}</td>
                  <td style={{ padding: '10px' }}>
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleDeleteBlog(blog._id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;