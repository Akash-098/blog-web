import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogAPI, commentAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Heart, MessageCircle, Calendar, User } from 'lucide-react';

const BlogDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    fetchBlog();
    fetchComments();
  }, [id]);

  const fetchBlog = async () => {
    try {
      const response = await blogAPI.getById(id);
      setBlog(response.data);
      setHasLiked(response.data.likes?.some(like => like._id === user?.id) || false);
    } catch (error) {
      console.error('Error fetching blog:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await commentAPI.getByBlog(id);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert('Please login to like blogs');
      return;
    }

    try {
      const response = await blogAPI.like(id);
      setBlog(prev => ({
        ...prev,
        likesCount: response.data.likesCount,
        likes: response.data.likes
      }));
      setHasLiked(response.data.hasLiked);
    } catch (error) {
      console.error('Error liking blog:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to comment');
      return;
    }

    try {
      await commentAPI.create({
        content: commentContent,
        blog: id
      });
      setCommentContent('');
      fetchComments();
      
      // Update comments count
      setBlog(prev => ({
        ...prev,
        commentsCount: prev.commentsCount + 1
      }));
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading blog...</div>;
  }

  if (!blog) {
    return <div className="container">Blog not found</div>;
  }

  return (
    <div className="container">
      <article className="card">
        <h1>{blog.title}</h1>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px', color: '#666' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <User size={16} />
            <span>{blog.author?.username}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Calendar size={16} />
            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
          </div>
          {user?.id === blog.author?._id && (
            <Link to={`/edit/${blog._id}`} className="btn btn-primary" style={{ marginLeft: 'auto' }}>
              Edit Blog
            </Link>
          )}
        </div>

        {blog.categories && blog.categories.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            {blog.categories.map(cat => (
              <span 
                key={cat} 
                style={{
                  background: '#007bff',
                  color: 'white',
                  padding: '5px 10px',
                  borderRadius: '15px',
                  fontSize: '0.8rem',
                  marginRight: '10px'
                }}
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {blog.featuredImage && (
          <img 
            src={blog.featuredImage} 
            alt={blog.title} 
            style={{ 
              width: '100%', 
              maxHeight: '400px', 
              objectFit: 'cover', 
              borderRadius: '8px',
              marginBottom: '20px'
            }} 
          />
        )}

        <div 
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: blog.content }}
          style={{ lineHeight: '1.6', fontSize: '16px' }}
        />

        <div style={{ display: 'flex', gap: '20px', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
          <button 
            onClick={handleLike}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '5px', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              color: hasLiked ? '#dc3545' : '#666'
            }}
          >
            <Heart size={20} fill={hasLiked ? '#dc3545' : 'none'} />
            <span>{blog.likesCount} Likes</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#666' }}>
            <MessageCircle size={20} />
            <span>{blog.commentsCount} Comments</span>
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <section className="card">
        <h3>Comments ({blog.commentsCount})</h3>
        
        {/* Comment Form */}
        {user && (
          <form onSubmit={handleCommentSubmit} style={{ marginBottom: '30px' }}>
            <div className="form-group">
              <textarea
                className="form-control"
                placeholder="Write a comment..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                rows="4"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">Post Comment</button>
          </form>
        )}

        {/* Comments List */}
        {comments.map(comment => (
          <div key={comment._id} className="comment">
            <div className="comment-header">
              <span className="comment-author">{comment.author?.username}</span>
              <span className="comment-date">
                {new Date(comment.createdAt).toLocaleDateString()}
                {comment.isEdited && ' (edited)'}
              </span>
            </div>
            <div className="comment-content">{comment.content}</div>
            
            {/* Reply functionality can be added here */}
          </div>
        ))}

        {comments.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            No comments yet. Be the first to comment!
          </div>
        )}
      </section>
    </div>
  );
};

export default BlogDetail;