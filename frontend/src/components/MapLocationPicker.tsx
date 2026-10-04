import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Navigation,
  Check,
  X,
  AlertCircle,
  Compass,
  Search,
  ExternalLink,
  Settings,
  Key,
  Layers,
} from 'lucide-react';

export interface LocationResult {
  addressLine1: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
}

interface MapLocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (result: LocationResult) => void;
  initialLat?: number;
  initialLng?: number;
}

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  initialLat = 14.6819, // Default: Anantapur/AP center or user coordinates
  initialLng = 77.6006,
}) => {
  const [lat, setLat] = useState<number>(initialLat);
  const [lng, setLng] = useState<number>(initialLng);
  const [loading, setLoading] = useState(false);
  const [locatingGPS, setLocatingGPS] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Address details parsed from geocoding
  const [addressLine1, setAddressLine1] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Anantapur');
  const [state, setState] = useState('Andhra Pradesh');
  const [pincode, setPincode] = useState('515001');

  // Google Maps API Key
  const [apiKey, setApiKey] = useState<string>(() => {
    return (
      (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
      localStorage.getItem('google_maps_api_key') ||
      ''
    );
  });
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isGoogleMapLoaded, setIsGoogleMapLoaded] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialLat && initialLng) {
        setLat(initialLat);
        setLng(initialLng);
        reverseGeocode(initialLat, initialLng);
      } else {
        handleUseGPS();
      }
    }
  }, [isOpen]);

  // Load Google Maps script if key exists
  useEffect(() => {
    if (!isOpen || !apiKey.trim() || !(window as any).google?.maps) {
      if (apiKey.trim() && isOpen && !(window as any).google?.maps) {
        const scriptId = 'google-maps-script';
        if (!document.getElementById(scriptId)) {
          const script = document.createElement('script');
          script.id = scriptId;
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey.trim()}&libraries=places`;
          script.async = true;
          script.defer = true;
          script.onload = () => {
            setIsGoogleMapLoaded(true);
            initGoogleMap(lat, lng);
          };
          script.onerror = () => {
            console.warn('Failed to load Google Maps script with provided key');
          };
          document.head.appendChild(script);
        } else {
          setIsGoogleMapLoaded(true);
        }
      }
      return;
    }

    if ((window as any).google?.maps) {
      setIsGoogleMapLoaded(true);
      initGoogleMap(lat, lng);
    }
  }, [isOpen, apiKey]);

  const initGoogleMap = (centerLat: number, centerLng: number) => {
    if (!mapRef.current || !(window as any).google?.maps) return;

    try {
      const google = (window as any).google;
      const center = { lat: centerLat, lng: centerLng };

      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom: 16,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      const marker = new google.maps.Marker({
        position: center,
        map,
        draggable: true,
        animation: google.maps.Animation.DROP,
        title: 'Drop Location',
      });

      marker.addListener('dragend', () => {
        const pos = marker.getPosition();
        if (pos) {
          const newLat = pos.lat();
          const newLng = pos.lng();
          setLat(newLat);
          setLng(newLng);
          reverseGeocode(newLat, newLng);
        }
      });

      map.addListener('click', (e: any) => {
        if (e.latLng) {
          const newLat = e.latLng.lat();
          const newLng = e.latLng.lng();
          marker.setPosition(e.latLng);
          setLat(newLat);
          setLng(newLng);
          reverseGeocode(newLat, newLng);
        }
      });

      googleMapInstance.current = map;
      markerInstance.current = marker;
    } catch (err) {
      console.error('Error initializing Google Map', err);
    }
  };

  const handleSaveApiKey = (key: string) => {
    setApiKey(key.trim());
    localStorage.setItem('google_maps_api_key', key.trim());
    setShowKeyInput(false);
  };

  // Reverse geocoding (OpenStreetMap Nominatim fallback + Google Maps if key present)
  const reverseGeocode = async (latitude: number, longitude: number) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. If Google Maps API is loaded, use Google Geocoder
      if ((window as any).google?.maps?.Geocoder) {
        const geocoder = new (window as any).google.maps.Geocoder();
        const response = await geocoder.geocode({
          location: { lat: latitude, lng: longitude },
        });

        if (response.results && response.results.length > 0) {
          const result = response.results[0];
          setAddressLine1(result.formatted_address || '');

          for (const comp of result.address_components) {
            if (comp.types.includes('postal_code')) {
              setPincode(comp.long_name);
            }
            if (comp.types.includes('locality')) {
              setCity(comp.long_name);
            }
            if (comp.types.includes('administrative_area_level_1')) {
              setState(comp.long_name);
            }
            if (comp.types.includes('sublocality') || comp.types.includes('neighborhood')) {
              setLandmark(comp.long_name);
            }
          }
          setLoading(false);
          return;
        }
      }

      // 2. Fallback to OpenStreetMap Reverse Geocoder
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      );
      const data = await res.json();

      if (data && data.address) {
        const addr = data.address;
        const street =
          addr.road ||
          addr.suburb ||
          addr.neighbourhood ||
          addr.residential ||
          addr.building ||
          data.display_name.split(',')[0];
        const nearLandmark = addr.landmark || addr.suburb || addr.neighbourhood || '';
        const cityName = addr.city || addr.town || addr.village || addr.county || 'Anantapur';
        const stateName = addr.state || 'Andhra Pradesh';
        const postCode = addr.postcode || '515001';

        setAddressLine1(street || data.display_name);
        setLandmark(nearLandmark);
        setCity(cityName);
        setState(stateName);
        setPincode(postCode);
      }
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get current GPS Location via HTML5 Geolocation API
  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser');
      return;
    }

    setLocatingGPS(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const currentLat = pos.coords.latitude;
        const currentLng = pos.coords.longitude;
        setLat(currentLat);
        setLng(currentLng);
        setLocatingGPS(false);

        // Center Google Map if loaded
        if (googleMapInstance.current && markerInstance.current) {
          const latLng = new (window as any).google.maps.LatLng(currentLat, currentLng);
          googleMapInstance.current.setCenter(latLng);
          markerInstance.current.setPosition(latLng);
        }

        reverseGeocode(currentLat, currentLng);
      },
      (err) => {
        setLocatingGPS(false);
        console.warn('Geolocation error:', err);
        if (err.code === 1) {
          setErrorMsg('Location permission was denied. Please allow GPS access in your browser.');
        } else {
          setErrorMsg('Could not fetch GPS location. Please pinpoint location on map.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleConfirm = () => {
    if (!addressLine1.trim()) {
      setErrorMsg('Please specify address line or pinpoint on map');
      return;
    }

    onSelectLocation({
      addressLine1: addressLine1.trim(),
      landmark: landmark.trim() || undefined,
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      latitude: lat,
      longitude: lng,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Select Delivery Location</h3>
              <p className="text-xs text-slate-500">Accurate GPS pinpoint for 10-minute instant dropoff</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
              title="Google Maps API Key Settings"
            >
              <Key className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Optional Google Maps API Key input dialog */}
        {showKeyInput && (
          <div className="p-3 bg-slate-50 border-b border-slate-100 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-emerald-600" />
                Google Maps API Key Configuration
              </span>
              <span className="text-[11px] text-slate-400">Optional</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy... Enter your Google Maps JavaScript API key"
                className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => handleSaveApiKey(apiKey)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs"
              >
                Save Key
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              If left blank, accurate GPS location with high-precision OpenStreetMap reverse geocoding is used automatically.
            </p>
          </div>
        )}

        {/* Map View Container */}
        <div className="relative h-64 sm:h-72 w-full bg-slate-100 overflow-hidden">
          {/* If Google Maps is loaded with key */}
          {apiKey.trim() ? (
            <div ref={mapRef} className="w-full h-full" />
          ) : (
            /* OpenStreetMap / Interactive GPS View */
            <div className="w-full h-full relative flex items-center justify-center bg-slate-100">
              <iframe
                title="GPS Map Location"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.005}%2C${
                  lat - 0.005
                }%2C${lng + 0.005}%2C${lat + 0.005}&layer=mapnik&marker=${lat}%2C${lng}`}
                className="w-full h-full border-0 pointer-events-auto"
              />
              {/* Center Map Marker pin */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-10 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xl ring-4 ring-white animate-bounce">
                  <MapPin className="w-6 h-6 fill-white" />
                </div>
                <div className="w-2.5 h-1 bg-black/30 rounded-full blur-[1px]"></div>
              </div>
            </div>
          )}

          {/* Quick "Use My Current GPS Location" overlay button */}
          <button
            onClick={handleUseGPS}
            disabled={locatingGPS}
            className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-2 bg-white/95 hover:bg-white text-slate-800 rounded-xl shadow-lg border border-slate-200/80 text-xs font-bold transition hover:scale-105 active:scale-95"
          >
            <Navigation className={`w-3.5 h-3.5 text-emerald-600 ${locatingGPS ? 'animate-spin' : ''}`} />
            <span>{locatingGPS ? 'Detecting GPS...' : 'Use Current Location'}</span>
          </button>

          {/* Coordinates chip */}
          <div className="absolute bottom-3 left-3 z-20 px-2.5 py-1 bg-slate-900/80 backdrop-blur-xs text-white rounded-lg text-[11px] font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              {lat.toFixed(5)}° N, {lng.toFixed(5)}° E
            </span>
          </div>
        </div>

        {/* Form Details */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Building / Flat / Street Name *
            </label>
            <input
              type="text"
              required
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="e.g. Flat 401, Green Meadows, 5th Cross"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Nearby Landmark / Area
            </label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. Opposite Community Hall"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                City *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                State *
              </label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Pincode *
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50">
          <a
            href={`https://www.google.com/maps?q=${lat},${lng}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-700 font-medium"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Verify on Google Maps</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirm Location</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
