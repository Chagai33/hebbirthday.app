import React, { useState } from 'react';
import { Plus, Upload, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FloatingDockProps {
  onAdd: () => void;
  onImport: () => void;
  onTextImport: () => void;
  hidden?: boolean;
}

export const FloatingDock: React.FC<FloatingDockProps> = ({
  onAdd,
  onImport,
  onTextImport,
  hidden = false,
}) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  // Determine position based on language
  // Hebrew (RTL): left-6, English (LTR): right-6
  const isHebrew = i18n.language === 'he';
  const positionClass = isHebrew ? 'left-6' : 'right-6';
  const menuAlignClass = isHebrew ? 'left-[0.5rem]' : 'right-[0.5rem]';

  // Order: Add (Bottom), Import, Text Import (Top)
  const menuItems = [
    { 
        id: 'add',
        icon: Plus, 
        label: t('birthday.addBirthday'), 
        onClick: onAdd, 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
    },
    { 
        id: 'import',
        icon: Upload, 
        label: t('birthday.importCSV'), 
        onClick: onImport, 
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
    },
    { 
        id: 'textImport',
        icon: FileText, 
        label: t('birthday.pasteImport'), 
        onClick: onTextImport, 
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
    }
  ];

  if (hidden) {
    return null;
  }

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <>
        {/* Backdrop to close menu when clicking outside */}
        {isOpen && (
            <div 
                className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-30 sm:hidden"
                onClick={() => setIsOpen(false)}
            />
        )}

        <div className={`fixed bottom-6 ${positionClass} z-40 sm:hidden flex flex-col-reverse items-center gap-4`}>
        {/* Main Toggle Button */}
        <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-4 rounded-full shadow-xl transition-all duration-300 z-40 border 
            ${isOpen 
                ? 'bg-white text-gray-600 rotate-45 border-gray-200 ring-0' 
                : 'bg-white text-blue-600 border-blue-600 ring-4 ring-blue-100 hover:bg-blue-50 animate-pulse-scale'
            }
            `}
            aria-label={isOpen ? t('common.close') : t('common.actions')}
        >
            {isOpen ? (
                <Plus className="w-6 h-6" /> 
            ) : (
                <Plus className="w-6 h-6 stroke-[2.5]" />
            )}
        </button>

        {/* Menu Items */}
        <div 
            className={`flex flex-col-reverse gap-3 absolute bottom-full mb-6 transition-all duration-200 ${isHebrew ? 'left-2' : 'right-2'}
            ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}
            style={{ paddingBottom: '1rem' }}
        >
            {menuItems.map((item) => (
            <div key={item.id} className={`flex items-center gap-3 group w-max ${isHebrew ? '' : 'flex-row-reverse'}`}>
                 {/* Icon Button */}
                <button
                    onClick={() => handleAction(item.onClick)}
                    className={`p-3 rounded-full shadow-lg border transition-all duration-200 hover:scale-110 active:scale-95 backdrop-blur-md bg-white/90 border-white/50`}
                    aria-label={item.label}
                >
                    {item.isCustomIcon ? (
                        <item.icon className="w-5 h-5" />
                    ) : (
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                    )}
                </button>

                {/* Label - Clickable */}
                <button
                    onClick={() => handleAction(item.onClick)} 
                    className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm border border-white/40 text-sm font-medium text-gray-800 whitespace-nowrap hover:bg-white/95 transition-colors cursor-pointer text-left"
                >
                    {item.label}
                </button>
            </div>
            ))}
        </div>
        </div>
    </>
  );
};
