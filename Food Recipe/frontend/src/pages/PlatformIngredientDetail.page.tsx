import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Button,
  Typography,
  CircularProgress,
  Paper,
  TextField,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Chip,
  Divider,
  Alert,
  Snackbar,
  Breadcrumbs,
  Link,
  Container,
  Fade,
  Skeleton
} from '@mui/material';
import {
  Add,
  Remove,
  ShoppingCart,
  ArrowBack,
  LocalOffer,
  Inventory,
  Star,
  Share,
  Favorite,
  FavoriteBorder
} from '@mui/icons-material';
import { PlatformIngredient } from '../types/PlatformIngredient';
import { useCart } from '../context/CartContext';

const API_BASE_URL = 'http://localhost:8000';

const PlatformIngredientDetailPage: React.FC = () => {
  const { ingredientId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  // Component state
  const [ingredient, setIngredient] = useState<PlatformIngredient | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  // Fetch ingredient details
  useEffect(() => {
    const fetchIngredient = async () => {
      if (!ingredientId) return;
      
      setLoading(true);
      setError('');
      
      try {
        const response = await axios.get(`${API_BASE_URL}/api/shop/platform-ingredients/${ingredientId}/`);
        setIngredient(response.data);
        console.log('Fetched ingredient:', response.data);
      } catch (err: any) {
        const errorMessage = err.response?.data?.detail || 'Failed to load ingredient';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchIngredient();
  }, [ingredientId]);

  // Handle add to cart
  const handleAddToCart = async () => {
    setAdding(true);
    setError('');
    setSuccess('');
    try {
      await addToCart(ingredient!.id, quantity);
      setSuccess('Added to cart!');
    } catch (e) {
      setError('Could not add to cart');
    } finally {
      setAdding(false);
    }
  };

  // Handle quantity changes
  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(Math.max(1, newQuantity));
  };

  // Handle favorite toggle
  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    // Here you would typically make an API call to save favorite status
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share && ingredient) {
      try {
        await navigator.share({
          title: ingredient.name,
          text: ingredient.description,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
        setSuccess('Link copied to clipboard!');
        setShowSuccess(true);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      setSuccess('Link copied to clipboard!');
      setShowSuccess(true);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="text" height={40} width="80%" />
            <Skeleton variant="text" height={20} width="60%" sx={{ mt: 1 }} />
            <Skeleton variant="text" height={30} width="40%" sx={{ mt: 2 }} />
            <Skeleton variant="rectangular" height={100} sx={{ mt: 2, borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={60} sx={{ mt: 2, borderRadius: 1 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  // Error state
  if (error && !ingredient) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={() => navigate(-1)} startIcon={<ArrowBack />}>
          Back to Shop
        </Button>
      </Container>
    );
  }

  if (!ingredient) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          color="inherit"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate('/shop');
          }}
          sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
        >
          Shop
        </Link>
        <Link
          color="inherit"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate('/shop');
          }}
          sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
        >
          Platform Ingredients
        </Link>
        <Typography color="text.primary">{ingredient.name}</Typography>
      </Breadcrumbs>

      <Fade in={true} timeout={600}>
        <Paper elevation={0} sx={{ overflow: 'hidden' }}>
          <Grid container spacing={0}>
            {/* Product Image */}
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative', height: { xs: 300, md: 500 } }}>
                <CardMedia
                  component="img"
                  image={ingredient.image_url || '/api/placeholder/500/500'}
                  alt={ingredient.name}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                {/* Overlay buttons */}
                <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1 }}>
                  <IconButton
                    onClick={handleFavoriteToggle}
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' }
                    }}
                  >
                    {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
                  </IconButton>
                  <IconButton
                    onClick={handleShare}
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' }
                    }}
                  >
                    <Share />
                  </IconButton>
                </Box>
                
                {/* Stock indicator */}
                <Chip
                  icon={<Inventory />}
                  label="In Stock"
                  color="success"
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    left: 16,
                    bgcolor: 'rgba(46, 125, 50, 0.9)',
                    color: 'white'
                  }}
                />
              </Box>
            </Grid>

            {/* Product Details */}
            <Grid item xs={12} md={6}>
              <CardContent sx={{ p: { xs: 3, md: 4 }, height: '100%' }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
                    {ingredient.name}
                  </Typography>
                  
                  {/* Rating placeholder - you can implement this if you have ratings */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', mr: 1 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} sx={{ color: '#ffc107', fontSize: 20 }} />
                      ))}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      (4.8) • 127 reviews
                    </Typography>
                  </Box>
                </Box>

                {/* Price and Quantity */}
                <Typography variant="h6" sx={{color: '#D97706'}} mb={2}>
                  {ingredient.price.toLocaleString()} FCFA / {ingredient.unit}
                </Typography>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <TextField
                    type="number"
                    label="Quantity"
                    value={quantity}
                    onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                    inputProps={{ min: 1 }}
                    size="small"
                    style={{ width: 100 }}
                  />
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={handleAddToCart}
                    disabled={adding}
                    sx={{ textTransform: 'none', fontWeight: 'bold', borderRadius: 2 }}
                  >
                    {adding ? 'Adding...' : 'Add to Cart'}
                  </Button>
                </Box>
                <Typography variant="subtitle2" mb={2}>
                  Total: {(ingredient.price * quantity).toLocaleString()} FCFA
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/cart')}
                    startIcon={<ShoppingCart />}
                  sx={{ textTransform: 'none', color: 'black', mb: 2, border:1, borderColor: "#D97706" }}
                >
                  View Cart
                </Button>
                {success && <Typography color="success.main">{success}</Typography>}
                {error && <Typography color="error.main">{error}</Typography>}

                {/* Description */}
                {ingredient.description && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                      {ingredient.description}
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ my: 3 }} />

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleAddToCart}
                    disabled={adding}
                    startIcon={adding ? <CircularProgress size={20} /> : <ShoppingCart />}
                    sx={{
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      backgroundColor: '#D97706',
                    }}
                  >
                    {adding ? 'Adding to Cart...' : 'Add to Cart'}
                  </Button>
                </Box>

                {/* Cart info */}
                {/* Additional Info */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip icon={<LocalOffer />} label="Fresh Quality" variant="outlined" />
                  <Chip icon={<Inventory />} label="Fast Delivery" variant="outlined" />
                </Box>
              </CardContent>
            </Grid>
          </Grid>
        </Paper>
      </Fade>

      {/* Back Button */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={() => navigate(-1)}
          startIcon={<ArrowBack />}
          sx={{ textTransform: 'none', color: '#D97706', borderColor: '#D97706' }}
        >
          Back to Shop
        </Button>
        <Button
          variant="text"
          onClick={() => navigate('/cart')}
          sx={{ textTransform: 'none', color: '#D97706' }}
        >
          View Cart
        </Button>
      </Box>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={4000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {success}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={showError}
        autoHideDuration={4000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={() => setShowError(false)}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PlatformIngredientDetailPage;