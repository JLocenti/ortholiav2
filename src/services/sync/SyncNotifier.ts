import { BehaviorSubject, Observable } from 'rxjs';
import { SyncInfo } from './types';

export class SyncNotifier {
  private syncStatus$ = new BehaviorSubject<SyncInfo>({
    status: 'idle',
    lastSync: null,
    pendingChanges: 0
  });

  notify(status: SyncInfo): void {
    this.syncStatus$.next(status);
  }

  getSyncStatus$(): Observable<SyncInfo> {
    return this.syncStatus$.asObservable();
  }

  getCurrentStatus(): SyncInfo {
    return this.syncStatus$.getValue();
  }
}