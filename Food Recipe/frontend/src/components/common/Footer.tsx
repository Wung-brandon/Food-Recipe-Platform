import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaPinterest } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <>
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10 px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold">PerfectRecipe</h3>
            <p className="mt-4 text-sm text-gray-400">Your daily destination for delicious recipes and cooking inspiration.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              <li><NavLink to="/" className="text-gray-400 no-underline hover:text-white">Home</NavLink></li>
              <li><NavLink to="/recipe" className="text-gray-400 no-underline hover:text-white">Explore Recipe</NavLink></li>
              <li><NavLink to="/shop" className="text-gray-400 no-underline hover:text-white">Shop</NavLink></li>
              <li><NavLink to="/cart" className="text-gray-400 no-underline hover:text-white">Cart</NavLink></li>
              <li><NavLink to="/about" className="text-gray-400 no-underline hover:text-white">About Us</NavLink></li>
              <li><NavLink to="/contact" className="text-gray-400 no-underline hover:text-white">Contact Us</NavLink></li>
              <li><NavLink to="/login" className="text-gray-400 no-underline hover:text-white">Login</NavLink></li>
              <li><NavLink to="/signup" className="text-gray-400 no-underline hover:text-white">SignUp</NavLink></li>
              <li><NavLink to="/dashboard" className="text-gray-400 no-underline hover:text-white">Dashboard</NavLink></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Categories</h3>
            <ul className="mt-4 space-y-2">
              <li><NavLink to="/category/breakfast" className="text-gray-400 no-underline hover:text-white">Breakfast</NavLink></li>
              <li><NavLink to="/category/lunch" className="text-gray-400 no-underline hover:text-white">Lunch</NavLink></li>
              <li><NavLink to="/category/vegetarian" className="text-gray-400 no-underline hover:text-white">Vegetarian</NavLink></li>
              <li><NavLink to="/category/desserts" className="text-gray-400 no-underline hover:text-white">Desserts</NavLink></li>
              <li><NavLink to="/category/baked-food" className="text-gray-400 no-underline hover:text-white">Baked Food</NavLink></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Stay Connected</h3>
            <p className="mt-4 text-sm text-gray-400">Subscribe to our newsletter for the latest recipes.</p>
            <input type="email" placeholder="Your email" className="mt-4 px-4 py-2 w-full rounded bg-gray-800 text-white" />
            <button className="mt-2 w-full bg-amber-600 text-white px-4 py-2 rounded">Subscribe</button>

            {/* Social Media Links */}
            <div className="mt-4 flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <FaFacebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <FaTwitter size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <FaInstagram size={20} />
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <FaPinterest size={20} />
              </a>
            </div>
          </div>
        </div>
        <div className="text-center text-gray-500 mt-10 text-sm">© 2025 PerfectRecipe. All rights reserved.</div>
      </footer>
    </>
  );
}

export default Footer;