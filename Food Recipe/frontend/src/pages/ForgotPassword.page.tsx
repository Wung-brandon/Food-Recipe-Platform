import React, { useState } from "react";
import { TextField, Button, Typography } from "@mui/material";
import { Email } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";


const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-md p-6">
        <Typography variant="h5" className="font-bold text-gray-800 text-center">
          Send Reset Link 
        </Typography>
        <Typography className="text-gray-500 py-6 text-center">
          Enter your email to receive a password reset link.
        </Typography>

        <form className="space-y-4">
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <Email className="mr-2 text-amber-600" />
              ),
            }}
          />

          <Button 
              fullWidth 
              variant="contained" 
              className="bg-amber-600 hover:bg-amber-700 text-white py-2"
              sx={{backgroundColor: '#d97706'}}
              onClick={() => navigate('/reset-password')}
          >
            Send Reset Link
          </Button>
        </form>

        <Typography className="mt-4 text-center text-gray-500">
          Remembered your password?{" "}
          <Link to="/login" className="text-amber-600 font-semibold">
            Login
          </Link>
        </Typography>
      </div>
    </div>
  );
};

export default ForgotPassword;
