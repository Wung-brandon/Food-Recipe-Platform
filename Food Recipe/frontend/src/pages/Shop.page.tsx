import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  FilterList, 
  Close,
  Kitchen,
  LocalDining,
  Storefront
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
  Alert,
  Tabs,
  Tab,
  Box
} from '@mui/material';
import ProductCard from '../components/ProductComponent';
import { Pagination } from '../components/Pagination';
import { Product, ApiResponse } from '../types/Products';

// Section types
type SectionType = 'products' | 'ingredients' | 'platform-ingredients';

interface SectionConfig {
  id: SectionType;
  label: string;
  icon: React.ReactNode;
  endpoint: string;
  maxPrice: number;
  color: string;
  description: string;
}

const SECTIONS: SectionConfig[] = [
  {
    id: 'products',
    label: 'Kitchen Utensils',
    icon: <Kitchen />,
    endpoint: 'products',
    maxPrice: 100,
    color: 'amber',
    description: 'Professional kitchen tools and utensils from Amazon'
  },
  {
    id: 'ingredients',
    label: 'African Ingredients',
    icon: <LocalDining />,
    endpoint: 'ingredients',
    maxPrice: 50,
    color: 'green',
    description: 'Authentic African spices and seasonings'
  },
  {
    id: 'platform-ingredients',
    label: 'Platform Ingredients',
    icon: <Storefront />,
    endpoint: 'platform-ingredients',
    maxPrice: 75,
    color: 'blue',
    description: 'Curated ingredients from our platform'
  }
];

const ShopPage: React.FC = () => {
  // Current section state
  const [activeSection, setActiveSection] = useState<SectionType>('products');
  const currentSectionConfig = SECTIONS.find(s => s.id === activeSection)!;
  
  // State management for each section
  const [sectionsData, setSectionsData] = useState<Record<SectionType, {
    items: Product[];
    loading: boolean;
    error: string | null;
    currentPage: number;
    totalCount: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }>>({
    'products': {
      items: [],
      loading: true,
      error: null,
      currentPage: 1,
      totalCount: 0,
      hasNext: false,
      hasPrevious: false
    },
    'ingredients': {
      items: [],
      loading: true,
      error: null,
      currentPage: 1,
      totalCount: 0,
      hasNext: false,
      hasPrevious: false
    },
    'platform-ingredients': {
      items: [],
      loading: true,
      error: null,
      currentPage: 1,
      totalCount: 0,
      hasNext: false,
      hasPrevious: false
    }
  });

  // Filter states - separate for each section
  const [sectionFilters, setSectionFilters] = useState<Record<SectionType, {
    searchQuery: string;
    priceRange: [number, number];
    sortBy: string;
  }>>({
    'products': {
      searchQuery: "",
      priceRange: [0, 100],
      sortBy: "newest"
    },
    'ingredients': {
      searchQuery: "",
      priceRange: [0, 50],
      sortBy: "newest"
    },
    'platform-ingredients': {
      searchQuery: "",
      priceRange: [0, 75],
      sortBy: "newest"
    }
  });

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [showFilterButtons, setShowFilterButtons] = useState(window.innerWidth >= 768);
  
  // Derived state for current section
  const currentData = sectionsData[activeSection];
  const currentFilters = sectionFilters[activeSection];
  const itemsPerPage = 20;
  const totalPages = Math.ceil(currentData.totalCount / itemsPerPage);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setShowFilterButtons(window.innerWidth >= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // API fetch function
  const fetchSectionData = async (
    section: SectionType, 
    page: number = 1, 
    search: string = "", 
    minPrice?: number, 
    maxPrice?: number
  ) => {
    const sectionConfig = SECTIONS.find(s => s.id === section)!;
    
    try {
      setSectionsData(prev => ({
        ...prev,
        [section]: { ...prev[section], loading: true, error: null }
      }));
      
      const params = new URLSearchParams();
      params.append('page', page.toString());
      
      if (search.trim()) {
        params.append('search', search.trim());
      }
      
      if (minPrice !== undefined && minPrice > 0) {
        params.append('min_price', minPrice.toString());
      }
      
      if (maxPrice !== undefined && maxPrice < sectionConfig.maxPrice) {
        params.append('max_price', maxPrice.toString());
      }
      
      const response = await fetch(`http://127.0.0.1:8000/api/shop/${sectionConfig.endpoint}/?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${sectionConfig.label.toLowerCase()}: ${response.statusText}`);
      }
      
      const data: ApiResponse = await response.json();
      
      setSectionsData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          items: data.results,
          totalCount: data.count,
          hasNext: !!data.next,
          hasPrevious: !!data.previous,
          loading: false
        }
      }));
      
    } catch (err) {
      console.error(`Error fetching ${section}:`, err);
      setSectionsData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          error: err instanceof Error ? err.message : 'An error occurred',
          items: [],
          loading: false
        }
      }));
    }
  };

  // Initial load for all sections
  useEffect(() => {
    SECTIONS.forEach(section => {
      fetchSectionData(section.id);
    });
  }, []);

  // Handle search and filters for current section with debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      // Reset to page 1 when filters change
      setSectionsData(prev => ({
        ...prev,
        [activeSection]: { ...prev[activeSection], currentPage: 1 }
      }));
      
      fetchSectionData(
        activeSection,
        1, 
        currentFilters.searchQuery, 
        currentFilters.priceRange[0], 
        currentFilters.priceRange[1]
      );
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [currentFilters.searchQuery, currentFilters.priceRange, activeSection]);

  // Handle page changes
  const handlePageChange = (page: number) => {
    setSectionsData(prev => ({
      ...prev,
      [activeSection]: { ...prev[activeSection], currentPage: page }
    }));
    
    fetchSectionData(
      activeSection, 
      page, 
      currentFilters.searchQuery, 
      currentFilters.priceRange[0], 
      currentFilters.priceRange[1]
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle section change
  const handleSectionChange = (event: React.SyntheticEvent, newSection: SectionType) => {
    setActiveSection(newSection);
  };

  // Update filters for current section
  const updateCurrentSectionFilter = (key: keyof typeof currentFilters, value: unknown) => {
    setSectionFilters(prev => ({
      ...prev,
      [activeSection]: {
        ...prev[activeSection],
        [key]: value
      }
    }));
  };

  // Apply client-side sorting
  const sortedItems = [...currentData.items].sort((a, b) => {
    switch (currentFilters.sortBy) {
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

  // Reset filters for current section
  const resetFilters = () => {
    setSectionFilters(prev => ({
      ...prev,
      [activeSection]: {
        searchQuery: "",
        priceRange: [0, currentSectionConfig.maxPrice],
        sortBy: "newest"
      }
    }));
    setSectionsData(prev => ({
      ...prev,
      [activeSection]: { ...prev[activeSection], currentPage: 1 }
    }));
    fetchSectionData(activeSection);
  };

  // Get color classes based on current section
  const getColorClasses = (type: 'bg' | 'text' | 'border' | 'hover') => {
    const colorMap = {
      amber: { bg: 'bg-amber-600', text: 'text-amber-600', border: 'border-amber-600', hover: 'hover:bg-amber-700' },
      green: { bg: 'bg-green-600', text: 'text-green-600', border: 'border-green-600', hover: 'hover:bg-green-700' },
      blue: { bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-600', hover: 'hover:bg-blue-700' }
    };
    return colorMap[currentSectionConfig.color as keyof typeof colorMap][type];
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
            value={currentFilters.priceRange}
            onChange={(_, newValue) => updateCurrentSectionFilter('priceRange', newValue as [number, number])}
            valueLabelDisplay="auto"
            min={0}
            max={currentSectionConfig.maxPrice}
            step={1}
            className={getColorClasses('text')}
          />
          <div className="flex justify-between mt-1">
            <span className="text-sm text-gray-500">${currentFilters.priceRange[0]}</span>
            <span className="text-sm text-gray-500">${currentFilters.priceRange[1]}</span>
          </div>
        </div>
        
        {/* Sort By */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Sort By</h3>
          <select 
            className="w-full p-2 border border-gray-300 rounded-md"
            value={currentFilters.sortBy}
            onChange={(e) => updateCurrentSectionFilter('sortBy', e.target.value)}
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
            className={`${getColorClasses('bg')} ${getColorClasses('hover')} text-white`}
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </Drawer>
  );

  const content = (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className={`${getColorClasses('bg')} text-white py-6`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">Multi-Platform Shop</h1>
              <p className="opacity-90">
                {currentSectionConfig.description}
              </p>
            </div>
            <div className="flex items-center">
              <Badge badgeContent={0} color="error">
                <button className={`${getColorClasses('bg').replace('600', '700')} ${getColorClasses('hover').replace('700', '800')} p-3 rounded-full flex items-center transition-colors`}>
                  <ShoppingCart />
                </button>
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <Tabs
            value={activeSection}
            onChange={handleSectionChange}
            className="border-b border-gray-200"
            indicatorColor="primary"
            textColor="primary"
          >
            {SECTIONS.map((section) => (
              <Tab
                key={section.id}
                value={section.id}
                icon={section.icon as React.ReactElement}
                label={section.label}
                className="flex-row gap-2 min-h-16"
              />
            ))}
          </Tabs>
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
                placeholder={`Search ${currentSectionConfig.label.toLowerCase()}...`}
                variant="outlined"
                size="small"
                value={currentFilters.searchQuery}
                onChange={(e) => updateCurrentSectionFilter('searchQuery', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search className={getColorClasses('text')} />
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
                value={currentFilters.sortBy}
                onChange={(e) => updateCurrentSectionFilter('sortBy', e.target.value)}
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
                  className={`w-full md:w-auto bg-${currentSectionConfig.color}-50 ${getColorClasses('text')} ${getColorClasses('border')} px-4 py-2 rounded-full flex items-center justify-center hover:bg-${currentSectionConfig.color}-100 transition-colors`}
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
                    className={`${getColorClasses('text')} text-sm hover:underline`}
                    onClick={resetFilters}
                  >
                    Reset All
                  </button>
                </div>
                
                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3 text-gray-700">Price Range</h3>
                  <Slider
                    value={currentFilters.priceRange}
                    onChange={(_, newValue) => updateCurrentSectionFilter('priceRange', newValue as [number, number])}
                    valueLabelDisplay="auto"
                    min={0}
                    max={currentSectionConfig.maxPrice}
                    step={1}
                    className={getColorClasses('text')}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-sm text-gray-500">${currentFilters.priceRange[0]}</span>
                    <span className="text-sm text-gray-500">${currentFilters.priceRange[1]}</span>
                  </div>
                </div>
                
                {/* Active filters */}
                {(currentFilters.searchQuery || currentFilters.priceRange[0] > 0 || currentFilters.priceRange[1] < currentSectionConfig.maxPrice) && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-3 text-gray-700">Active Filters</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentFilters.searchQuery && (
                        <Chip 
                          label={`Search: ${currentFilters.searchQuery}`}
                          onDelete={() => updateCurrentSectionFilter('searchQuery', "")}
                          size="small"
                          className={`bg-${currentSectionConfig.color}-50 ${getColorClasses('text')}`}
                        />
                      )}
                      {(currentFilters.priceRange[0] > 0 || currentFilters.priceRange[1] < currentSectionConfig.maxPrice) && (
                        <Chip 
                          label={`$${currentFilters.priceRange[0]} - $${currentFilters.priceRange[1]}`}
                          onDelete={() => updateCurrentSectionFilter('priceRange', [0, currentSectionConfig.maxPrice])}
                          size="small"
                          className={`bg-${currentSectionConfig.color}-50 ${getColorClasses('text')}`}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Products Grid */}
          <div className={`${showFilterButtons ? 'md:w-3/4 lg:w-4/5' : 'w-full'}`}>
            {/* Results count */}
            <div className="flex flex-wrap items-center justify-between mb-6">
              <h2 className="text-gray-700 text-lg">
                <span className="font-semibold">{currentData.totalCount}</span> {currentSectionConfig.label.toLowerCase()} found
                {currentData.currentPage > 1 && (
                  <span className="text-gray-500 ml-2">
                    (Page {currentData.currentPage} of {totalPages})
                  </span>
                )}
              </h2>
            </div>
            
            {/* Error state */}
            {currentData.error && (
              <Alert severity="error" className="mb-6">
                {currentData.error}
                <Button onClick={() => fetchSectionData(activeSection, currentData.currentPage)} className="ml-2">
                  Retry
                </Button>
              </Alert>
            )}
            
            {/* Loading state */}
            {currentData.loading && (
              <div className="flex justify-center items-center py-20">
                <CircularProgress className={getColorClasses('text')} />
              </div>
            )}
            
            {/* No results state */}
            {!currentData.loading && !currentData.error && sortedItems.length === 0 && (
              <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-700">No {currentSectionConfig.label} Found</h2>
                <p className="text-gray-500">Try adjusting your search or filters.</p>
              </div>
            )}
            
            {/* Product Cards */}
            {!currentData.loading && !currentData.error && sortedItems.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {sortedItems.map(product => {
                    let buttonTitle = '';
                    let detailsRoute = '';
                    
                    if (activeSection === 'products') {
                      buttonTitle = 'Purchase from Amazon';
                      detailsRoute = `/product/${product.id}`;
                    } else if (activeSection === 'ingredients') {
                      buttonTitle = 'Purchase from African Food Supermarket';
                      detailsRoute = `/ingredient/${product.id}`;
                    } else if (activeSection === 'platform-ingredients') {
                      buttonTitle = 'Add to Cart';
                      detailsRoute = `/ingredient/${product.id}`; // Fixed routing to match app.tsx
                    }
                    
                    return (
                      <div key={product.id} className="flex justify-center">
                        <ProductCard 
                          item={product} 
                          isPlatformIngredient={activeSection === 'platform-ingredients'} 
                          buttonTitle={buttonTitle}
                          detailsRoute={detailsRoute}
                        />
                      </div>
                    );
                  })}
                </div>
                
                {/* Pagination - Now available for ALL sections */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-10">
                    <Pagination
                      currentPage={currentData.currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      hasNext={currentData.hasNext}
                      hasPrevious={currentData.hasPrevious}
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

  // Remove all layout wrappers (UserDashboardLayout, Navbar, Footer)
  // Only render the shop content directly
  return content;
};

export default ShopPage;