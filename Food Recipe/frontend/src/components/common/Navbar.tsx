// import foodLogo from "../../assets/images/logo.jpg"
import { useState } from 'react';
import { NavLink } from "react-router-dom";
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="font-bold">
      <nav className="flex justify-between items-center p-8 relative z-10">
        {/* Logo */}
        <div>
          <NavLink to="/" className="text-2xl no-underline font-bold font-serif">
            <span className="text-gray-700">Perfect</span>
            <span className="text-amber-600">Recipe</span>
          </NavLink>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-10">
          <ul className="flex gap-10">
            {["Home", "Explore Recipe", "About Us", "Contact Us"].map((item) => (
              <li key={item}>
                <NavLink
                  to="/"
                  className="text-gray-700 text-xl hover:text-amber-600 no-underline"  
                >
                  {item}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Buttons (Desktop) */}
        <div className="hidden md:flex space-x-4">
          <button className="border-2 border-amber-600 px-4 py-2 rounded-lg text-gray-700 hover:bg-amber-600 hover:text-white transition">
            Login
          </button>
          <button className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition">
            Sign up
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={30} /> : <Menu size={30} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden text-center py-4">
          <ul className="space-y-4">
            {["Home", "Explore Recipe", "About Us", "Contact Us"].map((item) => (
              <li key={item}>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `text-black no-underline transition duration-300 ${
                      isActive ? "text-amber-600 font-semibold" : "hover:text-amber-600"
                    }`
                  }
                >
                  {item}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-3">
            <button className="block w-full border-2 border-amber-600 px-4 py-2 rounded-lg text-gray-700 hover:bg-amber-600 hover:text-white transition">
              Login
            </button>
            <button className="block w-full bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition">
              Sign up
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
