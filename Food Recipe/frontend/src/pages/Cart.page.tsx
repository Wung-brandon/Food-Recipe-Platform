import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Typography, 
  Button, 
  Divider, 
  IconButton, 
  TextField,
  Paper,
  Avatar,
  CircularProgress
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
import { Link } from 'react-router-dom';

// Define a type for cart item
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  image: string;
}

// Mock ingredient data (replace with your actual data source)
const mockCartItems: CartItem[] = [
  { 
    id: 1, 
    name: "Organic Fresh Tomatoes", 
    price: 3.99, 
    quantity: 2, 
    unit: "lb", 
    image: "/api/placeholder/80/80" 
  },
  { 
    id: 2, 
    name: "Extra Virgin Olive Oil", 
    price: 12.99, 
    quantity: 1, 
    unit: "bottle", 
    image: "/api/placeholder/80/80" 
  },
  { 
    id: 3, 
    name: "Organic Basil Leaves", 
    price: 2.49, 
    quantity: 1, 
    unit: "bunch", 
    image: "/api/placeholder/80/80" 
  },
  { 
    id: 4, 
    name: "Free-range Chicken Breast", 
    price: 8.99, 
    quantity: 2, 
    unit: "lb", 
    image: "/api/placeholder/80/80" 
  }
];

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoApplied, setPromoApplied] = useState<boolean>(false);
  const [discount, setDiscount] = useState<number>(0);
  
  // Simulate loading cart data
  useEffect(() => {
    setTimeout(() => {
      setCartItems(mockCartItems);
      setLoading(false);
    }, 800);
  }, []);
  
  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };
  
  const removeItem = (id: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };
  
  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === 'discount20') {
      setPromoApplied(true);
      setDiscount(0.2); // 20% discount
    } else {
      setPromoApplied(false);
      setDiscount(0);
      alert('Invalid promo code');
    }
  };
  
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const discountAmount = subtotal * discount;
  const deliveryFee = subtotal > 50 ? 0 : 4.99;
  const total = subtotal - discountAmount + deliveryFee;
  
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
  
  return (
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
                        src={item.image}
                        alt={item.name}
                        className="rounded-lg"
                        variant="rounded"
                        sx={{ width: 64, height: 64 }}
                      />
                      
                      <div className="flex-grow">
                        <Typography variant="subtitle1" className="font-medium text-gray-800">
                          {item.name}
                        </Typography>
                        <Typography variant="body2" className="text-gray-500">
                          ${item.price.toFixed(2)} per {item.unit}
                        </Typography>
                      </div>
                      
                      <div className="flex items-center gap-2 sm:ml-auto">
                        <IconButton 
                          size="small"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="border border-gray-200"
                        >
                          <Remove fontSize="small" />
                        </IconButton>
                        
                        <Typography className="w-8 text-center font-medium">
                          {item.quantity}
                        </Typography>
                        
                        <IconButton 
                          size="small"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="border border-gray-200"
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      </div>
                      
                      <div className="min-w-[80px] text-right">
                        <Typography variant="subtitle1" className="font-medium text-gray-800">
                          ${(item.price * item.quantity).toFixed(2)}
                        </Typography>
                        
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => removeItem(item.id)}
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
                    ${subtotal.toFixed(2)}
                  </Typography>
                </div>
                
                {promoApplied && (
                  <div className="flex justify-between text-green-600">
                    <Typography variant="body2">
                      Discount (20%)
                    </Typography>
                    <Typography variant="body2" className="font-medium">
                      -${discountAmount.toFixed(2)}
                    </Typography>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <Typography variant="body2" className="text-gray-600">
                    Delivery Fee
                  </Typography>
                  <Typography variant="body2" className="font-medium">
                    {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
                  </Typography>
                </div>
                
                <Divider />
                
                <div className="flex justify-between pt-1">
                  <Typography variant="subtitle1" className="font-medium">
                    Total
                  </Typography>
                  <Typography variant="subtitle1" className="font-bold text-amber-600">
                    ${total.toFixed(2)}
                  </Typography>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex gap-2 mb-3">
                  <TextField
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter promo code"
                    size="small"
                    fullWidth
                    className="rounded-lg"
                  />
                  <Button 
                    onClick={applyPromoCode}
                    variant="outlined"
                    className="border-amber-600 text-amber-600"
                    sx={{ 
                      borderColor: '#d97706', 
                      color: '#d97706', 
                      '&:hover': { 
                        borderColor: '#b45309', 
                        backgroundColor: 'rgba(217, 119, 6, 0.04)' 
                      },
                      textTransform: 'none'
                    }}
                  >
                    Apply
                  </Button>
                </div>
                
                {promoApplied && (
                  <Typography variant="caption" className="text-green-600">
                    Promo code applied successfully!
                  </Typography>
                )}
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
              >
                Proceed to Checkout
              </Button>
              
              <div className="mt-6 space-y-3">
                <div className="flex items-center text-gray-600">
                  <LocalShipping fontSize="small" className="mr-2" />
                  <Typography variant="body2">
                    Free delivery on orders over $50
                  </Typography>
                </div>
                <div className="flex items-center text-gray-600">
                  <Payments fontSize="small" className="mr-2" />
                  <Typography variant="body2">
                    Secure payment processing
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
                Continue Shopping
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default CartPage;