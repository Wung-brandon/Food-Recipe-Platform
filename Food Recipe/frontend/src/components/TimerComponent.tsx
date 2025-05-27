import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Typography, 
  IconButton, 
  CircularProgress,
} from '@mui/material';
import { 
  PlayArrow, 
  Pause, 
  Refresh, 
} from '@mui/icons-material';


export const Timer: React.FC<{ minutes: number }> = ({ minutes }) => {
  const [timeLeft, setTimeLeft] = useState(minutes * 60);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft]);

  const formatTime = () => {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    return `${hours > 0 ? `${hours}:` : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(minutes * 60);
  };

  const progress = 100 - ((timeLeft / (minutes * 60)) * 100);

  return (
    <motion.div 
      className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Typography variant="h6" className="font-semibold mb-3">
        Cooking Timer
      </Typography>
      
      <div className="relative mb-4">
        <CircularProgress 
          variant="determinate" 
          value={progress} 
          size={100} 
          thickness={4} 
          className="text-amber-500"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Typography variant="h5" className="font-mono">
            {formatTime()}
          </Typography>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <IconButton 
          onClick={toggleTimer}
          className={isActive ? "bg-red-100 hover:bg-red-200" : "bg-green-100 hover:bg-green-200"}
        >
          {isActive ? <Pause /> : <PlayArrow />}
        </IconButton>
        
        <IconButton 
          onClick={resetTimer}
          className="bg-gray-100 hover:bg-gray-200"
        >
          <Refresh />
        </IconButton>
      </div>
    </motion.div>
  );
};