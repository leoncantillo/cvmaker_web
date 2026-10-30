import type { ReactElement } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import './styles/App.scss';

function App(): ReactElement {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <Home />
              </>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
