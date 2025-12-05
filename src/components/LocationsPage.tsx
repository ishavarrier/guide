import { useState, useEffect, useRef } from 'react';
import { MapPin, Plus, X, Search, ArrowLeft } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { ActivitySelector } from './ActivitySelector';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Card, CardContent } from './ui/card';
import { FriendCarousel } from './FriendCarousel';
import PlacesService, { PlacePrediction } from '../services/PlacesService';

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

interface LocationsPageProps {
  onBack: () => void;
  onSearch: (locations: LocationEntry[], activity: string, friends: Friend[], midpointData?: any) => void;
}

export function LocationsPage({ onBack, onSearch }: LocationsPageProps) {
  const [activity, setActivity] = useState('restaurants');
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);
  const [locations, setLocations] = useState<LocationEntry[]>([
    { id: 'me', personName: 'Me', location: '', isMe: true }
  ]);
  const [coordinates, setCoordinates] = useState<{
    [key: string]: { lat: number; lng: number };
  }>({});
  const [suggestions, setSuggestions] = useState<{ [key: string]: PlacePrediction[] }>({});
  const [activeInputId, setActiveInputId] = useState<string | null>(null);
  const debounceTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // Update locations when friends change
  useEffect(() => {
    setLocations([
      { id: 'me', personName: 'Me', location: '', isMe: true },
      ...selectedFriends.map(f => ({ id: f.id, personName: f.name, location: '' }))
    ]);
  }, [selectedFriends]);

  const handleFriendsChange = (friends: Friend[]) => {
    setSelectedFriends(friends);
  };

  const updateLocation = async (id: string, value: string) => {
    setLocations(locations.map(loc =>
      loc.id === id ? { ...loc, location: value } : loc
    ));

    // Clear existing suggestions if input is cleared
    if (!value.trim()) {
      setSuggestions(prev => ({ ...prev, [id]: [] }));
      setActiveInputId(null);
      return;
    }

    // Debounce autocomplete requests
    if (debounceTimers.current[id]) {
      clearTimeout(debounceTimers.current[id]);
    }

    debounceTimers.current[id] = setTimeout(async () => {
      if (value.trim().length >= 2) {
        try {
          const results = await PlacesService.getPlaceAutocomplete(value.trim());
          setSuggestions(prev => ({ ...prev, [id]: results }));
          setActiveInputId(id);
        } catch (error) {
          console.error('Error fetching autocomplete:', error);
          setSuggestions(prev => ({ ...prev, [id]: [] }));
        }
      } else {
        setSuggestions(prev => ({ ...prev, [id]: [] }));
      }
    }, 300);
  };

  const handlePlaceSelect = async (id: string, place: PlacePrediction) => {
    try {
      // Get coordinates from place details
      const placeDetails = await PlacesService.getPlaceDetails(place.place_id);
      if (placeDetails && placeDetails.geometry && placeDetails.geometry.location) {
        const coords = {
          lat: placeDetails.geometry.location.lat,
          lng: placeDetails.geometry.location.lng,
        };

        setCoordinates((prev) => ({
          ...prev,
          [id]: coords,
        }));

        // Update location text
        setLocations(locations.map(loc =>
          loc.id === id ? { ...loc, location: place.description } : loc
        ));

        // Clear suggestions
        setSuggestions(prev => ({ ...prev, [id]: [] }));
        setActiveInputId(null);
      }
    } catch (error) {
      console.error('Error getting place coordinates:', error);
    }
  };

  const addMoreLocation = () => {
    setLocations([
      ...locations,
      { id: `extra-${Date.now()}`, personName: 'Additional Person', location: '' }
    ]);
  };

  const removeLocation = (id: string) => {
    if (id !== 'me') {
      setLocations(locations.filter(loc => loc.id !== id));
      // Clean up coordinates and suggestions
      setCoordinates(prev => {
        const newCoords = { ...prev };
        delete newCoords[id];
        return newCoords;
      });
      setSuggestions(prev => {
        const newSuggestions = { ...prev };
        delete newSuggestions[id];
        return newSuggestions;
      });
    }
  };

  const handleSearch = async () => {
    // Get coordinates for all locations
    const coordsArray = locations
      .filter((loc) => coordinates[loc.id])
      .map((loc) => ({
        lat: coordinates[loc.id].lat,
        lng: coordinates[loc.id].lng,
      }));

    if (coordsArray.length < 2) {
      alert('Please select valid locations for at least 2 people');
      return;
    }

    // Convert activity to filters
    const getActivityFilters = (activityType: string): string[] => {
      switch (activityType) {
        case 'restaurants':
          return ['restaurant'];
        case 'cafes':
          return ['cafe'];
        case 'shopping':
          return ['shopping_mall', 'store'];
        case 'entertainment':
          return ['movie_theater', 'amusement_park', 'zoo'];
        default:
          return ['restaurant', 'cafe'];
      }
    };

    try {
      // Call backend API
      const apiBaseUrl = 'http://localhost:8080/api/places';
      const endpoint = `${apiBaseUrl}/midpoint`;
      
      const request = {
        coords: coordsArray,
        filters: getActivityFilters(activity),
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        const midpointData = await response.json();
        onSearch(locations, activity, selectedFriends, midpointData);
      } else {
        const errorText = await response.text();
        console.error('API call failed:', response.status, errorText);
        alert('Failed to find midpoint. Please try again.');
      }
    } catch (error) {
      console.error('Error in handleSearch:', error);
      alert('Error finding midpoint. Please check your connection.');
    }
  };

  const isValid = locations.every(loc => loc.location.trim() !== '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-background rounded-2xl shadow-xl overflow-hidden border-2 border-secondary/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground p-6 pb-8">
          <button
            onClick={onBack}
            className="mb-4 p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-xl">
              <MapPin className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl">Plan Your Meetup</h1>
              <p className="text-primary-foreground/80 text-sm">Invite friends & set locations</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Friend Carousel */}
          <FriendCarousel onFriendsChange={handleFriendsChange} />

          <Separator className="mb-6" />

          {/* Locations List */}
          <div className="space-y-4 mb-6">
            {locations.map((loc, index) => (
              <Card key={loc.id} className="overflow-hidden border-secondary/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10 mt-1 ring-2 ring-secondary/50">
                      <AvatarFallback className="bg-secondary/10 text-secondary">
                        {loc.isMe ? '👤' : loc.personName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2 relative">
                      <Label className="text-sm text-secondary">{loc.personName}</Label>
                      <Input
                        type="text"
                        placeholder="Enter location or address"
                        value={loc.location}
                        onChange={(e) => updateLocation(loc.id, e.target.value)}
                        onFocus={() => {
                          if (suggestions[loc.id] && suggestions[loc.id].length > 0) {
                            setActiveInputId(loc.id);
                          }
                        }}
                        onBlur={() => {
                          // Delay to allow click on suggestion
                          setTimeout(() => setActiveInputId(null), 200);
                        }}
                        className="bg-input-background border-secondary/30 focus:border-secondary"
                        inputMode="text"
                        autoComplete="street-address"
                      />
                      {activeInputId === loc.id && suggestions[loc.id] && suggestions[loc.id].length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                          {suggestions[loc.id].map((suggestion) => (
                            <button
                              key={suggestion.place_id}
                              onClick={() => handlePlaceSelect(loc.id, suggestion)}
                              className="w-full text-left px-4 py-2 hover:bg-muted transition-colors flex items-start gap-2"
                            >
                              <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm">{suggestion.structured_formatting.main_text}</div>
                                {suggestion.structured_formatting.secondary_text && (
                                  <div className="text-xs text-muted-foreground truncate">
                                    {suggestion.structured_formatting.secondary_text}
                                  </div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {!loc.isMe && (
                      <button
                        onClick={() => removeLocation(loc.id)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors mt-1"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add More Button */}
          <Button
            variant="outline"
            className="w-full mb-6 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
            onClick={addMoreLocation}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add More Location
          </Button>

          <Separator className="mb-6" />

          {/* Activity Selector */}
          <div className="mb-6">
            <ActivitySelector selected={activity} onSelect={setActivity} />
          </div>

          {/* Search Button */}
          <Button
            onClick={handleSearch}
            className="w-full h-12"
            size="lg"
            disabled={!isValid}
          >
            <Search className="w-5 h-5 mr-2" />
            Find Midpoint
          </Button>
        </div>
      </div>
    </div>
  );
}
