import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from 'react';
import { env } from '../config/env';
import { useAuth } from '../context/useAuth';
import { apiClient, ApiError } from '../services/api/client';
import type { Profile, ProfileLink } from '../services/api/types';

export default function ProfilePage(): ReactElement {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [links, setLinks] = useState<ProfileLink[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile(): Promise<void> {
      try {
        const response = await apiClient.getProfile();
        if (isMounted) {
          const p = response.profile;
          setProfile(p);
          setFullName(p.fullName || '');
          setHeadline(p.headline || '');
          setPhone(p.phone || '');
          setLocation(p.location || '');
          setBio(p.bio || '');
          setLinks(p.links || []);
        }
      } catch (err) {
        if (isMounted) {
          setStatusMessage({
            type: 'error',
            text: err instanceof ApiError ? err.message : 'Error al cargar perfil',
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveProfile = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const response = await apiClient.updateProfile({
        fullName,
        headline,
        phone,
        location,
        bio,
        links,
      });
      setProfile(response.profile);
      setStatusMessage({ type: 'success', text: 'Perfil actualizado exitosamente.' });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof ApiError ? err.message : 'Error al guardar cambios',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setStatusMessage({ type: 'error', text: 'Solo se permiten imágenes JPG o PNG.' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'La imagen excede el límite de 2 MiB.' });
      return;
    }

    setIsUploadingPhoto(true);
    setStatusMessage(null);

    try {
      const response = await apiClient.uploadPhoto(file);
      setProfile((prev) => (prev ? { ...prev, photoUrl: response.photoUrl } : null));
      setStatusMessage({ type: 'success', text: 'Foto de perfil actualizada.' });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof ApiError ? err.message : 'Error al subir foto',
      });
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleDeletePhoto = async (): Promise<void> => {
    if (!confirm('¿Seguro que deseas eliminar tu foto de perfil?')) return;

    setIsUploadingPhoto(true);
    setStatusMessage(null);

    try {
      await apiClient.deletePhoto();
      setProfile((prev) => (prev ? { ...prev, photoUrl: null } : null));
      setStatusMessage({ type: 'success', text: 'Foto de perfil eliminada.' });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof ApiError ? err.message : 'Error al eliminar foto',
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleAddLink = (): void => {
    setLinks([...links, { label: '', url: '' }]);
  };

  const handleRemoveLink = (index: number): void => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleLinkChange = (index: number, field: 'label' | 'url', value: string): void => {
    const updated = [...links];
    const item = updated[index];
    if (item) {
      updated[index] = { ...item, [field]: value };
      setLinks(updated);
    }
  };

  if (isLoading) {
    return <div className="loading-banner">Cargando perfil...</div>;
  }

  const photoFullUrl = profile?.photoUrl
    ? `${env.apiUrl}${profile.photoUrl}`
    : null;

  return (
    <div className="profile-container">
      <h2>Mi Perfil Base</h2>
      <p className="user-email-badge">Cuenta: <strong>{user?.email}</strong></p>

      {statusMessage && (
        <div className={`status-banner ${statusMessage.type}`}>
          {statusMessage.text}
        </div>
      )}

      <div className="profile-photo-section">
        <div className="photo-preview-wrapper">
          {photoFullUrl ? (
            <img src={photoFullUrl} alt="Foto de perfil" className="photo-preview" />
          ) : (
            <div className="photo-placeholder">Sin Foto</div>
          )}
        </div>
        <div className="photo-actions">
          <label className="btn-secondary file-upload-btn">
            {isUploadingPhoto ? 'Subiendo...' : 'Cambiar Foto (JPG/PNG <= 2MB)'}
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={(e) => { void handlePhotoUpload(e); }}
              disabled={isUploadingPhoto}
              style={{ display: 'none' }}
            />
          </label>
          {profile?.photoUrl && (
            <button
              type="button"
              onClick={() => { void handleDeletePhoto(); }}
              disabled={isUploadingPhoto}
              className="btn-danger"
            >
              Eliminar Foto
            </button>
          )}
        </div>
      </div>

      <form onSubmit={(e) => { void handleSaveProfile(e); }} className="profile-form">
        <div className="form-group">
          <label htmlFor="fullName">Nombre Completo</label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Ej. Juan Pérez"
          />
        </div>

        <div className="form-group">
          <label htmlFor="headline">Titular Profesional</label>
          <input
            id="headline"
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Ej. Desarrollador Full Stack Senior"
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Teléfono / WhatsApp</label>
          <input
            id="phone"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ej. +57 300 123 4567"
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Ubicación</label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Ej. Medellín, Colombia"
          />
        </div>

        <div className="form-group">
          <label htmlFor="bio">Resumen / Extracto Personal</label>
          <textarea
            id="bio"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Breve presentación de tu trayectoria y objetivos profesionales..."
          />
        </div>

        <div className="links-section">
          <h3>Enlaces Externos (LinkedIn, GitHub, Portafolio)</h3>
          {links.map((link, idx) => (
            <div key={idx} className="link-row">
              <input
                type="text"
                placeholder="Etiqueta (ej. LinkedIn)"
                value={link.label}
                onChange={(e) => handleLinkChange(idx, 'label', e.target.value)}
              />
              <input
                type="url"
                placeholder="URL (ej. https://linkedin.com/in/...)"
                value={link.url}
                onChange={(e) => handleLinkChange(idx, 'url', e.target.value)}
              />
              <button
                type="button"
                onClick={() => handleRemoveLink(idx)}
                className="btn-danger-sm"
              >
                ✕
              </button>
            </div>
          ))}
          <button type="button" onClick={handleAddLink} className="btn-secondary">
            + Añadir Enlace
          </button>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={isSaving} className="btn-primary">
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
