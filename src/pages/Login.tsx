import { useState, type FormEvent, type ReactElement } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { ApiError } from '../services/api/client';

export default function Login(): ReactElement {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      void navigate('/profile');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado al iniciar sesión.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Iniciar Sesión</h2>
      {error && <div className="error-banner">{error}</div>}
      <form onSubmit={(e) => { void handleSubmit(e); }} className="auth-form">
        <div className="form-group">
          <label htmlFor="login-email">Correo Electrónico</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="login-password">Contraseña</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Iniciando...' : 'Entrar'}
        </button>
      </form>

      <p className="auth-switch">
        ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
      </p>
    </div>
  );
}
