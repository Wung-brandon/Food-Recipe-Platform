import React, { useState } from "react";
import { TextField, Button, Typography, InputAdornment, IconButton } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";
import { spaghetti } from "../components/images";

const AuthPage: React.FC = () => {
  const location = useLocation();
  const isSignup = location.pathname === "/signup";

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-lg flex flex-col md:flex-row w-full max-w-4xl">
        {/* Image Section - Hidden on Small Screens */}
        <div className="hidden md:flex md:w-1/2">
          <img src={spaghetti} alt="Food" className="w-full h-full object-cover rounded-l-lg" />
        </div>

        {/* Form Section */}
        <div className="w-full md:w-1/2 p-8 flex flex-col items-center">
          <Typography variant="h4" className="font-bold text-gray-800">
            {isSignup ? "Join PerfectRecipe" : "Welcome Back"}
          </Typography>
          <Typography className="text-gray-500 py-6">
            {isSignup
              ? "Create an account to explore and share recipes!"
              : "Log in to access your favorite recipes."}
          </Typography>

          <form className="w-full space-y-4">
            {isSignup && (
              <TextField
                fullWidth
                label="Full Name"
                variant="outlined"
                required
                className="hover:border-amber-600 focus:ring-amber-600"
              />
            )}

            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              type="email"
              required
              className="hover:border-amber-600 focus:ring-amber-600"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              variant="outlined"
              type={showPassword ? "text" : "password"}
              required
              className="hover:border-amber-600 focus:ring-amber-600"
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

            {isSignup && (
              <TextField
                fullWidth
                label="Confirm Password"
                variant="outlined"
                type="password"
                required
                className="hover:border-amber-600 focus:ring-amber-600"
              />
            )}

            {!isSignup && (
              <Typography className="text-right w-full text-sm text-amber-600">
                <Link to="/forgot-password">Forgot Password?</Link>
              </Typography>
            )}

            <Button
              fullWidth
              variant="contained"
              className="bg-amber-600 hover:bg-amber-700 text-white py-2"
              sx={{backgroundColor: '#d97706'}}
            >
              {isSignup ? "Sign Up" : "Login"}
            </Button>
          </form>

          {/* Footer Links */}
          <Typography className="mt-4 text-gray-500">
            {isSignup ? "Already have an account?" : "New to PerfectRecipe?"}{" "}
            <Link to={isSignup ? "/login" : "/signup"} className="text-amber-600 font-semibold">
              {isSignup ? "Login" : "Sign Up"}
            </Link>
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
