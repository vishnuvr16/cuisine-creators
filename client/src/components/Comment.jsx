import React, { useState, useEffect } from 'react';
import { User, MessageCircle, ThumbsUp, Trash2, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const CommentSection = ({ blogId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const fetchComments = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/blogs/${blogId}/comments?page=${pageNum}`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();
      const newComments = pageNum === 1 ? data.comments : [...comments, ...data.comments];
      setComments(newComments);
      setHasMore(pageNum < data.pagination.pages);
      setError(null);
    } catch (err) {
      setError('Failed to load comments');
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [blogId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`http://localhost:8000/api/blogs/${blogId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          content: newComment,
        })
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      const data = await response.json();
      setComments([data, ...comments]);
      setNewComment('');
      setError(null);
    } catch (err) {
      setError('Failed to post comment');
      console.error('Error posting comment:', err);
    }
  };

  const handleLike = async (commentId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/comments/${commentId}/like`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to like comment');
      }

      const data = await response.json();
      setComments(comments.map(comment => 
        comment._id === commentId
          ? { 
              ...comment, 
              likes: data.likes,
              isLiked: data.isLiked
            }
          : comment
      ));
    } catch (err) {
      console.error('Error liking comment:', err);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(`http://localhost:8000/api/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      setComments(comments.filter(comment => comment._id !== commentId));
    } catch (err) {
      setError('Failed to delete comment');
      console.error('Error deleting comment:', err);
    }
  };

  const loadMoreComments = () => {
    if (!loading && hasMore) {
      fetchComments(page + 1);
      setPage(page + 1);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <MessageCircle className="w-6 h-6" />
        Comments ({comments.length})
      </h2>

      {/* Comment Form */}
      <form onSubmit={handleCommentSubmit} className="mb-8">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-4 border rounded-lg mb-4 resize-y focus:ring-2 focus:ring-red-500 focus:border-transparent"
          rows="4"
          placeholder="Write your comment..."
        />
        <div className="flex justify-between items-center">
          <button 
            type="submit"
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!newComment.trim() || loading}
          >
            <MessageCircle className="w-4 h-4" />
            Post Comment
          </button>
          {error && <p className="text-red-500">{error}</p>}
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map(comment => (
          <div key={comment._id} className="border-b pb-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                {comment.user.avatar ? (
                  <img 
                    src={comment.user.avatar} 
                    alt={comment.user.name}
                    className="w-8 h-8 rounded-full" 
                  />
                ) : (
                  <User className="w-8 h-8 p-1 bg-gray-100 rounded-full" />
                )}
                <div>
                  <p className="font-semibold">{comment.user.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
              
              {/* Comment Actions Dropdown */}
              <div className="relative group">
                <button className="p-1 rounded-full hover:bg-gray-100">
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg hidden group-hover:block">
                  {comment.user._id === 'currentUserId' && ( // Replace with actual user check
                    <button
                      onClick={() => handleDelete(comment._id)}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Comment
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <p className="text-gray-700 mb-2">{comment.content}</p>
            
            <button 
              onClick={() => handleLike(comment._id)}
              className={`flex items-center gap-1 ${
                comment.isLiked ? 'text-red-600' : 'text-gray-500'
              } hover:text-red-600`}
            >
              <ThumbsUp className={`w-4 h-4 ${comment.isLiked ? 'fill-current' : ''}`} />
              {comment.likes} {comment.likes === 1 ? 'Like' : 'Likes'}
            </button>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <button
          onClick={loadMoreComments}
          className="w-full mt-6 py-2 text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Load More Comments'}
        </button>
      )}
    </div>
  );
};

export default CommentSection;