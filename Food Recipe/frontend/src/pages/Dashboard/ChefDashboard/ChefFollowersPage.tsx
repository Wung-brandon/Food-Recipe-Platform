import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../Layout/DashboardLayout';

type User = {
  id: number;
  username: string;
  name: string;
  avatar: string;
  bio: string;
  isFollowing: boolean;
  recipes: number;
  followers: number;
};

const FollowersPage = () => {
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');
  const [searchQuery, setSearchQuery] = useState('');
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulated data fetch
  useEffect(() => {
    // Simulating API call
    setTimeout(() => {
      const demoFollowers = [
        { id: 1, username: 'olivia_chef', name: 'Olivia Wilson', avatar: 'O', bio: 'Pastry chef specializing in French desserts', isFollowing: false, recipes: 24, followers: 1.2 },
        { id: 2, username: 'marcus_bbq', name: 'Marcus Johnson', avatar: 'M', bio: 'BBQ enthusiast and grill master', isFollowing: true, recipes: 36, followers: 3.5 },
        { id: 3, username: 'sophia_vegan', name: 'Sophia Chen', avatar: 'S', bio: 'Plant-based recipe developer and food photographer', isFollowing: false, recipes: 52, followers: 5.1 },
        { id: 4, username: 'chef_carlos', name: 'Carlos Rodriguez', avatar: 'C', bio: 'Professional chef sharing authentic Latin recipes', isFollowing: false, recipes: 78, followers: 8.7 },
        { id: 5, username: 'emily_bakes', name: 'Emily Thompson', avatar: 'E', bio: 'Home baker and cookbook author', isFollowing: true, recipes: 45, followers: 2.3 },
        { id: 6, username: 'james_paleo', name: 'James Wilson', avatar: 'J', bio: 'Paleo enthusiast focusing on healthy meal prep', isFollowing: false, recipes: 31, followers: 1.8 },
      ];

      const demoFollowing = [
        { id: 2, username: 'marcus_bbq', name: 'Marcus Johnson', avatar: 'M', bio: 'BBQ enthusiast and grill master', isFollowing: true, recipes: 36, followers: 3.5 },
        { id: 5, username: 'emily_bakes', name: 'Emily Thompson', avatar: 'E', bio: 'Home baker and cookbook author', isFollowing: true, recipes: 45, followers: 2.3 },
        { id: 7, username: 'chef_mike', name: 'Mike Peterson', avatar: 'M', bio: 'Restaurant owner sharing professional tips', isFollowing: true, recipes: 64, followers: 7.2 },
        { id: 8, username: 'tanya_spice', name: 'Tanya Sharma', avatar: 'T', bio: 'Spice expert and Indian cuisine specialist', isFollowing: true, recipes: 42, followers: 4.9 },
      ];

      setFollowers(demoFollowers);
      setFollowing(demoFollowing);
      setIsLoading(false);
    }, 800);
  }, []);

  const handleToggleFollow = (userId, currentTab) => {
    if (currentTab === 'followers') {
      setFollowers(followers.map(follower => 
        follower.id === userId 
          ? { ...follower, isFollowing: !follower.isFollowing } 
          : follower
      ));
    } else {
      // For the following tab, we remove the user from following when unfollowed
      setFollowing(following.filter(user => 
        user.id !== userId
      ));
    }
  };

  const filteredUsers = activeTab === 'followers'
    ? followers.filter(user => 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : following.filter(user => 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const UserCard = ({ user, onToggleFollow }) => (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row sm:items-center">
      <div className="h-14 w-14 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 text-xl font-bold">
        {user.avatar}
      </div>
      <div className="mt-3 sm:mt-0 sm:ml-4 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-medium text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-500">@{user.username}</p>
          </div>
          <button 
            onClick={() => onToggleFollow(user.id, activeTab)}
            className={`mt-2 sm:mt-0 px-4 py-1 text-sm font-medium rounded-full ${
              user.isFollowing 
                ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                : 'bg-amber-600 text-white hover:bg-amber-700'
            }`}
          >
            {user.isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-600">{user.bio}</p>
        <div className="mt-2 flex text-sm text-gray-500">
          <span className="mr-4">{user.recipes} recipes</span>
          <span>{user.followers}k followers</span>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout title="Network">
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Network</h1>
          <p className="mt-1 text-sm text-gray-600">Manage your followers and the chefs you follow</p>
        </div>

        {/* Tabs and Search */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('followers')}
                className={`px-4 py-4 text-sm font-medium ${
                  activeTab === 'followers'
                    ? 'border-b-2 border-amber-600 text-amber-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Followers ({followers.length})
              </button>
              <button
                onClick={() => setActiveTab('following')}
                className={`px-4 py-4 text-sm font-medium ${
                  activeTab === 'following'
                    ? 'border-b-2 border-amber-600 text-amber-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Following ({following.length})
              </button>
            </div>
          </div>
          
          {/* Search field */}
          <div className="p-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name or username"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Users list */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
            </div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <UserCard 
                key={user.id} 
                user={user} 
                onToggleFollow={handleToggleFollow} 
              />
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-amber-600 mx-auto">
                <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No {activeTab} found</h3>
              <p className="mt-2 text-gray-500">
                {activeTab === 'followers' 
                  ? 'You don\'t have any followers matching your search criteria yet.' 
                  : 'You\'re not following anyone matching your search criteria yet.'}
              </p>
              {activeTab === 'following' && (
                <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
                  Discover chefs to follow
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination - only show if more than 10 results */}
        {filteredUsers.length > 10 && (
          <div className="flex justify-center mt-6">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <a
                href="#"
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </a>
              <a
                href="#"
                aria-current="page"
                className="z-10 bg-amber-50 border-amber-500 text-amber-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
              >
                1
              </a>
              <a
                href="#"
                className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
              >
                2
              </a>
              <a
                href="#"
                className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
              >
                3
              </a>
              <a
                href="#"
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </a>
            </nav>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FollowersPage;