import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Typography,
  Button,
  Divider,
  IconButton,
  TextField,
  Paper,
  Avatar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel
} from '@mui/material';
import {
  ShoppingBasket,
  Delete,
  Add,
  Remove,
  ArrowBack,
  LocalShipping,
  Payments,
  ShoppingCart
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const CartPage: React.FC = () => {
  const {
    items: cartItems,
    loading,
    error,
    updateCartItem,
    removeFromCart,
    clearCart
  } = useCart();
  
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('mtn');
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    email: '',
    phone: '',
    recipeId: ''
  });

  const handleUpdateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateCartItem(id, newQuantity);
  };

  const handleRemoveItem = (id: number) => {
    removeFromCart(id);
  };

  // Only open payment dialog
  const handleProceedToPayment = () => {
    setPaymentDialogOpen(true);
  };

  // Generate a unique recipeId (UUID v4)
 function generateRecipeId() {
  const first = Math.floor(Math.random() * 10);
  const second = Math.floor(Math.random() * 10);
  return `${first}${second}`;
}


  // Calculate subtotal in FCFA
  const subtotal = cartItems.reduce((total, item) => total + (parseFloat(item.ingredient.price) * item.quantity), 0);
  const discountAmount = subtotal * discount;
  const deliveryFee = subtotal > 30000 ? 0 : 0; // Free delivery over 30,000 FCFA, else 20 FCFA
  const total = subtotal - discountAmount + deliveryFee;

  // Set amount and recipeId in formData when dialog opens
  React.useEffect(() => {
    if (paymentDialogOpen) {
      setFormData(formData => ({
        ...formData,
        amount: total.toString(),
        recipeId: generateRecipeId(),
      }));
    }
  }, [paymentDialogOpen, total]);

  // Submit payment form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const { amount, email, phone, recipeId } = formData;
      const sanitizedPhone = phone.replace('+237', '').replace('237', '').trim();
      const response = await axios.post('http://127.0.0.1:8000/api/orders/initiate-payment/', {
        amount: Number(amount),
        email,
        phone: sanitizedPhone,
        bookingId: String(recipeId)
      }, { headers: {'Content-Type': 'application/json'}}
    );
      // In handleSubmit, after getting the response, console.log the session id if present
      if (response.status === 200 && response.data.link) {
        if (response.data.sessionId) {
          console.log('Session ID:', response.data.sessionId);
        }
        window.location.href = response.data.link;
        console.log('Payment link:', response.data.link);
      } else {
        toast.error('Failed to get payment link.');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'An error occurred while initiating payment.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setProcessing(false);
    }
  };

  // Payment Method Dialog with payment form
  const paymentDialog = (
    <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)}>
      <DialogTitle>Select Payment Method</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <RadioGroup
            value={selectedPayment}
            onChange={e => setSelectedPayment(e.target.value)}
          >
            <FormControlLabel value="mtn" control={<Radio />} label="MTN Mobile Money" />
          </RadioGroup>
          <TextField
            label="Phone Number"
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
            fullWidth
            margin="normal"
            name='phone'
            size="small"
            required
          />
          <TextField
            label="Email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            fullWidth
            margin="normal"
            name='email'
            size="small"
            required
          />
          <TextField
            label="Amount (FCFA)"
            value={formData.amount}
            fullWidth
            margin="normal"
            name='amount'
            size="small"
            required
            type="number"
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="Recipe ID"
            value={formData.recipeId}
            fullWidth
            name='recipeId'
            margin="normal"
            size="small"
            required
            InputProps={{ readOnly: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)} disabled={processing}>Cancel</Button>
          <Button type="submit" variant="contained" color="warning" disabled={processing || !formData.phone || !formData.email}>
            {processing ? 'Processing...' : 'Pay'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 }
    },
    exit: {
      x: -100,
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const content = (
    <motion.div
      className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Button
              component={Link}
              to="/shop"
              startIcon={<ArrowBack />}
              className="text-gray-600 mb-4"
              sx={{ textTransform: 'none', color: '#D97706' }}
            >
              Back to Shop
            </Button>

            <div className="flex items-center">
              <ShoppingBasket className="text-amber-600 mr-3" sx={{ fontSize: 32 }} />
              <Typography variant="h4" component="h1" className="font-bold text-gray-800">
                Your Shopping Cart
              </Typography>
            </div>

            {!loading && cartItems.length === 0 && (
              <Typography variant="body1" className="text-gray-500 mt-2">
                Your cart is empty
              </Typography>
            )}
            {error && (
              <Typography variant="body2" color="error" className="mt-2">
                {error}
              </Typography>
            )}
          </motion.div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items Section */}
          <motion.div
            className="lg:w-2/3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <CircularProgress color="warning" />
                <Typography className="mt-4 text-gray-600">
                  Loading your cart...
                </Typography>
              </div>
            ) : cartItems.length === 0 ? (
              <motion.div
                className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  initial={{ y: -10, rotate: -5 }}
                  animate={{ y: 0, rotate: 0 }}
                  transition={{
                    duration: 0.6,
                    type: "spring",
                    stiffness: 100
                  }}
                  className="inline-block mb-6"
                >
                  <ShoppingCart sx={{ fontSize: 80 }} className="text-gray-300" />
                </motion.div>
                <Typography variant="h5" className="font-bold text-gray-800 mb-3">
                  Your cart is empty
                </Typography>
                <Typography variant="body1" className="text-gray-600 mb-6">
                  Looks like you haven't added any ingredients to your cart yet.
                </Typography>
                <Button
                  component={Link}
                  to="/shop"
                  variant="contained"
                  className="bg-amber-600 hover:bg-amber-700 my-4"
                  sx={{
                    backgroundColor: '#d97706',
                    '&:hover': { backgroundColor: '#b45309' },
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    px: 4,
                    py: 1.5
                  }}
                >
                  Browse Shop
                </Button>
              </motion.div>
            ) : (
              <Paper elevation={0} className="rounded-xl overflow-hidden border border-gray-100">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                  <Typography variant="subtitle1" className="font-medium text-gray-700">
                    {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
                  </Typography>
                  <Button
                    onClick={clearCart}
                    color="error"
                    size="small"
                    sx={{ ml: 2, textTransform: 'none' }}
                    disabled={loading || cartItems.length === 0}
                  >
                    Clear Cart
                  </Button>
                </div>

                <AnimatePresence>
                  {cartItems.map(item => (
                    <motion.div
                      key={item.id}
                      variants={itemVariants}
                      exit="exit"
                      className="p-4 sm:p-6 bg-white flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-gray-100 last:border-b-0"
                    >
                      <Avatar
                        src={item.ingredient.image}
                        alt={item.ingredient.name}
                        className="rounded-lg"
                        variant="rounded"
                        sx={{ width: 64, height: 64 }}
                      />

                      <div className="flex-grow">
                        <Typography variant="subtitle1" className="font-medium text-gray-800">
                          {item.ingredient.name}
                        </Typography>
                        <Typography variant="body2" className="text-gray-500">
                          {parseFloat(item.ingredient.price).toLocaleString()} FCFA per {item.ingredient.unit}
                        </Typography>
                      </div>

                      <div className="flex items-center gap-2 sm:ml-auto">
                        <IconButton
                          size="small"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="border border-gray-200"
                        >
                          <Remove fontSize="small" />
                        </IconButton>

                        <Typography className="w-8 text-center font-medium">
                          {item.quantity}
                        </Typography>

                        <IconButton
                          size="small"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="border border-gray-200"
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      </div>

                      <div className="min-w-[100px] text-right">
                        <Typography variant="subtitle1" className="font-medium text-gray-800">
                          {(parseFloat(item.ingredient.price) * item.quantity).toLocaleString()} FCFA
                        </Typography>

                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-gray-400 hover:text-red-500 -mr-2"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </Paper>
            )}
          </motion.div>

          {/* Order Summary Section */}
          <motion.div
            className="lg:w-1/3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Paper elevation={0} className="rounded-xl p-6 bg-white border border-gray-100">
              <Typography variant="h6" className="font-bold text-gray-800 mb-4">
                Order Summary
              </Typography>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <Typography variant="body2" className="text-gray-600">
                    Subtotal
                  </Typography>
                  <Typography variant="body2" className="font-medium">
                    {subtotal.toLocaleString()} FCFA
                  </Typography>
                </div>

                {promoApplied && (
                  <div className="flex justify-between text-green-600">
                    <Typography variant="body2">
                      Discount (20%)
                    </Typography>
                    <Typography variant="body2" className="font-medium">
                      -{discountAmount.toLocaleString()} FCFA
                    </Typography>
                  </div>
                )}

                <div className="flex justify-between">
                  <Typography variant="body2" className="text-gray-600">
                    Delivery Fee
                  </Typography>
                  <Typography variant="body2" className="font-medium">
                    {deliveryFee === 0 ? 'FREE' : `${deliveryFee.toLocaleString()} FCFA`}
                  </Typography>
                </div>

                <Divider />

                <div className="flex justify-between pt-1">
                  <Typography variant="subtitle1" className="font-medium">
                    Total
                  </Typography>
                  <Typography variant="subtitle1" className="font-bold text-amber-600">
                    {total.toLocaleString()} FCFA
                  </Typography>
                </div>
              </div>


              <Button
                variant="contained"
                fullWidth
                disabled={cartItems.length === 0 || loading}
                className="bg-amber-600 hover:bg-amber-700"
                sx={{
                  backgroundColor: '#d97706',
                  '&:hover': { backgroundColor: '#b45309' },
                  textTransform: 'none',
                  py: 1.5,
                  fontWeight: 'bold',
                  borderRadius: '8px'
                }}
                onClick={handleProceedToPayment}
              >
                Proceed to Payment
              </Button>

              <div className="mt-6 space-y-3">
                <div className="flex items-center text-gray-600">
                  <LocalShipping fontSize="small" className="mr-2" />
                  <Typography variant="body2">
                    Free shipping for orders over 5000 FCFA
                  </Typography>
                </div>
                <div className="flex items-center text-gray-600">
                  <Payments fontSize="small" className="mr-2" />
                  <Typography variant="body2">
                    Secure payment
                  </Typography>
                </div>
              </div>
            </Paper>

            <div className="mt-6">
              <Button
                component={Link}
                to="/shop"
                variant="text"
                startIcon={<ArrowBack />}
                className="text-amber-600"
                sx={{ textTransform: 'none', color: '#D97706' }}
              >
                Continuer shopping
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Payment Method Dialog */}
      {paymentDialog}
    </motion.div>
  );

  // At the end, just render content and paymentDialog, no layout wrappers
  return (
    <>
      {content}
    </>
  );
};

export default CartPage;