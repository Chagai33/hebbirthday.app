import React, { createContext, useContext, useState, useEffect } from 'react';

interface GuestNotificationsContextType {
  lastAcknowledged: number;
  markAsRead: () => void;
  isNew: (dateString: string) => boolean;
}

const GuestNotificationsContext = createContext<GuestNotificationsContextType | undefined>(undefined);

export const GuestNotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lastAcknowledged, setLastAcknowledged] = useState<number>(() => {
    const saved = localStorage.getItem('hebbirthday_guest_last_acknowledged');
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem('hebbirthday_guest_last_acknowledged', lastAcknowledged.toString());
  }, [lastAcknowledged]);

  const markAsRead = () => {
    setLastAcknowledged(Date.now());
  };

  const isNew = (dateString: string) => {
    return new Date(dateString).getTime() > lastAcknowledged;
  };

  return (
    <GuestNotificationsContext.Provider value={{ lastAcknowledged, markAsRead, isNew }}>
      {children}
    </GuestNotificationsContext.Provider>
  );
};

export const useGuestNotifications = () => {
  const context = useContext(GuestNotificationsContext);
  if (context === undefined) {
    throw new Error('useGuestNotifications must be used within a GuestNotificationsProvider');
  }
  return context;
};

