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
  Badge
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  AddCircle as AddCircleIcon,
  MenuBook as MenuBookIcon,
  People as PeopleIcon,
  Visibility as VisibilityIcon,
  ThumbUp as ThumbUpIcon,
  Comment as CommentIcon,
  Edit as EditIcon,
  DeleteOutline as DeleteOutlineIcon,
  Notifications as NotificationsIcon,
  Message as MessageIcon
} from '@mui/icons-material';
import DashboardLayout from '../../../Layout/DashboardLayout';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface RecipeStats {
  id: number;
  title: string;
  views: number;
  likes: number;
  comments: number;
}

interface RecentComment {
  id: number;
  author: string;
  avatar: string;
  comment: string;
  date: string;
  recipeTitle: string;
}

const ChefDashboard: React.FC = () => {
  const { user, checkChefStatus } = useAuth();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<string>('pending');
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState({
    totalRecipes: 0,
    totalViews: 0,
    totalLikes: 0,
    followers: 0
  });
  const [recentRecipes, setRecentRecipes] = useState<RecipeStats[]>([]);
  const [recentComments, setRecentComments] = useState<RecentComment[]>([]);

  const navItems = [
    { icon: <DashboardIcon />, text: 'Dashboard', path: '/chef-dashboard' },
    { icon: <MenuBookIcon />, text: 'My Recipes', path: '/my-recipes' },
    { icon: <AddCircleIcon />, text: 'Create Recipe', path: '/create-recipe' },
    { icon: <PeopleIcon />, text: 'Followers', path: '/followers' },
  ];

  // Sample data
  const sampleRecipes: RecipeStats[] = [
    { id: 1, title: 'Homemade Pizza', views: 1245, likes: 98, comments: 23 },
    { id: 2, title: 'Chocolate Soufflé', views: 982, likes: 76, comments: 15 },
    { id: 3, title: 'Beef Wellington', views: 763, likes: 45, comments: 8 },
  ];

  const sampleComments: RecentComment[] = [
    {
      id: 1,
      author: 'Emily Chen',
      avatar: '/api/placeholder/40/40',
      comment: 'This recipe was amazing! I made it for a dinner party and everyone loved it.',
      date: '2 hours ago',
      recipeTitle: 'Homemade Pizza'
    },
    {
      id: 2,
      author: 'Marcus Johnson',
      avatar: '/api/placeholder/40/40',
      comment: 'The instructions were so clear. Thank you for sharing!',
      date: '1 day ago',
      recipeTitle: 'Chocolate Soufflé'
    },
    {
      id: 3,
      author: 'Sofia Garcia',
      avatar: '/api/placeholder/40/40',
      comment: 'I had trouble with step 3. Could you clarify?',
      date: '2 days ago',
      recipeTitle: 'Beef Wellington'
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real application, you would fetch this data from your API
        // For now, simulating API calls with setTimeout
        
        // Get chef verification status
        try {
          const status = await checkChefStatus();
          setVerificationStatus(status);
        } catch (error) {
          console.error('Error checking chef status:', error);
          setVerificationStatus('error');
        }

        // Simulate API delay
        setTimeout(() => {
          setStats({
            totalRecipes: 15,
            totalViews: 8745,
            totalLikes: 532,
            followers: 124
          });
          setRecentRecipes(sampleRecipes);
          setRecentComments(sampleComments);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching chef data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <DashboardLayout title="Chef Dashboard" navItems={navItems}>
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
        {/* Welcome section */}
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
            <Typography variant="h4" gutterBottom>
              Welcome Chef {user?.username || ''}!
            </Typography>
            <Typography variant="body1">
              Share your culinary expertise and inspire home cooks around the world.
            </Typography>
          </Paper>
        </Grid>

        {/* Stats cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Recipes
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {stats.totalRecipes}
              </Typography>
              <Button 
                startIcon={<AddCircleIcon />}
                sx={{ mt: 2, color: '#d97706' }}
                onClick={() => navigate('/create-recipe')}
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
                {stats.totalViews.toLocaleString()}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <VisibilityIcon sx={{ color: '#64748b', mr: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  Last 30 days
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
                {stats.totalLikes.toLocaleString()}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <ThumbUpIcon sx={{ color: '#64748b', mr: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  Across all recipes
                </Typography>
              </Box>
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
                {stats.followers}
              </Typography>
              <Button 
                startIcon={<PeopleIcon />}
                sx={{ mt: 2, color: '#d97706' }}
                onClick={() => navigate('/followers')}
              >
                View All
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Recipe Stats */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Recent Recipe Performance</Typography>
              <Button 
                size="small" 
                sx={{ color: '#d97706' }}
                onClick={() => navigate('/my-recipes')}
              >
                View All
              </Button>
            </Box>
            
            {loading ? (
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

        {/* Recent Comments */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Recent Comments</Typography>
              <Badge badgeContent={3} color="error">
                <MessageIcon />
              </Badge>
            </Box>
            
            {loading ? (
              <LinearProgress sx={{ my: 4 }} />
            ) : (
              <List sx={{ width: '100%', maxHeight: 400, overflow: 'auto' }}>
                {recentComments.map((comment) => (
                  <React.Fragment key={comment.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar alt={comment.author} src={comment.avatar} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography sx={{ fontWeight: 'medium' }}>
                              {comment.author}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {comment.date}
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
                              {comment.comment}
                            </Typography>
                            <Typography
                              component="span"
                              variant="caption"
                              color="text.secondary"
                            >
                              on "{comment.recipeTitle}"
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default ChefDashboard;