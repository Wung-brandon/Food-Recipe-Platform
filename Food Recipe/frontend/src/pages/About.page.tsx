import React from "react";
import { Typography, Button, Card, CardContent, Avatar, Container } from "@mui/material";
import { People, Restaurant, Favorite } from "@mui/icons-material";
import { chef, delicious } from "../components/images";

import { motion } from "framer-motion";

const About: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <motion.div
        className="relative w-full h-[40vh] flex items-center justify-center text-center"
        style={{
          backgroundImage: `url(${delicious})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="relative z-10 px-5 md:px-20">
            {/* About PerfectRecipe */}
          <motion.div className="text-center py-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
            <Typography variant="h4" className="font-bold text-white mb-4">
              About PerfectRecipe
            </Typography>
            <Typography variant="body1" className="text-gray-300 max-w-3xl mx-auto">
              PerfectRecipe is more than just a recipe website – it's a community for food lovers. Our platform allows users to discover, create, and share incredible recipes while learning from others. Whether you're a seasoned chef or a beginner, we provide the perfect space for culinary exploration.
            </Typography>
          </motion.div>
            <Button variant="contained" sx={{ backgroundColor: "#d97706", borderRadius: "30px" }}>
              Explore Recipes
            </Button>
        </div>
      </motion.div>

      <Container className="py-16">
        

        {/* Our Core Values */}
        <motion.div className="text-center mb-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
          <Typography variant="h4" className="font-bold text-gray-800 mb-6">
            Our Core Values
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[{
              icon: <Restaurant fontSize="large" className="text-amber-600 mb-2" />, 
              title: "Quality Recipes", 
              text: "Each recipe is tested and reviewed to ensure excellence."
            }, {
              icon: <People fontSize="large" className="text-amber-600 mb-2" />, 
              title: "Community-Driven", 
              text: "We believe in sharing knowledge and celebrating food together."
            }, {
              icon: <Favorite fontSize="large" className="text-amber-600 mb-2" />, 
              title: "Passion for Food", 
              text: "We celebrate creativity and cultural diversity through cooking."
            }].map((item, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: index * 0.2 }}>
                <Card className="shadow-lg p-6 hover:shadow-2xl transition duration-300 transform hover:-translate-y-2">
                  <CardContent className="flex flex-col items-center">
                    {item.icon}
                    <Typography variant="h6" className="font-semibold">
                      {item.title}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600 text-center">
                      {item.text}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Meet Our Team */}
        <motion.div className="text-center mb-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
          <Typography variant="h4" className="font-bold text-gray-800 mb-6">
            Meet Our Team
          </Typography>
          <div className="flex flex-wrap justify-center gap-6">
            {["Alex Johnson", "Sarah Lee"].map((name, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: index * 0.2 }}>
                <Card className="shadow-lg p-4 w-60 hover:shadow-2xl transition duration-300 transform hover:-translate-y-2">
                  <CardContent className="flex flex-col items-center">
                    <Avatar src={chef} sx={{ width: 80, height: 80 }} />
                    <Typography variant="h6" className="font-semibold mt-2">
                      {name}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      {index === 0 ? "Founder & Head Chef" : "Recipe Curator & Blogger"}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div className="text-center bg-amber-600 text-white py-10 px-5 rounded-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
          <Typography variant="h4" className="font-bold mb-4">
            Join Our Community!
          </Typography>
          <Typography variant="body1" className="mb-6 max-w-2xl mx-auto">
            Connect with food lovers, share your favorite recipes, and explore new cuisines. Be a part of PerfectRecipe and start your culinary journey today!
          </Typography>
          <Button variant="contained" sx={{ backgroundColor: "white", color: "#d97706" }}>
            Get Started
          </Button>
        </motion.div>
      </Container>
    </div>
  );
};

export default About;
