import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../src/context/AuthContext';
import Dashboard from '../src/pages/Dashboard';
import CVEditor from '../src/pages/CVEditor';
import { HashRouter } from 'react-router-dom';
import { apiClient } from '../src/services/api/client';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'cv-123' }),
  };
});

describe('Dashboard and CV Editor UI', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders Dashboard with list of CVs and creates a new CV', async () => {
    vi.spyOn(apiClient, 'listCVs').mockResolvedValueOnce({
      cvs: [
        {
          id: 'cv-1',
          title: 'CV Software Engineer',
          template: 'classic',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    });

    const createSpy = vi.spyOn(apiClient, 'createCV').mockResolvedValueOnce({
      cv: {
        id: 'cv-new',
        userId: 'u-1',
        title: 'Mi Currículum',
        template: 'classic',
        personalInfo: { fullName: '', email: 'test@example.com' },
        sections: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    render(
      <AuthProvider>
        <HashRouter>
          <Dashboard />
        </HashRouter>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('CV Software Engineer')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '+ Crear Nuevo CV' }));

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith('Mi Currículum', true);
      expect(mockNavigate).toHaveBeenCalledWith('/cvs/cv-new');
    });
  });

  it('renders CVEditor with split editor and live preview', async () => {
    vi.spyOn(apiClient, 'getCV').mockResolvedValueOnce({
      cv: {
        id: 'cv-123',
        userId: 'u-1',
        title: 'Mi CV Completo',
        template: 'classic',
        personalInfo: {
          fullName: 'Laura Gómez',
          headline: 'Full Stack Architect',
          email: 'laura@example.com',
          phone: '+123456789',
          location: 'Bogotá',
          photoUrl: null,
          links: [],
        },
        sections: [
          {
            id: 'sec-exp',
            type: 'experience',
            title: 'Experiencia',
            visible: true,
            paginationRule: 'break',
            items: [
              {
                role: 'Tech Lead',
                company: 'Innovatech',
                startDate: '2022',
                endDate: 'Actual',
                description: 'Liderando equipos ágiles.',
              },
            ],
          },
          {
            id: 'sec-skills',
            type: 'skills',
            title: 'Habilidades',
            visible: true,
            paginationRule: 'break',
            items: [
              { name: 'TypeScript', category: 'technical' },
              { name: 'Liderazgo', category: 'soft' },
            ],
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    render(
      <AuthProvider>
        <HashRouter>
          <CVEditor />
        </HashRouter>
      </AuthProvider>,
    );

    await waitFor(() => {
      // In editor panel
      expect(screen.getByDisplayValue('Mi CV Completo')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Laura Gómez')).toBeInTheDocument();

      // In A4 preview panel
      expect(screen.getByRole('heading', { name: 'Laura Gómez' })).toBeInTheDocument();
      expect(screen.getByText('Full Stack Architect')).toBeInTheDocument();
      expect(screen.getByText('Tech Lead')).toBeInTheDocument();
      expect(screen.getByText('Innovatech')).toBeInTheDocument();
    });

    // Verify technical and soft skills are differentiated by internal classes
    const techSkillTag = screen.getByText('TypeScript');
    const softSkillTag = screen.getByText('Liderazgo');

    expect(techSkillTag).toHaveClass('a4-skill-technical');
    expect(techSkillTag).toHaveClass('skill-technical');
    expect(softSkillTag).toHaveClass('a4-skill-soft');
    expect(softSkillTag).toHaveClass('skill-soft');

    // Verify kebab dropdown menu on sections
    const kebabButtons = screen.getAllByRole('button', { name: 'Opciones de sección' });
    expect(kebabButtons.length).toBeGreaterThanOrEqual(1);

    // Click kebab menu on the first section
    const firstKebab = kebabButtons[0];
    if (firstKebab) {
      fireEvent.click(firstKebab);
      expect(screen.getByRole('button', { name: /ocultar del cv/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /mantener junta/i })).toBeInTheDocument();
    }

    // Check Print button exists
    expect(screen.getByRole('button', { name: /imprimir \/ guardar pdf/i })).toBeInTheDocument();
  });

  it('allows right clicking on section header to open context menu', async () => {
    vi.spyOn(apiClient, 'getCV').mockResolvedValueOnce({
      cv: {
        id: 'cv-ctx',
        userId: 'u-1',
        title: 'Context Test',
        template: 'classic',
        personalInfo: { fullName: 'Pedro', email: 'p@test.com' },
        sections: [
          {
            id: 'sec-custom',
            type: 'custom',
            title: 'Sección Extra',
            visible: true,
            paginationRule: 'break',
            content: 'Texto personalizado',
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    render(
      <AuthProvider>
        <HashRouter>
          <CVEditor />
        </HashRouter>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Sección Extra')).toBeInTheDocument();
    });

    // Right click on section title input container / header
    const titleInput = screen.getByDisplayValue('Sección Extra');
    const header = titleInput.closest('.section-block-header');
    expect(header).toBeInTheDocument();

    if (header) {
      fireEvent.contextMenu(header);
      expect(screen.getByRole('button', { name: /eliminar sección/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ocultar del cv/i })).toBeInTheDocument();
    }
  });
});
