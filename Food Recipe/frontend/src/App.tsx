import './App.css'
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'
import { 
  Home,
  About,
  ContactUs,
  SignupPage,
  LoginPage,
  ResetPassword,
  ForgotPassword,
  ShopPage,
  ExploreRecipesPage,
  CategoryDetails,
  NotFoundPage,
  CartPage,
  RecipeDetails,
  ChatPage,
  UserProfilePage,
  DashboardPage,
  FavoritesPage,
  SettingsPage,
  MessagesPage,
  RecipesPage,
  ProfilePage,
  OrderHistoryPage,
  MealPlannerPage
} from './pages'
import Navbar from './components/common/Navbar'
// import DashboardNavbar from './components/DashboardNavbar'
import Footer from './components/common/Footer'
// import DashboardLayout from './Layout/DashboardLayout'
// import { ThemeProvider } from './context/BackgroundContext'
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext'
// import 'bootstrap/dist/css/bootstrap.min.css';

import ChefDashboard from './pages/Dashboard/ChefDashboard/ChefDashboard';
import UserDashboard from './pages/Dashboard/UserDashboard/UserDashboard';
import ChefRecipes from './pages/Dashboard/ChefDashboard/ChefRecipe';
import ChefProfilePage from './pages/Dashboard/ChefDashboard/ChefProfile';
import CreateRecipePage from './pages/Dashboard/ChefDashboard/ChefCreateRecipe';
import FollowersPage from './pages/Dashboard/ChefDashboard/ChefFollowersPage';
import AnalyticsPage from './pages/Dashboard/ChefDashboard/ChefAnalytics';
function App() {
    return (
      <>
        <Router>
          <AuthProvider>
            <ToastContainer />
            <Routes>
              <Route path='/signup' element={<SignupPage />} />
              <Route path='/login' element={<LoginPage />} />
              {/* Routes with Main Navbar and Footer */}
              <Route
                element={
                  <>
                    <Navbar />
                    <Outlet />
                    <Footer />
                  </>
                }
              >
                <Route path='/' index element={<Home />} />
                <Route path='*' element={<NotFoundPage />} />
                <Route path='/about' element={<About />} />
                <Route path='/contact' element={<ContactUs />} />
                
                <Route path='/forgot-password' element={<ForgotPassword />} />
                <Route path='/reset-password' element={<ResetPassword />} />
                <Route path='/shop' element={<ShopPage />} />
                <Route path='/cart' element={<CartPage />} />
                <Route path='/explore-recipe' element={<ExploreRecipesPage />} />
                <Route path='/category/:categoryId' element={<CategoryDetails />} />
                <Route path='/recipe/:recipeId' element={<RecipeDetails />} />
                <Route path='/chat/:userId' element={<ChatPage />} />
                <Route path='/user/:userId' element={<UserProfilePage />} />
              </Route>
    
              {/* Dashboard Routes without Main Navbar and Footer */}
              
              {/* Dashboard route */}
                <Route path='/dashboard/chef' element={<ChefDashboard />}/>
                <Route path='/dashboard/chef/recipe' element={<ChefRecipes />}/>
                <Route path='/dashboard/chef/profile/:id' element={<ChefProfilePage />}/>
                <Route path="/dashboard/chef/create-recipe" element={<CreateRecipePage />} />
                <Route path='/dashboard/chef/followers' element={<FollowersPage />}/>
                <Route path='/dashboard/chef/analytics' element={<AnalyticsPage />}/>


                <Route path='/dashboard/user' element={<UserDashboard />}/>
                <Route index element={<DashboardPage />} />
                <Route path='favorites' element={<FavoritesPage />} />
                <Route path='messages' element={<MessagesPage />} />
                <Route path='settings' element={<SettingsPage />} />
                <Route path='orders' element={<OrderHistoryPage />} />
                <Route path='meal-planner' element={<MealPlannerPage />} />
                <Route path='recipes' element={<RecipesPage />} />
                <Route path='profile' element={<ProfilePage />} />
              
            </Routes>
          </AuthProvider>
        </Router>
      </>
    );
  }

export default App
