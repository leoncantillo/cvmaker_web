import { useState, type FormEvent, type ReactElement } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { ApiError } from '../services/api/client';

export default function Register(): ReactElement {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register(email, password);
      void navigate('/profile');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado al registrar la cuenta.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Crear Cuenta</h2>
      {error && <div className="error-banner">{error}</div>}
      <form onSubmit={(e) => { void handleSubmit(e); }} className="auth-form">
        <div className="form-group">
          <label htmlFor="reg-email">Correo Electrónico</label>
          <input
            id="reg-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="reg-password">Contraseña (mínimo 8 caracteres)</label>
          <input
            id="reg-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="reg-confirm-password">Confirmar Contraseña</label>
          <input
            id="reg-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Registrando...' : 'Crear Cuenta'}
        </button>
      </form>

      <p className="auth-switch">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
      </p>
    </div>
  );
}
