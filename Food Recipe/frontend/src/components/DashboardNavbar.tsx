// import React, { useState } from "react";
// import { motion } from "framer-motion";
// import { Avatar, IconButton, Switch } from "@mui/material";
// import { Menu as MenuIcon, Notifications, Search, Logout, DarkMode, LightMode } from "@mui/icons-material";
// import { useNavigate } from "react-router-dom";

// const DashboardNavbar: React.FC = () => {
//   const navigate = useNavigate();
//   const [darkMode, setDarkMode] = useState(false);

//   const toggleDarkMode = () => {
//     setDarkMode(!darkMode);
//     document.documentElement.classList.toggle("dark");
//   };

//   return (
//     <motion.nav 
//       initial={{ opacity: 0, y: -20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5 }}
//       className="bg-white dark:bg-gray-900 shadow-md fixed top-0 left-0 w-full px-6 py-3 flex justify-between items-center z-50"
//     >
//       {/* Left: Sidebar Toggle Button */}
//       <div className="flex items-center gap-4">
//         <IconButton>
//           <MenuIcon className="text-gray-700 dark:text-white" />
//         </IconButton>
//         <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Dashboard</h1>
//       </div>

//       {/* Center: Search Bar */}
//       <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 w-1/3">
//         <Search className="text-gray-500 dark:text-white" />
//         <input
//           type="text"
//           placeholder="Search recipes, ingredients..."
//           className="bg-transparent outline-none px-2 flex-1 text-gray-900 dark:text-white"
//         />
//       </div>

//       {/* Right: User Profile, Notifications & Dark Mode */}
//       <div className="flex items-center gap-4">
//         <IconButton>
//           <Notifications className="text-gray-700 dark:text-white" />
//         </IconButton>
//         <Switch
//           checked={darkMode}
//           onChange={toggleDarkMode}
//           icon={<LightMode className="text-gray-700" />}
//           checkedIcon={<DarkMode className="text-yellow-500" />}
//         />
//         <Avatar
//           src="/api/placeholder/200/200"
//           alt="User Avatar"
//           className="cursor-pointer"
//           onClick={() => navigate("/dashboard/profile")}
//         />
//         <IconButton onClick={() => navigate("/login")}>
//           <Logout className="text-red-500" />
//         </IconButton>
//       </div>
//     </motion.nav>
//   );
// };

// export default DashboardNavbar;
