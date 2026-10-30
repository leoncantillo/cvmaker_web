import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../src/App';

afterEach(() => {
  window.location.hash = '';
});

describe('App', () => {
  it('renders the home route with hash-based navigation', () => {
    window.location.hash = '#/';

    render(<App />);

    expect(screen.getByRole('heading', { name: 'Vite + React' })).toBeInTheDocument();
    expect(window.location.hash).toBe('#/');
  });
});
