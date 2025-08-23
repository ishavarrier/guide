import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

export interface LocationAutocompleteProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

declare global {
  interface Window {
    google: any;
  }
}

export function LocationAutocomplete({ 
  className, 
  label, 
  value, 
  onChange, 
  ...props 
}: LocationAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const initAutocomplete = () => {
      console.log('Initializing autocomplete...');
      if (window.google && window.google.maps && window.google.maps.places && inputRef.current) {
        try {
          console.log('Creating Places Autocomplete for input:', inputRef.current);
          
          const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
            types: ['address'],
            fields: ['formatted_address', 'geometry', 'place_id', 'name']
          });

          console.log('Autocomplete object created:', autocomplete);

          autocomplete.addListener('place_changed', () => {
            console.log('Place changed event fired');
            const place = autocomplete.getPlace();
            console.log('Selected place data:', place);
            
            if (place && place.formatted_address) {
              console.log('Setting address:', place.formatted_address);
              onChange(place.formatted_address);
            } else if (place && place.name) {
              console.log('Using place name:', place.name);
              onChange(place.name);
            }
          });

          setIsLoaded(true);
          console.log('Autocomplete setup complete');
        } catch (error) {
          console.error('Error setting up autocomplete:', error);
        }
      } else {
        console.log('Google Maps components check:', {
          google: !!window.google,
          maps: !!(window.google && window.google.maps),
          places: !!(window.google && window.google.maps && window.google.maps.places),
          input: !!inputRef.current
        });
      }
    };

    // Load Google Maps script with API key
    const loadGoogleMaps = () => {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      console.log('API Key available:', !!apiKey);
      
      if (!apiKey) {
        console.error('Google Maps API key not found in environment variables');
        return;
      }

      if (window.google) {
        console.log('Google Maps already loaded, initializing autocomplete');
        initAutocomplete();
        return;
      }

      console.log('Loading Google Maps script...');
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      
      // Set up global callback
      (window as any).initGoogleMaps = () => {
        console.log('Google Maps callback triggered');
        setTimeout(() => {
          console.log('Google Maps script loaded, checking components...');
          console.log('Places available:', !!(window.google && window.google.maps && window.google.maps.places));
          initAutocomplete();
        }, 100);
      };
      
      script.onerror = () => {
        console.error('Failed to load Google Maps script');
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();

    return () => {
      // Cleanup
    };
  }, [onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        className={cn(
          "w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all peer placeholder-transparent",
          className
        )}
        placeholder={label}
        value={value}
        onChange={handleInputChange}
        {...props}
      />
      <label className="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-600 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-primary peer-focus:text-sm transition-all">
        {label}
      </label>
      <MapPin className="absolute right-4 top-3.5 text-gray-400" size={16} />
      {isLoaded && (
        <div className="absolute right-12 top-3.5 w-2 h-2 bg-green-500 rounded-full" title="Autocomplete enabled" />
      )}
    </div>
  );
}