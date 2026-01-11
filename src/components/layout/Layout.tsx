import React, { useState } from 'react';
import { Header } from './Header';
import { AboutModal } from '../modals/AboutModal';
import { GroupsManagementModal } from '../modals/GroupsManagementModal';
import { LayoutProvider } from '../../contexts/LayoutContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showGroupsModal, setShowGroupsModal] = useState(false);

  return (
    <LayoutProvider value={{ 
      openAboutModal: () => setShowAboutModal(true),
      openGroupsModal: () => setShowGroupsModal(true)
    }}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main id="main-content" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-4 mb-20 sm:mb-0">
          {children}
        </main>
        <AboutModal 
          isOpen={showAboutModal} 
          onClose={() => setShowAboutModal(false)} 
        />
        <GroupsManagementModal
          isOpen={showGroupsModal}
          onClose={() => setShowGroupsModal(false)}
        />
      </div>
    </LayoutProvider>
  );
};
