import { MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-gray-200 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <MapPin className="text-white text-sm" size={16} />
              </div>
              <h3 className="text-lg font-semibold text-secondary">MID</h3>
            </div>
            <p className="text-gray-600">
              Find the perfect meeting spot between any two locations.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-secondary mb-3">Features</h4>
            <ul className="space-y-2 text-gray-600">
              <li>Location midpoint calculation</li>
              <li>Place type filtering</li>
              <li>Real-time search results</li>
              <li>Mobile-friendly design</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-secondary mb-3">Support</h4>
            <ul className="space-y-2 text-gray-600">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  How it works
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-gray-500">
          <p>&copy; 2024 MID. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
