import React, { createContext, useContext, useState } from 'react';

interface HolidayBarContextType {
  isHolidayBarVisible: boolean;
  setIsHolidayBarVisible: (visible: boolean) => void;
}

const HolidayBarContext = createContext<HolidayBarContextType | undefined>(undefined);

export const HolidayBarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isHolidayBarVisible, setIsHolidayBarVisible] = useState(true);
  return (
    <HolidayBarContext.Provider value={{ isHolidayBarVisible, setIsHolidayBarVisible }}>
      {children}
    </HolidayBarContext.Provider>
  );
};

export const useHolidayBar = () => {
  const context = useContext(HolidayBarContext);
  if (!context) {
    throw new Error('useHolidayBar must be used within HolidayBarProvider');
  }
  return context;
};
