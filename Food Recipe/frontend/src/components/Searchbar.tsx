// src/components/common/SearchBar.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Paper, 
  InputBase, 
  IconButton, 
  Chip,
  Popper,
  ClickAwayListener,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { Search, RestaurantMenu, AccessTime, Close, Tune } from '@mui/icons-material';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Search for the perfect recipe...", 
  className = "" 
}) => {
  const [query, setQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches] = useState([
    "Creamy pasta carbonara",
    "Homemade pizza dough",
    "Chocolate chip cookies"
  ]);
  const [trendingSearches] = useState([
    "Air fryer recipes",
    "Keto breakfast",
    "One-pot meals",
    "Summer salads"
  ]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setAnchorEl(null);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (!anchorEl && e.target.value) {
      setAnchorEl(e.currentTarget);
    } else if (e.target.value === '') {
      setAnchorEl(null);
    }
  };
  
  const handleChipClick = (term: string) => {
    setQuery(term);
    onSearch(term);
    setAnchorEl(null);
  };
  
  const handleClickAway = () => {
    setAnchorEl(null);
  };
  
  const open = Boolean(anchorEl);
  
  const filters = [
    { name: "Under 30 min", icon: <AccessTime fontSize="small" /> },
    { name: "Vegetarian", icon: <RestaurantMenu fontSize="small" /> },
    { name: "Dinner", icon: null },
    { name: "Dessert", icon: null }
  ];

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <div className={`relative w-full max-w-2xl my-4 ${className}`}>
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Paper
            component="form"
            onSubmit={handleSubmit}
            elevation={2}
            className="flex items-center px-4 py-2 rounded-full bg-white border border-gray-100"
          >
            <IconButton type="submit" aria-label="search" className="p-2">
              <Search />
            </IconButton>
            
            <InputBase
              placeholder={placeholder}
              value={query}
              onChange={handleInputChange}
              fullWidth
              className="ml-2 text-gray-800"
              inputProps={{ 'aria-label': 'search recipes' }}
            />
            
            {query && (
              <IconButton aria-label="clear search" onClick={() => setQuery('')} className="p-2">
                <Close fontSize="small" />
              </IconButton>
            )}
            
            <IconButton 
              aria-label="search filters" 
              className={`p-2 ${showFilters ? 'text-amber-500' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Tune />
            </IconButton>
          </Paper>
        </motion.div>
        
        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 mt-3 px-4"
          >
            {filters.map((filter, index) => (
              <Chip
                key={index}
                icon={filter.icon}
                label={filter.name}
                onClick={() => {}}
                className="bg-white hover:bg-amber-50 border border-gray-200"
              />
            ))}
          </motion.div>
        )}
        
        {/* Dropdown Suggestions */}
        <Popper 
          open={open} 
          anchorEl={anchorEl}
          placement="bottom-start"
          className="z-20 w-full max-w-2xl mt-1"
        >
          <Paper elevation={3} className="py-2 rounded-2xl overflow-hidden">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <>
                <div className="px-4 py-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-600">Recent Searches</p>
                    <button className="text-xs text-amber-600 hover:text-amber-800">Clear all</button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {recentSearches.map((term, index) => (
                      <Chip
                        key={index}
                        label={term}
                        size="small"
                        onClick={() => handleChipClick(term)}
                        className="bg-gray-100 hover:bg-gray-200"
                      />
                    ))}
                  </div>
                </div>
                <Divider />
              </>
            )}
            
            {/* Trending Searches */}
            <div className="px-4 py-2">
              <p className="text-sm font-medium text-gray-600">Trending Now</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {trendingSearches.map((term, index) => (
                  <Chip
                    key={index}
                    label={term}
                    size="small"
                    onClick={() => handleChipClick(term)}
                    className="bg-amber-100 hover:bg-amber-200 text-amber-800"
                  />
                ))}
              </div>
            </div>
            
            {/* Autocomplete Suggestions */}
            {query && (
              <>
                <Divider />
                <List dense className="py-0">
                  {[1, 2, 3].map((item) => (
                    <ListItem 
                      key={item} 
                      button
                      onClick={() => handleChipClick(`${query} recipe ${item}`)}
                      className="hover:bg-gray-50"
                    >
                      <Search className="mr-3 text-gray-400" fontSize="small" />
                      <ListItemText 
                        primary={`${query} recipe ${item}`}
                        primaryTypographyProps={{ className: "text-gray-700" }}
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </Paper>
        </Popper>
      </div>
    </ClickAwayListener>
  );
};

export default SearchBar;