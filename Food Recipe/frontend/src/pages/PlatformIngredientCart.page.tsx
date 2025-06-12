import React, { useEffect, useState } from 'react';
import {
  Typography,
  Button,
  IconButton,
  TextField,
  Paper,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { Delete, ShoppingCart, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

const PlatformIngredientCartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  // Fetch cart items
  useEffect(() => {
    setLoading(true);
    axios.get(`${API_BASE}/platform-ingredient-cart/`, { withCredentials: true })
      .then(res => {
        setCartItems(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load cart.');
        setLoading(false);
      });
  }, []);

  // Update quantity
  const handleQuantityChange = (id: number, quantity: number) => {
    if (quantity < 1) return;
    axios.patch(`${API_BASE}/platform-ingredient-cart/${id}/`, { quantity }, { withCredentials: true })
      .then(res => {
        setCartItems(items => items.map(item => item.id === id ? { ...item, quantity } : item));
      })
      .catch(() => setError('Failed to update quantity.'));
  };

  // Remove item
  const handleRemove = (id: number) => {
    axios.delete(`${API_BASE}/platform-ingredient-cart/${id}/`, { withCredentials: true })
      .then(() => {
        setCartItems(items => items.filter(item => item.id !== id));
      })
      .catch(() => setError('Failed to remove item.'));
  };

  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => sum + (item.ingredient.price * item.quantity), 0);

  // Checkout
  const handleCheckout = async () => {
    if (!phone || !email) {
      setError('Please provide phone and email.');
      return;
    }
    setCheckoutLoading(true);
    try {
      // 1. Create order
      const orderRes = await axios.post(`${API_BASE}/orders/`, {}, { withCredentials: true });
      const order = orderRes.data;
      // 2. Initiate payment
      const payload = {
        amount: parseFloat(order.total_amount),
        email,
        phone,
        bookingId: order.booking_id,
      };
      await axios.post(`${API_BASE}/initiate-payment/`, payload, { withCredentials: true });
      setSuccess('Order placed and payment initiated!');
      
      setCartItems([]);
    } catch (e: any) {
      setError('Checkout failed.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>
      <Typography variant="h4" gutterBottom>
        Cart
      </Typography>
      {loading ? (
        <div className="flex justify-center py-10">
          <CircularProgress color="warning" />
        </div>
      ) : cartItems.length === 0 ? (
        <Paper className="p-8 text-center">
          <ShoppingCart sx={{ fontSize: 60, color: '#d97706' }} />
          <Typography variant="h6" className="mt-4">Your cart is empty.</Typography>
          <Button onClick={() => navigate('/cart')} sx={{ mt: 2 }}>
            Browse Ingredients
          </Button>
        </Paper>
      ) : (
        <Paper className="p-4">
          {cartItems.map(item => (
            <div key={item.id} className="flex items-center gap-4 border-b py-4 last:border-b-0">
              <img src={item.ingredient.image} alt={item.ingredient.name} className="w-16 h-16 rounded object-cover" />
              <div className="flex-1">
                <Typography variant="subtitle1">{item.ingredient.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.ingredient.price.toLocaleString()} FCFA / {item.ingredient.unit}
                </Typography>
              </div>
              <TextField
                type="number"
                size="small"
                value={item.quantity}
                onChange={e => handleQuantityChange(item.id, parseInt(e.target.value))}
                inputProps={{ min: 1, style: { width: 60 } }}
              />
              <IconButton onClick={() => handleRemove(item.id)}>
                <Delete color="error" />
              </IconButton>
              <Typography variant="body1" sx={{ minWidth: 80, textAlign: 'right' }}>
                {(item.ingredient.price * item.quantity).toLocaleString()} FCFA
              </Typography>
            </div>
          ))}
          <Divider sx={{ my: 2 }} />
          <div className="flex justify-between items-center">
            <Typography variant="h6">Subtotal</Typography>
            <Typography variant="h6" color="primary">{subtotal.toLocaleString()} FCFA</Typography>
          </div>
          <div className="mt-6">
            <Typography variant="subtitle1" gutterBottom>Checkout</Typography>
            <div className="flex gap-4 mb-4">
              <TextField
                label="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                size="small"
                fullWidth
              />
              <TextField
                label="Phone"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                size="small"
                fullWidth
              />
            </div>
            <Button
              variant="contained"
              color="warning"
              fullWidth
              onClick={handleCheckout}
              disabled={checkoutLoading}
              sx={{ fontWeight: 'bold', borderRadius: 2 }}
            >
              {checkoutLoading ? 'Processing...' : 'Checkout & Pay'}
            </Button>
          </div>
        </Paper>
      )}
      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess(null)}>
        <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>
      </Snackbar>
    </div>
  );
};

export default PlatformIngredientCartPage;
