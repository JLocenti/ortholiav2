export type NetworkStatus = 'online' | 'offline';

export interface SyncState {
  status: NetworkStatus;
  lastSync: Date | null;
  pendingChanges: number;
}

export interface SyncError {
  code: string;
  message: string;
  timestamp: Date;
}