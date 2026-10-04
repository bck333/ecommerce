import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

interface LocationContextType {
  pincode: string;
  city: string;
  deliveryTime: string;
  isServiceable: boolean;
  setPincode: (code: string) => Promise<boolean>;
  isLocationModalOpen: boolean;
  openLocationModal: () => void;
  closeLocationModal: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pincode, setPincodeState] = useState<string>(() => localStorage.getItem('delivery_pincode') || '515001');
  const [city, setCity] = useState<string>('Anantapur');
  const [deliveryTime, setDeliveryTime] = useState<string>('10 - 15 mins');
  const [isServiceable, setIsServiceable] = useState<boolean>(true);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(() => !localStorage.getItem('delivery_pincode'));

  const checkPincodeService = async (code: string) => {
    try {
      const res = await api.post<{
        success: boolean;
        data: { serviceable: boolean; city: string; state: string; estimatedDeliveryTime: string };
      }>('/delivery/check', { pincode: code });

      if (res.data.success && res.data.data) {
        setIsServiceable(res.data.data.serviceable);
        if (res.data.data.serviceable) {
          setPincodeState(code);
          setCity(res.data.data.city || 'Anantapur');
          setDeliveryTime(res.data.data.estimatedDeliveryTime || '10 - 15 mins');
          localStorage.setItem('delivery_pincode', code);
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const storedPincode = localStorage.getItem('delivery_pincode');
    if (!storedPincode) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const { latitude, longitude } = pos.coords;
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
                { headers: { 'Accept-Language': 'en' } }
              );
              const data = await res.json();
              if (data && data.address && data.address.postcode) {
                const success = await checkPincodeService(data.address.postcode);
                if (success) {
                  setIsLocationModalOpen(false);
                }
              } else {
                checkPincodeService(pincode);
              }
            } catch (error) {
              console.error('Error reverse geocoding:', error);
              checkPincodeService(pincode);
            }
          },
          (err) => {
            console.warn('Geolocation error:', err);
            checkPincodeService(pincode);
          }
        );
      } else {
        checkPincodeService(pincode);
      }
    } else {
      checkPincodeService(storedPincode);
    }
  }, []);
  return (
    <LocationContext.Provider
      value={{
        pincode,
        city,
        deliveryTime,
        isServiceable,
        setPincode: checkPincodeService,
        isLocationModalOpen,
        openLocationModal: () => setIsLocationModalOpen(true),
        closeLocationModal: () => setIsLocationModalOpen(false),
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used within a LocationProvider');
  return context;
};
