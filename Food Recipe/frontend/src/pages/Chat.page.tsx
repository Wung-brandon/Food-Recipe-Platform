import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Avatar, 
  Button, 
  TextField, 
  IconButton, 
  Paper, 
  Divider,
  AppBar,
  Toolbar,
  CircularProgress,
  Menu,
  MenuItem
} from '@mui/material';
import { 
  Send, 
  AttachFile, 
  Image, 
  Mic, 
  MoreVert, 
  ArrowBack, 
  EmojiEmotions,
  Restaurant
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Types
interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  attachments?: string[];
}

interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  role: string;
  bio: string;
  isOnline: boolean;
  lastActive?: string;
}

const ChatPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Mock current user
  const currentUser = {
    id: 'current-user',
    name: 'You',
    avatar: '/api/placeholder/100/100'
  };
  
  // Fetch user profile and chat history
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockUserProfile: UserProfile = {
        id: userId || 'user-1',
        name: 'Chef Maria',
        avatar: '/api/placeholder/100/100',
        role: 'Professional Chef',
        bio: 'Award-winning chef with 15 years of experience specializing in Mediterranean cuisine.',
        isOnline: true,
        lastActive: '2 minutes ago'
      };
      
      const mockMessages: ChatMessage[] = [
        {
          id: 'msg-1',
          senderId: userId || 'user-1',
          receiverId: 'current-user',
          content: 'Hello! Thanks for checking out my recipe. How can I help you today?',
          timestamp: '2 days ago',
          isRead: true
        },
        {
          id: 'msg-2',
          senderId: 'current-user',
          receiverId: userId || 'user-1',
          content: 'Hi Chef Maria! I love your pancake recipe! I wanted to ask if I can substitute the eggs with something else?',
          timestamp: '2 days ago',
          isRead: true
        },
        {
          id: 'msg-3',
          senderId: userId || 'user-1',
          receiverId: 'current-user',
          content: 'Absolutely! You can use 1/4 cup of applesauce or 1 mashed banana per egg. The texture will be slightly different but still delicious!',
          timestamp: '2 days ago',
          isRead: true
        },
        {
          id: 'msg-4',
          senderId: 'current-user',
          receiverId: userId || 'user-1',
          content: "That sounds great! I'll try with the banana. Thanks for the quick response!",
          timestamp: '2 days ago',
          isRead: true
        },
        {
          id: 'msg-5',
          senderId: userId || 'user-1',
          receiverId: 'current-user',
          content: "You're welcome! Let me know how it turns out. I'd love to hear about your results with the banana substitution!",
          timestamp: '1 day ago',
          isRead: true
        }
      ];
      
      setUserProfile(mockUserProfile);
      setMessages(mockMessages);
      setLoading(false);
    }, 1000);
  }, [userId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !userProfile) return;
    
    setSending(true);
    
    // Create new message
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'current-user',
      receiverId: userProfile.id,
      content: newMessage,
      timestamp: 'Just now',
      isRead: false
    };
    
    // Simulate sending to API
    setTimeout(() => {
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      setSending(false);
      
      // Simulate chef response after 1-3 seconds
      const responseDelay = 1000 + Math.random() * 2000;
      setTimeout(() => {
        const responses = [
          "Thanks for your message! I'll get back to you as soon as I can.",
          "That's a great question about my recipe! Let me think about that for a moment.",
          "I'm glad you reached out about the recipe. Would you like any other cooking tips?",
          "Thanks for your interest in my cooking! Is there anything else you'd like to know?",
          "I appreciate your question! I'm always happy to help fellow cooking enthusiasts."
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const responseMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          senderId: userProfile.id,
          receiverId: 'current-user',
          content: randomResponse,
          timestamp: 'Just now',
          isRead: true
        };
        
        setMessages(prev => [...prev, responseMsg]);
      }, responseDelay);
    }, 500);
  };
  
  const handleAttachment = () => {
    // Implement file attachment logic
    console.log('Attach file clicked');
  };
  
  const handleImageUpload = () => {
    // Implement image upload logic
    console.log('Image upload clicked');
  };
  
  const handleVoiceMessage = () => {
    // Implement voice message recording
    console.log('Voice message clicked');
  };
  
  const handleEmojiOpen = () => {
    // Implement emoji picker
    console.log('Emoji picker clicked');
  };
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  const handleShareRecipe = () => {
    handleMenuClose();
    // Navigate to recipe selection page
    navigate('/share-recipe');
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Format messages by date
  const formatMessages = () => {
    const messagesByDate: Record<string, ChatMessage[]> = {};
    
    messages.forEach(message => {
      const date = message.timestamp;
      if (!messagesByDate[date]) {
        messagesByDate[date] = [];
      }
      messagesByDate[date].push(message);
    });
    
    return messagesByDate;
  };
  
  const messageGroups = formatMessages();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }
  
  if (!userProfile) {
    navigate('/not-found');
    return null;
  }
  
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Chat Header */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton 
            edge="start" 
            onClick={() => navigate(-1)}
            className="mr-2"
          >
            <ArrowBack />
          </IconButton>
          
          <div className="flex items-center flex-1">
            <Avatar 
              src={userProfile.avatar} 
              alt={userProfile.name}
              className="mr-3"
            />
            <div>
              <Typography variant="subtitle1" className="font-medium">
                {userProfile.name}
              </Typography>
              <Typography variant="caption" className="text-gray-500">
                {userProfile.isOnline ? 'Online' : `Last active ${userProfile.lastActive}`}
              </Typography>
            </div>
          </div>
          
          <div>
            <IconButton onClick={handleMenuOpen}>
              <MoreVert />
            </IconButton>
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => { navigate(`/profile/${userProfile.id}`); handleMenuClose(); }}>
                View Profile
              </MenuItem>
              <MenuItem onClick={handleShareRecipe}>
                Share a Recipe
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>Clear Chat</MenuItem>
              <MenuItem onClick={handleMenuClose}>Block User</MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {Object.entries(messageGroups).map(([date, dateMessages]) => (
          <div key={date} className="mb-6">
            <div className="text-center mb-4">
              <Typography variant="caption" className="bg-gray-200 px-3 py-1 rounded-full text-gray-600">
                {date}
              </Typography>
            </div>
            
            {dateMessages.map(message => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex mb-4 ${message.senderId === 'current-user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.senderId !== 'current-user' && (
                  <Avatar 
                    src={userProfile.avatar}
                    alt={userProfile.name}
                    className="mr-2 mt-1 w-8 h-8"
                  />
                )}
                
                <div 
                  className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                    message.senderId === 'current-user' 
                      ? 'bg-blue-500 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 rounded-bl-none shadow'
                  }`}
                >
                  <Typography variant="body1">{message.content}</Typography>
                  <Typography 
                    variant="caption" 
                    className={`block text-right mt-1 ${
                      message.senderId === 'current-user' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp === 'Just now' ? message.timestamp : ''}
                  </Typography>
                </div>
                
                {message.senderId === 'current-user' && (
                  <Avatar 
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="ml-2 mt-1 w-8 h-8"
                  />
                )}
              </motion.div>
            ))}
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat Input */}
      <Paper elevation={3} className="p-2">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <IconButton onClick={handleEmojiOpen}>
            <EmojiEmotions />
          </IconButton>
          
          <IconButton onClick={handleAttachment}>
            <AttachFile />
          </IconButton>
          
          <IconButton onClick={handleImageUpload}>
            <Image />
          </IconButton>
          
          <TextField
            variant="outlined"
            placeholder="Type a message..."
            fullWidth
            multiline
            maxRows={4}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
            size="small"
          />
          
          {newMessage.trim() ? (
            <IconButton 
              color="primary" 
              type="submit"
              disabled={sending}
            >
              {sending ? <CircularProgress size={24} /> : <Send />}
            </IconButton>
          ) : (
            <IconButton onClick={handleVoiceMessage} color="primary">
              <Mic />
            </IconButton>
          )}
          
          <IconButton
            className="bg-amber-100 hover:bg-amber-200 ml-1"
            onClick={handleShareRecipe}
          >
            <Restaurant />
          </IconButton>
        </form>
      </Paper>
    </div>
  );
};

export default ChatPage;