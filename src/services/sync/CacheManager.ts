import { openDB, IDBPDatabase } from 'idb';
import { SyncQueueItem } from './types';

export class CacheManager {
  private static readonly DB_NAME = 'ortholia-cache';
  private static readonly DB_VERSION = 1;
  private static readonly MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 jours
  private db: IDBPDatabase | null = null;

  async initialize(): Promise<void> {
    this.db = await openDB(CacheManager.DB_NAME, CacheManager.DB_VERSION, {
      upgrade(db) {
        // Store principal pour les données
        if (!db.objectStoreNames.contains('cache')) {
          const store = db.createObjectStore('cache', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('collection', 'collection');
        }

        // Store pour la file d'attente de synchronisation
        if (!db.objectStoreNames.contains('syncQueue')) {
          const queueStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          queueStore.createIndex('timestamp', 'timestamp');
          queueStore.createIndex('collection', 'collection');
        }
      }
    });
  }

  async set<T>(collection: string, id: string, data: T): Promise<void> {
    if (!this.db) await this.initialize();

    const timestamp = Date.now();
    await this.db!.put('cache', {
      id: `${collection}:${id}`,
      collection,
      data,
      timestamp
    });
  }

  async get<T>(collection: string, id: string): Promise<T | null> {
    if (!this.db) await this.initialize();

    const entry = await this.db!.get('cache', `${collection}:${id}`);
    return entry ? entry.data as T : null;
  }

  async delete(collection: string, id: string): Promise<void> {
    if (!this.db) await this.initialize();
    await this.db!.delete('cache', `${collection}:${id}`);
  }

  async addToSyncQueue<T>(item: SyncQueueItem<T>): Promise<void> {
    if (!this.db) await this.initialize();
    await this.db!.put('syncQueue', item);
  }

  async getSyncQueue<T>(): Promise<SyncQueueItem<T>[]> {
    if (!this.db) await this.initialize();
    return this.db!.getAllFromIndex('syncQueue', 'timestamp');
  }

  async removeSyncQueueItem(id: string): Promise<void> {
    if (!this.db) await this.initialize();
    await this.db!.delete('syncQueue', id);
  }

  async cleanOldCache(): Promise<void> {
    if (!this.db) await this.initialize();

    const now = Date.now();
    const tx = this.db!.transaction('cache', 'readwrite');
    const store = tx.objectStore('cache');
    const index = store.index('timestamp');

    let cursor = await index.openCursor();
    while (cursor) {
      if (now - cursor.value.timestamp > CacheManager.MAX_CACHE_AGE) {
        await cursor.delete();
      }
      cursor = await cursor.continue();
    }
  }

  async invalidateCollection(collection: string): Promise<void> {
    if (!this.db) await this.initialize();

    const tx = this.db!.transaction('cache', 'readwrite');
    const store = tx.objectStore('cache');
    const index = store.index('collection');

    let cursor = await index.openCursor(collection);
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
  }
}