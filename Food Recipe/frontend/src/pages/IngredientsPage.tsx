import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  FilterList, 
  Close, 
} from '@mui/icons-material';
import { 
  TextField, 
  InputAdornment, 
  Slider, 
  Badge,
  Drawer,
  IconButton,
  Chip,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import IngredientCard from '../components/IngredientComponent';
import { Pagination } from '../components/Pagination';

// Types for Ingredients
interface Ingredient {
  id: number;
  name: string;
  description: string | null;
  image_url: string;
  source_url: string;
  price: string;
  unit: string | null;
  created_at: string;
  updated_at: string;
}

interface IngredientsApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Ingredient[];
}

const IngredientsPage: React.FC = () => {
  // State management
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50]);
  const [sortBy, setSortBy] = useState("newest");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [cartItems, setCartItems] = useState<number>(0);
  const [showFilterButtons, setShowFilterButtons] = useState(window.innerWidth >= 768);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  
  // Derived state
  const itemsPerPage = 20; // Based on your API
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setShowFilterButtons(window.innerWidth >= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // API fetch function
  const fetchIngredients = async (page: number = 1, search: string = "", minPrice?: number, maxPrice?: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append('page', page.toString());
      
      if (search) {
        params.append('search', search);
      }
      
      if (minPrice !== undefined) {
        params.append('min_price', minPrice.toString());
      }
      
      if (maxPrice !== undefined) {
        params.append('max_price', maxPrice.toString());
      }
      
      const response = await fetch(`http://127.0.0.1:8000/api/shop/ingredients/?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch ingredients');
      }
      
      const data: IngredientsApiResponse = await response.json();
      
      setIngredients(data.results);
      setTotalCount(data.count);
      setHasNext(!!data.next);
      setHasPrevious(!!data.previous);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIngredients([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchIngredients();
  }, []);

  // Handle search and filters
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setCurrentPage(1);
      fetchIngredients(
        1, 
        searchQuery, 
        priceRange[0], 
        priceRange[1]
      );
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, priceRange]);

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchIngredients(page, searchQuery, priceRange[0], priceRange[1]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Apply client-side sorting
  const sortedIngredients = [...ingredients].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return parseFloat(a.price) - parseFloat(b.price);
      case "price-desc":
        return parseFloat(b.price) - parseFloat(a.price);
      case "name":
        return a.name.localeCompare(b.name);
      case "newest":
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setPriceRange([0, 50]);
    setSortBy("newest");
    setCurrentPage(1);
    fetchIngredients();
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
        
        {/* Price Range */}
        <div className="mb-6">
          <h3 className="font-medium mb-3">Price Range</h3>
          <Slider
            value={priceRange}
            onChange={(_, newValue) => setPriceRange(newValue as [number, number])}
            valueLabelDisplay="auto"
            min={0}
            max={50}
            step={1}
            className="text-green-600"
          />
          <div className="flex justify-between mt-1">
            <span className="text-sm text-gray-500">${priceRange[0]}</span>
            <span className="text-sm text-gray-500">${priceRange[1]}</span>
          </div>
        </div>
        
        {/* Sort By */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Sort By</h3>
          <select 
            className="w-full p-2 border border-gray-300 rounded-md"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
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
            className="bg-green-600 hover:bg-green-700 text-white"
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
      <div className="bg-green-600 text-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">African Ingredients Market</h1>
              <p className="text-green-100">
                Discover authentic African spices, seasonings, and cooking ingredients
              </p>
            </div>
            <div className="flex items-center">
              <Badge badgeContent={cartItems} color="error">
                <button className="bg-green-700 hover:bg-green-800 p-3 rounded-full flex items-center transition-colors">
                  <ShoppingCart />
                </button>
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
                placeholder="Search ingredients..."
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search className="text-green-600" />
                    </InputAdornment>
                  ),
                  className: "rounded-full",
                }}
              />
            </div>
            
            {/* Sort dropdown */}
            <div className="min-w-[180px]">
              <select 
                className="w-full p-2 border border-gray-200 rounded-full bg-white text-gray-800"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
            
            {/* Filter button (on mobile) */}
            {!showFilterButtons && (
              <div>
                <button
                  className="w-full md:w-auto bg-green-50 text-green-800 border border-green-200 px-4 py-2 rounded-full flex items-center justify-center hover:bg-green-100 transition-colors"
                  onClick={() => setIsFilterDrawerOpen(true)}
                >
                  <FilterList className="mr-1" />
                  Filters
                </button>
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
            <div className="md:w-1/4 lg:w-1/5">
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <button 
                    className="text-green-600 text-sm hover:underline"
                    onClick={resetFilters}
                  >
                    Reset All
                  </button>
                </div>
                
                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3 text-gray-700">Price Range</h3>
                  <Slider
                    value={priceRange}
                    onChange={(_, newValue) => setPriceRange(newValue as [number, number])}
                    valueLabelDisplay="auto"
                    min={0}
                    max={50}
                    step={1}
                    className="text-green-600"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-sm text-gray-500">${priceRange[0]}</span>
                    <span className="text-sm text-gray-500">${priceRange[1]}</span>
                  </div>
                </div>
                
                {/* Active filters */}
                {(searchQuery || priceRange[0] > 0 || priceRange[1] < 50) && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-3 text-gray-700">Active Filters</h3>
                    <div className="flex flex-wrap gap-2">
                      {searchQuery && (
                        <Chip 
                          label={`Search: ${searchQuery}`}
                          onDelete={() => setSearchQuery("")}
                          size="small"
                          className="bg-green-50 text-green-800"
                        />
                      )}
                      {(priceRange[0] > 0 || priceRange[1] < 50) && (
                        <Chip 
                          label={`$${priceRange[0]} - $${priceRange[1]}`}
                          onDelete={() => setPriceRange([0, 50])}
                          size="small"
                          className="bg-green-50 text-green-800"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Ingredients Grid */}
          <div className={`${showFilterButtons ? 'md:w-3/4 lg:w-4/5' : 'w-full'}`}>
            {/* Results count */}
            <div className="flex flex-wrap items-center justify-between mb-6">
              <h2 className="text-gray-700 text-lg">
                <span className="font-semibold">{totalCount}</span> {totalCount === 1 ? 'ingredient' : 'ingredients'} found
                {currentPage > 1 && (
                  <span className="text-gray-500 ml-2">
                    (Page {currentPage} of {totalPages})
                  </span>
                )}
              </h2>
            </div>
            
            {/* Error state */}
            {error && (
              <Alert severity="error" className="mb-6">
                {error}
                <Button onClick={() => fetchIngredients(currentPage)} className="ml-2">
                  Retry
                </Button>
              </Alert>
            )}
            
            {/* Loading state */}
            {loading && (
              <div className="flex justify-center items-center py-20">
                <CircularProgress className="text-green-600" />
              </div>
            )}
            
            {/* No results state */}
            {!loading && !error && sortedIngredients.length === 0 && (
              <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-700">No Ingredients Found</h2>
                <p className="text-gray-500">Try adjusting your search or filters.</p>
              </div>
            )}
            
            {/* Ingredient Cards */}
            {!loading && !error && sortedIngredients.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {sortedIngredients.map(ingredient => (
                    <div key={ingredient.id} className="flex justify-center">
                      <IngredientCard item={ingredient} />
                    </div>
                  ))}
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-10">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      hasNext={hasNext}
                      hasPrevious={hasPrevious}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Filter Drawer for mobile */}
      {filterDrawer}
    </div>
  );
};

export default IngredientsPage;