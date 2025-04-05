import React from 'react';
import { motion } from 'framer-motion';
import { 
  Favorite as FavoriteIcon,
  BarChart as AnalyticsIcon,
  ShoppingCart as CartIcon,
  TrendingUp as TrendIcon,
  Restaurant as CuisineIcon
} from '@mui/icons-material';
import { 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  LinearProgress, 
  Button 
} from '@mui/material';

// Static Data for Enhanced Dashboard
const staticUserData = {
  name: 'Emily Rodriguez',
  avatar: '/api/placeholder/200/200',
  followers: 245,
  following: 178,
  recipesCreated: 42,
  totalViews: 15324,
  totalEngagement: 2456
};

const recipeAnalytics = [
  { 
    id: 1, 
    title: 'Spicy Chicken Tacos', 
    views: 1245, 
    rating: 4.7,
    engagement: 78,
    performance: 85
  },
  { 
    id: 2, 
    title: 'Vegan Chocolate Cake', 
    views: 890, 
    rating: 4.9,
    engagement: 92,
    performance: 95
  },
  { 
    id: 3, 
    title: 'Mediterranean Salad', 
    views: 675, 
    rating: 4.6,
    engagement: 65,
    performance: 72
  }
];

const orderHistory = [
  {
    id: 1,
    date: '2024-03-01',
    items: ['Organic Olive Oil', 'Fresh Basil'],
    total: 24.99,
    status: 'Delivered'
  },
  {
    id: 2,
    date: '2024-02-15',
    items: ['Spice Blend Set', 'Cooking Herbs'],
    total: 34.50,
    status: 'Delivered'
  },
  {
    id: 3,
    date: '2024-03-10',
    items: ['Premium Sea Salt', 'Cooking Spatula'],
    total: 19.75,
    status: 'Processing'
  }
];

const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h4" className="font-bold">
          Analytics Dashboard
        </Typography>
        <Chip 
          icon={<AnalyticsIcon />} 
          label="Pro Creator" 
          color="primary" 
          className="bg-amber-600"
        />
      </div>

      {/* Analytics Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Overall Stats Card */}
        <Card className="col-span-1">
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h6">My Performance</Typography>
              <TrendIcon className="text-green-500" />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <Typography variant="subtitle1" className="font-bold">
                  {staticUserData.totalViews}
                </Typography>
                <Typography variant="caption">Total Likes</Typography>
              </div>
              <div>
                <Typography variant="subtitle1" className="font-bold">
                  {staticUserData.recipesCreated}
                </Typography>
                <Typography variant="caption">Recipes</Typography>
              </div>
              <div>
                <Typography variant="subtitle1" className="font-bold">
                  {staticUserData.totalEngagement}
                </Typography>
                <Typography variant="caption">Engagements</Typography>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recipe Performance Card */}
        <Card className="col-span-1">
          <CardContent>
            <Typography variant="h6" className="mb-4">
              Top Performing Recipes
            </Typography>
            {recipeAnalytics.map((recipe) => (
              <div 
                key={recipe.id} 
                className="flex justify-between items-center mb-2 p-2 hover:bg-gray-100 rounded"
              >
                <div>
                  <Typography variant="subtitle2">{recipe.title}</Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={recipe.performance} 
                    className="mt-1"
                    color="primary"
                  />
                </div>
                <div className="flex items-center">
                  <FavoriteIcon fontSize="small" className="text-amber-600 mr-1" />
                  <Typography variant="caption">{recipe.rating}</Typography>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Order History Card */}
        <Card className="col-span-1">
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h6">Recent Orders</Typography>
              <CartIcon className="text-blue-500" />
            </div>
            {orderHistory.map((order) => (
              <div 
                key={order.id} 
                className="flex justify-between items-center mb-2 p-2 hover:bg-gray-100 rounded"
              >
                <div>
                  <Typography variant="subtitle2">
                    {order.items.join(', ')}
                  </Typography>
                  <Typography variant="caption" className="text-gray-500">
                    {order.date}
                  </Typography>
                </div>
                <Chip 
                  label={`$${order.total.toFixed(2)}`} 
                  size="small" 
                  color={order.status === 'Delivered' ? 'success' : 'warning'}
                />
              </div>
            ))}
            <Button 
              variant="outlined" 
              fullWidth 
              className="mt-4 border-amber-600 text-amber-600"
            >
              View All Orders
            </Button>
          </CardContent>
        </Card>

        {/* Engagement Metrics */}
        <Card className="col-span-1 md:col-span-2">
          <CardContent>
            <Typography variant="h6" className="mb-4">
              Engagement Overview
            </Typography>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <CuisineIcon className="text-blue-500 mx-auto mb-2" />
                <Typography variant="subtitle2">Total Recipes</Typography>
                <Typography variant="h6" className="font-bold">
                  {staticUserData.recipesCreated}
                </Typography>
              </div>
              <div className="text-center">
                <AnalyticsIcon className="text-green-500 mx-auto mb-2" />
                <Typography variant="subtitle2">Total Likes</Typography>
                <Typography variant="h6" className="font-bold">
                  {staticUserData.totalViews}
                </Typography>
              </div>
              <div className="text-center">
                <FavoriteIcon className="text-red-500 mx-auto mb-2" />
                <Typography variant="subtitle2">Avg. Rating</Typography>
                <Typography variant="h6" className="font-bold">
                  4.7
                </Typography>
              </div>
              <div className="text-center">
                <TrendIcon className="text-purple-500 mx-auto mb-2" />
                <Typography variant="subtitle2">Growth Rate</Typography>
                <Typography variant="h6" className="font-bold text-green-600">
                  +22%
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-1">
          <CardContent>
            <Typography variant="h6" className="mb-4">
              Quick Actions
            </Typography>
            <div className="space-y-3">
              <Button 
                variant="contained" 
                fullWidth 
                className="bg-amber-600 hover:bg-amber-700"
              >
                Create New Recipe
              </Button>
              <Button 
                variant="outlined" 
                fullWidth 
                className="border-blue-500 text-blue-500"
              >
                Shop Ingredients
              </Button>
              <Button 
                variant="outlined" 
                fullWidth 
                className="border-green-500 text-green-500"
              >
                Analyze Performance
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DashboardPage;