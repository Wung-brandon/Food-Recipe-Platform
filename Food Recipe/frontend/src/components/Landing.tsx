import React from "react";
import { TextField, Button, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import {
  spaghetti,
  ekwang,
  katikati,
  njama,
  pizza,
  hamburger,
  ndole,
  achu,
  oslun,
  pepperBeef,
} from "./images";

const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-white my-10">
      {/* Left Content */}
      <div className="flex flex-col justify-center items-start w-full md:w-1/2 p-6 md:p-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Discover the Best Recipes for Every Meal
        </h1>
        <h2 className="text-4xl md:text-5xl font-bold text-orange-500 mb-4">
          Cook Healthy & Delicious Food
        </h2>
        <p className="text-gray-600 mb-6 md:mb-8">
          PerfectRecipe brings you a variety of easy-to-follow, chef-approved
          recipes for your everyday cooking. Search for your favorite dishes and
          master the art of cooking!
        </p>

        {/* Search Bar */}
        <div className="w-full flex items-center mb-6 md:mb-8">
          <TextField
            variant="outlined"
            placeholder="Search recipes..."
            className="w-full"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "50px",
                backgroundColor: "white",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="primary"
            sx={{
              borderRadius: "50px",
              paddingX: 3,
              marginLeft: "-60px",
              zIndex: 1,
            }}
          >
            Search
          </Button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:flex md:flex-wrap justify-start gap-4 mb-6 md:mb-8">
          <div className="flex flex-col bg-gray-200 p-4 rounded-lg items-center w-40">
            <span className="text-3xl font-bold">4.9</span>
            <span className="text-gray-600">50K Reviews</span>
          </div>
          <div className="flex flex-col bg-gray-200 p-4 rounded-lg items-center w-40">
            <span className="text-3xl font-bold">5,000+</span>
            <span className="text-gray-600">Recipes</span>
          </div>
          <div className="flex flex-col bg-gray-200 p-4 rounded-lg items-center w-40">
            <span className="text-3xl font-bold">10K+</span>
            <span className="text-gray-600">Chefs</span>
          </div>
        </div>
      </div>

      {/* Right Content - Images */}
      <div className="w-full md:w-1/2 relative flex flex-col items-center justify-center p-6 md:p-10">
        {/* Background color starts from middle of main image */}
        <div className="absolute left-1/2 right-1/2 top-0 w-full h-1/2 bg-gray-100"></div>

        {/* Main Image */}
        <img
          src={spaghetti}
          alt="Spaghetti"
          className="relative z-10 rounded-full w-64 md:w-80 h-64 md:h-80 object-cover shadow-lg"
        />

        {/* Small Images */}
        <div className="relative z-10 flex flex-wrap justify-center gap-4 mt-6">
          <img src={ndole} alt="Ndole" className="rounded-full w-24 h-24 md:w-32 md:h-32 object-cover shadow-md" />
          <img src={ekwang} alt="Ekwang" className="rounded-full w-24 h-24 md:w-32 md:h-32 object-cover shadow-md" />
          <img src={hamburger} alt="Burger" className="rounded-full w-24 h-24 md:w-32 md:h-32 object-cover shadow-md" />
          <img src={pizza} alt="Pizza" className="rounded-full w-24 h-24 md:w-32 md:h-32 object-cover shadow-md" />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
