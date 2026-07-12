import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useHolidayBar } from '../context/HolidayBarContext';

interface Holiday {
  id: string;
  date: string;
  name: string | null;
}

const HolidayBar: React.FC = () => {
  const { setIsHolidayBarVisible } = useHolidayBar();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        setIsLoading(true);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const twoWeeksLater = new Date(today);
        twoWeeksLater.setDate(twoWeeksLater.getDate() + 10);

        const pad = (n: number) => String(n).padStart(2, '0');
        const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
        const twoWeeksStr = `${twoWeeksLater.getFullYear()}-${pad(twoWeeksLater.getMonth() + 1)}-${pad(twoWeeksLater.getDate())}`;

        const { data, error } = await supabase
          .from('holidays')
          .select('*')
          .gte('date', todayStr)
          .lte('date', twoWeeksStr)
          .order('date', { ascending: true });

        if (error) {
          console.error('Error fetching holidays:', error);
          setHolidays([]);
        } else {
          setHolidays(data || []);
        }
      } catch (error) {
        console.error('Unexpected error fetching holidays:', error);
        setHolidays([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHolidays();
  }, []);

  useEffect(() => {
    if (holidays.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % holidays.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [holidays.length]);

  useEffect(() => {
    setIsHolidayBarVisible(isVisible && !isLoading && holidays.length > 0);
  }, [isVisible, isLoading, holidays.length, setIsHolidayBarVisible]);

  if (!isVisible || isLoading || holidays.length === 0) {
    return null;
  }

  const currentHoliday = holidays[currentIndex];
  const date = new Date(currentHoliday.date + 'T00:00:00');
  const dateStr = date.toLocaleDateString('fi-FI', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 shadow-lg">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-bold text-sm sm:text-base truncate">
                {currentHoliday.name ? `${currentHoliday.name} (${dateStr})` : `Suljettu: ${dateStr}`}
              </span>
            </div>
            {holidays.length > 1 && (
              <span className="text-xs font-semibold flex-shrink-0 ml-2">
                {currentIndex + 1}/{holidays.length}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 p-1 hover:bg-yellow-500 rounded transition-colors"
            aria-label="Close notification"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HolidayBar;
