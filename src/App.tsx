import type { ReactElement } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Navbar from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import ProfilePage from './pages/Profile';
import Register from './pages/Register';
import './styles/App.scss';

function App(): ReactElement {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Navbar />
          <main className="app-main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
