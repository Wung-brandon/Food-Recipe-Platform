import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  Button,
  Box,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Stack,
  Alert,
  AlertTitle,
  Tooltip,
  Badge,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip
} from '@mui/material';
import { 
  AddCircle as AddCircleIcon,
  People as PeopleIcon,
  Visibility as VisibilityIcon,
  ThumbUp as ThumbUpIcon,
  Comment as CommentIcon,
  Edit as EditIcon,
  DeleteOutline as DeleteOutlineIcon,
  Message as MessageIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Analytics as AnalyticsIcon,
  Star as StarIcon
} from '@mui/icons-material';
import DashboardLayout from '../../../Layout/DashboardLayout';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AnalyticsData } from '../../../types/AnalyticsData';
import { RecentComment } from '../../../types/RecentComments';
import { RecipeStats } from '../../../types/RecipeStats';


const API_BASE_URL = 'http://localhost:8000';
const ChefDashboard: React.FC = () => {
  const { user, checkChefStatus, token } = useAuth();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<string>('pending');
  const [loading, setLoading] = useState<boolean>(true);
  const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(false);
  const [commentsLoading, setCommentsLoading] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<string>('30days');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string>('');
  const [stats, setStats] = useState({
    totalRecipes: 0,
    totalViews: 0,
    totalLikes: 0,
    followers: 0
  });
  const [recentRecipes, setRecentRecipes] = useState<RecipeStats[]>([]);
  const [recentComments, setRecentComments] = useState<RecentComment[]>([]);

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  // Helper function to get user avatar
  const getUserAvatar = (comment: RecentComment) => {
    if (comment.user?.profile_picture) {
      return comment.user.profile_picture;
    }
    // Generate a color based on username for consistent avatar colors
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
    const colorIndex = comment.username.charCodeAt(0) % colors.length;
    return colors[colorIndex];
  };

  // Fetch recent comments from API
  const fetchRecentComments = async () => {
    setCommentsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/recipes/recent-reviews/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (response.data.success) {
        setRecentComments(response.data.data);
      } else {
        console.error('Failed to fetch recent comments:', response.data);
        setError('Failed to load recent comments');
      }
    } catch (error: any) {
      console.error('Error fetching recent comments:', error);
      setError('Failed to load recent comments. Please try again.');
      // Keep existing comments or set to empty array
      setRecentComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Fetch analytics data from API
  const fetchAnalyticsData = async (range: string = '30days') => {
    setAnalyticsLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/analytics/recipe-analytics/?range=${range}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      setAnalyticsData(response.data);
      
      // Update stats from analytics data
      const totalViews = response.data.viewsData.reduce((sum: number, item: any) => sum + item.views, 0);
      const totalLikes = response.data.engagement.likes;
      const recipesCount = response.data.recipesPerformance.length;
      
      setStats(prev => ({
        ...prev,
        totalRecipes: recipesCount,
        totalViews: totalViews,
        totalLikes: totalLikes,
        followers: response.data.followers.count
      }));
      
      // Update recent recipes from performance data
      setRecentRecipes(response.data.recipesPerformance.slice(0, 3).map((recipe: any, index: number) => ({
        id: index + 1,
        title: recipe.name,
        views: recipe.views,
        likes: recipe.likes,
        comments: recipe.comments
      })));
      
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data. Using sample data.');
      
      // Fallback to sample data
      setStats({
        totalRecipes: 15,
        totalViews: 8745,
        totalLikes: 532,
        followers: 124
      });
      
      setRecentRecipes([
        { id: 1, title: 'Homemade Pizza', views: 1245, likes: 98, comments: 23 },
        { id: 2, title: 'Chocolate Soufflé', views: 982, likes: 76, comments: 15 },
        { id: 3, title: 'Beef Wellington', views: 763, likes: 45, comments: 8 },
      ]);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleTimeRangeChange = (newRange: string) => {
    setTimeRange(newRange);
    fetchAnalyticsData(newRange);
  };

  const formatPercentageChange = (percentage: number) => {
    const isPositive = percentage >= 0;
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        {isPositive ? (
          <TrendingUpIcon sx={{ color: '#10b981', fontSize: 16, mr: 0.5 }} />
        ) : (
          <TrendingDownIcon sx={{ color: '#ef4444', fontSize: 16, mr: 0.5 }} />
        )}
        <Typography 
          variant="caption" 
          sx={{ 
            color: isPositive ? '#10b981' : '#ef4444',
            fontWeight: 'medium'
          }}
        >
          {Math.abs(percentage)}% {isPositive ? 'increase' : 'decrease'}
        </Typography>
      </Box>
    );
  };

  // Render star rating
  const renderStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarIcon key={i} sx={{ color: '#ffd700', fontSize: 16 }} />
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <StarIcon key="half" sx={{ color: '#ffd700', fontSize: 16, opacity: 0.5 }} />
      );
    }
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
        {stars}
        <Typography variant="caption" sx={{ ml: 0.5, color: 'text.secondary' }}>
          ({rating.toFixed(1)})
        </Typography>
      </Box>
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get chef verification status
        try {
          const status = await checkChefStatus();
          setVerificationStatus(status);
        } catch (error) {
          console.error('Error checking chef status:', error);
          setVerificationStatus('error');
        }

        // Fetch analytics data and recent comments in parallel
        await Promise.all([
          fetchAnalyticsData(timeRange),
          fetchRecentComments()
        ]);
        
      } catch (error) {
        console.error('Error fetching chef data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  return (
    <DashboardLayout title="Chef Dashboard">
      {/* Error Alert */}
      {error && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Verification Status Alert */}
      {verificationStatus === 'pending' && (
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small">
              Details
            </Button>
          }
        >
          <AlertTitle>Verification Pending</AlertTitle>
          Your chef profile is currently under review. You'll be notified once it's approved.
        </Alert>
      )}
      
      {verificationStatus === 'rejected' && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="error" size="small">
              Appeal
            </Button>
          }
        >
          <AlertTitle>Verification Rejected</AlertTitle>
          Your chef profile verification was rejected. Please check your email for details.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Welcome section with time range selector */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 2,
              background: 'linear-gradient(to right, #d97706, #f59e0b)',
              color: 'white',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h4" gutterBottom>
                  Welcome Chef {user?.username || ''}!
                </Typography>
                <Typography variant="body1">
                  Share your culinary expertise and inspire home cooks around the world.
                </Typography>
              </Box>
              <Box>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel sx={{ color: 'white', '&.Mui-focused': { color: 'white' } }}>
                    Time Range
                  </InputLabel>
                  <Select
                    value={timeRange}
                    onChange={(e) => handleTimeRangeChange(e.target.value)}
                    sx={{
                      color: 'white',
                      '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                      '.MuiSvgIcon-root': { color: 'white' }
                    }}
                  >
                    <MenuItem value="7days">Last 7 Days</MenuItem>
                    <MenuItem value="30days">Last 30 Days</MenuItem>
                    <MenuItem value="90days">Last 90 Days</MenuItem>
                    <MenuItem value="12months">Last 12 Months</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Enhanced Stats cards with percentage changes */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Recipes
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {analyticsLoading ? '...' : stats.totalRecipes}
              </Typography>
              <Button 
                startIcon={<AddCircleIcon />}
                sx={{ mt: 2, color: '#d97706' }}
                onClick={() => navigate('/dashboard/chef/create-recipe')}
              >
                Add New
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Views
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {analyticsLoading ? '...' : stats.totalViews.toLocaleString()}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <VisibilityIcon sx={{ color: '#64748b', mr: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  {timeRange.replace('days', ' days').replace('months', ' months')}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Likes
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {analyticsLoading ? '...' : stats.totalLikes.toLocaleString()}
              </Typography>
              {analyticsData?.engagement && formatPercentageChange(analyticsData.engagement.likesPercentage)}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Followers
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {analyticsLoading ? '...' : stats.followers}
              </Typography>
              {analyticsData?.followers && formatPercentageChange(analyticsData.followers.growthPercentage)}
              <Button 
                startIcon={<PeopleIcon />}
                sx={{ mt: 1, color: '#d97706' }}
                size="small"
                onClick={() => navigate('/dashboard/chef/followers')}
              >
                View All
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Engagement Stats Row */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AnalyticsIcon sx={{ mr: 1, color: '#d97706' }} />
              <Typography variant="h6">Engagement Overview</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    <ThumbUpIcon sx={{ color: '#d97706', mr: 0.5 }} />
                    <Typography variant="h6">
                      {analyticsLoading ? '...' : analyticsData?.engagement.likes || 0}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">Likes</Typography>
                  {analyticsData?.engagement && (
                    <Chip 
                      size="small" 
                      label={`${analyticsData.engagement.likesPercentage > 0 ? '+' : ''}${analyticsData.engagement.likesPercentage}%`}
                      color={analyticsData.engagement.likesPercentage >= 0 ? 'success' : 'error'}
                      sx={{ mt: 0.5 }}
                    />
                  )}
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    <CommentIcon sx={{ color: '#d97706', mr: 0.5 }} />
                    <Typography variant="h6">
                      {analyticsLoading ? '...' : analyticsData?.engagement.comments || 0}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">Comments</Typography>
                  {analyticsData?.engagement && (
                    <Chip 
                      size="small" 
                      label={`${analyticsData.engagement.commentsPercentage > 0 ? '+' : ''}${analyticsData.engagement.commentsPercentage}%`}
                      color={analyticsData.engagement.commentsPercentage >= 0 ? 'success' : 'error'}
                      sx={{ mt: 0.5 }}
                    />
                  )}
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    <ShareIcon sx={{ color: '#d97706', mr: 0.5 }} />
                    <Typography variant="h6">
                      {analyticsLoading ? '...' : analyticsData?.engagement.shares || 0}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">Shares</Typography>
                  {analyticsData?.engagement && (
                    <Chip 
                      size="small" 
                      label={`${analyticsData.engagement.sharesPercentage > 0 ? '+' : ''}${analyticsData.engagement.sharesPercentage}%`}
                      color={analyticsData.engagement.sharesPercentage >= 0 ? 'success' : 'error'}
                      sx={{ mt: 0.5 }}
                    />
                  )}
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    <BookmarkIcon sx={{ color: '#d97706', mr: 0.5 }} />
                    <Typography variant="h6">
                      {analyticsLoading ? '...' : analyticsData?.engagement.saves || 0}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">Saves</Typography>
                  {analyticsData?.engagement && (
                    <Chip 
                      size="small" 
                      label={`${analyticsData.engagement.savesPercentage > 0 ? '+' : ''}${analyticsData.engagement.savesPercentage}%`}
                      color={analyticsData.engagement.savesPercentage >= 0 ? 'success' : 'error'}
                      sx={{ mt: 0.5 }}
                    />
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Recipe Stats */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Recent Recipe Performance</Typography>
              <Button 
                size="small" 
                sx={{ color: '#d97706' }}
                onClick={() => navigate('/dashboard/chef/recipe')}
              >
                View All
              </Button>
            </Box>
            
            {analyticsLoading ? (
              <LinearProgress sx={{ my: 4 }} />
            ) : (
              <Stack spacing={2}>
                {recentRecipes.map((recipe) => (
                  <Card key={recipe.id} variant="outlined">
                    <CardContent sx={{ pb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                          {recipe.title}
                        </Typography>
                        <Box>
                          <Tooltip title="Edit Recipe">
                            <IconButton size="small">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Recipe">
                            <IconButton size="small" color="error">
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', mt: 1, mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                          <VisibilityIcon fontSize="small" sx={{ color: '#64748b', mr: 0.5 }} />
                          <Typography variant="body2">{recipe.views.toLocaleString()}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                          <ThumbUpIcon fontSize="small" sx={{ color: '#64748b', mr: 0.5 }} />
                          <Typography variant="body2">{recipe.likes}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CommentIcon fontSize="small" sx={{ color: '#64748b', mr: 0.5 }} />
                          <Typography variant="body2">{recipe.comments}</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>

        {/* Recent Comments - Updated with dynamic data */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Recent Reviews</Typography>
              <Badge badgeContent={recentComments.length} color="error">
                <MessageIcon />
              </Badge>
            </Box>
            
            {commentsLoading ? (
              <LinearProgress sx={{ my: 4 }} />
            ) : recentComments.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CommentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  No recent reviews yet
                </Typography>
              </Box>
            ) : (
              <List sx={{ width: '100%', maxHeight: 400, overflow: 'auto' }}>
                {recentComments.map((comment) => (
                  <React.Fragment key={comment.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar 
                          alt={comment.user?.username || comment.username} 
                          src={comment.user?.profile_picture}
                          sx={{ 
                            bgcolor: typeof getUserAvatar(comment) === 'string' ? getUserAvatar(comment) : undefined 
                          }}
                        >
                          {!comment.user?.profile_picture && (comment.user?.username || comment.username).charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                              <Typography sx={{ fontWeight: 'medium' }}>
                                {comment.user?.username || comment.username}
                              </Typography>
                              {comment.rating > 0 && renderStarRating(comment.rating)}
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(comment.created_at)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                              sx={{ display: 'block', mb: 0.5 }}
                            >
                              {comment.text}
                            </Typography>
                            <Typography
                              component="span"
                              variant="caption"
                              color="text.secondary"
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                fontStyle: 'italic'
                              }}
                            >
                              on "{comment.recipe_title}"
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {comment.id !== recentComments[recentComments.length - 1].id && (
                      <Divider variant="inset" component="li" />
                    )}
                  </React.Fragment>
                ))}
              </List>
            )}

            {/* Refresh button for comments */}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button 
                size="small" 
                onClick={fetchRecentComments}
                disabled={commentsLoading}
                sx={{ color: '#d97706' }}
              >
                {commentsLoading ? 'Refreshing...' : 'Refresh Reviews'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default ChefDashboard;