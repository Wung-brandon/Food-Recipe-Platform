import React from 'react';
import { 
  Typography, 
  Card, 
  CardContent, 
  Avatar, 
  Button 
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';


const staticUserData = {
  name: 'Emily Rodriguez',
  avatar: '/api/placeholder/200/200',
  followers: 245,
  following: 178,
  recipesCreated: 42
};

const ProfilePage: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <Typography variant="h4">Profile</Typography>
      <Card>
        <CardContent className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
          <Avatar 
            src={staticUserData.avatar} 
            alt={staticUserData.name} 
            className="w-32 h-32 border-4 border-amber-600"
          />
          <div className="flex-1 w-full">
            <div className="flex justify-between items-center">
              <Typography variant="h5">{staticUserData.name}</Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                startIcon={<EditIcon />}
                className="border-amber-600 text-amber-600"
              >
                Edit Profile
              </Button>
            </div>
            <Typography variant="subtitle1" className="text-gray-600 mb-4">
              Recipe Creator & Food Enthusiast
            </Typography>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <Typography variant="subtitle2" className="font-bold">
                  {staticUserData.recipesCreated}
                </Typography>
                <Typography variant="caption">Recipes Created</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" className="font-bold">
                  {staticUserData.followers}
                </Typography>
                <Typography variant="caption">Followers</Typography>
              </div>
              <div>
                <Typography variant="subtitle2" className="font-bold">
                  {staticUserData.following}
                </Typography>
                <Typography variant="caption">Following</Typography>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
