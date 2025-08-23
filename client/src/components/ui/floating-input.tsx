import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

export interface FloatingInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          type="text"
          className={cn(
            "w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all peer placeholder-transparent",
            className
          )}
          placeholder={label}
          ref={ref}
          {...props}
        />
        <label className="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-600 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-primary peer-focus:text-sm transition-all">
          {label}
        </label>
        <MapPin className="absolute right-4 top-3.5 text-gray-400" size={16} />
      </div>
    );
  }
);

FloatingInput.displayName = "FloatingInput";

export { FloatingInput };
