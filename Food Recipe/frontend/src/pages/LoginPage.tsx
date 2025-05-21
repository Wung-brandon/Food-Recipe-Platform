import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
  Paper,
  Grid,
  Box,
} from "@mui/material";
import { Link } from "react-router-dom";
import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";
import { spaghetti } from "../components/images";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const LoginPage: React.FC = () => {
  const { login } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Handle Input Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-8">
      <Paper elevation={3} className="w-full max-w-4xl rounded-lg overflow-hidden">
        <Grid container>
          {/* Image Section */}
          <Grid item xs={12} md={6} className="hidden md:block">
            <img 
              src={spaghetti} 
              alt="Food" 
              className="w-full h-full object-cover"
              style={{ minHeight: '100%' }}
            />
          </Grid>

          {/* Form Section */}
          <Grid item xs={12} md={6}>
            <Box className="p-6 md:p-8">
              <Typography variant="h4" className="font-bold text-gray-800 text-center mb-2">
                Welcome Back
              </Typography>
              
              <Typography className="text-gray-500 text-center mb-6">
                Log in to access your favorite recipes.
              </Typography>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Email Field */}
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  variant="outlined"
                  type="email"
                  required
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Password Field */}
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  variant="outlined"
                  type={showPassword ? "text" : "password"}
                  required
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Forgot Password Link */}
                <Typography className="text-right w-full text-sm text-amber-600">
                  <Link to="/forgot-password">Forgot Password?</Link>
                </Typography>

                {/* Submit Button */}
                <Button
                  fullWidth
                  variant="contained"
                  className="bg-amber-600 hover:bg-amber-700 text-white py-3 mt-4"
                  sx={{ backgroundColor: "#d97706" }}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Login"}
                </Button>
              </form>

              {/* Footer Links */}
              <Typography className="mt-6 text-center text-gray-500">
                New to PerfectRecipe?{" "}
                <Link to="/signup" className="text-amber-600 font-semibold">
                  Sign Up
                </Link>
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
};

export default LoginPage;