import { describe, expect, it } from 'vitest';
import { AdminReportService, ReportService } from './report.service';

describe('ReportService', () => {
 it('should create an instance', () => {
  const service = new ReportService();
  expect(service).toBeInstanceOf(ReportService);
 });

 it('should have getReportByUser method', () => {
  const service = new ReportService();
  expect(service.getReportByUser).toBeDefined();
  expect(typeof service.getReportByUser).toBe('function');
 });
});

describe('AdminReportService', () => {
 it('should create an instance', () => {
  const service = new AdminReportService();
  expect(service).toBeInstanceOf(AdminReportService);
 });

 it('should extend ReportService', () => {
  const service = new AdminReportService();
  expect(service).toBeInstanceOf(ReportService);
 });

 it('should have getAllReports method', () => {
  const service = new AdminReportService();
  expect(service.getAllReports).toBeDefined();
  expect(typeof service.getAllReports).toBe('function');
 });
});
