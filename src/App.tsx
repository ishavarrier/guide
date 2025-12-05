import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { LocationsPage } from './components/LocationsPage';
import { MidpointMapPage } from './components/MidpointMapPage';
import { SharePollPage } from './components/SharePollPage';
import { InstallPrompt } from './components/InstallPrompt';
import { registerServiceWorker } from './register-sw';

type Screen = 'login' | 'locations' | 'map' | 'poll';

interface Friend {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
}

interface LocationEntry {
  id: string;
  personName: string;
  location: string;
  isMe?: boolean;
}

interface MidpointData {
  midpoint: { lat: number; lng: number };
  midpoint_address: string;
  places: Array<{
    place_id: string;
    name: string;
    address: string;
    rating?: number;
    distance: number;
    coordinates: { lat: number; lng: number };
  }>;
  radius_meters: number;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);
  const [locations, setLocations] = useState<LocationEntry[]>([]);
  const [selectedActivity, setSelectedActivity] = useState('restaurants');
  const [midpointData, setMidpointData] = useState<MidpointData | undefined>(undefined);

  // Prevent pull-to-refresh and improve mobile experience
  useEffect(() => {
    // Register service worker for PWA functionality
    registerServiceWorker();

    // Disable pull-to-refresh on the entire document
    const preventDefault = (e: TouchEvent) => {
      if (e.touches.length > 1) return;
      const target = e.target as HTMLElement;
      const scrollable = target.closest('[class*="overflow-y-auto"], [class*="overflow-x-auto"]');
      if (!scrollable || scrollable.scrollTop <= 0) {
        e.preventDefault();
      }
    };

    document.body.addEventListener('touchmove', preventDefault, { passive: false });

    // Set theme color based on screen
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#c2410c');
    }

    // Detect if running in standalone mode (installed as PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      console.log('Running as installed PWA');
    }

    return () => {
      document.body.removeEventListener('touchmove', preventDefault);
    };
  }, []);

  const handleLoginComplete = () => {
    setCurrentScreen('locations');
  };

  const handleLocationsSubmit = (locationData: LocationEntry[], activity: string, friends: Friend[], midpointData?: MidpointData) => {
    setLocations(locationData);
    setSelectedActivity(activity);
    setSelectedFriends(friends);
    setMidpointData(midpointData);
    setCurrentScreen('map');
  };

  const handleShareMidpoint = () => {
    setCurrentScreen('poll');
  };

  const handleBackFromLocations = () => {
    setCurrentScreen('login');
  };

  const handleBackFromMap = () => {
    setCurrentScreen('locations');
  };

  const handleBackFromPoll = () => {
    setCurrentScreen('map');
  };

  return (
    <div className="mobile-app-wrapper min-h-screen">
      {currentScreen === 'login' && (
        <LoginPage onComplete={handleLoginComplete} />
      )}
      
      {currentScreen === 'locations' && (
        <LocationsPage
          onBack={handleBackFromLocations}
          onSearch={handleLocationsSubmit}
        />
      )}
      
      {currentScreen === 'map' && (
        <MidpointMapPage
          activity={selectedActivity}
          onBack={handleBackFromMap}
          onShare={handleShareMidpoint}
          midpointData={midpointData}
        />
      )}
      
      {currentScreen === 'poll' && (
        <SharePollPage onBack={handleBackFromPoll} />
      )}

      {/* PWA Install Prompt */}
      <InstallPrompt />
    </div>
  );
}
