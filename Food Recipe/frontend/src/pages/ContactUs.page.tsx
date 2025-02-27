import React from "react";
import { TextField, Button, Typography, Grid, Paper } from "@mui/material";
import { Phone, Email, LocationOn } from "@mui/icons-material";
import { delicious } from "../components/images";

const ContactUs: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center">
      {/* Background Image Section */}
      <div
        className="relative w-full h-[40vh] flex items-center justify-center text-center"
        style={{
          backgroundImage: `url(${delicious})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="relative z-10 px-5 md:px-20">
          <Typography variant="h4" className="text-center font-bold text-white mb-6">
            Contact Us
          </Typography>
        </div>
      </div>

      {/* Contact Form & Details Section */}
      <Grid container spacing={4} className="px-10 py-10">
        {/* Contact Form */}
        <Grid item xs={12} md={6}>
          <Paper className="p-6 shadow-md rounded-lg">
            <Typography variant="h6" className="mb-4 text-gray-700">
              Send us a Message
            </Typography>
            <form className="space-y-4">
              <TextField fullWidth label="Your Name" variant="outlined" required />
              <TextField fullWidth label="Your Email" variant="outlined" type="email" required />
              <TextField fullWidth label="Subject" variant="outlined" required />
              <TextField fullWidth label="Message" variant="outlined" multiline rows={4} required />
              <Button fullWidth variant="contained" sx={{ backgroundColor: "#d97706", color: "white" }}>
                Send Message
              </Button>
            </form>
          </Paper>
        </Grid>

        {/* Contact Details */}
        <Grid item xs={12} md={6}>
          <Paper className="p-6 shadow-md rounded-lg bg-gray-50">
            <Typography variant="h6" className="mb-4 text-gray-700">
              Get in Touch
            </Typography>
            <div className="flex items-center mb-4">
              <Phone className="text-amber-600 mr-2" />
              <Typography>+1 (123) 456-7890</Typography>
            </div>
            <div className="flex items-center mb-4">
              <Email className="text-amber-600 mr-2" />
              <Typography>support@perfectrecipe.com</Typography>
            </div>
            <div className="flex items-center mb-4">
              <LocationOn className="text-amber-600 mr-2" />
              <Typography>123 Recipe Street, Foodie City, USA</Typography>
            </div>

            {/* Google Maps Embed Placeholder */}
            <div className="mt-6">
              <iframe
                title="map"
                width="100%"
                height="200"
                className="rounded-lg"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.8354345093726!2d144.95373531576746!3d-37.81627974202157!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642af0f11fd81%3A0x5045675218ce7e33!2sFoodie%20Street!5e0!3m2!1sen!2sus!4v1633873683452!5m2!1sen!2sus"
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default ContactUs;
