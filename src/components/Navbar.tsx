import type { ReactElement } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import '../styles/Navbar.scss';

function Navbar(): ReactElement {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (): void => {
    logout();
    void navigate('/login');
  };

  return (
    <nav className="main-menu" aria-label="Main Navigation">
      <div className="nav-brand">
        <Link to="/">CVmaker</Link>
      </div>
      <ul className="nav-links">
        <li>
          <Link to="/">Inicio</Link>
        </li>
        {isAuthenticated ? (
          <>
            <li>
              <Link to="/profile">Mi Perfil</Link>
            </li>
            <li className="user-badge" title={user?.email}>
              <span>{user?.email}</span>
            </li>
            <li>
              <button type="button" onClick={handleLogout} className="btn-logout">
                Cerrar Sesión
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login">Iniciar Sesión</Link>
            </li>
            <li>
              <Link to="/register" className="btn-nav-register">
                Crear Cuenta
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
