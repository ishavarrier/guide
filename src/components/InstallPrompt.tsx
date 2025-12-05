import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true;
    
    if (isInstalled) {
      return;
    }

    // Check if user has previously dismissed
    const dismissed = localStorage.getItem('installPromptDismissed');
    if (dismissed) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-5">
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Download className="w-5 h-5 text-primary" />
                <h3 className="text-sm">Install MidMeet</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Install our app for quick access and offline support
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleInstall}
                  size="sm"
                  className="flex-1"
                >
                  Install
                </Button>
                <Button
                  onClick={handleDismiss}
                  size="sm"
                  variant="outline"
                >
                  Not now
                </Button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
