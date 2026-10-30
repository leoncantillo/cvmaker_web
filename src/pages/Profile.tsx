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
import type {
  AchievementItem,
  CertificationItem,
  EducationItem,
  ExperienceItem,
  LanguageItem,
  Profile,
  ProfileLink,
  ProjectItem,
  ReferenceItem,
  SkillItem,
} from '../services/api/types';

type SectionTab =
  | 'identity'
  | 'experiences'
  | 'educations'
  | 'certifications'
  | 'skills'
  | 'languages'
  | 'projects'
  | 'achievements'
  | 'references';

export default function ProfilePage(): ReactElement {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<SectionTab>('identity');
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
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [educations, setEducations] = useState<EducationItem[]>([]);
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [references, setReferences] = useState<ReferenceItem[]>([]);

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
          setExperiences(p.experiences || []);
          setEducations(p.educations || []);
          setCertifications(p.certifications || []);
          setSkills(p.skills || []);
          setLanguages(p.languages || []);
          setProjects(p.projects || []);
          setAchievements(p.achievements || []);
          setReferences(p.references || []);
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

  const handleSaveProfile = async (e?: FormEvent): Promise<void> => {
    if (e) e.preventDefault();
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
        experiences,
        educations,
        certifications,
        skills,
        languages,
        projects,
        achievements,
        references,
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

  if (isLoading) {
    return <div className="loading-banner">Cargando perfil profesional...</div>;
  }

  const photoFullUrl = profile?.photoUrl
    ? `${env.apiUrl}${profile.photoUrl}`
    : null;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div>
          <h2>Mi Perfil Profesional</h2>
          <p className="user-email-badge">Cuenta: <strong>{user?.email}</strong></p>
        </div>
        <button
          type="button"
          onClick={() => { void handleSaveProfile(); }}
          disabled={isSaving}
          className="btn-primary btn-save-top"
        >
          {isSaving ? 'Guardando...' : 'Guardar Todo'}
        </button>
      </div>

      {statusMessage && (
        <div className={`status-banner ${statusMessage.type}`}>
          {statusMessage.text}
        </div>
      )}

      {/* Tabs navigation */}
      <div className="section-tabs" role="tablist">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'identity' ? 'active' : ''}`}
          onClick={() => setActiveTab('identity')}
        >
          Identidad
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'experiences' ? 'active' : ''}`}
          onClick={() => setActiveTab('experiences')}
        >
          Experiencia ({experiences.length})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'educations' ? 'active' : ''}`}
          onClick={() => setActiveTab('educations')}
        >
          Educación ({educations.length})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
          onClick={() => setActiveTab('skills')}
        >
          Habilidades ({skills.length})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'certifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('certifications')}
        >
          Certificados ({certifications.length})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'languages' ? 'active' : ''}`}
          onClick={() => setActiveTab('languages')}
        >
          Idiomas ({languages.length})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          Proyectos ({projects.length})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          Logros ({achievements.length})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'references' ? 'active' : ''}`}
          onClick={() => setActiveTab('references')}
        >
          Referencias ({references.length})
        </button>
      </div>

      <div className="tab-content">
        {/* Tab 1: Identity */}
        {activeTab === 'identity' && (
          <div className="tab-pane">
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

            <div className="form-row">
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
            </div>

            <div className="form-group">
              <label htmlFor="bio">Resumen / Extracto Profesional</label>
              <textarea
                id="bio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Breve presentación de tu trayectoria y objetivos profesionales..."
              />
            </div>

            <div className="links-section">
              <h3>Enlaces de Contacto / Redes</h3>
              {links.map((link, idx) => (
                <div key={idx} className="link-row">
                  <input
                    type="text"
                    placeholder="Etiqueta (ej. LinkedIn)"
                    value={link.label}
                    onChange={(e) => {
                      const updated = [...links];
                      const item = updated[idx];
                      if (item) {
                        updated[idx] = { ...item, label: e.target.value };
                        setLinks(updated);
                      }
                    }}
                  />
                  <input
                    type="url"
                    placeholder="URL (ej. https://linkedin.com/in/...)"
                    value={link.url}
                    onChange={(e) => {
                      const updated = [...links];
                      const item = updated[idx];
                      if (item) {
                        updated[idx] = { ...item, url: e.target.value };
                        setLinks(updated);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setLinks(links.filter((_, i) => i !== idx))}
                    className="btn-danger-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setLinks([...links, { label: '', url: '' }])}
                className="btn-secondary"
              >
                + Añadir Enlace
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Experiences */}
        {activeTab === 'experiences' && (
          <div className="tab-pane">
            <h3>Experiencia Laboral</h3>
            {experiences.map((exp, idx) => (
              <div key={exp.id || idx} className="item-card">
                <div className="card-header">
                  <strong>#{idx + 1} {exp.role || 'Nuevo Cargo'} {exp.company ? `en ${exp.company}` : ''}</strong>
                  <button
                    type="button"
                    onClick={() => setExperiences(experiences.filter((_, i) => i !== idx))}
                    className="btn-danger-sm"
                  >
                    Eliminar
                  </button>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Empresa</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => {
                        const copy = [...experiences];
                        const item = copy[idx];
                        if (item) {
                          copy[idx] = { ...item, company: e.target.value };
                          setExperiences(copy);
                        }
                      }}
                      placeholder="Empresa o cliente"
                    />
                  </div>
                  <div className="form-group">
                    <label>Cargo / Rol</label>
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => {
                        const copy = [...experiences];
                        const item = copy[idx];
                        if (item) {
                          copy[idx] = { ...item, role: e.target.value };
                          setExperiences(copy);
                        }
                      }}
                      placeholder="Ej. Líder Técnico"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Fecha Inicio</label>
                    <input
                      type="text"
                      value={exp.startDate || ''}
                      onChange={(e) => {
                        const copy = [...experiences];
                        const item = copy[idx];
                        if (item) {
                          copy[idx] = { ...item, startDate: e.target.value };
                          setExperiences(copy);
                        }
                      }}
                      placeholder="Ej. 2021-01"
                    />
                  </div>
                  <div className="form-group">
                    <label>Fecha Fin</label>
                    <input
                      type="text"
                      value={exp.endDate || ''}
                      onChange={(e) => {
                        const copy = [...experiences];
                        const item = copy[idx];
                        if (item) {
                          copy[idx] = { ...item, endDate: e.target.value };
                          setExperiences(copy);
                        }
                      }}
                      placeholder="Ej. 2024-05 o Actual"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Descripción y logros</label>
                  <textarea
                    rows={3}
                    value={exp.description || ''}
                    onChange={(e) => {
                      const copy = [...experiences];
                      const item = copy[idx];
                      if (item) {
                        copy[idx] = { ...item, description: e.target.value };
                        setExperiences(copy);
                      }
                    }}
                    placeholder="Responsabilidades y tecnologías utilizadas..."
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setExperiences([
                  ...experiences,
                  { id: `exp-${Date.now()}`, company: '', role: '', description: '' },
                ])
              }
              className="btn-secondary"
            >
              + Añadir Experiencia
            </button>
          </div>
        )}

        {/* Tab 3: Educations */}
        {activeTab === 'educations' && (
          <div className="tab-pane">
            <h3>Formación Académica</h3>
            {educations.map((edu, idx) => (
              <div key={edu.id || idx} className="item-card">
                <div className="card-header">
                  <strong>#{idx + 1} {edu.degree || 'Nuevo Título'} {edu.institution ? `en ${edu.institution}` : ''}</strong>
                  <button
                    type="button"
                    onClick={() => setEducations(educations.filter((_, i) => i !== idx))}
                    className="btn-danger-sm"
                  >
                    Eliminar
                  </button>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Institución</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => {
                        const copy = [...educations];
                        const item = copy[idx];
                        if (item) {
                          copy[idx] = { ...item, institution: e.target.value };
                          setEducations(copy);
                        }
                      }}
                      placeholder="Universidad o instituto"
                    />
                  </div>
                  <div className="form-group">
                    <label>Título / Grado</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => {
                        const copy = [...educations];
                        const item = copy[idx];
                        if (item) {
                          copy[idx] = { ...item, degree: e.target.value };
                          setEducations(copy);
                        }
                      }}
                      placeholder="Ej. Licenciatura en..."
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Periodo</label>
                    <input
                      type="text"
                      value={edu.startDate || ''}
                      onChange={(e) => {
                        const copy = [...educations];
                        const item = copy[idx];
                        if (item) {
                          copy[idx] = { ...item, startDate: e.target.value };
                          setEducations(copy);
                        }
                      }}
                      placeholder="Ej. 2018 - 2022"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setEducations([
                  ...educations,
                  { id: `edu-${Date.now()}`, institution: '', degree: '' },
                ])
              }
              className="btn-secondary"
            >
              + Añadir Educación
            </button>
          </div>
        )}

        {/* Tab 4: Skills */}
        {activeTab === 'skills' && (
          <div className="tab-pane">
            <h3>Habilidades Técnicas y Blandas</h3>
            <div className="skills-grid">
              {skills.map((skill, idx) => (
                <div key={skill.id || idx} className="skill-pill">
                  <input
                    type="text"
                    value={skill.name}
                    onChange={(e) => {
                      const copy = [...skills];
                      const item = copy[idx];
                      if (item) {
                        copy[idx] = { ...item, name: e.target.value };
                        setSkills(copy);
                      }
                    }}
                    placeholder="Habilidad"
                  />
                  <select
                    value={skill.category}
                    onChange={(e) => {
                      const copy = [...skills];
                      const item = copy[idx];
                      if (item) {
                        copy[idx] = {
                          ...item,
                          category: e.target.value as 'technical' | 'soft',
                        };
                        setSkills(copy);
                      }
                    }}
                  >
                    <option value="technical">Técnica</option>
                    <option value="soft">Blanda</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setSkills(skills.filter((_, i) => i !== idx))}
                    className="btn-danger-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                setSkills([
                  ...skills,
                  { id: `sk-${Date.now()}`, name: '', category: 'technical', level: 'Intermedio' },
                ])
              }
              className="btn-secondary"
            >
              + Añadir Habilidad
            </button>
          </div>
        )}

        {/* Tab 5: Certifications */}
        {activeTab === 'certifications' && (
          <div className="tab-pane">
            <h3>Certificaciones</h3>
            {certifications.map((cert, idx) => (
              <div key={cert.id || idx} className="item-card">
                <div className="card-header">
                  <strong>#{idx + 1} {cert.name || 'Nueva Certificación'}</strong>
                  <button
                    type="button"
                    onClick={() => setCertifications(certifications.filter((_, i) => i !== idx))}
                    className="btn-danger-sm"
                  >
                    Eliminar
                  </button>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre</label>
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => {
                        const copy = [...certifications];
                        const item = copy[idx];
                        if (item) {
                          copy[idx] = { ...item, name: e.target.value };
                          setCertifications(copy);
                        }
                      }}
                      placeholder="Ej. AWS Certified Developer"
                    />
                  </div>
                  <div className="form-group">
                    <label>Emisor</label>
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) => {
                        const copy = [...certifications];
                        const item = copy[idx];
                        if (item) {
                          copy[idx] = { ...item, issuer: e.target.value };
                          setCertifications(copy);
                        }
                      }}
                      placeholder="Ej. Amazon Web Services"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setCertifications([
                  ...certifications,
                  { id: `cert-${Date.now()}`, name: '', issuer: '' },
                ])
              }
              className="btn-secondary"
            >
              + Añadir Certificación
            </button>
          </div>
        )}

        {/* Tab 6: Languages */}
        {activeTab === 'languages' && (
          <div className="tab-pane">
            <h3>Idiomas</h3>
            {languages.map((lang, idx) => (
              <div key={lang.id || idx} className="link-row">
                <input
                  type="text"
                  placeholder="Idioma (ej. Inglés)"
                  value={lang.language}
                  onChange={(e) => {
                    const copy = [...languages];
                    const item = copy[idx];
                    if (item) {
                      copy[idx] = { ...item, language: e.target.value };
                      setLanguages(copy);
                    }
                  }}
                />
                <input
                  type="text"
                  placeholder="Nivel (ej. Bilingüe / C1)"
                  value={lang.proficiency || ''}
                  onChange={(e) => {
                    const copy = [...languages];
                    const item = copy[idx];
                    if (item) {
                      copy[idx] = { ...item, proficiency: e.target.value };
                      setLanguages(copy);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setLanguages(languages.filter((_, i) => i !== idx))}
                  className="btn-danger-sm"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setLanguages([
                  ...languages,
                  { id: `lang-${Date.now()}`, language: '', proficiency: '' },
                ])
              }
              className="btn-secondary"
            >
              + Añadir Idioma
            </button>
          </div>
        )}

        {/* Tab 7: Projects */}
        {activeTab === 'projects' && (
          <div className="tab-pane">
            <h3>Proyectos Destacados</h3>
            {projects.map((proj, idx) => (
              <div key={proj.id || idx} className="item-card">
                <div className="card-header">
                  <strong>#{idx + 1} {proj.title || 'Nuevo Proyecto'}</strong>
                  <button
                    type="button"
                    onClick={() => setProjects(projects.filter((_, i) => i !== idx))}
                    className="btn-danger-sm"
                  >
                    Eliminar
                  </button>
                </div>
                <div className="form-group">
                  <label>Título del Proyecto</label>
                  <input
                    type="text"
                    value={proj.title}
                    onChange={(e) => {
                      const copy = [...projects];
                      const item = copy[idx];
                      if (item) {
                        copy[idx] = { ...item, title: e.target.value };
                        setProjects(copy);
                      }
                    }}
                    placeholder="Ej. Sistema de Inventario"
                  />
                </div>
                <div className="form-group">
                  <label>URL o Repositorio</label>
                  <input
                    type="url"
                    value={proj.url || ''}
                    onChange={(e) => {
                      const copy = [...projects];
                      const item = copy[idx];
                      if (item) {
                        copy[idx] = { ...item, url: e.target.value };
                        setProjects(copy);
                      }
                    }}
                    placeholder="https://github.com/..."
                  />
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <textarea
                    rows={2}
                    value={proj.description || ''}
                    onChange={(e) => {
                      const copy = [...projects];
                      const item = copy[idx];
                      if (item) {
                        copy[idx] = { ...item, description: e.target.value };
                        setProjects(copy);
                      }
                    }}
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setProjects([
                  ...projects,
                  { id: `proj-${Date.now()}`, title: '', description: '' },
                ])
              }
              className="btn-secondary"
            >
              + Añadir Proyecto
            </button>
          </div>
        )}

        {/* Tab 8: Achievements */}
        {activeTab === 'achievements' && (
          <div className="tab-pane">
            <h3>Logros y Reconocimientos</h3>
            {achievements.map((ach, idx) => (
              <div key={ach.id || idx} className="link-row">
                <input
                  type="text"
                  placeholder="Título del logro"
                  value={ach.title}
                  onChange={(e) => {
                    const copy = [...achievements];
                    const item = copy[idx];
                    if (item) {
                      copy[idx] = { ...item, title: e.target.value };
                      setAchievements(copy);
                    }
                  }}
                />
                <input
                  type="text"
                  placeholder="Año / Fecha"
                  value={ach.date || ''}
                  onChange={(e) => {
                    const copy = [...achievements];
                    const item = copy[idx];
                    if (item) {
                      copy[idx] = { ...item, date: e.target.value };
                      setAchievements(copy);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setAchievements(achievements.filter((_, i) => i !== idx))}
                  className="btn-danger-sm"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setAchievements([
                  ...achievements,
                  { id: `ach-${Date.now()}`, title: '' },
                ])
              }
              className="btn-secondary"
            >
              + Añadir Logro
            </button>
          </div>
        )}

        {/* Tab 9: References */}
        {activeTab === 'references' && (
          <div className="tab-pane">
            <h3>Referencias Profesionales</h3>
            {references.map((ref, idx) => (
              <div key={ref.id || idx} className="item-card">
                <div className="card-header">
                  <strong>#{idx + 1} {ref.name || 'Nueva Referencia'}</strong>
                  <button
                    type="button"
                    onClick={() => setReferences(references.filter((_, i) => i !== idx))}
                    className="btn-danger-sm"
                  >
                    Eliminar
                  </button>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre</label>
                    <input
                      type="text"
                      value={ref.name}
                      onChange={(e) => {
                        const copy = [...references];
                        const item = copy[idx];
                        if (item) {
                          copy[idx] = { ...item, name: e.target.value };
                          setReferences(copy);
                        }
                      }}
                      placeholder="Nombre del contacto"
                    />
                  </div>
                  <div className="form-group">
                    <label>Empresa / Relación</label>
                    <input
                      type="text"
                      value={ref.company || ''}
                      onChange={(e) => {
                        const copy = [...references];
                        const item = copy[idx];
                        if (item) {
                          copy[idx] = { ...item, company: e.target.value };
                          setReferences(copy);
                        }
                      }}
                      placeholder="Empresa o cargo"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Contacto (Email / Teléfono)</label>
                  <input
                    type="text"
                    value={ref.contact || ''}
                    onChange={(e) => {
                      const copy = [...references];
                      const item = copy[idx];
                      if (item) {
                        copy[idx] = { ...item, contact: e.target.value };
                        setReferences(copy);
                      }
                    }}
                    placeholder="email@example.com / +123..."
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setReferences([
                  ...references,
                  { id: `ref-${Date.now()}`, name: '', company: '' },
                ])
              }
              className="btn-secondary"
            >
              + Añadir Referencia
            </button>
          </div>
        )}
      </div>

      <div className="form-actions-bottom">
        <button
          type="button"
          onClick={() => { void handleSaveProfile(); }}
          disabled={isSaving}
          className="btn-primary"
        >
          {isSaving ? 'Guardando Cambios...' : 'Guardar Todos los Cambios'}
        </button>
      </div>
    </div>
  );
}
