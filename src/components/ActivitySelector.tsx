import { Coffee, ShoppingBag, Utensils } from 'lucide-react';
import { Label } from './ui/label';

interface ActivitySelectorProps {
  selected: string;
  onSelect: (activity: string) => void;
}

export function ActivitySelector({ selected, onSelect }: ActivitySelectorProps) {
  const activities = [
    { id: 'restaurants', label: 'Restaurants', icon: Utensils },
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
    { id: 'cafes', label: 'Cafes', icon: Coffee },
  ];

  return (
    <div className="space-y-3">
      <Label>Activity Type</Label>
      <div className="grid grid-cols-3 gap-3">
        {activities.map((activity) => {
          const Icon = activity.icon;
          const isSelected = selected === activity.id;
          return (
            <button
              key={activity.id}
              onClick={() => onSelect(activity.id)}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border hover:border-primary/50'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-sm">{activity.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
