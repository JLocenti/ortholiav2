import { BehaviorSubject } from 'rxjs';
import { NetworkStatus } from './types';
import { auth } from '../../config/firebase.ts';

export class NetworkManager {
  private static instance: NetworkManager | null = null;
  private networkStatus$ = new BehaviorSubject<NetworkStatus>(
    navigator.onLine ? 'online' : 'offline'
  );
  private isAuthenticated = false;

  private constructor() {
    // Écouter les événements de connectivité de base
    window.addEventListener('online', () => this.handleNetworkChange(true));
    window.addEventListener('offline', () => this.handleNetworkChange(false));

    // Écouter l'état d'authentification
    auth.onAuthStateChanged((user) => {
      this.isAuthenticated = !!user;
      this.handleNetworkChange(navigator.onLine);
    });
  }

  static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  private handleNetworkChange(isOnline: boolean): void {
    // Si hors ligne ou non authentifié, utiliser l'état du navigateur
    if (!isOnline || !this.isAuthenticated) {
      this.networkStatus$.next(isOnline ? 'online' : 'offline');
      return;
    }

    // Si en ligne et authentifié, l'état sera mis à jour par les requêtes Firebase normales
    this.networkStatus$.next('online');
  }

  public getNetworkStatus$() {
    return this.networkStatus$.asObservable();
  }

  public getCurrentStatus(): NetworkStatus {
    return this.networkStatus$.getValue();
  }

  public isOnline(): boolean {
    return this.getCurrentStatus() === 'online';
  }
}

export const networkManager = NetworkManager.getInstance();