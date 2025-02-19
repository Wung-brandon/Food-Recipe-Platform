import React, { useState } from "react";
import { Button, Dialog, DialogContent, IconButton } from "@mui/material";
import { PlayArrow, Instagram, Close } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import vid from "../assets/videos/Learn_Docker_in_7_Easy_Steps_-_Full_Beginner_s_Tutorial(720p).mp4";
// Import images
import {
  spaghetti,
  chicken,
  beans,
  delicious,
  plantain,
} from "./images";

// Video URL
const videoUrl = vid;

const StyledButton = styled(Button)({
  backgroundColor: "white",
  color: "black",
  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  padding: "10px 24px",
  margin: "auto",
  borderRadius: "8px",
  border: "3px solid white",
  position: "relative",
  zIndex: 1,
  "&:hover": {
    backgroundColor: "#FFA000",
    color: "white",
  },
});

const VideoSection: React.FC = () => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className="w-full">
      {/* Video Section Cover Image */}
      <div className="relative h-[350px] flex items-center justify-center text-center text-white">
        <img src={spaghetti} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10">
          <button
            className="bg-orange-500 p-4 rounded-full mb-4"
            onClick={handleClickOpen}
          >
            <PlayArrow fontSize="large" className="text-white" />
          </button>
          <h2 className="text-2xl md:text-4xl font-bold">
            Easily include videos with your recipe instructions
          </h2>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="relative mt-2">
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <img src={delicious} alt="Drink" className="h-40 w-full object-cover sm:h-60" />
          <img src={spaghetti} alt="Burger" className="h-40 w-full object-cover sm:h-60" />
          <img src={beans} alt="Pasta" className="h-40 w-full object-cover sm:h-60" />
          <img src={plantain} alt="Dessert" className="h-40 w-full object-cover sm:h-60" />
          <img src={chicken} alt="Salad" className="h-40 w-full object-cover sm:h-60" />
          <img src={spaghetti} alt="Burger" className="h-40 w-full object-cover sm:h-60" />
        </div>

        {/* Instagram Button Centered */}
        <div className="absolute inset-0 flex justify-center items-center">
          <StyledButton variant="contained" startIcon={<Instagram />}>
            Follow on Instagram
          </StyledButton>
        </div>
      </div>

      {/* Video Modal */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogContent>
          <div className="relative">
            <IconButton
              onClick={handleClose}
              className="absolute top-2 right-2"
              aria-label="close"
            >
              <Close />
            </IconButton>
            <div className="relative" style={{ paddingTop: '56.25%' }}>
              <iframe
                src={videoUrl}
                title="Video Player"
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoSection;