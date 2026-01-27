import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { storageService } from '../../src/services/storageService.js';

describe('storageService', () => {
    beforeEach(() => {
        localStorage.clear();
        storageService.pendingSaves = 0;
        storageService.lastSaveAt = 0;
        storageService.saveSequence = 0;
        storageService.lastSaveOk = true;
        storageService.lastSaveError = '';
        storageService.saveQueue = Promise.resolve();
    });

    afterEach(async () => {
        await storageService.flush();
        vi.useRealTimers();
    });

    it('saveClientData writes per-client data and appends snapshots', () => {
        storageService.saveClientData({ id: 'C1', clientName: 'Client 1' });
        const saved = storageService.loadClientData('C1');
        expect(saved.id).toBe('C1');

        const snaps = storageService.getSnapshots('C1');
        expect(snaps.length).toBe(1);
        expect(snaps[0].data.id).toBe('C1');
    });

    it('appendSnapshot keeps only the last 5 snapshots', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2020-01-01T00:00:00.000Z'));

        for (let i = 0; i < 6; i += 1) {
            storageService.saveClientData({ id: 'C1', clientName: `Client 1 - ${i}` });
            vi.advanceTimersByTime(1000);
        }

        const snaps = storageService.getSnapshots('C1');
        expect(snaps.length).toBe(5);
    });

    it('importWorkspaceExport merges auditLog with current workspace auditLog', () => {
        storageService.saveClientData({
            id: 'C1',
            measurementContract: {
                auditLog: [{ id: 'current' }]
            }
        });

        const bundle = {
            type: 'bravvo_workspace_export',
            version: 1,
            exportedAt: '2020-01-01T00:00:00.000Z',
            clientId: 'C1',
            schemaVersion: 1,
            checksum: '',
            payload: {
                id: 'C1',
                clientName: 'Imported',
                measurementContract: {
                    auditLog: [{ id: 'imported' }]
                }
            }
        };

        storageService.importWorkspaceExport('C1', JSON.stringify(bundle));

        const saved = storageService.loadClientData('C1');
        expect(saved.clientName).toBe('Imported');
        expect(saved.measurementContract.auditLog.map(e => e.id)).toEqual(['current', 'imported']);
    });

    it('restoreSnapshot merges auditLog with current workspace auditLog', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2020-01-01T00:00:00.000Z'));

        storageService.saveClientData({
            id: 'C1',
            kpis: { sales: { value: 1, goal: 0 } },
            measurementContract: { auditLog: [{ id: 'snap' }] }
        });

        const snapTs = storageService.getSnapshots('C1')[0].ts;
        vi.advanceTimersByTime(1000);

        storageService.saveClientData({
            id: 'C1',
            kpis: { sales: { value: 777, goal: 0 } },
            measurementContract: { auditLog: [{ id: 'current' }] }
        });

        const restored = storageService.restoreSnapshot('C1', snapTs);
        expect(restored.kpis.sales.value).toBe(1);
        expect(restored.measurementContract.auditLog.map(e => e.id)).toEqual(['current', 'snap']);
    });

    it('importWorkspaceExport rejects checksum mismatches', () => {
        const bundle = {
            type: 'bravvo_workspace_export',
            version: 1,
            checksum: 'deadbeef',
            payload: { id: 'C1', clientName: 'Bad' }
        };

        expect(() => storageService.importWorkspaceExport('C1', JSON.stringify(bundle))).toThrow(/Checksum mismatch/);
    });
});
