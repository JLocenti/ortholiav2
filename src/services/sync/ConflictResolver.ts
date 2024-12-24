import { ConflictResolution } from './types';

export class ConflictResolver<T extends { updatedAt: string }> {
  constructor(private mergeStrategies: Partial<Record<keyof T, 'local' | 'server' | 'merge'>> = {}) {}

  resolve(local: T, server: T): ConflictResolution<T> {
    const localTimestamp = new Date(local.updatedAt).getTime();
    const serverTimestamp = new Date(server.updatedAt).getTime();

    // Par défaut, on prend la version la plus récente
    if (localTimestamp > serverTimestamp) {
      return {
        localData: local,
        serverData: server,
        resolvedData: local,
        strategy: 'local'
      };
    }

    // Fusion personnalisée basée sur les stratégies définies
    const mergedData = { ...server };
    let hasCustomMerge = false;

    for (const [key, strategy] of Object.entries(this.mergeStrategies)) {
      if (strategy === 'merge') {
        hasCustomMerge = true;
        // Logique de fusion personnalisée pour chaque champ
        if (Array.isArray(local[key as keyof T])) {
          mergedData[key as keyof T] = this.mergeArrays(
            local[key as keyof T] as any[],
            server[key as keyof T] as any[]
          );
        }
      } else if (strategy === 'local') {
        mergedData[key as keyof T] = local[key as keyof T];
      }
    }

    return {
      localData: local,
      serverData: server,
      resolvedData: hasCustomMerge ? mergedData : server,
      strategy: hasCustomMerge ? 'merge' : 'server'
    };
  }

  private mergeArrays<U>(local: U[], server: U[]): U[] {
    // Fusion des tableaux en supprimant les doublons
    return Array.from(new Set([...local, ...server]));
  }
}