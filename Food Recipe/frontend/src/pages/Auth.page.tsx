// import React, { useState } from "react";
// import {
//   TextField,
//   Button,
//   Typography,
//   InputAdornment,
//   IconButton,
//   CircularProgress,
// } from "@mui/material";
// import { Link, useLocation } from "react-router-dom";
// import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";
// import { spaghetti } from "../components/images";
// import { useAuth } from "../context/AuthContext";
// import { toast } from "react-toastify";
// const AuthPage: React.FC = () => {
//   const location = useLocation();
//   const isSignup = location.pathname === "/signup";

//   const { login, register } = useAuth();

//   const [loading, setLoading] = useState<boolean>(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [formData, setFormData] = useState({
//     username: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//   });
  

//   // Handle Input Change
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

  

//   // Handle Form Submission
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
    

//     try {
//       if (isSignup) {
//         if (formData.password !== formData.confirmPassword) {
//           toast.error("Passwords do not match")
//           // setError("Passwords do not match");
//           setLoading(false);
//           return;
//         }
//         await register(formData.username, formData.email, formData.password, formData.confirmPassword);
//       } else {
//         await login(formData.email, formData.password);
//       }
   
//     } catch (err: any) {
//       toast.error(err.message || "An error occurred")
//       // setError(err.message || "An error occurred");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
//       <div className="bg-white shadow-lg rounded-lg flex flex-col md:flex-row w-full max-w-4xl">
//         {/* Image Section */}
//         <div className="hidden md:flex md:w-1/2">
//           <img src={spaghetti} alt="Food" className="w-full h-full object-cover rounded-l-lg" />
//         </div>

//         {/* Form Section */}
//         <div className="w-full md:w-1/2 p-8 flex flex-col items-center">
//           <Typography variant="h4" className="font-bold text-gray-800">
//             {isSignup ? "Join PerfectRecipe" : "Welcome Back"}
//           </Typography>
//           <Typography className="text-gray-500 py-6">
//             {isSignup ? "Create an account to explore and share recipes!" : "Log in to access your favorite recipes."}
//           </Typography>


//           <form className="w-full space-y-4" onSubmit={handleSubmit}>
//             {isSignup && (
//               <TextField
//                 fullWidth
//                 label="Username"
//                 name="username"
//                 variant="outlined"
//                 required
//                 onChange={handleChange}
//               />
//             )}

//             <TextField
//               fullWidth
//               label="Email"
//               name="email"
//               variant="outlined"
//               type="email"
//               required
//               onChange={handleChange}
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <Email />
//                   </InputAdornment>
//                 ),
//               }}
//             />

//             <TextField
//               fullWidth
//               label="Password"
//               name="password"
//               variant="outlined"
//               type={showPassword ? "text" : "password"}
//               required
//               onChange={handleChange}
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <Lock />
//                   </InputAdornment>
//                 ),
//                 endAdornment: (
//                   <InputAdornment position="end">
//                     <IconButton onClick={() => setShowPassword(!showPassword)}>
//                       {showPassword ? <VisibilityOff /> : <Visibility />}
//                     </IconButton>
//                   </InputAdornment>
//                 ),
//               }}
//             />

//             {isSignup && (
//               <TextField
//                 fullWidth
//                 label="Confirm Password"
//                 name="confirmPassword"
//                 variant="outlined"
//                 type="password"
//                 required
//                 onChange={handleChange}
//               />
//             )}

//             {!isSignup && (
//               <Typography className="text-right w-full text-sm text-amber-600">
//                 <Link to="/forgot-password">Forgot Password?</Link>
//               </Typography>
//             )}

//             <Button
//               fullWidth
//               variant="contained"
//               className="bg-amber-600 hover:bg-amber-700 text-white py-2"
//               sx={{ backgroundColor: "#d97706" }}
//               type="submit"
//               disabled={loading}
//             >
//               {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : isSignup ? "Sign Up" : "Login"}
//             </Button>
//           </form>

//           {/* Footer Links */}
//           <Typography className="mt-4 text-gray-500">
//             {isSignup ? "Already have an account?" : "New to PerfectRecipe?"}{" "}
//             <Link to={isSignup ? "/login" : "/signup"} className="text-amber-600 font-semibold">
//               {isSignup ? "Login" : "Sign Up"}
//             </Link>
//           </Typography>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AuthPage;



     {/* Confirm Password Field */}
 