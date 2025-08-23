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
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const initAutocomplete = () => {
      if (window.google && window.google.maps && window.google.maps.places && inputRef.current) {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          fields: ['formatted_address', 'geometry']
        });

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace();
          if (place.formatted_address) {
            onChange(place.formatted_address);
          }
        });
        setIsLoaded(true);
      }
    };

    // Load Google Maps script with API key
    const loadGoogleMaps = () => {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.warn('Google Maps API key not found');
        return;
      }

      if (window.google) {
        initAutocomplete();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
      script.async = true;
      script.defer = true;
      script.onload = initAutocomplete;
      document.head.appendChild(script);
    };

    loadGoogleMaps();

    return () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative">
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