import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { networkManager } from '../services/sync/NetworkManager';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(networkManager.isOnline());

  useEffect(() => {
    const subscription = networkManager.getNetworkStatus$().subscribe(status => {
      setIsOnline(status === 'online');
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg shadow-lg">
      <WifiOff className="w-4 h-4" />
      <span className="text-sm font-medium">Mode hors ligne</span>
    </div>
  );
}