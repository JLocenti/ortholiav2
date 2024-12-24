import { openDB, IDBPDatabase } from 'idb';
import { db } from '../config/firebase';
import { collection, doc, setDoc, onSnapshot, getDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { NetworkStatus } from '../types/sync';

interface SyncQueueItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  collection: string;
  data: any;
  timestamp: number;
}

class SyncService {
  private db: IDBPDatabase | null = null;
  private networkStatus: NetworkStatus = 'online';
  private syncQueue: SyncQueueItem[] = [];
  private listeners: Map<string, () => void> = new Map();

  constructor() {
    this.initializeDB();
    this.setupNetworkListener();
  }

  private async initializeDB() {
    this.db = await openDB('ortholia-db', 1, {
      upgrade(db) {
        // Create stores for each collection we want to sync
        db.createObjectStore('patients', { keyPath: 'id' });
        db.createObjectStore('syncQueue', { keyPath: 'id' });
        db.createObjectStore('lastSync', { keyPath: 'collection' });
      }
    });
  }

  private setupNetworkListener() {
    window.addEventListener('online', () => {
      this.networkStatus = 'online';
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.networkStatus = 'offline';
    });
  }

  async saveLocally(collection: string, data: any) {
    if (!this.db) return;

    try {
      const timestamp = Date.now();
      await this.db.put(collection, { ...data, updatedAt: timestamp });

      // Add to sync queue if we're offline
      if (this.networkStatus === 'offline') {
        const queueItem: SyncQueueItem = {
          id: `${collection}_${data.id}_${timestamp}`,
          operation: data.id ? 'update' : 'create',
          collection,
          data,
          timestamp
        };
        await this.db.put('syncQueue', queueItem);
      } else {
        // Sync immediately if we're online
        await this.syncToFirestore(collection, data);
      }
    } catch (error) {
      console.error('Error saving locally:', error);
      throw error;
    }
  }

  private async syncToFirestore(collection: string, data: any) {
    try {
      const docRef = doc(db, collection, data.id);
      await setDoc(docRef, {
        ...data,
        updatedAt: Timestamp.fromDate(new Date())
      }, { merge: true });
    } catch (error) {
      console.error('Error syncing to Firestore:', error);
      throw error;
    }
  }

  async processSyncQueue() {
    if (!this.db || this.networkStatus === 'offline') return;

    const queue = await this.db.getAll('syncQueue');
    for (const item of queue) {
      try {
        await this.syncToFirestore(item.collection, item.data);
        await this.db.delete('syncQueue', item.id);
      } catch (error) {
        console.error('Error processing sync queue:', error);
      }
    }
  }

  subscribeToCollection(collection: string, onUpdate: (data: any[]) => void) {
    // Unsubscribe from existing listener if any
    this.unsubscribeFromCollection(collection);

    // Subscribe to Firestore updates
    const q = query(
      collection(db, collection),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (!this.db) return;

      const changes = snapshot.docChanges();
      for (const change of changes) {
        const data = { id: change.doc.id, ...change.doc.data() };

        // Update local database
        await this.db.put(collection, data);
      }

      // Get all local data and notify subscribers
      const localData = await this.db.getAll(collection);
      onUpdate(localData);
    });

    this.listeners.set(collection, unsubscribe);
  }

  unsubscribeFromCollection(collection: string) {
    const unsubscribe = this.listeners.get(collection);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(collection);
    }
  }

  async getLocalData(collection: string): Promise<any[]> {
    if (!this.db) return [];
    return await this.db.getAll(collection);
  }
}

export const syncService = new SyncService();