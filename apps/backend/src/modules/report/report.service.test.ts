import { describe, expect, it } from 'vitest';
import { InMemoryReportRepository } from './report.repository';
import { ReportService } from './report.service';

describe('ReportService', () => {
  const makeService = () => {
    const repo = new InMemoryReportRepository();
    const service = new ReportService(repo);
    return { repo, service };
  };

  describe('createReport', () => {
    it('génère un id et des timestamps', async () => {
      const { service } = makeService();
      const report = await service.createReport({ desc: 'Trottoir dégradé', authorId: 'user-1' });
      expect(report.id).toBeDefined();
      expect(report.authorId).toBe('user-1');
      expect(report.createdAt).toBeDefined();
      expect(report.updatedAt).toBe(report.createdAt);
      expect(report.status).toBe('pending');
      expect(report.type).toBe('Autre');
    });

    it('dérive le titre depuis la description courte', async () => {
      const { service } = makeService();
      const report = await service.createReport({ desc: 'Nid de poule', authorId: 'user-1' });
      expect(report.title).toBe('Nid de poule');
    });

    it('tronque le titre à 60 caractères sur un espace', async () => {
      const { service } = makeService();
      const desc = 'Un trottoir très dégradé avec des nids de poule dangereux qui nécessitent une intervention urgente';
      const report = await service.createReport({ desc, authorId: 'user-1' });
      expect(report.title.length).toBeLessThanOrEqual(61); // 60 + ellipsis char
      expect(report.title.endsWith('…')).toBe(true);
    });

    it('stocke la localisation et la photoUrl si fournies', async () => {
      const { service } = makeService();
      const report = await service.createReport({
        desc: 'Lampadaire cassé',
        authorId: 'user-1',
        location: { latitude: 43.2965, longitude: 5.3698 },
        photoUrl: 'https://example.com/photo.jpg',
      });
      expect(report.location).toEqual({ latitude: 43.2965, longitude: 5.3698 });
      expect(report.photoUrl).toBe('https://example.com/photo.jpg');
    });
  });

  describe('getMyReports', () => {
    it("retourne uniquement les signalements de l'auteur", async () => {
      const { service } = makeService();
      await service.createReport({ desc: 'Problème voirie', authorId: 'user-A' });
      await service.createReport({ desc: 'Éclairage défaillant', authorId: 'user-B' });

      const result = await service.getMyReports('user-A', 1, 10);
      expect(result.data.every((r) => r.authorId === 'user-A')).toBe(true);
    });

    it('calcule correctement totalPages', async () => {
      const { service } = makeService();
      for (let i = 0; i < 5; i++) {
        await service.createReport({ desc: `Signalement ${i} suffisamment long`, authorId: 'user-paginate' });
      }
      const result = await service.getMyReports('user-paginate', 1, 2);
      expect(result.total).toBe(5);
      expect(result.totalPages).toBe(3);
      expect(result.data.length).toBeLessThanOrEqual(2);
    });

    it('retourne une page vide pour un auteur sans signalements', async () => {
      const { service } = makeService();
      const result = await service.getMyReports('user-inconnu', 1, 10);
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });
  });

  describe('getReportByIdForUser', () => {
    it("retourne le signalement si l'auteur correspond", async () => {
      const { service } = makeService();
      const created = await service.createReport({ desc: 'Mobilier cassé', authorId: 'user-1' });
      const found = await service.getReportByIdForUser(created.id, 'user-1');
      expect(found.id).toBe(created.id);
    });

    it("lève une erreur si le signalement n'existe pas", async () => {
      const { service } = makeService();
      await expect(service.getReportByIdForUser('id-inexistant', 'user-1')).rejects.toThrow('Report not found');
    });

    it("lève une erreur si l'auteur ne correspond pas", async () => {
      const { service } = makeService();
      const created = await service.createReport({ desc: 'Dégradation', authorId: 'user-1' });
      await expect(service.getReportByIdForUser(created.id, 'user-autre')).rejects.toThrow('Report not found');
    });
  });

  describe('cancelReport', () => {
    it('passe le statut à cancelled', async () => {
      const { service } = makeService();
      const created = await service.createReport({ desc: 'Bruit excessif nocturne', authorId: 'user-1' });
      const cancelled = await service.cancelReport(created.id, 'user-1');
      expect(cancelled.status).toBe('cancelled');
    });

    it('met à jour updatedAt', async () => {
      const { service, repo } = makeService();
      const created = await service.createReport({ desc: 'Stationnement gênant', authorId: 'user-1' });
      // Force une date passée pour garantir un updatedAt différent après cancel
      await repo.update(created.id, { updatedAt: '2020-01-01T00:00:00.000Z' });
      const cancelled = await service.cancelReport(created.id, 'user-1');
      expect(cancelled.updatedAt).not.toBe('2020-01-01T00:00:00.000Z');
    });

    it("refuse l'annulation d'un signalement déjà résolu", async () => {
      const { service, repo } = makeService();
      const created = await service.createReport({ desc: 'Problème résolu', authorId: 'user-1' });
      await repo.update(created.id, { status: 'resolved' });
      await expect(service.cancelReport(created.id, 'user-1')).rejects.toThrow(
        'Cannot cancel a report that is resolved or already cancelled',
      );
    });

    it("refuse l'annulation d'un signalement déjà annulé", async () => {
      const { service } = makeService();
      const created = await service.createReport({ desc: 'Déjà annulé', authorId: 'user-1' });
      await service.cancelReport(created.id, 'user-1');
      await expect(service.cancelReport(created.id, 'user-1')).rejects.toThrow(
        'Cannot cancel a report that is resolved or already cancelled',
      );
    });

    it("lève une erreur si l'auteur ne correspond pas", async () => {
      const { service } = makeService();
      const created = await service.createReport({ desc: "Signalement d'un autre", authorId: 'user-1' });
      await expect(service.cancelReport(created.id, 'user-autre')).rejects.toThrow('Report not found');
    });
  });
});
