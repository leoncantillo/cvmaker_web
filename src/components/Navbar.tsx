import type { ReactElement } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileLines,
  faFolderOpen,
  faUser,
  faCircleUser,
  faRightFromBracket,
  faArrowRightToBracket,
  faUserPlus,
  faSun,
  faMoon,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/useAuth';
import { useTheme } from '../context/useTheme';
import '../styles/Navbar.scss';

function Navbar(): ReactElement {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = (): void => {
    logout();
    void navigate('/login');
  };

  return (
    <nav className="main-menu no-print" aria-label="Main Navigation">
      <div className="nav-brand">
        <Link to="/">
          <FontAwesomeIcon icon={faFileLines} />
          <span>CVmaker</span>
        </Link>
      </div>
      <ul className="nav-links">
        <li>
          <Link to="/">Inicio</Link>
        </li>
        {isAuthenticated ? (
          <>
            <li>
              <Link to="/cvs">
                <FontAwesomeIcon icon={faFolderOpen} />
                <span>Mis CVs</span>
              </Link>
            </li>
            <li>
              <Link to="/profile">
                <FontAwesomeIcon icon={faUser} />
                <span>Mi Perfil</span>
              </Link>
            </li>
            <li className="user-badge" title={user?.email}>
              <FontAwesomeIcon icon={faCircleUser} />
              <span>{user?.email}</span>
            </li>
            <li>
              <button
                type="button"
                onClick={toggleTheme}
                className="btn-theme-toggle"
                title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
                aria-label="Alternar tema de color"
              >
                <FontAwesomeIcon icon={theme === 'light' ? faMoon : faSun} />
              </button>
            </li>
            <li>
              <button type="button" onClick={handleLogout} className="btn-logout" title="Cerrar sesión">
                <FontAwesomeIcon icon={faRightFromBracket} />
                <span>Salir</span>
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login">
                <FontAwesomeIcon icon={faArrowRightToBracket} />
                <span>Iniciar Sesión</span>
              </Link>
            </li>
            <li>
              <Link to="/register" className="btn-nav-register">
                <FontAwesomeIcon icon={faUserPlus} />
                <span>Crear Cuenta</span>
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={toggleTheme}
                className="btn-theme-toggle"
                title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
                aria-label="Alternar tema de color"
              >
                <FontAwesomeIcon icon={theme === 'light' ? faMoon : faSun} />
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
