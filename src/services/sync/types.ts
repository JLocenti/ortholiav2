import { z } from 'zod';

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'conflict' | 'offline';

export interface SyncInfo {
  status: SyncStatus;
  lastSync: Date | null;
  pendingChanges: number;
  error?: Error;
}

export interface SyncQueueItem<T> {
  id: string;
  operation: 'create' | 'update' | 'delete';
  collection: string;
  data: T;
  timestamp: number;
  retryCount: number;
}

export const syncInfoSchema = z.object({
  status: z.enum(['idle', 'syncing', 'error', 'conflict', 'offline']),
  lastSync: z.date().nullable(),
  pendingChanges: z.number(),
  error: z.instanceof(Error).optional()
});

export type NetworkStatus = 'online' | 'offline';

export interface ConflictResolution<T> {
  localData: T;
  serverData: T;
  resolvedData: T;
  strategy: 'local' | 'server' | 'merge';
}