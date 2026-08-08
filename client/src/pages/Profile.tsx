import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { User } from '../context/AuthContext';

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/users/${username}`);
        setProfile(response.data);
        if (response.data.bio) {
          setBio(response.data.bio);
        }
      } catch (err: any) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/users/profile', { bio });
      setProfile({ ...profile!, bio });
      setIsEditing(false);
    } catch (err: any) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading profile...</div>;
  if (error) return <div className="text-center text-red-600 py-10">{error}</div>;
  if (!profile) return <div className="text-center py-10">Profile not found</div>;

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-32 bg-indigo-600"></div>
        <div className="px-6 py-4 flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-12 space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="h-24 w-24 rounded-full border-4 border-white bg-white overflow-hidden shadow-sm flex-shrink-0">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.username} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-400 text-3xl font-bold uppercase">
                {profile.username[0]}
              </div>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left mb-2 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-900">{profile.username}</h1>
            <p className="text-sm text-gray-500">Joined {new Date(profile.createdAt).toLocaleDateString()}</p>
          </div>
          {isOwnProfile && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          )}
        </div>

        <div className="px-6 py-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">About</h3>
          
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
              />
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap">
              {profile.bio || 'No bio provided yet.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
