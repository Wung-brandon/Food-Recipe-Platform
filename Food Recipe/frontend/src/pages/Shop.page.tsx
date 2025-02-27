// import React, { useState } from "react";
// import { TextField, Typography, Grid, Card, CardContent, CardMedia, Button } from "@mui/material";
// import { motion } from "framer-motion";
// import { spaghetti } from "../components/images";

// // Sample ingredient data
// const ingredients = [
//   { id: 1, name: "Fresh Basil", price: "$2.99", image: spaghetti },
//   { id: 2, name: "Cherry Tomatoes", price: "$3.49", image: spaghetti },
//   { id: 3, name: "Mozzarella Cheese", price: "$4.99", image: spaghetti },
//   { id: 4, name: "Olive Oil", price: "$5.99", image: spaghetti },
//   { id: 5, name: "Garlic Cloves", price: "$1.99", image: spaghetti },
//   { id: 6, name: "Pasta", price: "$3.99", image: spaghetti },
// ];

// const ShopPage: React.FC = () => {
//   const [searchTerm, setSearchTerm] = useState("");

//   // Filtering ingredients based on search input
//   const filteredIngredients = ingredients.filter((ingredient) =>
//     ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="min-h-screen bg-gray-50 py-10 px-6 md:px-20">
//       {/* Header Section */}
//       <div className="relative w-full h-[40vh] flex items-center justify-center text-center bg-cover bg-center"
//         style={{ backgroundImage: "url('/images/shop-banner.jpg')" }}>
//         <div className="absolute inset-0 bg-black/60"></div>
//         <div className="relative z-10 px-5 md:px-20">
//           <Typography variant="h4" className="text-white font-bold">
//             Shop for Fresh Ingredients
//           </Typography>
//         </div>
//       </div>

//       {/* Search Bar */}
//       <div className="mt-10 flex justify-center">
//         <TextField
//           variant="outlined"
//           placeholder="Search Ingredients..."
//           fullWidth
//           className="max-w-md"
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//       </div>

//       {/* Ingredients Grid */}
//       <Grid container spacing={4} className="mt-8">
//         {filteredIngredients.length > 0 ? (
//           filteredIngredients.map((ingredient) => (
//             <Grid item xs={12} sm={6} md={4} key={ingredient.id}>
//               <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
//                 <Card className="shadow-lg rounded-lg overflow-hidden">
//                   <CardMedia
//                     component="img"
//                     height="200"
//                     image={ingredient.image}
//                     alt={ingredient.name}
//                   />
//                   <CardContent>
//                     <Typography variant="h6" className="font-bold text-gray-800">
//                       {ingredient.name}
//                     </Typography>
//                     <Typography variant="body2" className="text-gray-600">
//                       {ingredient.price}
//                     </Typography>
//                     <Button
//                       variant="contained"
//                       sx={{ backgroundColor: "#d97706", color: "white", marginTop: "10px" }}
//                       fullWidth
//                     >
//                       Add to Cart
//                     </Button>
//                   </CardContent>
//                 </Card>
//               </motion.div>
//             </Grid>
//           ))
//         ) : (
//           <Typography variant="h6" className="text-center text-gray-600 w-full mt-10">
//             No ingredients found.
//           </Typography>
//         )}
//       </Grid>
//     </div>
//   );
// };

// export default ShopPage;



import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  ShoppingCart, 
  FilterList, 
  Close, 
  Star, 
  StarHalf,
  AddShoppingCart,
  FavoriteBorder,
  Favorite
} from '@mui/icons-material';
import { 
  TextField, 
  InputAdornment, 
  Slider, 
  Checkbox, 
  FormControlLabel,
  Badge,
  Drawer,
  IconButton,
  Chip,
  Button
} from '@mui/material';

// Sample image placeholder
const sampleImage = "/api/placeholder/300/300";

// Sample ingredient data
const ingredientsData = [
  {
    id: 1,
    name: "Organic Basil",
    category: "Herbs",
    imageUrl: sampleImage,
    price: 3.99,
    unit: "bunch",
    rating: 4.7,
    reviewCount: 128,
    isFeatured: true,
    isOrganic: true,
    stock: 45,
    tags: ["Fresh", "Organic", "Local"],
    discountPercent: 0
  },
  {
    id: 2,
    name: "Premium Olive Oil",
    category: "Oils",
    imageUrl: sampleImage,
    price: 18.50,
    unit: "bottle",
    rating: 4.9,
    reviewCount: 203,
    isFeatured: true,
    isOrganic: true,
    stock: 32,
    tags: ["Imported", "Gourmet"],
    discountPercent: 10
  },
  {
    id: 3,
    name: "Himalayan Pink Salt",
    category: "Spices",
    imageUrl: sampleImage,
    price: 6.75,
    unit: "jar",
    rating: 4.5,
    reviewCount: 76,
    isFeatured: false,
    isOrganic: false,
    stock: 89,
    tags: ["Mineral-rich", "Premium"],
    discountPercent: 0
  },
  {
    id: 4,
    name: "Fresh Avocados",
    category: "Produce",
    imageUrl: sampleImage,
    price: 1.99,
    unit: "each",
    rating: 4.3,
    reviewCount: 182,
    isFeatured: true,
    isOrganic: true,
    stock: 15,
    tags: ["Fresh", "Ripe"],
    discountPercent: 0
  },
  {
    id: 5,
    name: "Artisanal Sourdough",
    category: "Bakery",
    imageUrl: sampleImage,
    price: 5.50,
    unit: "loaf",
    rating: 4.8,
    reviewCount: 156,
    isFeatured: true,
    isOrganic: false,
    stock: 8,
    tags: ["Freshly Baked", "Artisanal"],
    discountPercent: 0
  },
  {
    id: 6,
    name: "Free-Range Eggs",
    category: "Dairy & Eggs",
    imageUrl: sampleImage,
    price: 4.99,
    unit: "dozen",
    rating: 4.6,
    reviewCount: 89,
    isFeatured: false,
    isOrganic: true,
    stock: 24,
    tags: ["Free-Range", "Organic"],
    discountPercent: 0
  },
  {
    id: 7,
    name: "Aged Balsamic Vinegar",
    category: "Condiments",
    imageUrl: sampleImage,
    price: 12.99,
    unit: "bottle",
    rating: 4.9,
    reviewCount: 67,
    isFeatured: true,
    isOrganic: false,
    stock: 19,
    tags: ["Imported", "Aged"],
    discountPercent: 15
  },
  {
    id: 8,
    name: "Grass-Fed Ground Beef",
    category: "Meat",
    imageUrl: sampleImage,
    price: 8.99,
    unit: "lb",
    rating: 4.5,
    reviewCount: 112,
    isFeatured: false,
    isOrganic: true,
    stock: 22,
    tags: ["Grass-Fed", "Sustainable"],
    discountPercent: 0
  },
  {
    id: 9,
    name: "Wild-Caught Salmon",
    category: "Seafood",
    imageUrl: sampleImage,
    price: 14.99,
    unit: "fillet",
    rating: 4.7,
    reviewCount: 93,
    isFeatured: true,
    isOrganic: false,
    stock: 13,
    tags: ["Wild-Caught", "Sustainable"],
    discountPercent: 0
  },
  {
    id: 10,
    name: "Organic Quinoa",
    category: "Grains",
    imageUrl: sampleImage,
    price: 5.99,
    unit: "lb",
    rating: 4.4,
    reviewCount: 145,
    isFeatured: false,
    isOrganic: true,
    stock: 56,
    tags: ["Organic", "Gluten-Free"],
    discountPercent: 5
  },
  {
    id: 11,
    name: "Shallots",
    category: "Produce",
    imageUrl: sampleImage,
    price: 2.49,
    unit: "lb",
    rating: 4.2,
    reviewCount: 78,
    isFeatured: false,
    isOrganic: false,
    stock: 32,
    tags: ["Fresh"],
    discountPercent: 0
  },
  {
    id: 12,
    name: "Vanilla Bean Pods",
    category: "Baking",
    imageUrl: sampleImage,
    price: 8.99,
    unit: "pack",
    rating: 4.9,
    reviewCount: 62,
    isFeatured: true,
    isOrganic: true,
    stock: 19,
    tags: ["Gourmet", "Organic"],
    discountPercent: 0
  }
];

// Categories with icons would be defined here
const categories = [
  { id: "All", name: "All Categories" },
  { id: "Produce", name: "Produce" },
  { id: "Herbs", name: "Herbs & Spices" },
  { id: "Oils", name: "Oils & Vinegars" },
  { id: "Bakery", name: "Bakery" },
  { id: "Dairy & Eggs", name: "Dairy & Eggs" },
  { id: "Meat", name: "Meat" },
  { id: "Seafood", name: "Seafood" },
  { id: "Grains", name: "Grains & Pasta" },
  { id: "Baking", name: "Baking Supplies" },
  { id: "Condiments", name: "Condiments" },
];

// Ingredient Card Component
const IngredientCard: React.FC<{ item: any }> = ({ item }) => {
  const [isInCart, setIsInCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Calculate discounted price if applicable
  const finalPrice = item.discountPercent > 0 
    ? (item.price - (item.price * item.discountPercent / 100)).toFixed(2) 
    : item.price.toFixed(2);
  
  return (
    <motion.div 
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className="relative">
        {/* Product image */}
        <img 
          src={item.imageUrl} 
          alt={item.name} 
          className="w-full h-48 object-cover"
        />
        
        {/* Discount badge */}
        {item.discountPercent > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
            {item.discountPercent}% OFF
          </div>
        )}
        
        {/* Favorite button */}
        <button 
          className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-md"
          onClick={() => setIsFavorite(!isFavorite)}
        >
          {isFavorite ? (
            <Favorite className="text-red-500" fontSize="small" />
          ) : (
            <FavoriteBorder className="text-gray-500" fontSize="small" />
          )}
        </button>
        
        {/* Organic badge */}
        {item.isOrganic && (
          <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md">
            ORGANIC
          </div>
        )}
        
        {/* Stock indicator for low stock */}
        {item.stock < 20 && (
          <div className="absolute bottom-2 right-2 bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded-md">
            Only {item.stock} left
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-gray-800 text-lg mb-1">{item.name}</h3>
            <p className="text-sm text-gray-500 mb-2">{item.category}</p>
          </div>
        </div>
        
        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex text-amber-500">
            {[...Array(5)].map((_, i) => {
              if (i < Math.floor(item.rating)) 
                return <Star key={i} fontSize="small" />;
              else if (i < Math.ceil(item.rating)) 
                return <StarHalf key={i} fontSize="small" />;
              return null;
            })}
          </div>
          <span className="text-xs text-gray-500 ml-1">({item.reviewCount})</span>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {item.tags.map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
        
        {/* Price and Add to Cart */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-end">
            {item.discountPercent > 0 && (
              <span className="text-gray-400 line-through mr-2 text-sm">${item.price.toFixed(2)}</span>
            )}
            <span className="font-bold text-xl text-gray-800">${finalPrice}</span>
            <span className="text-gray-500 text-sm ml-1">/{item.unit}</span>
          </div>
          
          <motion.button
            className={`p-2 rounded-full flex items-center justify-center 
              ${isInCart ? 'bg-green-50 border border-green-500 text-green-600' : 'bg-amber-600 text-white'}`}
            onClick={() => setIsInCart(!isInCart)}
            whileTap={{ scale: 0.9 }}
          >
            {isInCart ? (
              <Check className="h-5 w-5" />
            ) : (
              <AddShoppingCart className="h-5 w-5" />
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Check icon component
const Check = (props: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={props.className} 
    viewBox="0 0 20 20" 
    fill="currentColor"
  >
    <path 
      fillRule="evenodd" 
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
      clipRule="evenodd" 
    />
  </svg>
);

// Main Shop Page Component
const ShopPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20]);
  const [showOrganic, setShowOrganic] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);
  const [showInStock, setShowInStock] = useState(true);
  const [sortBy, setSortBy] = useState("featured");
  const [filteredItems, setFilteredItems] = useState(ingredientsData);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [cartItems, setCartItems] = useState<number>(0);
  const [showFilterButtons, setShowFilterButtons] = useState(window.innerWidth >= 768);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setShowFilterButtons(window.innerWidth >= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Apply all filters
  useEffect(() => {
    let result = [...ingredientsData];
    
    // Category filter
    if (activeCategory !== "All") {
      result = result.filter(item => item.category === activeCategory);
    }
    
    // Price range filter
    result = result.filter(
      item => item.price >= priceRange[0] && item.price <= priceRange[1]
    );
    
    // Organic filter
    if (showOrganic) {
      result = result.filter(item => item.isOrganic);
    }
    
    // Discount filter
    if (showDiscount) {
      result = result.filter(item => item.discountPercent > 0);
    }
    
    // In stock filter
    if (showInStock) {
      result = result.filter(item => item.stock > 0);
    }
    
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        item => 
          item.name.toLowerCase().includes(query) || 
          item.category.toLowerCase().includes(query) ||
          item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Sort
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "featured":
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }
    
    setFilteredItems(result);
  }, [
    activeCategory,
    priceRange,
    showOrganic,
    showDiscount,
    showInStock,
    searchQuery,
    sortBy
  ]);
  
  // Reset filters
  const resetFilters = () => {
    setActiveCategory("All");
    setPriceRange([0, 20]);
    setShowOrganic(false);
    setShowDiscount(false);
    setShowInStock(true);
    setSortBy("featured");
  };
  
  // Filter drawer (for mobile)
  const filterDrawer = (
    <Drawer
      anchor="right"
      open={isFilterDrawerOpen}
      onClose={() => setIsFilterDrawerOpen(false)}
    >
      <div className="w-80 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Filters</h2>
          <IconButton onClick={() => setIsFilterDrawerOpen(false)}>
            <Close />
          </IconButton>
        </div>
        
        {/* Mobile Category Select */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Category</h3>
          <select 
            className="w-full p-2 border border-gray-300 rounded-md"
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Price Range */}
        <div className="mb-6">
          <h3 className="font-medium mb-3">Price Range</h3>
          <Slider
            value={priceRange}
            onChange={(_, newValue) => setPriceRange(newValue as [number, number])}
            valueLabelDisplay="auto"
            min={0}
            max={20}
            step={0.5}
            className="text-amber-600"
          />
          <div className="flex justify-between mt-1">
            <span className="text-sm text-gray-500">${priceRange[0]}</span>
            <span className="text-sm text-gray-500">${priceRange[1]}</span>
          </div>
        </div>
        
        {/* Other filters */}
        <div className="mb-6 space-y-2">
          <FormControlLabel
            control={
              <Checkbox 
                checked={showOrganic} 
                onChange={(e) => setShowOrganic(e.target.checked)}
                className="text-amber-600"
              />
            }
            label="Organic Only"
          />
          <FormControlLabel
            control={
              <Checkbox 
                checked={showDiscount} 
                onChange={(e) => setShowDiscount(e.target.checked)}
                className="text-amber-600"
              />
            }
            label="On Sale"
          />
          <FormControlLabel
            control={
              <Checkbox 
                checked={showInStock} 
                onChange={(e) => setShowInStock(e.target.checked)}
                className="text-amber-600"
              />
            }
            label="In Stock"
          />
        </div>
        
        {/* Sort By */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Sort By</h3>
          <select 
            className="w-full p-2 border border-gray-300 rounded-md"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Customer Rating</option>
          </select>
        </div>
        
        {/* Action buttons */}
        <div className="mt-8 flex gap-2">
          <Button 
            variant="outlined" 
            fullWidth
            onClick={resetFilters}
            className="text-gray-600 border-gray-300"
          >
            Reset All
          </Button>
          <Button 
            variant="contained" 
            fullWidth
            onClick={() => setIsFilterDrawerOpen(false)}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </Drawer>
  );
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-amber-600 text-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">Ingredients Shop</h1>
              <p className="text-amber-100">
                Find the perfect ingredients for your recipes
              </p>
            </div>
            <div className="flex items-center">
              <Badge badgeContent={cartItems} color="error">
                <motion.button
                  className="bg-amber-700 hover:bg-amber-800 p-3 rounded-full flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ShoppingCart />
                </motion.button>
              </Badge>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="bg-white shadow-md py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-grow">
              <TextField
                fullWidth
                placeholder="Search ingredients, categories, or tags..."
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search className="text-amber-600" />
                    </InputAdornment>
                  ),
                  className: "rounded-full",
                }}
              />
            </div>
            
            {/* Sort dropdown (always visible) */}
            <div className="min-w-[180px]">
              <select 
                className="w-full p-2 border border-gray-200 rounded-full bg-white text-gray-800"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
            
            {/* Filter button (on mobile) */}
            {!showFilterButtons && (
              <div>
                <motion.button
                  className="w-full md:w-auto bg-amber-50 text-amber-800 border border-amber-200 px-4 py-2 rounded-full flex items-center justify-center"
                  onClick={() => setIsFilterDrawerOpen(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FilterList className="mr-1" />
                  Filters
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filter sidebar (on desktop) */}
          {showFilterButtons && (
            <motion.div 
              className="md:w-1/4 lg:w-1/5"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <button 
                    className="text-amber-600 text-sm hover:underline"
                    onClick={resetFilters}
                  >
                    Reset All
                  </button>
                </div>
                
                {/* Categories */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3 text-gray-700">Categories</h3>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <motion.button
                        key={category.id}
                        className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                          activeCategory === category.id
                            ? 'bg-amber-100 text-amber-800 font-medium'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                        onClick={() => setActiveCategory(category.id)}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {category.name}
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3 text-gray-700">Price Range</h3>
                  <Slider
                    value={priceRange}
                    onChange={(_, newValue) => setPriceRange(newValue as [number, number])}
                    valueLabelDisplay="auto"
                    min={0}
                    max={20}
                    step={0.5}
                    className="text-amber-600"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-sm text-gray-500">${priceRange[0]}</span>
                    <span className="text-sm text-gray-500">${priceRange[1]}</span>
                  </div>
                </div>
                
                {/* Other filters */}
                <div className="mb-6 space-y-2">
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={showOrganic} 
                        onChange={(e) => setShowOrganic(e.target.checked)}
                        className="text-amber-600"
                      />
                    }
                    label="Organic Only"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={showDiscount} 
                        onChange={(e) => setShowDiscount(e.target.checked)}
                        className="text-amber-600"
                      />
                    }
                    label="On Sale"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={showInStock} 
                        onChange={(e) => setShowInStock(e.target.checked)}
                        className="text-amber-600"
                      />
                    }
                    label="In Stock"
                  />
                </div>
                
                {/* Active filters */}
                {(activeCategory !== "All" || showOrganic || showDiscount || !showInStock) && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-3 text-gray-700">Active Filters</h3>
                    <div className="flex flex-wrap gap-2">
                      {activeCategory !== "All" && (
                        <Chip 
                          label={`Category: ${activeCategory}`}
                          onDelete={() => setActiveCategory("All")}
                          size="small"
                          className="bg-amber-50 text-amber-800"
                        />
                      )}
                      {showOrganic && (
                        <Chip 
                          label="Organic Only"
                          onDelete={() => setShowOrganic(false)}
                          size="small"
                          className="bg-amber-50 text-amber-800"
                        />
                      )}
                      {showDiscount && (
                        <Chip 
                          label="On Sale"
                          onDelete={() => setShowDiscount(false)}
                          size="small"
                          className="bg-amber-50 text-amber-800"
                        />
                      )}
                      {!showInStock && (
                        <Chip 
                          label="Include Out of Stock"
                          onDelete={() => setShowInStock(true)}
                          size="small"
                          className="bg-amber-50 text-amber-800"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
          
          {/* Products Grid */}
          <div className={`${showFilterButtons ? 'md:w-3/4 lg:w-4/5' : 'w-full'}`}>
            {/* Results count and applied filters */}
            <div className="flex flex-wrap items-center justify-between mb-6">
              <h2 className="text-gray-700 text-lg">
                <span className="font-semibold">{filteredItems.length}</span> {filteredItems.length === 1 ? 'product' : 'products'} found
              </h2>
              
              {/* Quick filter chips - visible on mobile */}
              {!showFilterButtons && (
                <div className="flex flex-wrap gap-2 mt-4 w-full">
                  {[
                    { label: "Organic", isActive: showOrganic, toggle: () => setShowOrganic(!showOrganic) },
                    { label: "On Sale", isActive: showDiscount, toggle: () => setShowDiscount(!showDiscount) },
                    { label: "In Stock", isActive: showInStock, toggle: () => setShowInStock(!showInStock) }
                  ].map((filter) => (
                    <Chip
                      key={filter.label}
                      label={filter.label}
                      onClick={filter.toggle}
                      className={filter.isActive ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* No results state */}
            {filteredItems.length === 0 && (
              <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-700">No Products Found</h2>
                <p className="text-gray-500">Try adjusting your filters or search criteria.</p>
              </div>
            )}
            
            {/* Ingredient Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {filteredItems.map(item => (
                <IngredientCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Filter Drawer for mobile */}
      {filterDrawer}
    </div>
  );
};

export default ShopPage;