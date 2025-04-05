import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Avatar, 
  Button, 
  Paper, 
  Divider, 
  Tabs, 
  Tab, 
  Box,
  IconButton,
  Grid,
  Skeleton,
  Chip,
  Rating,
  Card,
  CardMedia,
  CardContent,
  Menu,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { 
  ArrowBack, 
  LocationOn, 
  VerifiedUser, 
  Restaurant, 
  Bookmark, 
  Message, 
  Share, 
  MoreVert, 
  StarBorder,
  Instagram,
  YouTube,
  Facebook,
  Language,
  Email,
  AccessTime,
  Report
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { chef } from '../components/images';
// Types
interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  coverImage: string;
  role: string;
  bio: string;
  location: string;
  isVerified: boolean;
  joinDate: string;
  followers: number;
  following: number;
  recipes: number;
  socialMedia: {
    website?: string;
    instagram?: string;
    youtube?: string;
    facebook?: string;
  };
  specialties: string[];
  isFollowed: boolean;
}

interface RecipePreview {
  id: string;
  title: string;
  image: string;
  rating: number;
  ratingCount: number;
  cookingTime: number;
  likes: number;
}

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recipes, setRecipes] = useState<RecipePreview[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [folderMenuAnchorEl, setFolderMenuAnchorEl] = useState<null | HTMLElement>(null);
  
  // Fetch user profile and recipes
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockUserProfile: UserProfile = {
        id: userId || 'user-1',
        name: 'Chef Maria Rodriguez',
        avatar: chef,
        coverImage: chef,
        role: 'Professional Chef & Food Blogger',
        bio: 'Award-winning chef with 15 years of experience specializing in Mediterranean and Latin American cuisine. Author of "Flavors Without Borders" cookbook and host of the weekly cooking show "Kitchen Journeys".',
        location: 'Barcelona, Spain',
        isVerified: true,
        joinDate: 'Member since January 2020',
        followers: 15648,
        following: 283,
        recipes: 147,
        socialMedia: {
          website: 'https://chefmaria.example.com',
          instagram: 'chef_maria',
          youtube: 'ChefMariaOfficial',
          facebook: 'ChefMariaRodriguez'
        },
        specialties: ['Mediterranean', 'Latin American', 'Pastry', 'Seafood', 'Vegetarian'],
        isFollowed: false
      };
      
      const mockRecipes: RecipePreview[] = Array(12).fill(null).map((_, index) => ({
        id: `recipe-${index + 1}`,
        title: `Recipe ${index + 1}: ${['Paella', 'Tiramisu', 'Seafood Pasta', 'Vegetable Curry', 'Churros', 'Gazpacho', 'Risotto', 'Salmon Tartare'][index % 8]}`,
        image: `/api/placeholder/400/300`,
        rating: 3.5 + (Math.random() * 1.5),
        ratingCount: Math.floor(Math.random() * 200) + 20,
        cookingTime: Math.floor(Math.random() * 50) + 10,
        likes: Math.floor(Math.random() * 500) + 50
      }));
      
      setUserProfile(mockUserProfile);
      setRecipes(mockRecipes);
      setIsFollowing(mockUserProfile.isFollowed);
      setLoading(false);
    }, 1500);
  }, [userId]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  const handleFolderMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFolderMenuAnchorEl(event.currentTarget);
  };
  
  const handleFolderMenuClose = () => {
    setFolderMenuAnchorEl(null);
  };
  
  const handleFollowToggle = () => {
    setIsFollowing(prev => !prev);
    
    // In a real app, make API call to follow/unfollow
    console.log(`${isFollowing ? 'Unfollowing' : 'Following'} user ${userId}`);
    
    // Simulate API response and update UI
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        followers: isFollowing ? userProfile.followers - 1 : userProfile.followers + 1,
        isFollowed: !isFollowing
      });
    }
  };
  
  const handleMessageUser = () => {
    navigate(`/chat/${userId}`);
  };
  
  const handleRecipeClick = (recipeId: string) => {
    navigate(`/recipe/${recipeId}`);
  };
  
  const handleSaveToFolder = (folder: string) => {
    // In a real app, make API call to save user to folder
    console.log(`Saving ${userProfile?.name} to folder: ${folder}`);
    handleFolderMenuClose();
  };
  
  const handleReport = () => {
    // In a real app, show report dialog
    console.log(`Reporting user ${userId}`);
    handleMenuClose();
  };
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Skeleton for cover image */}
        <Skeleton variant="rectangular" height={250} className="w-full" />
        
        {/* Skeleton for profile info */}
        <div className="container mx-auto px-4 -mt-16 relative z-10">
          <div className="flex flex-col md:flex-row gap-6">
            <Skeleton variant="circular" width={150} height={150} className="border-4 border-white" />
            
            <div className="flex-1 mt-4 md:mt-20">
              <Skeleton variant="text" height={40} className="w-1/3 mb-2" />
              <Skeleton variant="text" height={25} className="w-1/4 mb-3" />
              <Skeleton variant="text" height={60} className="w-full mb-4" />
              
              <div className="flex gap-3 mb-4">
                <Skeleton variant="rectangular" width={100} height={36} className="rounded-full" />
                <Skeleton variant="rectangular" width={100} height={36} className="rounded-full" />
              </div>
            </div>
          </div>
          
          <Skeleton variant="rectangular" height={50} className="w-full mt-6 mb-4" />
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
            {Array(8).fill(null).map((_, index) => (
              <Skeleton key={index} variant="rectangular" height={200} className="rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (!userProfile) {
    navigate('/not-found');
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Cover Image */}
      <div className="h-64 relative">
        <img 
          src={userProfile.coverImage}
          alt={`${userProfile.name} cover`}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4">
          <IconButton 
            className="bg-white/80 hover:bg-white"
            onClick={() => navigate(-1)}
          >
            <ArrowBack />
          </IconButton>
        </div>
        <div className="absolute top-4 right-4">
          <IconButton 
            className="bg-white/80hover:bg-white"
            onClick={handleMenuOpen}
          >
            <MoreVert />
          </IconButton>
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMessageUser}>
              <Message className="mr-2" /> Message
            </MenuItem>
            <MenuItem onClick={() => handleSaveToFolder('Favorites')}>
              <Bookmark className="mr-2" /> Save to Favorites
            </MenuItem>
            <MenuItem onClick={handleReport}>
              <Report className="mr-2" /> Report
            </MenuItem>
          </Menu>
        </div>
      </div>

      {/* User Profile Info */}
      <div className="container mx-auto px-4 -mt-16 relative z-10">
        <div className="flex flex-col md:flex-row gap-6">
          <Avatar 
            src={userProfile.avatar} 
            alt={userProfile.name} 
            className="border-4 border-white w-36 h-36"
            sx={{ width: 150, height: 150 }}
          />
          <div className="flex-1 mt-4 md:mt-20">
            <Typography variant="h4" className="font-bold">{userProfile.name}</Typography>
            <Typography variant="body2" className="text-gray-600">{userProfile.role}</Typography>
            {userProfile.isVerified && (
              <Chip label="Verified" icon={<VerifiedUser />} className="mt-2" />
            )}
            <Typography variant="body2" className="text-gray-600 mt-2">{userProfile.bio}</Typography>
            <Typography variant="body2" className="text-gray-600 mt-1">
              <LocationOn /> {userProfile.location}
            </Typography>
            <Typography variant="body2" className="text-gray-600 mt-1">{userProfile.joinDate}</Typography>
            <div className="flex gap-4 mt-4">
              <Button 
                variant="contained" 
                onClick={handleFollowToggle}
                sx={{backgroundColor: '#D97706'}}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </Button>
              <Button 
                    variant="outlined"
                    onClick={handleMessageUser}
                    sx={{border: '2px solid #D97706', color: '#D97706', fontWeight:'bold'}}
               >
                Message
              </Button>
            </div>
            <div className="flex gap-4 mt-4">
              <Typography variant="body2">{formatNumber(userProfile.followers)} Followers</Typography>
              <Typography variant="body2">{formatNumber(userProfile.following)} Following</Typography>
              <Typography variant="body2">{userProfile.recipes} Recipes</Typography>
            </div>
          </div>
        </div>

        <Divider className="my-6" />

        {/* Specialties */}
        <Typography variant="h5" className="font-semibold mb-4">Specialties</Typography>
        <div className="flex flex-wrap gap-2">
          {userProfile.specialties.map(specialty => (
            <Chip label={specialty} key={specialty} className="bg-amber-500 text-white" />
          ))}
        </div>

        <Divider className="my-6" />

        {/* Recipe Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label="Recipes" />
            <Tab label="About" />
          </Tabs>
        </Box>
        
        <TabPanel value={selectedTab} index={0}>
          <Grid container spacing={2}>
            {recipes.map(recipe => (
              <Grid item xs={12} sm={6} md={4} key={recipe.id}>
                <Card onClick={() => handleRecipeClick(recipe.id)} className="cursor-pointer">
                  <CardMedia
                    component="img"
                    height="140"
                    image={recipe.image}
                    alt={recipe.title}
                  />
                  <CardContent>
                    <Typography variant="h6" component="div">{recipe.title}</Typography>
                    <Rating value={recipe.rating} readOnly precision={0.5} />
                    <Typography variant="body2" color="text.secondary">
                      {recipe.cookingTime} min | {formatNumber(recipe.likes)} Likes
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={selectedTab} index={1}>
          <Typography variant="body1" className="mt-4">
            For more information, check out the following links:
          </Typography>
          <div className="flex flex-wrap gap-4 mt-4">
            {userProfile.socialMedia.website && (
              <Button
                variant="outlined"
                href={userProfile.socialMedia.website}
                target="_blank"
                startIcon={<Language />}
              >
                Website
              </Button>
            )}
            {userProfile.socialMedia.instagram && (
              <Button
                variant="outlined"
                href={`https://instagram.com/${userProfile.socialMedia.instagram}`}
                target="_blank"
                startIcon={<Instagram />}
              >
                Instagram
              </Button>
            )}
            {userProfile.socialMedia.youtube && (
              <Button
                variant="outlined"
                href={`https://youtube.com/${userProfile.socialMedia.youtube}`}
                target="_blank"
                startIcon={<YouTube />}
              >
                YouTube
              </Button>
            )}
            {userProfile.socialMedia.facebook && (
              <Button
                variant="outlined"
                href={`https://facebook.com/${userProfile.socialMedia.facebook}`}
                target="_blank"
                startIcon={<Facebook />}
              >
                Facebook
              </Button>
            )}
          </div>
        </TabPanel>
      </div>
    </motion.div>
  );
};

// TabPanel component for controlling tab contents
const TabPanel: React.FC<{ children?: React.ReactNode; index: number; value: number }> = ({ children, index, value }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

export default UserProfilePage;