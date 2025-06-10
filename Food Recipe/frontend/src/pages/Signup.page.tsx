import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  Typography, Button, Box, TextField, FormControl, InputLabel, 
  Select, MenuItem, FormControlLabel, Checkbox, InputAdornment,
  IconButton, Stepper, Step, StepLabel, Paper, SelectChangeEvent
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Link } from 'react-router-dom';

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

  console.log("Form Data:", formData);
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
        
        // Ensure all required files are present
        if (!fileUploads.certification || !fileUploads.identity_proof || !fileUploads.food_safety_certification) {
          toast.error("Please upload all required documents");
          setLoading(false);
          return;
        }
        
        // Call the registerChef function with all required parameters
        await registerChef(
          formData.email,
          formData.password,
          formData.confirmPassword,
          formData.username,
          formData.specialization,
          formData.years_of_experience.toString(),
          formData.certification_number,
          formData.issuing_authority,
          formData.has_accepted_terms,
          fileUploads.certification,
          fileUploads.identity_proof,
          fileUploads.food_safety_certification
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

  // Render the appropriate step based on activeChefStep
  const renderChefStep = () => {
    switch (activeChefStep) {
      case 0: // Basic Info
        return (
          <Box>
            <Typography variant="h6" mb={2}>Basic Information</Typography>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              margin="normal"
              required
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleNext}
                disabled={!validateBasicInfoStep()}
              >
                Next
              </Button>
            </Box>
          </Box>
        );
      
      case 1: // Chef Experience
        return (
          <Box>
            <Typography variant="h6" mb={2}>Professional Experience</Typography>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Culinary Specialization</InputLabel>
              <Select
                name="specialization"
                value={formData.specialization}
                onChange={handleSpecializationChange}
                label="Culinary Specialization"
              >
                {SPECIALIZATION_CHOICES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Years of Experience"
              name="years_of_experience"
              type="number"
              value={formData.years_of_experience}
              onChange={handleChange}
              margin="normal"
              required
              inputProps={{ min: 0 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button variant="outlined" onClick={handleBack}>
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
          </Box>
        );
      
      case 2: // Certifications
        return (
          <Box>
            <Typography variant="h6" mb={2}>Professional Certifications</Typography>
            <TextField
              fullWidth
              label="Certification Number"
              name="certification_number"
              value={formData.certification_number}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Issuing Authority"
              name="issuing_authority"
              value={formData.issuing_authority}
              onChange={handleChange}
              margin="normal"
              required
            />
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Upload Certification Document
              </Typography>
              <input
                accept="image/*,.pdf"
                type="file"
                onChange={(e) => handleFileChange(e, "certification")}
                style={{ marginBottom: '16px' }}
              />
              {fileUploads.certification && (
                <Typography variant="body2" color="primary" gutterBottom>
                  File selected: {fileUploads.certification.name}
                </Typography>
              )}
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Food Safety Certification
              </Typography>
              <input
                accept="image/*,.pdf"
                type="file"
                onChange={(e) => handleFileChange(e, "food_safety_certification")}
                style={{ marginBottom: '16px' }}
              />
              {fileUploads.food_safety_certification && (
                <Typography variant="body2" color="primary" gutterBottom>
                  File selected: {fileUploads.food_safety_certification.name}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button variant="outlined" onClick={handleBack}>
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
          </Box>
        );
      
      case 3: // Verification
        return (
          <Box>
            <Typography variant="h6" mb={2}>Identity Verification</Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Upload Identity Proof (Government ID)
              </Typography>
              <input
                accept="image/*,.pdf"
                type="file"
                onChange={(e) => handleFileChange(e, "identity_proof")}
                style={{ marginBottom: '16px' }}
              />
              {fileUploads.identity_proof && (
                <Typography variant="body2" color="primary" gutterBottom>
                  File selected: {fileUploads.identity_proof.name}
                </Typography>
              )}
            </Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.has_accepted_terms}
                  onChange={handleCheckboxChange}
                  name="has_accepted_terms"
                  color="primary"
                />
              }
              label="I agree to the Terms and Conditions and Privacy Policy"
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button variant="outlined" onClick={handleBack}>
                Back
              </Button>
              <Button 
                type="submit"
                variant="contained" 
                color="primary" 
                disabled={loading || !validateVerificationStep()}
              >
                Register as Chef
              </Button>
            </Box>
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom textAlign="center">
        Create an Account
      </Typography>
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Account Type</InputLabel>
          <Select
            value={userType}
            onChange={handleUserTypeChange}
            label="Account Type"
          >
            <MenuItem value="user">Regular User</MenuItem>
            <MenuItem value="chef">Professional Chef</MenuItem>
          </Select>
        </FormControl>
        
        <form onSubmit={handleSubmit}>
          {userType === "user" ? (
            // Regular User Signup Form
            <Box>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                margin="normal"
                required
              />
              <Button 
                fullWidth 
                type="submit" 
                variant="contained" 
                sx={{ backgroundColor: "#d97706", mt: 2 }}
                disabled={loading}
              >
                {loading ? "Processing..." : "Sign Up"}
              </Button>
            </Box>
          ) : (
            // Chef Signup Form with Stepper
            <Box sx={{ mt: 2 }}>
              <Stepper activeStep={activeChefStep} alternativeLabel sx={{ mb: 3 }}>
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
              {renderChefStep()}
            </Box>
          )}
        </form>
        
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            Already have an account? <Link to="/login" className='text-amber-600'>Login</Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default SignupPage;