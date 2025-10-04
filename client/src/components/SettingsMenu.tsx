import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/context/WalletContext';
import { useLocation } from 'wouter';
import { HelpCircle, MessageCircle, RefreshCw, Shield, LogOut, ChevronRight } from 'lucide-react';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsMenu({ isOpen, onClose }: SettingsMenuProps) {
  const { disconnect } = useWallet();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await disconnect();
    onClose();
    setLocation('/');
  };

  const menuSections = [
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'FAQ', onClick: () => setLocation('/help') },
        { icon: MessageCircle, label: 'Contact Us', onClick: () => setLocation('/feedback') },
      ]
    },
    {
      title: 'Developer',
      items: [
        { 
          icon: RefreshCw, 
          label: 'Reset Device Cache', 
          onClick: () => {
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload();
          }
        },
      ]
    },
    {
      title: 'Privacy',
      items: [
        { icon: Shield, label: 'Privacy Policy', onClick: () => setLocation('/terms-of-service') },
      ]
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {menuSections.map((section, index) => (
            <div key={index}>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">{section.title}</h3>
              <div className="space-y-1">
                {section.items.map((item, itemIndex) => (
                  <Button
                    key={itemIndex}
                    variant="ghost"
                    className="w-full justify-between hover:bg-gray-100"
                    onClick={() => {
                      item.onClick();
                      onClose();
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 text-gray-600" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Button>
                ))}
              </div>
            </div>
          ))}
          
          <div className="pt-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Log out
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-400">Version 1.0.0</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
