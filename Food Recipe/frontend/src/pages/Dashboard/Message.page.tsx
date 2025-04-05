import React from 'react';
import { 
  Typography, 
  Card, 
  CardContent, 
  Button 
} from '@mui/material';
import { Message as MessageIcon } from '@mui/icons-material';

const MessagesPage: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <Typography variant="h4">Messages</Typography>
      <Card>
        <CardContent className="text-center">
          <MessageIcon 
            className="text-amber-600 mb-4" 
            style={{ fontSize: 64 }} 
          />
          <Typography variant="h6" className="mb-2">
            No Messages
          </Typography>
          <Typography variant="body2" className="text-gray-600 mb-4">
            You have no new messages at the moment. 
            Connect with other food lovers to start chatting!
          </Typography>
          <Button 
            variant="contained" 
            className="bg-amber-600 hover:bg-amber-700"
          >
            Find Connections
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessagesPage;