import { useEffect, useState, type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, ApiError } from '../services/api/client';
import type { CVHeader } from '../services/api/types';

export default function Dashboard(): ReactElement {
  const [cvs, setCvs] = useState<CVHeader[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const navigate = useNavigate();

  const loadCvs = async (): Promise<void> => {
    try {
      const res = await apiClient.listCVs();
      setCvs(res.cvs);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof ApiError ? err.message : 'Error al cargar currículums',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCvs();
  }, []);

  const handleCreateCV = async (): Promise<void> => {
    setIsCreating(true);
    setStatusMessage(null);

    try {
      const res = await apiClient.createCV('Mi Currículum', true);
      void navigate(`/cvs/${res.cv.id}`);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof ApiError ? err.message : 'Error al crear CV',
      });
      setIsCreating(false);
    }
  };

  const handleDuplicateCV = async (id: string): Promise<void> => {
    try {
      const res = await apiClient.duplicateCV(id);
      setStatusMessage({ type: 'success', text: `CV duplicado como "${res.cv.title}"` });
      void loadCvs();
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof ApiError ? err.message : 'Error al duplicar CV',
      });
    }
  };

  const handleDeleteCV = async (id: string, title: string): Promise<void> => {
    if (!confirm(`¿Seguro que deseas eliminar "${title}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await apiClient.deleteCV(id);
      setCvs((prev) => prev.filter((item) => item.id !== id));
      setStatusMessage({ type: 'success', text: 'CV eliminado correctamente.' });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof ApiError ? err.message : 'Error al eliminar CV',
      });
    }
  };

  if (isLoading) {
    return <div className="loading-banner">Cargando tus currículums...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2>Mis Currículums</h2>
          <p className="subtitle">Crea, edita y gestiona múltiples versiones de tu CV.</p>
        </div>
        <button
          type="button"
          onClick={() => { void handleCreateCV(); }}
          disabled={isCreating}
          className="btn-primary btn-create-cv"
        >
          {isCreating ? 'Creando CV...' : '+ Crear Nuevo CV'}
        </button>
      </div>

      {statusMessage && (
        <div className={`status-banner ${statusMessage.type}`}>
          {statusMessage.text}
        </div>
      )}

      {cvs.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-icon">📄</div>
          <h3>Aún no has creado ningún currículum</h3>
          <p>
            Haz clic en <strong>Crear Nuevo CV</strong> para comenzar. Importaremos automáticamente
            tus datos de perfil para que tu primer CV esté listo en segundos.
          </p>
          <button
            type="button"
            onClick={() => { void handleCreateCV(); }}
            disabled={isCreating}
            className="btn-primary"
          >
            Comenzar Ahora
          </button>
        </div>
      ) : (
        <div className="cv-grid">
          {cvs.map((item) => (
            <div key={item.id} className="cv-card">
              <div className="cv-card-body">
                <span className="cv-badge">A4 • Plantilla {item.template}</span>
                <h3 className="cv-card-title">{item.title}</h3>
                <p className="cv-date">
                  Actualizado: {new Date(item.updatedAt).toLocaleDateString()} {new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="cv-card-actions">
                <button
                  type="button"
                  onClick={() => { void navigate(`/cvs/${item.id}`); }}
                  className="btn-primary btn-sm"
                >
                  Editar y Vista Previa
                </button>
                <button
                  type="button"
                  onClick={() => { void handleDuplicateCV(item.id); }}
                  className="btn-secondary btn-sm"
                >
                  Duplicar
                </button>
                <button
                  type="button"
                  onClick={() => { void handleDeleteCV(item.id, item.title); }}
                  className="btn-danger-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
