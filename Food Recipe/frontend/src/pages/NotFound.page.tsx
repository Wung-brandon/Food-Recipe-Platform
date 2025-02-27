import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Typography, Button } from '@mui/material';
import { Home, KeyboardBackspace } from '@mui/icons-material';

const NotFoundPage:React.FC = () => {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="text-center max-w-lg"
        initial={{ y: 30 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <motion.div
          initial={{ scale: 0.8, rotate: -5 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            duration: 0.6, 
            delay: 0.4,
            type: "spring", 
            stiffness: 120 
          }}
          className="mb-8 inline-block"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
            <path d="M10.5 3.75H13.5M10.5 3.75V2.25H13.5V3.75M10.5 3.75H2.25V6H21.75V3.75H13.5"></path>
            <path d="M10.7418 19.5031C10.8052 19.1274 10.8369 18.7412 10.8369 18.3488C10.8369 14.5416 7.75044 11.4551 3.94323 11.4551C3.21895 11.4551 2.51961 11.5577 1.86328 11.7503M10.7418 19.5031C9.44527 21.5965 7.00914 22.9434 4.24245 22.9434C0.435241 22.9434 -2.65162 19.8568 -2.65162 16.0496C-2.65162 14.7729 -2.32825 13.5768 -1.75869 12.537M10.7418 19.5031L20.9066 6.7153M13.9334 15.8531C13.8302 15.5241 13.7759 15.1766 13.7759 14.8176C13.7759 12.1053 15.9729 9.9083 18.6852 9.9083C19.5282 9.9083 20.3167 10.1249 21.0039 10.5061M13.9334 15.8531C14.7413 17.3376 16.2208 18.3488 17.9293 18.3488C20.4867 18.3488 22.5615 16.274 22.5615 13.7166C22.5615 12.6905 22.2447 11.7443 21.6998 10.9681M13.9334 15.8531L3.76844 28.6409"></path>
            <line x1="1" y1="23" x2="23" y2="23" stroke="#FDBA74" strokeWidth="0.5"></line>
          </svg>
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Typography variant="h2" component="h1" className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Page Not Found
          </Typography>
          
          <Typography variant="body1" className="text-gray-600 mb-8">
            Oops! It seems the recipe you're looking for has been moved or doesn't exist. 
            Let's find you something delicious instead.
          </Typography>
        </motion.div>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 py-4 justify-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <Button 
            component={Link}
            to="/"
            variant="contained" 
            startIcon={<Home />}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-full"
            sx={{ 
              backgroundColor: '#d97706', 
              '&:hover': { backgroundColor: '#b45309' },
              borderRadius: '9999px',
              textTransform: 'none',
              fontWeight: 'bold'
            }}
          >
            Go to Homepage
          </Button>
          
          <Button 
            component={Link}
            to="#"
            onClick={() => window.history.back()}
            variant="outlined" 
            startIcon={<KeyboardBackspace />}
            className="border-amber-600 text-amber-600 hover:bg-amber-50 px-6 py-2 rounded-full"
            sx={{ 
              borderColor: '#d97706', 
              color: '#d97706',
              '&:hover': { borderColor: '#b45309', color: '#b45309', backgroundColor: '#fef3c7' },
              borderRadius: '9999px',
              textTransform: 'none',
              fontWeight: 'bold'
            }}
          >
            Go Back
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default NotFoundPage;