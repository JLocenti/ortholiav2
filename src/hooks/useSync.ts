import { useState, useEffect } from 'react';
import { SyncService } from '../services/sync/SyncService';
import { SyncInfo } from '../services/sync/types';

export function useSync<T extends { id: string }>(collection: string) {
  const [data, setData] = useState<T[]>([]);
  const [syncInfo, setSyncInfo] = useState<SyncInfo>({
    status: 'idle',
    lastSync: null,
    pendingChanges: 0
  });

  useEffect(() => {
    const syncService = SyncService.getInstance();

    // S'abonner aux mises à jour de synchronisation
    const syncSubscription = syncService.syncNotifier
      .getSyncStatus$()
      .subscribe(setSyncInfo);

    // S'abonner aux mises à jour de la collection
    const unsubscribe = syncService.subscribeToCollection<T>(
      collection,
      setData
    );

    return () => {
      syncSubscription.unsubscribe();
      unsubscribe();
    };
  }, [collection]);

  const saveData = async (item: T) => {
    try {
      await SyncService.getInstance().saveData(collection, item);
    } catch (error) {
      console.error('Error saving data:', error);
      throw error;
    }
  };

  return {
    data,
    syncInfo,
    saveData
  };
}