import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isAdmin } from '../utils/auth';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1 style={{ color: '#007bff', margin: 0 }}>BlogApp</h1>
          </Link>
          
          <div className="nav-links">
            <Link to="/">Home</Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/create">Write Blog</Link>
                <Link to="/profile">Profile</Link>
                {isAdmin() && <Link to="/admin">Admin</Link>}
                <span>Hello, {user?.username}</span>
                <button 
                  onClick={handleLogout}
                  className="btn btn-secondary"
                  style={{ marginLeft: '10px' }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;