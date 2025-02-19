import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Home } from './pages'
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
        </Routes>
        <Footer />
      </Router>
    </>
  )
}

export default App
