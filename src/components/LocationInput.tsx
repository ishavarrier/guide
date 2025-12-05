import { MapPin } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface LocationInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

export function LocationInput({ label, placeholder, value, onChange }: LocationInputProps) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        {label}
      </Label>
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-input-background border-border"
      />
    </div>
  );
}
