import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import PostCard, { Post } from '../components/PostCard';
import PostCreate from '../components/PostCreate';
import { useAuth } from '../context/AuthContext';

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();

  const fetchPosts = async (pageNum: number, append = false) => {
    try {
      const response = await api.get(`/feed?page=${pageNum}&limit=10`);
      const newPosts = response.data;
      
      if (newPosts.length < 10) {
        setHasMore(false);
      }
      
      setPosts(prev => append ? [...prev, ...newPosts] : newPosts);
    } catch (err) {
      console.error('Failed to fetch feed:', err);
      setError('Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1);
  }, []);

  const handlePostCreated = (newPost: Post) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, true);
  };

  // We handle optimistic updates within the card, but we also want to keep
  // the parent state vaguely in sync if possible, though PostCard owns its local UI state.
  const handleLikeToggle = (postId: string, newLikedState: boolean, newCount: number) => {
     setPosts(prevPosts => 
        prevPosts.map(post => {
            if (post.id === postId) {
                // Update local likes array for initial state of re-renders
                const currentLikes = post.likes || [];
                const updatedLikes = newLikedState 
                    ? [...currentLikes, { userId: user?.id || '' }]
                    : currentLikes.filter(like => like.userId !== user?.id);
                    
                return {
                    ...post,
                    _count: { likes: newCount },
                    likes: updatedLikes
                };
            }
            return post;
        })
     );
  };

  if (loading && page === 1) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 px-4 sm:px-0">Home</h1>
      
      {user && <PostCreate onPostCreated={handlePostCreated} />}
      
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6 text-center">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        {posts.map(post => (
          <PostCard key={post.id} post={post} onLikeToggle={handleLikeToggle} />
        ))}
        
        {posts.length === 0 && !error && (
          <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow border border-gray-100">
            No posts yet. Be the first to share something!
          </div>
        )}
      </div>
      
      {hasMore && posts.length > 0 && (
        <div className="mt-8 text-center">
          <button 
            onClick={handleLoadMore}
            className="px-6 py-2 bg-white border border-gray-200 rounded-full font-medium text-blue-500 hover:bg-gray-50 transition-colors shadow-sm"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default Feed;
