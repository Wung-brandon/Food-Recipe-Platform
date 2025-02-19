import React, { useState } from "react";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { beans, plantain, delicious } from "./images";
import TitleText from "./TitleText";

const testimonials = [
  {
    name: "Jane Doe",
    feedback: "The recipes are easy to follow and absolutely delicious!",
    img: beans,
  },
  {
    name: "John Smith",
    feedback: "I love the variety of recipes available. Highly recommend!",
    img: delicious,
  },
  {
    name: "Emily Johnson",
    feedback: "My go-to place for quick and tasty meals. Thank you!",
    img: plantain,
  },
];

const TestimonialSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="py-10 flex flex-col items-center mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-12">
      <TitleText title="What Our Customers Say" />

      <div className="relative w-full p-6 rounded-lg text-center">
        <img
          src={testimonials[activeIndex].img}
          alt={testimonials[activeIndex].name}
          className="w-24 h-24 rounded-full mx-auto mb-4"
        />
        <h5 className="text-lg font-semibold">{testimonials[activeIndex].name}</h5>
        <p className="text-gray-600 mt-2">{testimonials[activeIndex].feedback}</p>

        {/* Navigation Buttons */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-gray-200 rounded-full shadow-lg"
        >
          <ArrowBack className="text-gray-600" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-gray-200 rounded-full shadow-lg"
        >
          <ArrowForward className="text-gray-600" />
        </button>
      </div>

      {/* Indicators */}
      <div className="flex mt-4 space-x-2">
        {testimonials.map((_, index) => (
          <span
            key={index}
            className={`h-3 w-3 rounded-full ${
              index === activeIndex ? "bg-orange-500" : "bg-gray-300"
            }`}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default TestimonialSection;
