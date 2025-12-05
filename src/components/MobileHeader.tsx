import { ReactNode } from 'react';
import { ArrowLeft, MapPinned } from 'lucide-react';

interface MobileHeaderProps {
  title: string;
  subtitle: string;
  onBack?: () => void;
  icon?: ReactNode;
}

export function MobileHeader({ title, subtitle, onBack, icon }: MobileHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground p-6 pb-8 sticky top-0 z-10 shadow-lg">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-4 p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors active:scale-95"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}
      <div className="flex items-center gap-3">
        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
          {icon || <MapPinned className="w-8 h-8" />}
        </div>
        <div>
          <h1 className="text-2xl">{title}</h1>
          <p className="text-primary-foreground/80 text-sm">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
