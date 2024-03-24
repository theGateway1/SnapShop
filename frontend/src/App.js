import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './components/Home/home';
import Auth from './components/Auth/auth';
import './App.css';
import PrivateRoute from './shared/components/private-route';
import { AuthProvider } from './shared/contexts/auth-context';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Auth />} />
            {/* Private routes can only be accessed after authentication */}
            <Route path="/" element={<PrivateRoute component={Home} />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
