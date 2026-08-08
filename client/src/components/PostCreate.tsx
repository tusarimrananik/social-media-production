import React, { useState, useRef } from 'react';
import api from '../utils/api';
import { uploadMedia } from '../utils/upload';
import { useAuth } from '../context/AuthContext';
import { Post } from './PostCard';

interface PostCreateProps {
  onPostCreated: (newPost: Post) => void;
}

const PostCreate: React.FC<PostCreateProps> = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const clearFile = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !file) return;

    setIsSubmitting(true);
    setError(null);

    try {
      let imageUrl = null;
      if (file) {
        imageUrl = await uploadMedia(file, 'post');
      }

      const response = await api.post('/posts', {
        content: content.trim() || null,
        imageUrl
      });

      // The backend needs to return the new post populated with author and like details
      // Assuming it does:
      onPostCreated(response.data);
      
      // Reset form
      setContent('');
      clearFile();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6 border border-gray-200">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start space-x-3 mb-3">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.username} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 font-bold">
               {user.username.charAt(0).toUpperCase()}
            </div>
          )}
          <textarea
            className="w-full bg-gray-50 rounded-lg border-transparent focus:border-blue-500 focus:bg-white focus:ring-0 p-3 text-gray-800 resize-none"
            rows={3}
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {previewUrl && (
          <div className="relative mb-3 ml-13">
            <img src={previewUrl} alt="Preview" className="rounded-lg max-h-64 object-contain border border-gray-200" />
            <button
              type="button"
              onClick={clearFile}
              className="absolute top-2 right-2 bg-gray-800 bg-opacity-75 text-white rounded-full p-1 hover:bg-opacity-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {error && <div className="text-red-500 text-sm mb-3 ml-13">{error}</div>}

        <div className="flex items-center justify-between ml-13 pt-2 border-t border-gray-100">
          <div className="flex items-center">
            <label className="cursor-pointer text-blue-500 hover:text-blue-600 flex items-center space-x-1 p-2 rounded-lg hover:bg-blue-50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">Photo</span>
              <input
                type="file"
                className="hidden"
                accept="image/jpeg, image/png, image/webp"
                onChange={handleFileChange}
                ref={fileInputRef}
                disabled={isSubmitting}
              />
            </label>
          </div>
          
          <button
            type="submit"
            disabled={(!content.trim() && !file) || isSubmitting}
            className={`px-4 py-1.5 rounded-full font-semibold text-white ${
              (!content.trim() && !file) || isSubmitting
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 shadow-sm'
            } transition-colors`}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostCreate;
