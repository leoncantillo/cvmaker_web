import { useEffect, useRef, useState, type ReactElement } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { env } from '../config/env';
import { apiClient, ApiError } from '../services/api/client';
import type { CVPersonalInfo, CVSection, GenericSectionItem } from '../services/api/types';

export default function CVEditor(): ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState<string>('');
  const [personalInfo, setPersonalInfo] = useState<CVPersonalInfo>({
    fullName: '',
    email: '',
  });
  const [sections, setSections] = useState<CVSection[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('saved');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isInitialMount = useRef(true);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCV(): Promise<void> {
      if (!id) return;

      try {
        const res = await apiClient.getCV(id);
        if (isMounted) {
          setTitle(res.cv.title);
          setPersonalInfo(res.cv.personalInfo || { fullName: '', email: '' });
          setSections(res.cv.sections || []);
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage(err instanceof ApiError ? err.message : 'Error al cargar CV');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadCV();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Auto-save debounced effect
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!id || isLoading) return;

    setSaveStatus('saving');

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await apiClient.updateCV(id, {
          title,
          personalInfo,
          sections,
        });
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
      }
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [title, personalInfo, sections, id, isLoading]);

  const handlePrint = (): void => {
    window.print();
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down'): void => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const copy = [...sections];
    const [moved] = copy.splice(index, 1);
    if (moved) {
      copy.splice(targetIndex, 0, moved);
      setSections(copy);
    }
  };

  const handleToggleSectionVisibility = (index: number): void => {
    const copy = [...sections];
    const sec = copy[index];
    if (sec) {
      copy[index] = { ...sec, visible: !sec.visible };
      setSections(copy);
    }
  };

  const handleDeleteSection = (index: number): void => {
    if (!confirm('¿Deseas eliminar esta sección del currículum?')) return;
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleAddCustomSection = (): void => {
    const newSec: CVSection = {
      id: `sec-custom-${Date.now()}`,
      type: 'custom',
      title: 'Sección Personalizada',
      visible: true,
      paginationRule: 'break',
      content: 'Escribe aquí tu contenido personalizado...',
    };
    setSections([...sections, newSec]);
  };

  if (isLoading) {
    return <div className="loading-banner">Cargando editor de CV...</div>;
  }

  if (errorMessage) {
    return (
      <div className="error-banner">
        {errorMessage}
        <button type="button" onClick={() => { void navigate('/cvs'); }} className="btn-secondary" style={{ marginLeft: '1rem' }}>
          Volver a Mis CVs
        </button>
      </div>
    );
  }

  const photoFullUrl = personalInfo.photoUrl
    ? `${env.apiUrl}${personalInfo.photoUrl}`
    : null;

  return (
    <div className="cv-editor-layout">
      {/* Top Bar (Hidden when printing) */}
      <header className="editor-topbar no-print">
        <div className="topbar-left">
          <button
            type="button"
            onClick={() => { void navigate('/cvs'); }}
            className="btn-secondary btn-sm"
          >
            ← Mis CVs
          </button>
          <input
            type="text"
            className="cv-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título del Currículum"
          />
        </div>

        <div className="topbar-right">
          <span className={`save-status-badge ${saveStatus}`}>
            {saveStatus === 'saving' && 'Guardando...'}
            {saveStatus === 'saved' && '✓ Guardado'}
            {saveStatus === 'error' && '⚠️ Error al guardar'}
          </span>
          <button
            type="button"
            onClick={handlePrint}
            className="btn-primary btn-print"
          >
            🖨️ Imprimir / Guardar PDF (A4)
          </button>
        </div>
      </header>

      {/* Main Split Body */}
      <div className="editor-split-container">
        {/* Left Side: Form Editor (Hidden when printing) */}
        <div className="editor-panel no-print">
          <div className="editor-card">
            <h3>👤 Información Personal</h3>
            <div className="form-group">
              <label>Nombre Completo</label>
              <input
                type="text"
                value={personalInfo.fullName}
                onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                placeholder="Ej. María Rodríguez"
              />
            </div>
            <div className="form-group">
              <label>Titular Profesional</label>
              <input
                type="text"
                value={personalInfo.headline || ''}
                onChange={(e) => setPersonalInfo({ ...personalInfo, headline: e.target.value })}
                placeholder="Ej. Diseñadora de Producto UI/UX"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="text"
                  value={personalInfo.phone || ''}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Ubicación</label>
              <input
                type="text"
                value={personalInfo.location || ''}
                onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                placeholder="Ej. Madrid, España"
              />
            </div>
          </div>

          {/* Sections List */}
          <div className="editor-card">
            <div className="card-header-flex">
              <h3>📑 Secciones del Currículum</h3>
              <button
                type="button"
                onClick={handleAddCustomSection}
                className="btn-secondary btn-sm"
              >
                + Sección Personalizada
              </button>
            </div>

            {sections.map((sec, idx) => (
              <div key={sec.id || idx} className="section-editor-block">
                <div className="section-block-header">
                  <div className="section-meta">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveSection(idx, 'up')}
                      className="btn-icon"
                      title="Subir posición"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={idx === sections.length - 1}
                      onClick={() => handleMoveSection(idx, 'down')}
                      className="btn-icon"
                      title="Bajar posición"
                    >
                      ▼
                    </button>
                    <input
                      type="text"
                      className="section-title-input"
                      value={sec.title}
                      onChange={(e) => {
                        const copy = [...sections];
                        const s = copy[idx];
                        if (s) {
                          copy[idx] = { ...s, title: e.target.value };
                          setSections(copy);
                        }
                      }}
                    />
                  </div>
                  <div className="section-actions">
                    <label className="visibility-label">
                      <input
                        type="checkbox"
                        checked={sec.visible}
                        onChange={() => handleToggleSectionVisibility(idx)}
                      />
                      {sec.visible ? 'Visible' : 'Oculta'}
                    </label>
                    <button
                      type="button"
                      onClick={() => handleDeleteSection(idx)}
                      className="btn-danger-sm"
                      title="Eliminar sección"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {sec.visible && (
                  <div className="section-block-body">
                    <div className="pagination-rule-row">
                      <label>Paginación A4:</label>
                      <select
                        value={sec.paginationRule}
                        onChange={(e) => {
                          const copy = [...sections];
                          const s = copy[idx];
                          if (s) {
                            copy[idx] = { ...s, paginationRule: e.target.value };
                            setSections(copy);
                          }
                        }}
                      >
                        <option value="break">Permitir salto de página</option>
                        <option value="avoid-break">Intentar mantener en una sola página</option>
                      </select>
                    </div>

                    {/* Summary / Custom textarea */}
                    {(sec.type === 'summary' || sec.type === 'custom') && (
                      <div className="form-group">
                        <textarea
                          rows={4}
                          value={sec.content || ''}
                          onChange={(e) => {
                            const copy = [...sections];
                            const s = copy[idx];
                            if (s) {
                              copy[idx] = { ...s, content: e.target.value };
                              setSections(copy);
                            }
                          }}
                          placeholder="Contenido de la sección..."
                        />
                      </div>
                    )}

                    {/* Experiences */}
                    {sec.type === 'experience' && (
                      <div className="items-list">
                        {(sec.items || []).map((exp: GenericSectionItem, expIdx: number) => (
                          <div key={expIdx} className="item-subcard">
                            <div className="subcard-header">
                              <strong>{exp.role || 'Cargo'} {exp.company ? `- ${exp.company}` : ''}</strong>
                              <button
                                type="button"
                                onClick={() => {
                                  const copy = [...sections];
                                  const s = copy[idx];
                                  if (s) {
                                    copy[idx] = {
                                      ...s,
                                      items: (s.items || []).filter((_: GenericSectionItem, i: number) => i !== expIdx),
                                    };
                                    setSections(copy);
                                  }
                                }}
                                className="btn-danger-sm"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="form-row">
                              <input
                                type="text"
                                placeholder="Empresa"
                                value={exp.company || ''}
                                onChange={(e) => {
                                  const copy = [...sections];
                                  const s = copy[idx];
                                  if (s && s.items) {
                                    s.items[expIdx] = { ...s.items[expIdx], company: e.target.value };
                                    setSections(copy);
                                  }
                                }}
                              />
                              <input
                                type="text"
                                placeholder="Cargo"
                                value={exp.role || ''}
                                onChange={(e) => {
                                  const copy = [...sections];
                                  const s = copy[idx];
                                  if (s && s.items) {
                                    s.items[expIdx] = { ...s.items[expIdx], role: e.target.value };
                                    setSections(copy);
                                  }
                                }}
                              />
                            </div>
                            <div className="form-row">
                              <input
                                type="text"
                                placeholder="Periodo (ej. 2021 - 2023)"
                                value={exp.startDate ? `${exp.startDate} - ${exp.endDate || 'Actual'}` : (exp.period || '')}
                                onChange={(e) => {
                                  const copy = [...sections];
                                  const s = copy[idx];
                                  if (s && s.items) {
                                    s.items[expIdx] = { ...s.items[expIdx], period: e.target.value };
                                    setSections(copy);
                                  }
                                }}
                              />
                            </div>
                            <textarea
                              rows={2}
                              placeholder="Descripción..."
                              value={exp.description || ''}
                              onChange={(e) => {
                                const copy = [...sections];
                                const s = copy[idx];
                                if (s && s.items) {
                                  s.items[expIdx] = { ...s.items[expIdx], description: e.target.value };
                                  setSections(copy);
                                }
                              }}
                            />
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const copy = [...sections];
                            const s = copy[idx];
                            if (s) {
                              copy[idx] = {
                                ...s,
                                items: [...(s.items || []), { company: '', role: '', description: '' }],
                              };
                              setSections(copy);
                            }
                          }}
                          className="btn-secondary btn-sm"
                        >
                          + Añadir Experiencia
                        </button>
                      </div>
                    )}

                    {/* Educations */}
                    {sec.type === 'education' && (
                      <div className="items-list">
                        {(sec.items || []).map((edu: GenericSectionItem, eduIdx: number) => (
                          <div key={eduIdx} className="item-subcard">
                            <div className="subcard-header">
                              <strong>{edu.degree || 'Título'} {edu.institution ? `- ${edu.institution}` : ''}</strong>
                              <button
                                type="button"
                                onClick={() => {
                                  const copy = [...sections];
                                  const s = copy[idx];
                                  if (s) {
                                    copy[idx] = {
                                      ...s,
                                      items: (s.items || []).filter((_: GenericSectionItem, i: number) => i !== eduIdx),
                                    };
                                    setSections(copy);
                                  }
                                }}
                                className="btn-danger-sm"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="form-row">
                              <input
                                type="text"
                                placeholder="Institución"
                                value={edu.institution || ''}
                                onChange={(e) => {
                                  const copy = [...sections];
                                  const s = copy[idx];
                                  if (s && s.items) {
                                    s.items[eduIdx] = { ...s.items[eduIdx], institution: e.target.value };
                                    setSections(copy);
                                  }
                                }}
                              />
                              <input
                                type="text"
                                placeholder="Título / Grado"
                                value={edu.degree || ''}
                                onChange={(e) => {
                                  const copy = [...sections];
                                  const s = copy[idx];
                                  if (s && s.items) {
                                    s.items[eduIdx] = { ...s.items[eduIdx], degree: e.target.value };
                                    setSections(copy);
                                  }
                                }}
                              />
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const copy = [...sections];
                            const s = copy[idx];
                            if (s) {
                              copy[idx] = {
                                ...s,
                                items: [...(s.items || []), { institution: '', degree: '' }],
                              };
                              setSections(copy);
                            }
                          }}
                          className="btn-secondary btn-sm"
                        >
                          + Añadir Educación
                        </button>
                      </div>
                    )}

                    {/* Skills */}
                    {sec.type === 'skills' && (
                      <div className="skills-pill-editor">
                        {(sec.items || []).map((sk: GenericSectionItem, skIdx: number) => (
                          <div key={skIdx} className="skill-chip">
                            <input
                              type="text"
                              value={sk.name || ''}
                              onChange={(e) => {
                                const copy = [...sections];
                                const s = copy[idx];
                                if (s && s.items) {
                                  s.items[skIdx] = { ...s.items[skIdx], name: e.target.value };
                                  setSections(copy);
                                }
                              }}
                              placeholder="Habilidad"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const copy = [...sections];
                                const s = copy[idx];
                                if (s) {
                                  copy[idx] = {
                                    ...s,
                                    items: (s.items || []).filter((_: GenericSectionItem, i: number) => i !== skIdx),
                                  };
                                  setSections(copy);
                                }
                              }}
                              className="btn-chip-delete"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const copy = [...sections];
                            const s = copy[idx];
                            if (s) {
                              copy[idx] = {
                                ...s,
                                items: [...(s.items || []), { name: '', category: 'technical' }],
                              };
                              setSections(copy);
                            }
                          }}
                          className="btn-secondary btn-sm"
                        >
                          + Añadir Habilidad
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Live A4 Preview Sheet */}
        <div className="preview-panel">
          <div className="a4-sheet" id="cv-print-area">
            {/* Header / Personal Info */}
            <div className="a4-header">
              <div className="a4-header-text">
                <h1 className="a4-name">{personalInfo.fullName || 'Tu Nombre'}</h1>
                {personalInfo.headline && (
                  <p className="a4-headline">{personalInfo.headline}</p>
                )}
                <div className="a4-contact-bar">
                  {personalInfo.email && <span>✉ {personalInfo.email}</span>}
                  {personalInfo.phone && <span>📞 {personalInfo.phone}</span>}
                  {personalInfo.location && <span>📍 {personalInfo.location}</span>}
                  {Array.isArray(personalInfo.links) && personalInfo.links.map((link, i) => (
                    <span key={i}>🔗 {link.label || link.url}</span>
                  ))}
                </div>
              </div>
              {photoFullUrl && (
                <div className="a4-photo-wrapper">
                  <img src={photoFullUrl} alt="Foto CV" className="a4-photo" />
                </div>
              )}
            </div>

            {/* Sections */}
            <div className="a4-sections">
              {sections
                .filter((s) => s.visible !== false)
                .map((sec, secIdx) => (
                  <div
                    key={sec.id || secIdx}
                    className={`a4-section ${sec.paginationRule === 'avoid-break' ? 'avoid-page-break' : ''}`}
                  >
                    <h2 className="a4-section-title">{sec.title}</h2>

                    {/* Summary / Custom text */}
                    {(sec.type === 'summary' || sec.type === 'custom') && sec.content && (
                      <p className="a4-section-text">{sec.content}</p>
                    )}

                    {/* Experience items */}
                    {sec.type === 'experience' && Array.isArray(sec.items) && (
                      <div className="a4-items-container">
                        {sec.items.map((item: GenericSectionItem, i: number) => (
                          <div key={i} className="a4-item">
                            <div className="a4-item-heading">
                              <span className="a4-item-role"><strong>{item.role}</strong></span>
                              <span className="a4-item-company">{item.company}</span>
                              <span className="a4-item-date">
                                {item.period || (item.startDate ? `${item.startDate} - ${item.endDate || 'Actual'}` : '')}
                              </span>
                            </div>
                            {item.description && <p className="a4-item-desc">{item.description}</p>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Education items */}
                    {sec.type === 'education' && Array.isArray(sec.items) && (
                      <div className="a4-items-container">
                        {sec.items.map((item: GenericSectionItem, i: number) => (
                          <div key={i} className="a4-item">
                            <div className="a4-item-heading">
                              <span className="a4-item-role"><strong>{item.degree}</strong></span>
                              <span className="a4-item-company">{item.institution}</span>
                              <span className="a4-item-date">
                                {item.startDate ? `${item.startDate} - ${item.endDate || ''}` : ''}
                              </span>
                            </div>
                            {item.description && <p className="a4-item-desc">{item.description}</p>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Skills pills */}
                    {sec.type === 'skills' && Array.isArray(sec.items) && (
                      <div className="a4-skills-list">
                        {sec.items.map((sk: GenericSectionItem, i: number) => (
                          <span key={i} className="a4-skill-tag">
                            {sk.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Generic fallback items */}
                    {!['summary', 'custom', 'experience', 'education', 'skills'].includes(sec.type) &&
                      Array.isArray(sec.items) && (
                        <div className="a4-items-container">
                          {sec.items.map((item: GenericSectionItem, i: number) => (
                            <div key={i} className="a4-item">
                              <div className="a4-item-heading">
                                <strong>{item.name || item.title || item.language}</strong>
                                <span>{item.issuer || item.proficiency || item.relationship || ''}</span>
                                <span>{item.date || item.issueDate || item.contact || ''}</span>
                              </div>
                              {item.description && <p className="a4-item-desc">{item.description}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
