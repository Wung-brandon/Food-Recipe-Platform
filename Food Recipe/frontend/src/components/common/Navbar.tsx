import { useState } from 'react';
import { NavLink, useNavigate, Link } from "react-router-dom";
import { Menu, X } from 'lucide-react';
import IconButton from '@mui/material/IconButton';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Badge, { BadgeProps } from '@mui/material/Badge';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const navLinks = [
  { name: 'Home', link: '/' },
  { name: 'Explore Recipe', link: '/explore-recipe' },
  { name: 'Shop', link: '/shop' },
  { name: 'About Us', link: '/about' },
  { name: 'Contact Us', link: '/contact' },
];

const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  const handleMobileLinkClick = () => {
    setIsOpen(false); // close menu after clicking
  };

  console.log("Current Language:", i18n.language);
  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setIsLanguageOpen(false); // Close language dropdown after selection
  };
  return (
    <header className="font-bold shadow-md sticky top-0 bg-white z-50">
      <nav className="flex justify-between items-center p-6 relative z-10">
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
            {navLinks.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.link}
                  className={({ isActive }) =>
                    `text-xl no-underline transition duration-300 ${
                      isActive
                        ? "text-amber-600 font-semibold"
                        : "text-gray-700 hover:text-amber-600"
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Language Selector */}
          {/* <div className="relative">
            <button
              onClick={() => setIsLanguageOpen(!isLanguageOpen)}
              className="text-xl text-gray-700 hover:text-amber-600 transition duration-300 focus:outline-none"
            >
              Language
            </button>
            {isLanguageOpen && (
              <div className="absolute top-full left-0 mt-2 w-24 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="language-selector">
                  <Link to="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" onClick={() => changeLanguage('en')}>English</Link>
                  <Link to="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" onClick={() => changeLanguage('fr')}>French</Link>
                </div>
              </div>
            )}
          </div> */}
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex space-x-4 items-center">
          <IconButton aria-label="cart" onClick={() => navigate('/cart')}>
            <StyledBadge badgeContent={4} color="error">
              <ShoppingCartIcon />
            </StyledBadge>
          </IconButton>
          <button
            className="border-2 border-amber-600 px-4 py-2 rounded-lg text-gray-700 hover:bg-amber-600 hover:text-white transition"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
          <button
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition"
            onClick={() => navigate('/signup')}
          >
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
        <div className="md:hidden text-center py-4 px-6 bg-white shadow-md">
          <ul className="space-y-4">
            {navLinks.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.link}
                  onClick={handleMobileLinkClick}
                  className={({ isActive }) =>
                    `text-lg no-underline transition duration-300 ${
                      isActive
                        ? "text-amber-600 font-semibold"
                        : "text-black hover:text-amber-600"
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Mobile Language Selector */}
          <div className="relative mt-4">
            <button
              onClick={() => setIsLanguageOpen(!isLanguageOpen)}
              className="block w-full text-lg text-black hover:text-amber-600 transition duration-300 focus:outline-none py-2"
            >
              Language
            </button>
            {isLanguageOpen && (
              <div className="absolute top-full left-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="mobile-language-selector">
                  <Link to="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" onClick={() => {
                    changeLanguage('en');
                    setIsOpen(false);
                  }}>English</Link>
                  <Link to="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" onClick={() => {
                    changeLanguage('fr');
                    setIsOpen(false);
                  }}>French</Link>


                </div>
              </div>
            )}
          </div>

          {/* Mobile Buttons */}
          <div className="mt-6 space-y-3">
            <button
              className="block w-full border-2 border-amber-600 px-4 py-2 rounded-lg text-gray-700 hover:bg-amber-600 hover:text-white transition"
              onClick={() => {
                navigate('/login');
                setIsOpen(false);
              }}
            >
              Login
            </button>
            <button
              className="block w-full bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition"
              onClick={() => {
                navigate('/signup');
                setIsOpen(false);
              }}
            >
              Sign up
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
