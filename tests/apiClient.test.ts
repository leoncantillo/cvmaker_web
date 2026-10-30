import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiClient } from '../src/services/api/client';

const fetchMock = vi.fn();

describe('apiClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it('returns typed successful responses', async () => {
    vi.stubGlobal(
      'fetch',
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({ status: 'ok' }), { status: 200 }),
      ),
    );

    await expect(apiClient.checkHealth()).resolves.toEqual({
      status: 'ok',
    });
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/api/health', {
      headers: {},
      method: 'GET',
    });
  });

  it('serializes request bodies and adds a JSON content type', async () => {
    vi.stubGlobal(
      'fetch',
      fetchMock.mockResolvedValue(new Response(JSON.stringify({ id: 'cv-1' }), { status: 201 })),
    );

    await apiClient.post('/cvs', { title: 'My CV' });

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/cvs', {
      body: JSON.stringify({ title: 'My CV' }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
  });

  it('maps API error payloads to ApiError', async () => {
    vi.stubGlobal(
      'fetch',
      fetchMock.mockResolvedValue(
        new Response(
          JSON.stringify({
            error: { code: 'NOT_FOUND', message: 'CV not found.', details: { id: 'cv-1' } },
          }),
          { status: 404 },
        ),
      ),
    );

    await expect(apiClient.get('/cvs/cv-1')).rejects.toMatchObject({
      code: 'NOT_FOUND',
      status: 404,
      details: { id: 'cv-1' },
    } satisfies Partial<ApiError>);
  });

  it('maps network failures to ApiError', async () => {
    vi.stubGlobal('fetch', fetchMock.mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(apiClient.checkHealth()).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
      status: 0,
    } satisfies Partial<ApiError>);
  });
});
