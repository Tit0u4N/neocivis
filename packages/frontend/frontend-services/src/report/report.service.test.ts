import type { PaginatedReportsResponse, Report } from '@repo/contracts/report';
import type { KyInstance } from 'ky';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReportService } from './report.service';

const mockReport: Report = {
  id: 'report-1',
  authorId: 'user-1',
  title: 'Lampadaire défectueux',
  type: 'Éclairage public',
  status: 'pending',
  desc: 'Le lampadaire au coin de la rue clignote.',
  createdAt: '2026-04-12T10:00:00.000Z',
  updatedAt: '2026-04-12T10:00:00.000Z',
};

const mockPaginated: PaginatedReportsResponse = {
  data: [mockReport],
  total: 1,
  page: 1,
  limit: 10,
  totalPages: 1,
};

function makeKy(overrides: Partial<Record<string, unknown>> = {}): KyInstance {
  const json = vi.fn();
  const base = {
    get: vi.fn().mockReturnValue({ json }),
    post: vi.fn().mockReturnValue({ json }),
    patch: vi.fn().mockReturnValue({ json }),
    extend: vi.fn(),
    ...overrides,
  };
  // extend retourne une instance avec post
  (base.extend as ReturnType<typeof vi.fn>).mockReturnValue(base);
  return base as unknown as KyInstance;
}

describe('ReportService (frontend)', () => {
  let ky: ReturnType<typeof makeKy>;
  let service: ReportService;

  beforeEach(() => {
    ky = makeKy();
    service = new ReportService(ky as KyInstance);
  });

  describe('getMine', () => {
    it('appelle GET reports/me et retourne la réponse paginée', async () => {
      const json = vi.fn().mockResolvedValue(mockPaginated);
      (ky.get as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const result = await service.getMine();

      expect(ky.get).toHaveBeenCalledWith('reports/me', expect.objectContaining({ searchParams: {} }));
      expect(result).toEqual(mockPaginated);
    });

    it('transmet page et limit en searchParams', async () => {
      const json = vi.fn().mockResolvedValue(mockPaginated);
      (ky.get as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      await service.getMine({ page: 2, limit: 5 });

      expect(ky.get).toHaveBeenCalledWith(
        'reports/me',
        expect.objectContaining({ searchParams: { page: 2, limit: 5 } }),
      );
    });
  });

  describe('getById', () => {
    it('appelle GET reports/:id et retourne le signalement', async () => {
      const json = vi.fn().mockResolvedValue(mockReport);
      (ky.get as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const result = await service.getById('report-1');

      expect(ky.get).toHaveBeenCalledWith('reports/report-1');
      expect(result).toEqual(mockReport);
    });
  });

  describe('cancel', () => {
    it('appelle PATCH reports/:id/cancel et retourne le signalement mis à jour', async () => {
      const cancelled = { ...mockReport, status: 'cancelled' as const };
      const json = vi.fn().mockResolvedValue(cancelled);
      (ky.patch as ReturnType<typeof vi.fn>).mockReturnValue({ json });

      const result = await service.cancel('report-1');

      expect(ky.patch).toHaveBeenCalledWith('reports/report-1/cancel');
      expect(result.status).toBe('cancelled');
    });
  });

  describe('create', () => {
    it('appelle POST reports avec FormData et retourne le signalement créé', async () => {
      const json = vi.fn().mockResolvedValue(mockReport);
      const postMock = vi.fn().mockReturnValue({ json });
      const extendedKy = { post: postMock };
      (ky.extend as ReturnType<typeof vi.fn>).mockReturnValue(extendedKy);

      const result = await service.create({ desc: 'Le lampadaire au coin de la rue clignote.' });

      expect(ky.extend).toHaveBeenCalledWith({ headers: { 'Content-Type': undefined } });
      expect(postMock).toHaveBeenCalledWith('reports', expect.objectContaining({ body: expect.any(FormData) }));
      expect(result).toEqual(mockReport);
    });

    it('ajoute latitude et longitude si fournis', async () => {
      const json = vi.fn().mockResolvedValue(mockReport);
      const postMock = vi.fn().mockReturnValue({ json });
      (ky.extend as ReturnType<typeof vi.fn>).mockReturnValue({ post: postMock });

      await service.create({ desc: 'Voirie abîmée', latitude: 43.2965, longitude: 5.3698 });

      const formData: FormData = postMock.mock.calls[0][1].body;
      expect(formData.get('latitude')).toBe('43.2965');
      expect(formData.get('longitude')).toBe('5.3698');
    });

    it("n'ajoute pas latitude/longitude si absents", async () => {
      const json = vi.fn().mockResolvedValue(mockReport);
      const postMock = vi.fn().mockReturnValue({ json });
      (ky.extend as ReturnType<typeof vi.fn>).mockReturnValue({ post: postMock });

      await service.create({ desc: 'Tag sur mur' });

      const formData: FormData = postMock.mock.calls[0][1].body;
      expect(formData.get('latitude')).toBeNull();
      expect(formData.get('longitude')).toBeNull();
    });
  });
});
