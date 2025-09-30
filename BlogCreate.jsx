import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { blogAPI } from '../services/api';
import RichTextEditor from '../components/RichTextEditor';

const BlogCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    categories: [],
    tags: [],
    featuredImage: '',
    status: 'draft'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
  };

  const handleCategoriesChange = (e) => {
    const categories = e.target.value.split(',').map(cat => cat.trim()).filter(cat => cat);
    setFormData(prev => ({
      ...prev,
      categories
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await blogAPI.create(formData);
      navigate(`/blog/${response.data._id}`);
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating blog');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Create New Blog</h1>
        
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              className="form-control"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Excerpt (Optional)</label>
            <textarea
              name="excerpt"
              className="form-control"
              value={formData.excerpt}
              onChange={handleChange}
              rows="3"
              maxLength="300"
              placeholder="Brief description of your blog..."
            />
          </div>

          <div className="form-group">
            <label>Categories (comma separated)</label>
            <input
              type="text"
              className="form-control"
              placeholder="technology, programming, web-development"
              onChange={handleCategoriesChange}
            />
          </div>

          <div className="form-group">
            <label>Featured Image URL (Optional)</label>
            <input
              type="url"
              name="featuredImage"
              className="form-control"
              value={formData.featuredImage}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="form-group">
            <label>Content</label>
            <RichTextEditor
              value={formData.content}
              onChange={handleContentChange}
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              className="form-control"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="draft">Draft</option>
              <option value="published">Publish</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
            >
              {loading ? 'Publishing...' : 'Publish Blog'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogCreate;