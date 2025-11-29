import React, { useState, useRef, useEffect, createContext, useContext } from 'react';

// Context to manage exclusive tooltip visibility
interface TooltipContextType {
  activeTooltipId: string | null;
  setActiveTooltipId: (id: string | null) => void;
}

const TooltipContext = createContext<TooltipContextType>({
  activeTooltipId: null,
  setActiveTooltipId: () => {},
});

export const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setActiveTooltipId(null);
    // Capture phase to ensure it runs before other click handlers if needed, 
    // but standard bubble phase is usually fine if stopPropagation is used correctly.
    // Using standard listener on window to catch clicks anywhere.
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <TooltipContext.Provider value={{ activeTooltipId, setActiveTooltipId }}>
      {children}
    </TooltipContext.Provider>
  );
};

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  theme?: 'light' | 'dark' | 'blue' | 'purple';
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, className = '', theme = 'light' }) => {
  // Generate a random ID for this tooltip instance if not provided
  const id = useRef(Math.random().toString(36).substr(2, 9)).current;
  const { activeTooltipId, setActiveTooltipId } = useContext(TooltipContext);
  
  const isVisible = activeTooltipId === id;
  
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const showTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveTooltipId(id);
  };

  const hideTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      // Only clear if we are the active one
      if (activeTooltipId === id) {
        setActiveTooltipId(null);
      }
    }, 100);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isTouchDevice) {
      e.stopPropagation(); // Stop bubbling to prevent the window listener from immediately closing it
      if (isVisible) {
        setActiveTooltipId(null);
      } else {
        setActiveTooltipId(id);
      }
    }
  };

  const handleMouseEnter = () => {
    if (!isTouchDevice) {
      showTooltip();
    }
  };

  const handleMouseLeave = () => {
    if (!isTouchDevice) {
      hideTooltip();
    }
  };

  const getThemeClasses = () => {
    switch (theme) {
      case 'dark':
        return 'bg-gray-900 text-white border-gray-900';
      case 'blue':
        return 'bg-blue-50 text-blue-900 border-blue-200';
      case 'purple':
        return 'bg-purple-50 text-purple-900 border-purple-200';
      case 'light':
      default:
        return 'bg-white text-slate-700 border-slate-200';
    }
  };

  const getArrowColorClass = () => {
    switch (theme) {
      case 'dark':
        return 'border-t-gray-900';
      case 'blue':
        return 'border-t-blue-50'; // Using background color for arrow blend
      case 'purple':
        return 'border-t-purple-50'; // Using background color for arrow blend
      case 'light':
      default:
        return 'border-t-white';
    }
  };

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs rounded-lg shadow-xl whitespace-nowrap pointer-events-none animate-fade-in border ${getThemeClasses()}`}>
            {content}
            {/* Triangle arrow */}
            <div className={`absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent drop-shadow-sm ${getArrowColorClass()}`} />
        </div>
      )}
    </div>
  );
};
