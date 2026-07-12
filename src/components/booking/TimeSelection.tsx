import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Clock, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { BookingData } from './BookingFlow'

interface TimeSelectionProps {
  bookingData: BookingData
  onDateSelect: (date: string) => void
  onTimeSelect: (time: string) => void
}

interface Availability {
  id: string
  date: string
  start_time: string
  end_time: string
  is_booked: boolean
  staff_id: string
}

interface Booking {
  id: string
  service_id: string
  booking_date: string
  booking_time: string
  end_at_time: string
  status: string
  total_duration_minutes: number
}

// Define operating hours for each day of the week
const OPERATING_HOURS = {
  0: null, // Sunday - Closed
  1: { start: '10:00', end: '18:00' }, // Monday
  2: { start: '10:00', end: '18:00' }, // Tuesday
  3: { start: '10:00', end: '18:00' }, // Wednesday
  4: { start: '10:00', end: '18:00' }, // Thursday
  5: { start: '10:00', end: '18:00' }, // Friday
  6: { start: '10:00', end: '17:00' }, // Saturday
}

const TimeSelection: React.FC<TimeSelectionProps> = ({
  bookingData,
  onDateSelect,
  onTimeSelect,
}) => {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [availableSlots, setAvailableSlots] = useState<{ [key: string]: string[] }>({})
  const [loadingSlots, setLoadingSlots] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [expandedDay, setExpandedDay] = useState<string | null>(null)

  // Helper functions for time calculations
  const timeToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number)
    return hours * 60 + minutes
  }

  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  // Generate week dates
  const getWeekDates = (startDate: Date) => {
    const dates = []
    const start = new Date(startDate)
    start.setDate(start.getDate() - start.getDay() + 1) // Start from Monday

    for (let i = 0; i < 7; i++) {
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const fetchAndCalculateAvailableSlots = async () => {
    if (!bookingData.selectedService) return

    setLoadingSlots(true)
    setFetchError(null) // Clear previous errors
    
    try {
      // Calculate total duration including add-ons
      const totalDuration = bookingData.selectedService.duration_minutes + 
        bookingData.selectedAddOns.reduce((sum, addOn) => sum + addOn.duration_minutes, 0)
      
      const weekDates = getWeekDates(currentWeek)
      const startDate = weekDates[0].toISOString().split('T')[0]
      const endDate = weekDates[6].toISOString().split('T')[0]

      //console.log('Total Service Duration:', totalDuration)
      //console.log('Fetching data from:', startDate, 'to', endDate)

      // Fetch existing bookings for the week
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, booking_date, booking_time, end_at_time, status, total_duration_minutes')
        .gte('booking_date', startDate)
        .lte('booking_date', endDate)
        .in('status', ['pending', 'confirmed'])

      if (bookingsError) throw bookingsError
      //console.log('Fetched Bookings:', bookings)

      // Fetch unavailable blocks from availability table (where is_booked = true)
      const { data: unavailableBlocks, error: availabilityError } = await supabase
        .from('availability')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .eq('is_booked', true)

      if (availabilityError) throw availabilityError
      //console.log('Fetched Unavailable Blocks:', unavailableBlocks)

      // Calculate available slots for each day
      const calculatedSlots: { [key: string]: string[] } = {}

      weekDates.forEach(date => {
        const dateString = date.toISOString().split('T')[0]
        const dayOfWeek = date.getDay()
        
        //console.log(`--- Processing Date: ${dateString} (Day ${dayOfWeek}) ---`)
        
        // Get operating hours for this day
        const dayOperatingHours = OPERATING_HOURS[dayOfWeek as keyof typeof OPERATING_HOURS]
        
        if (!dayOperatingHours) {
          //console.log('  Day is closed')
          calculatedSlots[dateString] = []
          return
        }

        //console.log(`  Operating hours: ${dayOperatingHours.start} - ${dayOperatingHours.end}`)

        const dayStartMinutes = timeToMinutes(dayOperatingHours.start)
        const dayEndMinutes = timeToMinutes(dayOperatingHours.end)

        // Get existing bookings for this date
        const dayBookings = (bookings || []).filter(
          (booking: Booking) => booking.booking_date === dateString
        )
        
        // Get unavailable blocks for this date
        const dayUnavailableBlocks = (unavailableBlocks || []).filter(
          (block: Availability) => block.date === dateString
        )

        //console.log('  Day Bookings:', dayBookings)
        //console.log('  Day Unavailable Blocks:', dayUnavailableBlocks)

        const daySlots: string[] = []

        // Generate potential slots every 15 minutes within operating hours
        for (let slotStart = dayStartMinutes; slotStart < dayEndMinutes; slotStart += 15) {
          const slotEnd = slotStart + totalDuration

          // Check if the slot fits within operating hours
          if (slotEnd > dayEndMinutes) {
            //console.log(`    Slot ${minutesToTime(slotStart)}-${minutesToTime(slotEnd)} extends //beyond operating hours. Skipping.`)
            //continue
          }

          // Check for conflicts with existing bookings
          let hasBookingConflict = false
          
          for (const booking of dayBookings) {
            const bookingStartMinutes = timeToMinutes(booking.booking_time)
            
            // Handle cases where end_at_time might be null (for existing bookings)
            let bookingEndMinutes: number
            if (booking.end_at_time) {
              bookingEndMinutes = timeToMinutes(booking.end_at_time)
            } else if (booking.total_duration_minutes) {
              // Fallback: calculate end time from start time + duration
              bookingEndMinutes = bookingStartMinutes + booking.total_duration_minutes
            } else {
              // Skip this booking if we can't determine its end time
              //console.log(`      Skipping booking ${booking.id} - no end_at_time or total_duration_minutes`)
              //continue
            }

            // Check if there's an overlap
            if (slotStart < bookingEndMinutes && slotEnd > bookingStartMinutes) {
              hasBookingConflict = true
              const endTimeDisplay = booking.end_at_time || minutesToTime(bookingEndMinutes)
              //console.log(`      Booking conflict for slot ${minutesToTime(slotStart)}-${minutesToTime(slotEnd)} with booking ${booking.booking_time}-${endTimeDisplay}`)
              break
            }
          }

          // Check for conflicts with unavailable blocks
          let hasUnavailableConflict = false
          
          for (const block of dayUnavailableBlocks) {
            const blockStartMinutes = timeToMinutes(block.start_time)
            const blockEndMinutes = timeToMinutes(block.end_time)

            // Check if there's an overlap
            if (slotStart < blockEndMinutes && slotEnd > blockStartMinutes) {
              hasUnavailableConflict = true
              //console.log(`      Unavailable block conflict for slot ${minutesToTime(slotStart)}-${minutesToTime(slotEnd)} with block ${block.start_time}-${block.end_time}`)
              break
            }
          }

          // If no conflicts, add this slot
          if (!hasBookingConflict && !hasUnavailableConflict) {
            daySlots.push(minutesToTime(slotStart))
            //console.log(`    Adding available slot: ${minutesToTime(slotStart)}`)
          }
        }

        calculatedSlots[dateString] = daySlots.sort()
        //console.log(`  Final calculated slots for ${dateString}:`, calculatedSlots[dateString])
      })

      setAvailableSlots(calculatedSlots)
      
      // Set default expanded day to first day with available slots, or first day of week
      const firstDayWithSlots = weekDates.find(date => {
        const dateString = date.toISOString().split('T')[0]
        return calculatedSlots[dateString] && calculatedSlots[dateString].length > 0
      })
      
      if (firstDayWithSlots) {
        setExpandedDay(firstDayWithSlots.toISOString().split('T')[0])
      } else {
        setExpandedDay(weekDates[0].toISOString().split('T')[0])
      }
    } catch (error) {
      console.error('Error fetching availability:', error)
      setFetchError('Ajanvarausaikojen lataaminen epäonnistui. Tarkista verkkoyhteytesi tai yritä uudelleen myöhemmin.')
      // Fallback to empty slots on error
      const weekDates = getWeekDates(currentWeek)
      const fallbackSlots: { [key: string]: string[] } = {}
      weekDates.forEach(date => {
        fallbackSlots[date.toISOString().split('T')[0]] = []
      })
      setAvailableSlots(fallbackSlots)
    } finally {
      setLoadingSlots(false)
    }
  }

  useEffect(() => {
    fetchAndCalculateAvailableSlots()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWeek, bookingData.selectedService?.duration_minutes, bookingData.selectedAddOns])

  const weekDates = getWeekDates(currentWeek)
  const dayNames = ['MA', 'TI', 'KE', 'TO', 'PE', 'LA', 'SU']

  const formatDate = (date: Date) => {
    return `${date.getDate()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.`
  }

  const formatWeekHeader = (date: Date) => {
    const monthNames = [
      'TAMMIKUU', 'HELMIKUU', 'MAALISKUU', 'HUHTIKUU', 'TOUKOKUU', 'KESÄKUU',
      'HEINÄKUU', 'ELOKUU', 'SYYSKUU', 'LOKAKUU', 'MARRASKUU', 'JOULUKUU'
    ]
    const month = monthNames[date.getMonth()]
    const year = date.getFullYear()
    return `${month} ${year}`
  }


  const nextWeek = () => {
    const next = new Date(currentWeek)
    next.setDate(next.getDate() + 7)
    setCurrentWeek(next)
  }

  const prevWeek = () => {
    const prev = new Date(currentWeek)
    prev.setDate(prev.getDate() - 7)
    setCurrentWeek(prev)
  }

  const handleTimeSlotSelect = (dateString: string, time: string) => {
    onDateSelect(dateString)
    onTimeSelect(time)
    // Keep the day expanded after selection - only collapse when clicking day header or another day
  }

  const getAvailabilityText = (slots: string[], isPast: boolean, isToday: boolean, isClosed: boolean, isLoading: boolean, hasError: boolean) => {
    if (isPast) return 'Mennyt päivä'
    if (isToday) return 'Ei saman päivän varauksia'
    if (isClosed) return 'Suljettu'
    if (isLoading) return 'Ladataan...'
    if (hasError) return 'Lataus epäonnistui'
    if (slots.length === 0) return 'Ei vapaita aikoja'
    return `${slots.length} vapaata aikaa`
  }

  return (
    <div>
      {/* Header with back button and title */}
      <div className="pb-4">

        {bookingData.selectedService && (
          <div className="sticky top-0 z-10 bg-orange-50 border border-orange-200 rounded-xl p-4">
            <p className="text-orange-800">
              <span className="font-semibold">Valittu palvelu:</span> {bookingData.selectedService.name}
              {bookingData.selectedAddOns.length > 0 && (
                <span className="ml-2">
                  + {bookingData.selectedAddOns.map(addOn => addOn.name).join(', ')}
                </span>
              )}
              <span className="ml-2 text-sm">
                ({bookingData.selectedService.duration_minutes + 
                  bookingData.selectedAddOns.reduce((sum, addOn) => sum + addOn.duration_minutes, 0)} min)
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Error Display */}
      {fetchError && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">!</span>
            </div>
            <div>
              <h4 className="font-bold text-red-800 text-sm">Aikojen lataus epäonnistui</h4>
              <p className="text-red-700 text-sm">{fetchError}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setFetchError(null)
              fetchAndCalculateAvailableSlots()
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
          >
            Yritä uudelleen
          </button>
        </div>
      )}

      {/* Calendar Header */}
      <div className="bg-gray-700 text-white p-2 sm:p-4 rounded-t-2xl flex items-center justify-between">
        <button onClick={prevWeek} className="p-2 hover:bg-gray-600 rounded-full">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h4 className="text-sm sm:text-[14px] font-bold">{formatWeekHeader(currentWeek)}</h4>
        <button onClick={nextWeek} className="p-2 hover:bg-gray-600 rounded-full">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Calendar - Expandable Days */}
      <div className="block sm:hidden">
        <div className="space-y-3">
          {weekDates.map((date, index) => {
            const dateString = date.toISOString().split('T')[0]
            const slots = availableSlots[dateString] || []
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const dateOnly = new Date(date)
            dateOnly.setHours(0, 0, 0, 0)
            const isPast = dateOnly < today
            const isToday = dateOnly.getTime() === today.getTime()
            const dayOfWeek = date.getDay()
            const isClosed = !OPERATING_HOURS[dayOfWeek as keyof typeof OPERATING_HOURS]
            const isExpanded = expandedDay === dateString
            const availabilityText = getAvailabilityText(slots, isPast, isToday, isClosed, loadingSlots, !!fetchError)

            return (
              <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Day Header */}
                <button
                  onClick={() => setExpandedDay(isExpanded ? null : dateString)}
                  className={`w-full p-4 flex items-center justify-between transition-colors ${
                    isPast || isToday || isClosed
                      ? 'bg-gray-50 cursor-not-allowed'
                      : 'hover:bg-gray-50 active:bg-gray-100'
                  }`}
                  disabled={isPast || isToday || isClosed}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-left">
                      <div className="font-bold text-gray-900 text-lg">
                        {dayNames[index]}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(date)}
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${
                      isPast || isClosed
                        ? 'text-gray-400'
                        : isToday
                          ? 'text-blue-600'
                        : slots.length > 0
                          ? 'text-green-600'
                          : 'text-gray-500'
                    }`}>
                      {availabilityText}
                    </div>
                  </div>

                  {!isPast && !isToday && !isClosed && (
                    <div className="flex items-center">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  )}
                </button>

                {/* Expanded Time Slots */}
                {isExpanded && !isPast && !isToday && !isClosed && (
                  <div className="border-t border-gray-200 p-4">
                    {loadingSlots ? (
                      <div className="text-center py-8">
                        <Loader2 className="w-6 h-6 mx-auto mb-2 opacity-50 animate-spin" />
                        <p className="text-sm text-gray-500">Ladataan aikoja...</p>
                      </div>
                    ) : fetchError ? (
                      <div className="text-center py-8">
                        <p className="text-sm text-gray-500">Lataus epäonnistui</p>
                      </div>
                    ) : slots.length === 0 ? (
                      <div className="text-center py-8">
                        <Clock className="w-6 h-6 mx-auto mb-2 opacity-50" />
                        <p className="text-sm text-gray-500">Ei vapaita aikoja</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-3">
                        {slots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => handleTimeSlotSelect(dateString, slot)}
                            className={`p-3 text-sm font-medium rounded-lg border transition-all duration-200 ${
                              bookingData.selectedDate === dateString && bookingData.selectedTime === slot
                                ? 'bg-orange-500 text-white border-orange-500'
                                : 'bg-white border-gray-200 hover:border-orange-300 hover:bg-orange-50 active:bg-orange-100'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Desktop Calendar - Original Grid Layout */}
      <div className="hidden sm:block">
        <div className="bg-white border border-gray-200 rounded-b-2xl overflow-hidden">
          <div className="block sm:grid sm:grid-cols-7 border-b border-gray-200">
            {weekDates.map((date, index) => (
              <div key={index} className="w-full sm:w-auto p-1 sm:p-2 md:p-4 text-center border-b sm:border-r border-gray-200 last:border-b-0 sm:last:border-r-0">
                <div className="font-bold text-gray-700 text-xs sm:text-sm md:text-base">{dayNames[index]}</div>
                <div className="text-xs sm:text-sm text-gray-500">{formatDate(date)}</div>
              </div>
            ))}
          </div>

          <div className="block sm:grid sm:grid-cols-7 min-h-[300px] sm:min-h-[400px]">
            {weekDates.map((date, index) => {
              const dateString = date.toISOString().split('T')[0]
              const slots = availableSlots[dateString] || []
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              const dateOnly = new Date(date)
              dateOnly.setHours(0, 0, 0, 0)
              const isPast = dateOnly < today
              const isToday = dateOnly.getTime() === today.getTime()
              const dayOfWeek = date.getDay()
              const isClosed = !OPERATING_HOURS[dayOfWeek as keyof typeof OPERATING_HOURS]

              return (
                <div key={index} className="w-full sm:w-auto border-b sm:border-r border-gray-200 last:border-b-0 sm:last:border-r-0 px-0.5 sm:px-1 py-1 sm:py-2">
                  {isPast ? (
                    <div className="text-center text-gray-400 py-2">
                      <Clock className="w-4 h-4 mx-auto mb-1 opacity-50" />
                      <p className="text-xs">Mennyt päivä</p>
                    </div>
                  ) : isToday ? (
                    <div className="text-center text-blue-500 py-2">
                      <Clock className="w-4 h-4 mx-auto mb-1" />
                      <p className="text-xs font-medium">Ei saman päivän</p>
                      <p className="text-xs font-medium">varauksia</p>
                    </div>
                  ) : isClosed ? (
                    <div className="text-center text-gray-400 py-2">
                      <p className="text-xs">Suljettu</p>
                    </div>
                  ) : loadingSlots ? (
                    <div className="text-center text-gray-400 py-2">
                      <Loader2 className="w-4 h-4 mx-auto mb-1 opacity-50 animate-spin" />
                      <p className="text-xs">Ladataan...</p>
                    </div>
                  ) : fetchError ? (
                    <div className="text-center text-gray-400 py-2">
                      <p className="text-xs">Lataus epäonnistui</p>
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="text-center text-gray-400 py-2">
                      <p className="text-xs">Ei aikoja</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {slots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => {
                            onDateSelect(dateString)
                            onTimeSelect(slot)
                          }}
                          className={`w-full p-2 sm:p-2.5 text-sm rounded-lg border transition-all duration-200 ${
                            bookingData.selectedDate === dateString && bookingData.selectedTime === slot
                              ? 'bg-orange-500 text-white border-orange-500'
                              : 'bg-white border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

    </div>
  )
}

export default TimeSelection