import { MapPin, Star, Navigation } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface ResultCardProps {
  name: string;
  type: string;
  rating: number;
  distance: string;
  address: string;
  priceLevel?: string;
}

export function ResultCard({ name, type, rating, distance, address, priceLevel }: ResultCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="flex-1 pr-2">{name}</h3>
          <Badge variant="secondary" className="shrink-0">
            {type}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <Navigation className="w-4 h-4" />
            <span>{distance}</span>
          </div>
          {priceLevel && <span>{priceLevel}</span>}
        </div>
        
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
          <span className="line-clamp-1">{address}</span>
        </div>
      </CardContent>
    </Card>
  );
}
