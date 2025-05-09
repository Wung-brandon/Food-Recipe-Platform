import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Grid,
  Box,
  SelectChangeEvent,
  FormControlLabel,
  Checkbox,
  Stepper,
  Step,
  StepLabel,
  FormHelperText,
  Divider,
} from "@mui/material";
import { Link } from "react-router-dom";
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Lock, 
  Person, 
  RestaurantMenu, 
  Work, 
  VerifiedUser,
  Security,
  Article,
  FileUpload,
  Badge
} from "@mui/icons-material";
import { spaghetti } from "../components/images";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

// Define specialization choices based on backend
const SPECIALIZATION_CHOICES = [
  { value: "ITALIAN", label: "Italian Cuisine" },
  { value: "FRENCH", label: "French Cuisine" },
  { value: "ASIAN", label: "Asian Cuisine" },
  { value: "MEXICAN", label: "Mexican Cuisine" },
  { value: "MEDITERRANEAN", label: "Mediterranean Cuisine" },
  { value: "INDIAN", label: "Indian Cuisine" },
  { value: "PASTRY", label: "Pastry & Baking" },
  { value: "VEGAN", label: "Vegan & Vegetarian" },
  { value: "BBQ", label: "BBQ & Grilling" },
  { value: "SEAFOOD", label: "Seafood" }
];

const SignupPage: React.FC = () => {
  const { register, registerChef } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<string>("user");
  const [activeChefStep, setActiveChefStep] = useState(0);
  const [fileUploads, setFileUploads] = useState({
    certification: null as File | null,
    identity_proof: null as File | null,
    food_safety_certification: null as File | null
  });
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    specialization: "",
    years_of_experience: 0,
    certification_number: "",
    issuing_authority: "",
    has_accepted_terms: false
  });

  // Handle Input Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "years_of_experience") {
      // Ensure it's a non-negative number
      const numValue = Math.max(0, parseInt(value) || 0);
      setFormData({ ...formData, [name]: numValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle Select Change
  const handleUserTypeChange = (e: SelectChangeEvent) => {
    setUserType(e.target.value);
    // Reset chef form steps when switching account types
    if (e.target.value === "chef") {
      setActiveChefStep(0);
    }
  };

  // Handle Specialization Change
  const handleSpecializationChange = (e: SelectChangeEvent) => {
    setFormData({ ...formData, specialization: e.target.value });
  };

  // Handle Checkbox Change
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
  };

  // Handle File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files && e.target.files[0]) {
      setFileUploads({ ...fileUploads, [field]: e.target.files[0] });
    }
  };

  // Chef registration stepper steps
  const handleNext = () => {
    setActiveChefStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveChefStep((prevStep) => prevStep - 1);
  };

  // Form validation for each step
  const validateBasicInfoStep = () => {
    return formData.username && formData.email && formData.password && 
           formData.password === formData.confirmPassword;
  };

  const validateChefExperienceStep = () => {
    return formData.specialization && formData.years_of_experience > 0;
  };

  const validateCertificationsStep = () => {
    return formData.certification_number && 
           formData.issuing_authority && 
           fileUploads.certification && 
           fileUploads.food_safety_certification;
  };

  const validateVerificationStep = () => {
    return fileUploads.identity_proof && formData.has_accepted_terms;
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        setLoading(false);
        return;
      }

      if (userType === "chef") {
        // Validate all required fields for chef registration
        if (!validateBasicInfoStep() || 
            !validateChefExperienceStep() || 
            !validateCertificationsStep() || 
            !validateVerificationStep()) {
          toast.error("Please fill in all required fields");
          setLoading(false);
          return;
        }
        
        // Create FormData object for file uploads
        const chefFormData = new FormData();
        chefFormData.append("email", formData.email);
        chefFormData.append("password", formData.password);
        chefFormData.append("confirmPassword", formData.confirmPassword);
        chefFormData.append("username", formData.username);
        chefFormData.append("specialization", formData.specialization);
        chefFormData.append("years_of_experience", formData.years_of_experience.toString());
        chefFormData.append("certification_number", formData.certification_number);
        chefFormData.append("issuing_authority", formData.issuing_authority);
        chefFormData.append("has_accepted_terms", formData.has_accepted_terms.toString());
        
        // Append files
        if (fileUploads.certification) {
          chefFormData.append("certification", fileUploads.certification);
        }
        if (fileUploads.identity_proof) {
          chefFormData.append("identity_proof", fileUploads.identity_proof);
        }
        if (fileUploads.food_safety_certification) {
          chefFormData.append("food_safety_certification", fileUploads.food_safety_certification);
        }
        
        await registerChef(
          formData.email,
          formData.password,
          formData.confirmPassword,
          formData.username,
          formData.specialization,
          formData.years_of_experience.toString()
        );
      } else {
        // Regular user registration
        await register(
          formData.email, 
          formData.password, 
          formData.confirmPassword,
          formData.username
        );
      }
   
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Chef registration steps content
  const renderChefSteps = () => {
    switch (activeChefStep) {
      case 0:
        return (
          <>
            <Typography variant="h6" className="mb-4">
              Basic Information
            </Typography>
            
            {/* Username Field */}
            <TextField
              fullWidth
              label="Username"
              name="username"
              variant="outlined"
              required
              value={formData.username}
              onChange={handleChange}
              className="mb-4"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                ),
              }}
            />

            {/* Email Field */}
            <TextField
              fullWidth
              label="Email"
              name="email"
              variant="outlined"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mb-4"
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
              value={formData.password}
              onChange={handleChange}
              className="mb-4"
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

            {/* Confirm Password Field */}
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              variant="outlined"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mb-4"
            />
            
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={!validateBasicInfoStep()}
              className="mt-4"
            >
              Next
            </Button>
          </>
        );
      
      case 1:
        return (
          <>
            <Typography variant="h6" className="mb-4">
              Culinary Experience
            </Typography>
            
            {/* Specialization Field */}
            <FormControl fullWidth variant="outlined" className="mb-4" required>
              <InputLabel id="specialization-label">Specialization</InputLabel>
              <Select
                labelId="specialization-label"
                name="specialization"
                value={formData.specialization}
                onChange={handleSpecializationChange}
                label="Specialization"
                startAdornment={
                  <InputAdornment position="start">
                    <RestaurantMenu />
                  </InputAdornment>
                }
              >
                {SPECIALIZATION_CHOICES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {/* Years of Experience Field */}
            <TextField
              fullWidth
              label="Years of Experience"
              name="years_of_experience"
              variant="outlined"
              type="number"
              required
              inputProps={{ min: 0 }}
              value={formData.years_of_experience}
              onChange={handleChange}
              className="mb-4"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Work />
                  </InputAdornment>
                ),
              }}
            />
            
            <Box className="flex justify-between mt-4">
              <Button onClick={handleBack}>
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={!validateChefExperienceStep()}
              >
                Next
              </Button>
            </Box>
          </>
        );
      
      case 2:
        return (
          <>
            <Typography variant="h6" className="mb-4">
              Certifications
            </Typography>
            
            {/* Certification Upload */}
            <Typography variant="subtitle2" className="mb-1">
              Professional Certificate
            </Typography>
            <Box className="mb-4">
              <input
                accept="image/*,application/pdf"
                style={{ display: 'none' }}
                id="certification-upload"
                type="file"
                onChange={(e) => handleFileChange(e as React.ChangeEvent<HTMLInputElement>, 'certification')}
              />
              <label htmlFor="certification-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<FileUpload />}
                  fullWidth
                >
                  {fileUploads.certification ? fileUploads.certification.name : "Upload Certification"}
                </Button>
              </label>
              {fileUploads.certification && (
                <FormHelperText>
                  File selected: {fileUploads.certification.name}
                </FormHelperText>
              )}
            </Box>
            
            {/* Certification Number Field */}
            <TextField
              fullWidth
              label="Certification Number"
              name="certification_number"
              variant="outlined"
              required
              value={formData.certification_number}
              onChange={handleChange}
              className="mb-4"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Badge />
                  </InputAdornment>
                ),
              }}
            />
            
            {/* Issuing Authority Field */}
            <TextField
              fullWidth
              label="Issuing Authority"
              name="issuing_authority"
              variant="outlined"
              required
              value={formData.issuing_authority}
              onChange={handleChange}
              className="mb-4"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <VerifiedUser />
                  </InputAdornment>
                ),
              }}
            />
            
            {/* Food Safety Certification Upload */}
            <Typography variant="subtitle2" className="mb-1">
              Food Safety Certification
            </Typography>
            <Box className="mb-4">
              <input
                accept="image/*,application/pdf"
                style={{ display: 'none' }}
                id="food-safety-upload"
                type="file"
                onChange={(e) => handleFileChange(e as React.ChangeEvent<HTMLInputElement>, 'food_safety_certification')}
              />
              <label htmlFor="food-safety-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<FileUpload />}
                  fullWidth
                >
                  {fileUploads.food_safety_certification ? fileUploads.food_safety_certification.name : "Upload Food Safety Certificate"}
                </Button>
              </label>
              {fileUploads.food_safety_certification && (
                <FormHelperText>
                  File selected: {fileUploads.food_safety_certification.name}
                </FormHelperText>
              )}
            </Box>
            
            <Box className="flex justify-between mt-4">
              <Button onClick={handleBack}>
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={!validateCertificationsStep()}
              >
                Next
              </Button>
            </Box>
          </>
        );
      
      case 3:
        return (
          <>
            <Typography variant="h6" className="mb-4">
              Verification & Terms
            </Typography>
            
            {/* Identity Proof Upload */}
            <Typography variant="subtitle2" className="mb-1">
              Identity Proof Document
            </Typography>
            <Box className="mb-4">
              <input
                accept="image/*,application/pdf"
                style={{ display: 'none' }}
                id="identity-upload"
                type="file"
                onChange={(e) => handleFileChange(e as React.ChangeEvent<HTMLInputElement>, 'identity_proof')}
              />
              <label htmlFor="identity-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<FileUpload />}
                  fullWidth
                >
                  {fileUploads.identity_proof ? fileUploads.identity_proof.name : "Upload Identity Proof"}
                </Button>
              </label>
              {fileUploads.identity_proof && (
                <FormHelperText>
                  File selected: {fileUploads.identity_proof.name}
                </FormHelperText>
              )}
            </Box>
            
            <FormHelperText className="mb-4">
              Please upload a government-issued ID (passport, driver's license, etc.)
            </FormHelperText>
            
            {/* Terms and Conditions */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.has_accepted_terms}
                  onChange={handleCheckboxChange}
                  name="has_accepted_terms"
                  color="primary"
                  required
                />
              }
              label={
                <Typography variant="body2">
                  I accept the Terms and Conditions for Chef Registration, including verification procedures and content guidelines.
                </Typography>
              }
              className="mb-2"
            />
            
            <Typography variant="body2" color="text.secondary" className="mb-4">
              By registering as a chef, you agree to our verification process and content standards. Your application will be reviewed by our team.
            </Typography>
            
            <Box className="flex justify-between mt-4">
              <Button onClick={handleBack}>
                Back
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading || !validateVerificationStep()}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: "white" }} />
                ) : (
                  "Submit Chef Application"
                )}
              </Button>
            </Box>
          </>
        );
      
      default:
        return null;
    }
  };

  // Regular user form
  const renderUserForm = () => (
    <>
      {/* Username Field */}
      <TextField
        fullWidth
        label="Username"
        name="username"
        variant="outlined"
        required
        value={formData.username}
        onChange={handleChange}
        className="mb-4"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Person />
            </InputAdornment>
          ),
        }}
      />

      {/* Email Field */}
      <TextField
        fullWidth
        label="Email"
        name="email"
        variant="outlined"
        type="email"
        required
        value={formData.email}
        onChange={handleChange}
        className="mb-4"
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
        value={formData.password}
        onChange={handleChange}
        className="mb-4"
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

      {/* Confirm Password Field */}
      <TextField
        fullWidth
        label="Confirm Password"
        name="confirmPassword"
        variant="outlined"
        type="password"
        required
        value={formData.confirmPassword}
        onChange={handleChange}
        className="mb-4"
      />

      {/* Submit Button */}
      <Button
        fullWidth
        variant="contained"
        className="bg-amber-600 hover:bg-amber-700 text-white py-3 mt-4"
        sx={{ backgroundColor: "#d97706" }}
        type="submit"
        disabled={loading}
      >
        {loading ? (
          <CircularProgress size={24} sx={{ color: "white" }} />
        ) : (
          "Sign Up"
        )}
      </Button>
    </>
  );

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
                Join PerfectRecipe
              </Typography>
              
              <Typography className="text-gray-500 text-center mb-6">
                Create an account to explore and share recipes!
              </Typography>

              {/* User Type Selection */}
              <FormControl fullWidth variant="outlined" className="mb-4 mt-4">
                <InputLabel id="user-type-label">Account Type</InputLabel>
                <Select
                  labelId="user-type-label"
                  value={userType}
                  onChange={handleUserTypeChange}
                  label="Account Type"
                >
                  <MenuItem value="user">Regular User</MenuItem>
                  <MenuItem value="chef">Professional Chef</MenuItem>
                </Select>
              </FormControl>

              {userType === "chef" && (
                <Box className="mb-4">
                  <Stepper activeStep={activeChefStep} alternativeLabel>
                    <Step>
                      <StepLabel>Basic Info</StepLabel>
                    </Step>
                    <Step>
                      <StepLabel>Experience</StepLabel>
                    </Step>
                    <Step>
                      <StepLabel>Certifications</StepLabel>
                    </Step>
                    <Step>
                      <StepLabel>Verification</StepLabel>
                    </Step>
                  </Stepper>
                </Box>
              )}

              <Divider className="mb-4" />

              <form className="space-y-4" onSubmit={handleSubmit}>
                {userType === "chef" ? renderChefSteps() : renderUserForm()}
              </form>

              {/* Footer Links */}
              <Typography className="mt-6 text-center text-gray-500">
                Already have an account?{" "}
                <Link to="/login" className="text-amber-600 font-semibold">
                  Login
                </Link>
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
};

export default SignupPage;