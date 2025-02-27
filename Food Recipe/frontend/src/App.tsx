import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { 
  Home,
  About,
  ContactUs,
  AuthPage,
  ResetPassword,
  ForgotPassword,
  ShopPage,
  ExploreRecipesPage,
  CategoryDetails,
  NotFoundPage,
  CartPage,
  RecipeDetails,
  ChatPage,
  UserProfilePage
} from './pages'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import 'bootstrap/dist/css/bootstrap.min.css';
function App() {
  

  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path='/' index element={<Home />}/>
          <Route path='*' element={<NotFoundPage />}/>
          <Route path='/about' element={<About />}/>
          <Route path='/contact' element={<ContactUs />}/>
          <Route path="/signup" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/explore-recipe" element={<ExploreRecipesPage />} />
          <Route path="/category/:categoryId" element={<CategoryDetails />} />
          <Route path="/recipe/:recipeId" element={<RecipeDetails />} />
          <Route path="/chat/:userId" element={<ChatPage />} />
          <Route path="/user/:userId" element={<UserProfilePage />} />
        </Routes>
        <Footer />
      </Router>
    </>
  )
}

export default App
