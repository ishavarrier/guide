import { MapPin } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-surface shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <MapPin className="text-white text-sm" size={16} />
            </div>
            <h1 className="text-xl font-bold text-secondary">MID</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-secondary hover:text-primary transition-colors">
              How it works
            </a>
            <a href="#" className="text-secondary hover:text-primary transition-colors">
              About
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
