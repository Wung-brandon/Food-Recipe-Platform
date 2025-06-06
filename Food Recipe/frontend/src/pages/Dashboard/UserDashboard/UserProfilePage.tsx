import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  TextField,
  Paper,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Divider,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import axios from "axios";
import { toast } from 'react-toastify';
import { useAuth } from "../../../context/AuthContext";
import UserDashboardLayout from "../../../Layout/UserDashboardLayout";

const API_BASE_URL = "http://localhost:8000";

const UserProfileDashboard = () => {
  const { user, token } = useAuth();
  
  // State variables
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    bio: "",
    profile_picture: null,
  });
  const [preview, setPreview] = useState(null);

  // Create axios instance with auth headers
  const axiosConfig = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  };

  const axiosMultipartConfig = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    }
  };

  // Fetch profile data - First get all user profiles, then get specific one
  const fetchProfile = async () => {
    setLoading(true);
    try {
      // First, get the list of user profiles to find the user's profile ID
      const listResponse = await axios.get(`${API_BASE_URL}/api/user/profile/`, axiosConfig);
      
      if (listResponse.data && listResponse.data.length > 0) {
        // Get the first profile (since it's filtered by user in backend)
        const userProfile = listResponse.data[0];
        
        // Now fetch the detailed profile using the ID
        const detailResponse = await axios.get(
          `${API_BASE_URL}/api/user/profile/${userProfile.id}/`, 
          axiosConfig
        );
        
        setProfile(detailResponse.data);
        setForm({
          full_name: detailResponse.data.full_name || "",
          bio: detailResponse.data.bio || "",
          profile_picture: null,
        });
        setPreview(detailResponse.data.profile_picture || null);
        
        toast.success("Profile loaded successfully!");
      } else {
        // No profile exists yet
        setProfile(null);
        // toast.info("No profile found. You can create one by editing your profile.");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      
      if (error.response?.status === 404) {
        // Profile doesn't exist yet
        setProfile(null);
        // toast.info("No profile found. You can create one by editing your profile.");
      } else {
        toast.error("Failed to load profile. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchProfile();
    }
  }, [user, token]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle profile picture upload
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file.");
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB.");
        return;
      }
      
      setForm(prev => ({ ...prev, profile_picture: file }));
      setPreview(URL.createObjectURL(file));
      toast.success("Image selected successfully!");
    }
  };

  // Save/update profile
  const handleSave = async () => {
    setSaving(true);
    
    try {
      const formData = new FormData();
      formData.append("full_name", form.full_name);
      formData.append("bio", form.bio);
      
      if (form.profile_picture) {
        formData.append("profile_picture", form.profile_picture);
      }

      let response;
      
      if (profile && profile.id) {
        // Update existing profile using the profile ID
        response = await axios.put(
          `${API_BASE_URL}/api/user/profile/${profile.id}/`,
          formData,
          axiosMultipartConfig
        );
        toast.success("Profile updated successfully!");
      } else {
        // Create new profile using the list-create endpoint
        response = await axios.post(
          `${API_BASE_URL}/api/user/profile/`,
          formData,
          axiosMultipartConfig
        );
        toast.success("Profile created successfully!");
      }
      
      setProfile(response.data);
      setEditMode(false);
      
      // Refresh profile data
      await fetchProfile();
      
    } catch (error) {
      console.error("Error saving profile:", error);
      
      if (error.response?.data) {
        // Handle validation errors
        const errorMessages = Object.values(error.response.data).flat();
        errorMessages.forEach(msg => toast.error(msg));
      } else {
        toast.error("Failed to save profile. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        profile_picture: null,
      });
      setPreview(profile.profile_picture || null);
    } else {
      setForm({
        full_name: "",
        bio: "",
        profile_picture: null,
      });
      setPreview(null);
    }
    setEditMode(false);
    toast.info("Changes cancelled.");
  };

  const getInitials = (name) => {
    if (name) return name.charAt(0).toUpperCase();
    if (user?.username) return user.username.charAt(0).toUpperCase();
    return "U";
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} sx={{ color: "#f59e0b" }} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading profile...</Typography>
      </Box>
    );
  }

  return (
    <UserDashboardLayout title="My Profile">
      <Paper elevation={6} sx={{ borderRadius: 4, overflow: 'hidden' }}>
        {/* Header Section */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
            color: "white",
            textAlign: "center",
            py: 4,
            position: "relative"
          }}
        >
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            My Profile
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Manage your personal information
          </Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          {/* Profile Picture Section */}
          <Box display="flex" justifyContent="center" sx={{ mb: 4, mt: -6 }}>
            <Box position="relative">
              <Avatar
                src={preview || profile?.profile_picture || ""}
                sx={{
                  width: 120,
                  height: 120,
                  border: "4px solid white",
                  boxShadow: 3,
                  fontSize: 48,
                  bgcolor: "#f59e0b"
                }}
              >
                {getInitials(form.full_name)}
              </Avatar>
              {editMode && (
                <IconButton
                  component="label"
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    bgcolor: "#f59e0b",
                    color: "white",
                    "&:hover": { bgcolor: "#d97706" },
                    boxShadow: 2
                  }}
                >
                  <PhotoCameraIcon />
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </IconButton>
              )}
            </Box>
          </Box>

          {/* User Basic Info */}
          <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: "#f59e0b", fontWeight: "bold" }}>
                <PersonIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                Account Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <PersonIcon sx={{ mr: 1, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary">Username:</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="medium">
                    {user?.username || "Not set"}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <EmailIcon sx={{ mr: 1, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary">Email:</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="medium">
                    {user?.email || "Not set"}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <InfoIcon sx={{ mr: 1, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary">Role:</Typography>
                  </Box>
                  <Chip
                    label={user?.role || "USER"}
                    color={user?.role === "CHEF" ? "warning" : "primary"}
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="body2" color="text.secondary">Status:</Typography>
                  </Box>
                  <Chip
                    label={user?.is_verified ? "Verified" : "Unverified"}
                    color={user?.is_verified ? "success" : "default"}
                    size="small"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Profile Details */}
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ color: "#f59e0b", fontWeight: "bold" }}>
                  Profile Details
                </Typography>
                
                {!editMode && (
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => setEditMode(true)}
                    sx={{
                      bgcolor: "#f59e0b",
                      "&:hover": { bgcolor: "#d97706" },
                      borderRadius: 2
                    }}
                  >
                    Edit Profile
                  </Button>
                )}
              </Box>
              
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Full Name"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    fullWidth
                    disabled={!editMode}
                    variant="outlined"
                    placeholder="Enter your full name"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": {
                          borderColor: "#f59e0b",
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#f59e0b",
                      },
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Bio"
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    minRows={4}
                    disabled={!editMode}
                    variant="outlined"
                    placeholder="Tell us about yourself..."
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": {
                          borderColor: "#f59e0b",
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#f59e0b",
                      },
                    }}
                  />
                </Grid>
              </Grid>

              {editMode && (
                <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={saving}
                    sx={{
                      bgcolor: "#f59e0b",
                      "&:hover": { bgcolor: "#d97706" },
                    }}
                  >
                    {saving ? <CircularProgress size={20} color="inherit" /> : "Save Changes"}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Profile Stats */}
          {profile && (
            <Card variant="outlined" sx={{ mt: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: "#f59e0b", fontWeight: "bold" }}>
                  Profile Statistics
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary" fontWeight="bold">
                        {profile.followers_count || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Followers
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary" fontWeight="bold">
                        {profile.following_count || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Following
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Paper>
    </UserDashboardLayout>
  );
};

export default UserProfileDashboard;