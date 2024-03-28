import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './components/Home/home';
import Auth from './components/Auth/auth';
import './App.css';
import PrivateRoute from './shared/components/private-route';
import { AuthProvider } from './shared/contexts/auth-context';
import { CartProvider } from './shared/contexts/cart-context';
import Cart from './components/Cart/cart';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Routes>
              <Route path="/login" element={<Auth />} />
              {/* Private routes can only be accessed after authentication */}
              <Route path="/" element={<PrivateRoute Component={Home} />} />
              <Route path="/cart" element={<PrivateRoute Component={Cart} />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
