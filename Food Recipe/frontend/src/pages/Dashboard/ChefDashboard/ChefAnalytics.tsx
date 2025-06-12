import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../Layout/DashboardLayout';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../../context/AuthContext';
import { Link } from 'react-router-dom';

type RecipePerformance = {
  name: string;
  views: number;
  likes: number;
  comments: number;
  conversionRate?: string;
};

type AnalyticsData = {
  viewsData: { name: string; views: number; uniqueVisitors: number }[];
  recipesPerformance: RecipePerformance[];
  followers: { count: number; growth: number; growthPercentage?: number };
  engagement: { 
    likes: number; 
    comments: number; 
    shares: number; 
    saves: number;
    likesPercentage?: number;
    commentsPercentage?: number;
    sharesPercentage?: number;
    savesPercentage?: number;
  };
  topRecipes: RecipePerformance[];
  categoryDistribution: { name: string; value: number }[];
};


 
const API_BASE_URL = 'http://localhost:8000';

const AnalyticsPage = () => {
  const [selectedRange, setSelectedRange] = useState('30days');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    viewsData: [],
    recipesPerformance: [],
    followers: { count: 0, growth: 0, growthPercentage: 0 },
    engagement: { 
      likes: 0, 
      comments: 0, 
      shares: 0, 
      saves: 0,
      likesPercentage: 0,
      commentsPercentage: 0,
      sharesPercentage: 0,
      savesPercentage: 0
    },
    topRecipes: [],
    categoryDistribution: []
  });
  const { token } = useAuth();

  // Enhanced API service functions
  const apiService = {
    // Get analytics data with better error handling
    getAnalytics: async (range: string) => {
      if (!token) {
        throw new Error('No authentication token available');
      }

      console.log('Making analytics request with token:', token);

      const response = await fetch(`${API_BASE_URL}/api/analytics/recipe-analytics/?range=${range}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Fixed: Changed from Bearer to Token
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to view analytics.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
        throw new Error(`Failed to fetch analytics data: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Analytics data received:', data);
      return data;
    },

    // Track recipe view with better error handling
    trackView: async (recipeId: string, timeSpent: number = 0) => {
      const response = await fetch(`${API_BASE_URL}/api/analytics/track-view/`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '', // Fixed: Changed from Bearer to Token
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipe_id: recipeId,
          time_spent: timeSpent,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to track view');
      }
      
      return response.json();
    },

    // Handle engagement actions with better error handling
    handleEngagement: async (action: string, recipeId: string, additionalData?: any) => {
      if (!token) {
        throw new Error('Authentication required for engagement actions');
      }

      const requestBody: any = {
        action,
        recipe_id: recipeId,
      };

      if (action === 'comment' && additionalData?.comment) {
        requestBody.comment = additionalData.comment;
      }
      if (action === 'share' && additionalData?.platform) {
        requestBody.platform = additionalData.platform;
      }

      const response = await fetch(`${API_BASE_URL}/api/analytics/engagement/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, // Fixed: Changed from Bearer to Token
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed');
        }
        throw new Error(`Failed to ${action}`);
      }
      
      return response.json();
    },

    // Download analytics report
    downloadReport: async (range: string) => {
      if (!token) {
        throw new Error('Authentication required');
      }

      try {
        const data = await apiService.getAnalytics(range);
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `analytics-report-${range}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        throw new Error('Failed to download report');
      }
    }
  };

  // Fetch analytics data from backend
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Fetching analytics data with token:', token);
        const data = await apiService.getAnalytics(selectedRange);
        
        // Process the data to match frontend structure
        const processedData: AnalyticsData = {
          viewsData: data.viewsData || [],
          recipesPerformance: data.recipesPerformance || [],
          followers: {
            count: data.followers?.count || 0,
            growth: data.followers?.growth || 0,
            growthPercentage: data.followers?.growthPercentage || 0
          },
          engagement: {
            likes: data.engagement?.likes || 0,
            comments: data.engagement?.comments || 0,
            shares: data.engagement?.shares || 0,
            saves: data.engagement?.saves || 0,
            likesPercentage: data.engagement?.likesPercentage || 0,
            commentsPercentage: data.engagement?.commentsPercentage || 0,
            sharesPercentage: data.engagement?.sharesPercentage || 0,
            savesPercentage: data.engagement?.savesPercentage || 0
          },
          topRecipes: data.topRecipes || [],
          categoryDistribution: data.categoryDistribution || []
        };
        
        console.log('Processed analytics data:', processedData);
        setAnalyticsData(processedData);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analytics data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchAnalyticsData();
    } else {
      setError('Please log in to view analytics');
      setIsLoading(false);
    }
  }, [selectedRange, token]);

  // Helper function to format percentage change
  const formatPercentageChange = (percentage: number): string => {
    if (percentage > 0) return `+${percentage}%`;
    if (percentage < 0) return `${percentage}%`;
    return '0%';
  };

  // Helper function to get percentage color class
  const getPercentageColorClass = (percentage: number): string => {
    if (percentage > 0) return 'text-green-500';
    if (percentage < 0) return 'text-red-500';
    return 'text-gray-500';
  };
  
  // Custom colors for charts
  const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
  
  // Card component for metrics
  const MetricCard = ({ title, value, subValue, subText, icon }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="p-3 rounded-md bg-amber-100 text-amber-600">
          {icon}
        </div>
        <div className="ml-5">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="flex items-end mt-1">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {subValue !== undefined && (
              <p className={`ml-2 mb-1 text-sm font-medium ${subValue > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {subValue > 0 ? '+' : ''}{subValue}% {subText}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Error state
  // if (error) {
  //   return (
  //     <DashboardLayout title="Analytics">
  //       <div className="flex flex-col items-center justify-center py-20">
  //         <div className="text-red-500 mb-4">
  //           <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  //           </svg>
  //         </div>
  //         <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Analytics</h3>
  //         <p className="text-gray-500 mb-4">{error}</p>
  //         <button
  //           onClick={() => window.location.reload()}
  //           className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700"
  //         >
  //           Retry
  //         </button>
  //       </div>
  //     </DashboardLayout>
  //   );
  // }

  return (
    <DashboardLayout title="Analytics">
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Recipe Analytics</h1>
            <p className="mt-1 text-sm text-gray-600">Track your recipe performance and audience growth</p>
          </div>
          
          {/* Time range selector */}
          <div className="mt-4 md:mt-0">
            <select
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
              disabled={isLoading}
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="12months">Last 12 Months</option>
            </select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
          </div>
        ) : (
          <>
            {/* Overview cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Total Views"
                value={analyticsData.viewsData.reduce((sum, item) => sum + item.views, 0).toLocaleString()}
                subValue={12} // You can calculate this from previous period data
                subText="vs previous period"
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                }
              />
              
              <MetricCard
                title="Followers"
                value={analyticsData.followers.count.toLocaleString()}
                subValue={analyticsData.followers.growth}
                subText="new followers"
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
              />
              
              <MetricCard
                title="Recipe Likes"
                value={analyticsData.engagement.likes.toLocaleString()}
                subValue={8} // You can calculate this from previous period data
                subText="vs previous period"
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                }
              />
              
              <MetricCard
                title="Recipe Comments"
                value={analyticsData.engagement.comments.toLocaleString()}
                subValue={-3} // You can calculate this from previous period data
                subText="vs previous period"
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                }
              />
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Views Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900">Views Over Time</h2>
                {analyticsData.viewsData.length > 0 ? (
                  <div className="mt-2 h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={analyticsData.viewsData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="views" stroke="#F59E0B" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="uniqueVisitors" stroke="#10B981" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="mt-2 h-80 flex items-center justify-center text-gray-500">
                    No views data available for this period
                  </div>
                )}
              </div>
              
              {/* Recipe Performance Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900">Recipe Performance</h2>
                {analyticsData.recipesPerformance.length > 0 ? (
                  <div className="mt-2 h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analyticsData.recipesPerformance}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="views" fill="#F59E0B" />
                        <Bar dataKey="likes" fill="#10B981" />
                        <Bar dataKey="comments" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="mt-2 h-80 flex items-center justify-center text-gray-500">
                    No recipe performance data available
                  </div>
                )}
              </div>
              
              {/* Category Distribution Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900">Recipe Categories</h2>
                {analyticsData.categoryDistribution.length > 0 ? (
                  <div className="mt-2 h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.categoryDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {analyticsData.categoryDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="mt-2 h-80 flex items-center justify-center text-gray-500">
                    No category distribution data available
                  </div>
                )}
              </div>
              
              {/* Top Recipes */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900">Top Performing Recipes</h2>
                {analyticsData.topRecipes.length > 0 ? (
                  <div className="mt-6 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Recipe
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Views
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Likes
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Conv. Rate
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {analyticsData.topRecipes.map((recipe, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {recipe.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {recipe.views.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {recipe.likes.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                parseFloat(recipe.conversionRate ?? '0') > 15 
                                  ? 'bg-green-100 text-green-800' 
                                  : parseFloat(recipe.conversionRate ?? '0') > 10
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {recipe.conversionRate}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="mt-6 text-center text-gray-500">
                    No top recipes data available
                  </div>
                )}
                <div className="mt-6">
                  <Link to="/dashboard/chef/recipe" className="text-sm font-medium text-amber-600 hover:text-amber-500">
                    View all recipes →
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Engagement Analysis */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900">Engagement Breakdown</h2>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="border border-gray-200 rounded-lg p-4 text-center">
                  <div className="text-amber-600 mx-auto inline-block p-3 rounded-full bg-amber-100">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-500">Likes</p>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">{analyticsData.engagement.likes.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 text-center">
                  <div className="text-amber-600 mx-auto inline-block p-3 rounded-full bg-amber-100">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-500">Comments</p>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">{analyticsData.engagement.comments.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 text-center">
                  <div className="text-amber-600 mx-auto inline-block p-3 rounded-full bg-amber-100">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-500">Shares</p>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">{analyticsData.engagement.shares.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 text-center">
                  <div className="text-amber-600 mx-auto inline-block p-3 rounded-full bg-amber-100">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-500">Recipe Saves</p>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">{analyticsData.engagement.saves.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tips and Insights */}
            <div className="bg-amber-50 border border-amber-100 rounded-lg shadow p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-amber-800">Insights for Growth</h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Your top recipe has a {analyticsData.topRecipes[0]?.conversionRate}% conversion rate - great engagement!</li>
                      <li>You have {analyticsData.followers.growth} new followers this period. Keep up the consistent posting!</li>
                      <li>Total engagement across all recipes shows strong community interest in your content.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            {/* <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button 
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                onClick={() => {
                  // Implement download functionality
                  console.log('Download report clicked');
                }}
              >
                <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Report
              </button>
              <button 
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                onClick={() => {
                  // Implement personalized tips functionality
                  console.log('Get personalized tips clicked');
                }}
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Get Personalized Tips
              </button>
            </div> */}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

// Export the API service for use in other components
// export { apiService };
export default AnalyticsPage;