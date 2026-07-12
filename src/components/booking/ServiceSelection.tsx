import React, { useState, useEffect, useRef } from 'react'
import { Scissors, Baby, Wrench, Zap, Star } from 'lucide-react'
import { supabase, Service } from '../../lib/supabase'

interface ServiceSelectionProps {
  selectedService: Service | null
  selectedAddOns: Service[]
  onServiceSelect: (service: Service) => void
  onAddOnToggle: (addOn: Service) => void
  onNext: () => void
}

const ServiceSelection: React.FC<ServiceSelectionProps> = ({
  selectedService,
  selectedAddOns,
  onServiceSelect,
  onAddOnToggle,
}) => {
  const [mainServices, setMainServices] = useState<Service[]>([])
  const serviceRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const servicesContainerRef = useRef<HTMLDivElement>(null)
  const [hairAddOns, setHairAddOns] = useState<Service[]>([])
  const [beardAddOns, setBeardAddOns] = useState<Service[]>([])
  const [generalAddOns, setGeneralAddOns] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    fetchServices()
  }, [])

  // Scroll selected service into view when add-ons are revealed
  useEffect(() => {
    if (selectedService && serviceRefs.current.has(selectedService.id)) {
      const serviceElement = serviceRefs.current.get(selectedService.id);
      if (serviceElement) {
        setTimeout(() => {
          serviceElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest',
            inline: 'nearest'
          });
        }, 100); // Small delay to ensure DOM has updated
      }
    }
  }, [selectedService]);

  const fetchServices = async () => {
    try {
      setFetchError(null) // Clear previous errors
      const { data, error } = await supabase
        .from('services')
        .select('id, name, discerption, price, duration_minutes, category, is_active, add_on_type')
        .eq('is_active', true)
        .order('add_on_type', { ascending: true })

      //console.log("data from fetchServices: ", data)
      if (error) throw error
      
      const allServices = data || []
      
      // Categorize services based on add_on_type
      const mainSelectableServices = allServices.filter(service => 
        service.add_on_type === 'hair_add_on' || 
        service.add_on_type === 'beard_add_on' || 
        service.add_on_type === 'kid_add_on'
      )
      
      const hairAddOnServices = allServices.filter(service => 
        service.add_on_type === 'hair_add_on'
      )
      
      const beardAddOnServices = allServices.filter(service => 
        service.add_on_type === 'beard_add_on'
      )
      
      const generalAddOnServices = allServices.filter(service => 
        service.add_on_type === 'general_add_on'
      )
      
      setMainServices(mainSelectableServices)
      setHairAddOns(hairAddOnServices)
      setBeardAddOns(beardAddOnServices)
      setGeneralAddOns(generalAddOnServices)
    } catch (error) {
      console.error('Error fetching services:', error)
      setFetchError('Palveluiden lataaminen epäonnistui. Tarkista verkkoyhteytesi tai yritä uudelleen myöhemmin.')
    } finally {
      setLoading(false)
    }
  }

  const getServiceIcon = (serviceName: string) => {
    if (serviceName.toLowerCase().includes('lapsi') || serviceName.toLowerCase().includes('5-7')) {
      return <Baby className="w-6 h-6 text-orange-500" />
    }
    if (serviceName.toLowerCase().includes('parta') || serviceName.toLowerCase().includes('razor')) {
      return <Wrench className="w-6 h-6 text-orange-500" />
    }
    if (serviceName.toLowerCase().includes('kone') && !serviceName.toLowerCase().includes('saksi')) {
      return <Zap className="w-6 h-6 text-orange-500" />
    }
    if (serviceName.toLowerCase().includes('muotoilu') || serviceName.toLowerCase().includes('hiusraja')) {
      return <Star className="w-6 h-6 text-orange-500" />
    }
    return <Scissors className="w-6 h-6 text-orange-500" />
  }

  // Determine which add-ons to display based on selected service
  const getDisplayableAddOns = () => {
    if (!selectedService) return []
    
    let displayableAddOns: Service[] = []
    
    // Always include general add-ons (like hair wash)
    displayableAddOns = [...generalAddOns]
    
    // Add specific add-ons based on main service type
    if (selectedService.add_on_type === 'hair_add_on') {
      // For hair services, show beard add-ons
      displayableAddOns = [...displayableAddOns, ...beardAddOns]
    } else if (selectedService.add_on_type === 'beard_add_on') {
      // For beard services, show hair add-ons
      displayableAddOns = [...displayableAddOns, ...hairAddOns]
    } else if (selectedService.add_on_type === 'kid_add_on') {
      // For kid services, show only general add-ons (no hair or beard add-ons)
      // displayableAddOns already contains generalAddOns, so no additional services needed
    }
    
    // Filter out the selected service itself from add-ons
    displayableAddOns = displayableAddOns.filter(addOn => addOn.id !== selectedService.id)
    
   // console.log('Selected service type:', selectedService.add_on_type)
    //console.log('Displayable add-ons:', displayableAddOns.map(a => `${a.name} (${a.add_on_type})`))
    
    return displayableAddOns
  }

  const handleServiceClick = (service: Service) => {
    if (selectedService?.id === service.id) {
      // If clicking on already selected service, deselect it
      onServiceSelect(null as unknown as Service)
    } else {
      // Otherwise, select the new service
      onServiceSelect(service)
    }
  }
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gray-50 rounded-2xl p-4 sm:p-8 order-1 md:order-1">
          <div className="text-center mb-6 sm:mb-8">
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Huom. Jos et löydä sopivaa aikaa, niin otathan yhteyttä soittamalla. Tervetuloa lämpimästi! Maskin saa liikkeestä myös, jos oma pääsi unohtumaan.
            </p>
          </div>
        </div>

        <div className="order-2 md:order-2">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mr-4">
                <span className="text-white font-bold">!</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-800">Palveluiden lataus epäonnistui</h3>
                <p className="text-red-700 text-sm">{fetchError}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setFetchError(null)
                setLoading(true)
                fetchServices()
              }}
              className="bg-red-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
            >
              Yritä uudelleen
            </button>
          </div>
        </div>
      </div>
    )
  }
  const displayableAddOns = getDisplayableAddOns()

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-gray-50 rounded-2xl p-4 sm:p-8 order-1 md:order-1">

        
        <div className="text-center mb-6 sm:mb-8">
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            Huom. Jos et löydä sopivaa aikaa, niin otathan yhteyttä soittamalla. Tervetuloa lämpimästi! Maskin saa liikkeestä myös, jos oma pääsi unohtumaan.
          </p>
          
        </div>

       
      </div>

      <div className="order-2 md:order-2">
        <div className="flex items-center mb-6">
          <h3 className="text-lg sm:text-[14px] font-bold text-gray-900">Valitse palvelu</h3>
        </div>

        <div ref={servicesContainerRef} className="space-y-4">
          {mainServices.map((service) => (
            <div
              key={service.id}
              ref={(el) => {
                if (el) {
                  serviceRefs.current.set(service.id, el);
                } else {
                  serviceRefs.current.delete(service.id);
                }
              }}
              onClick={() => handleServiceClick(service)}
              className={`bg-white rounded-xl px-4 py-[10px] sm:px-6 sm:py-[16px] border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedService?.id === service.id
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {getServiceIcon(service.name)}
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-[14px] font-bold text-gray-900 mb-0">
                      {service.name}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600">{service.discerption}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <span className="text-base sm:text-[14px] font-black text-orange-500">
                    {service.price}€
                  </span>
                  {selectedService?.id === service.id && (
                    <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center mt-2 ml-auto">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
              {/* Add-on Services Section - appears within the selected service card */}
              {selectedService?.id === service.id && displayableAddOns.length > 0 && (
                <div 
                  className="mt-6 pt-6 border-t border-gray-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h4 className="text-base sm:text-[14px] font-bold text-gray-900 mb-4">Lisäpalvelut</h4>
                  <div className="space-y-3">
                    {displayableAddOns.map((addOn) => {
                      const isSelected = selectedAddOns?.some(item => item.id === addOn.id) ?? false
                      return (
                        <div
                          key={addOn.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            //console.log('Add-on clicked:', addOn.id, addOn.name)
                            onAddOnToggle(addOn)
                          }}
                          className={`bg-gray-50 rounded-lg px-4 py-[8px] sm:px-6 sm:py-[8px] border-2 cursor-pointer transition-all duration-300 hover:shadow-md ${
                            isSelected
                              ? 'border-orange-500 bg-orange-100'
                              : 'border-gray-200 hover:border-orange-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1">
                              <div className="flex-shrink-0">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                  isSelected 
                                    ? 'bg-orange-500 border-orange-500' 
                                    : 'border-gray-300'
                                }`}>
                                  {isSelected && (
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h5 className="text-sm font-semibold text-gray-900">{addOn.name}</h5>
                                <p className="text-xs text-gray-600">{addOn.discerption}</p>
                              </div>
                            </div>
                            <span className="text-base sm:text-[14px] font-bold text-orange-500">
                              +{addOn.price}€
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>


   
      </div>
    </div>
  )
}

export default ServiceSelection