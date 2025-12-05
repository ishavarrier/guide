import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MapPin, Star, Users, Share2, Navigation } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';

interface Place {
  place_id: string;
  name: string;
  address: string;
  rating?: number;
  distance: number;
  coordinates: { lat: number; lng: number };
}

interface MidpointData {
  midpoint: { lat: number; lng: number };
  midpoint_address: string;
  places: Place[];
  radius_meters: number;
}

interface MidpointMapPageProps {
  activity: string;
  onBack: () => void;
  onShare: () => void;
  midpointData?: MidpointData;
}

export function MidpointMapPage({ activity, onBack, onShare, midpointData }: MidpointMapPageProps) {
  const [displayedCount, setDisplayedCount] = useState<number>(10);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const formatDistance = (distanceMiles: number): string => {
    return `${distanceMiles.toFixed(1)} mi`;
  };

  const getActivityLabel = (activityType: string): string => {
    switch (activityType) {
      case 'restaurants':
        return 'Restaurants';
      case 'cafes':
        return 'Cafes';
      case 'shopping':
        return 'Shopping';
      case 'entertainment':
        return 'Entertainment';
      default:
        return 'Places';
    }
  };

  const places = midpointData?.places || [];
  const displayedPlaces = places.slice(0, displayedCount);

  // Reset displayed count when places change
  useEffect(() => {
    setDisplayedCount(10);
  }, [places.length]);

  // Handle scroll to load more
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const paddingToBottom = 50;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - paddingToBottom;

      if (isNearBottom && displayedCount < places.length) {
        // Load 10 more places
        setDisplayedCount((prev) => Math.min(prev + 10, places.length));
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [displayedCount, places.length]);

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-xl">
                <MapPin className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl">Midpoint Found</h1>
                <p className="text-primary-foreground/80 text-sm">Central location results</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Map Visualization */}
          <Card className="mb-6 overflow-hidden border-2 border-secondary/30">
            <div className="relative bg-muted h-64 flex items-center justify-center">
              {/* Simple map visualization */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 dark:from-blue-950 dark:to-blue-900">
                {/* Grid pattern to simulate map */}
                <div className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }}
                />
                
                {/* Midpoint marker */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-30" />
                    <div className="relative bg-primary text-primary-foreground p-3 rounded-full shadow-lg">
                      <MapPin className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Place markers with stars */}
                {places.slice(0, 3).map((place, index) => {
                  const positions = [
                    { top: '30%', left: '40%' },
                    { top: '50%', left: '65%' },
                    { top: '60%', left: '35%' }
                  ];
                  return (
                    <div
                      key={place.place_id}
                      className="absolute"
                      style={positions[index]}
                    >
                      <div className="bg-yellow-400 text-yellow-900 p-2 rounded-full shadow-md">
                        <Star className="w-4 h-4 fill-current" />
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Map overlay info */}
              {places.length > 0 && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-secondary text-secondary-foreground backdrop-blur shadow-lg">
                    <Users className="w-3 h-3 mr-1" />
                    {places.length} places nearby
                  </Badge>
                </div>
              )}
            </div>
          </Card>

          {/* Activity Type Badge */}
          <div className="flex items-center justify-between mb-4">
            <h2>Nearby {getActivityLabel(activity)}</h2>
            <Badge className="bg-secondary text-secondary-foreground">
              {displayedPlaces.length} {displayedPlaces.length < places.length ? `of ${places.length}` : ''} places
            </Badge>
          </div>

          {/* Places List */}
          <div 
            ref={scrollContainerRef}
            className="space-y-3 max-h-[280px] overflow-y-auto pr-1 mb-6"
          >
            {displayedPlaces.length > 0 ? (
              displayedPlaces.map((place) => (
                <Card key={place.place_id} className="overflow-hidden hover:shadow-md transition-shadow border-secondary/20 hover:border-secondary/50">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="flex-1">{place.name}</h3>
                      {place.rating !== undefined && place.rating !== null && (
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{place.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 mb-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Navigation className="w-4 h-4" />
                        <span>{formatDistance(place.distance)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{place.address}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="overflow-hidden border-secondary/20">
                <CardContent className="p-4">
                  <p className="text-muted-foreground">No places found near the midpoint.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Share Button */}
          <Button
            onClick={onShare}
            className="w-full h-12"
            size="lg"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share Midpoint with Group
          </Button>
        </div>
      </div>
    </div>
  );
}
