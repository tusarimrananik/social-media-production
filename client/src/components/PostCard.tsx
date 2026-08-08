import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export interface Post {
  id: string;
  content: string | null;
  imageUrl: string | null;
  createdAt: string;
  author: {
    username: string;
    avatarUrl: string | null;
  };
  _count: {
    likes: number;
  };
  likes: { userId: string }[];
}

interface PostCardProps {
  post: Post;
  onLikeToggle?: (postId: string, newLikedState: boolean, newCount: number) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLikeToggle }) => {
  const { user } = useAuth();
  
  const isInitiallyLiked = user ? post.likes?.some(like => like.userId === user.id) : false;
  
  const [isLiked, setIsLiked] = useState(isInitiallyLiked);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [isLiking, setIsLiking] = useState(false);

  const handleToggleLike = async () => {
    if (!user) return;
    
    // Optimistic update
    const newLikedState = !isLiked;
    const newCount = newLikedState ? likeCount + 1 : likeCount - 1;
    
    setIsLiked(newLikedState);
    setLikeCount(newCount);
    if (onLikeToggle) {
        onLikeToggle(post.id, newLikedState, newCount);
    }
    setIsLiking(true);

    try {
      await api.post(`/posts/${post.id}/like`);
    } catch (error) {
      // Revert on failure
      setIsLiked(!newLikedState);
      setLikeCount(newLikedState ? newCount - 1 : newCount + 1);
      if (onLikeToggle) {
        onLikeToggle(post.id, !newLikedState, newLikedState ? newCount - 1 : newCount + 1);
      }
      console.error('Failed to toggle like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const formattedDate = new Date(post.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex items-center mb-4">
        <Link to={`/profile/${post.author.username}`} className="flex items-center group">
          {post.author.avatarUrl ? (
             <img src={post.author.avatarUrl} alt={post.author.username} className="w-10 h-10 rounded-full object-cover mr-3" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3 text-gray-500 font-bold">
               {post.author.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 group-hover:underline">@{post.author.username}</h3>
            <p className="text-xs text-gray-500">{formattedDate}</p>
          </div>
        </Link>
      </div>
      
      {post.content && <p className="text-gray-800 whitespace-pre-wrap mb-4">{post.content}</p>}
      
      {post.imageUrl && (
        <div className="mb-4 rounded-lg overflow-hidden border border-gray-100">
          <img src={post.imageUrl} alt="Post content" className="w-full h-auto max-h-[500px] object-contain bg-gray-50" />
        </div>
      )}
      
      <div className="flex items-center border-t border-gray-100 pt-3">
        <button 
          onClick={handleToggleLike}
          disabled={!user || isLiking}
          className={`flex items-center space-x-1 ${!user ? 'opacity-50 cursor-not-allowed' : ''} ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'} transition-colors`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isLiked ? 0 : 1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          <span className="font-medium">{likeCount}</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
