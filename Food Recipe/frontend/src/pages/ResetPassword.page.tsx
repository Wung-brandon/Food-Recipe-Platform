import React, { useState } from "react";
import { TextField, Button, Typography, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff, Lock } from "@mui/icons-material";
import { Link } from "react-router-dom";

const ResetPassword: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-md p-6">
        <Typography variant="h5" className="font-bold text-gray-800 text-center">
          Reset Your Password
        </Typography>
        <Typography className="text-gray-500 py-6 text-center">
          Enter your new password below.
        </Typography>

        <form className="space-y-4">
          <TextField
            fullWidth
            label="New Password"
            variant="outlined"
            type={showPassword ? "text" : "password"}
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
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

          <TextField
            fullWidth
            label="Confirm Password"
            variant="outlined"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button 
            fullWidth 
            variant="contained" 
            className="bg-amber-600 hover:bg-amber-700 text-white py-2"
            sx={{backgroundColor: '#d97706'}}
            >
            Reset Password
          </Button>
        </form>

        <Typography className="mt-4 text-center text-gray-500">
          Back to{" "}
          <Link to="/login" className="text-amber-600 font-semibold">
            Login
          </Link>
        </Typography>
      </div>
    </div>
  );
};

export default ResetPassword;
