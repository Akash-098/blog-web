import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogAPI } from '../services/api';
import { Search, Filter } from 'lucide-react';

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBlogs();
  }, [page, search, category]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 9 };
      if (search) params.search = search;
      if (category) params.category = category;

      const response = await blogAPI.getAll(params);
      setBlogs(response.data.blogs);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBlogs();
  };

  if (loading) {
    return <div className="loading">Loading blogs...</div>;
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Latest Blogs</h1>
        
        {/* Search and Filter */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', flex: 1 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={20} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search blogs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
            </div>
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
          
          <select 
            className="form-control" 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: '200px' }}
          >
            <option value="">All Categories</option>
            <option value="technology">Technology</option>
            <option value="programming">Programming</option>
            <option value="web-development">Web Development</option>
            <option value="mobile-development">Mobile Development</option>
            <option value="ai">Artificial Intelligence</option>
          </select>
        </div>

        {/* Blog Grid */}
        <div className="blog-grid">
          {blogs.map(blog => (
            <div key={blog._id} className="blog-card">
              {blog.featuredImage && (
                <img src={blog.featuredImage} alt={blog.title} />
              )}
              <div className="blog-card-content">
                <h3>
                  <Link to={`/blog/${blog._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {blog.title}
                  </Link>
                </h3>
                <p>{blog.excerpt}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#666' }}>
                    By {blog.author?.username}
                  </span>
                  <div style={{ display: 'flex', gap: '10px', fontSize: '0.8rem', color: '#666' }}>
                    <span>❤️ {blog.likesCount}</span>
                    <span>💬 {blog.commentsCount}</span>
                  </div>
                </div>
                {blog.categories && blog.categories.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    {blog.categories.map(cat => (
                      <span 
                        key={cat} 
                        style={{
                          background: '#007bff',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.7rem',
                          marginRight: '5px'
                        }}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
            <button 
              className="btn btn-secondary" 
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <span style={{ padding: '10px' }}>
              Page {page} of {totalPages}
            </span>
            <button 
              className="btn btn-secondary" 
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        )}

        {blogs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            No blogs found. {search && 'Try changing your search criteria.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;