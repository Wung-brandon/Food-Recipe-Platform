import React, { useState } from 'react';
import { 
  Typography, 
  Card, 
  CardContent, 
  Switch, 
  FormControlLabel 
} from '@mui/material';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    privacyMode: false,
    darkMode: false
  });

  const handleToggle = (setting: keyof typeof settings) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [setting]: !prevSettings[setting]
    }));
  };

  return (
    <div className="space-y-6 p-6">
      <Typography variant="h4">Settings</Typography>
      <Card>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <Typography variant="subtitle1">
              Notifications
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications}
                  onChange={() => handleToggle('notifications')}
                  color="primary"
                />
              }
              label=""
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <Typography variant="subtitle1">
                Privacy Mode
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Hide personal information from other users
              </Typography>
            </div>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.privacyMode}
                  onChange={() => handleToggle('privacyMode')}
                  color="primary"
                />
              }
              label=""
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <Typography variant="subtitle1">
                Dark Mode
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Switch between light and dark themes
              </Typography>
            </div>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.darkMode}
                  onChange={() => handleToggle('darkMode')}
                  color="primary"
                />
              }
              label=""
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;