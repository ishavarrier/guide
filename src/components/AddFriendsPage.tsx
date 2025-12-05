import { useState } from 'react';
import { UserPlus, MapPinned, Search, X } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { selectionHaptic, successHaptic } from '../utils/haptics';

interface Friend {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
}

interface AddFriendsPageProps {
  onContinue: (friends: Friend[]) => void;
}

export function AddFriendsPage({ onContinue }: AddFriendsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [myFriends, setMyFriends] = useState<Friend[]>([
    { id: '1', name: 'Sarah Johnson', phone: '(555) 234-5678', avatar: '' },
    { id: '2', name: 'Mike Chen', phone: '(555) 345-6789', avatar: '' },
    { id: '3', name: 'Emma Davis', phone: '(555) 456-7890', avatar: '' },
    { id: '4', name: 'Alex Martinez', phone: '(555) 567-8901', avatar: '' },
  ]);

  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());

  const toggleFriend = (friendId: string) => {
    selectionHaptic();
    const newSelected = new Set(selectedFriends);
    if (newSelected.has(friendId)) {
      newSelected.delete(friendId);
    } else {
      newSelected.add(friendId);
    }
    setSelectedFriends(newSelected);
  };

  const filteredFriends = myFriends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.phone.includes(searchQuery)
  );

  const handleContinue = () => {
    successHaptic();
    const selected = myFriends.filter(f => selectedFriends.has(f.id));
    onContinue(selected);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-background rounded-2xl shadow-xl overflow-hidden border-2 border-secondary/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground p-6 pb-8">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-xl">
              <MapPinned className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl">Add Friends</h1>
              <p className="text-primary-foreground/80 text-sm">Select friends to meet with</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
            <Input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input-background border-secondary/30 focus:border-secondary"
              inputMode="search"
              autoComplete="off"
            />
          </div>

          {/* Selected Count */}
          {selectedFriends.size > 0 && (
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {selectedFriends.size} friend{selectedFriends.size !== 1 ? 's' : ''} selected
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFriends(new Set())}
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Friends List */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 mb-6">
            {filteredFriends.map((friend) => {
              const isSelected = selectedFriends.has(friend.id);
              return (
                <Card
                  key={friend.id}
                  className={`cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-secondary border-secondary' : 'hover:border-secondary/30'
                  }`}
                  onClick={() => toggleFriend(friend.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className={`w-12 h-12 ${isSelected ? 'ring-2 ring-secondary' : ''}`}>
                        <AvatarImage src={friend.avatar} alt={friend.name} />
                        <AvatarFallback className={isSelected ? 'bg-secondary text-secondary-foreground' : ''}>
                          {friend.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3>{friend.name}</h3>
                        <p className="text-sm text-muted-foreground">{friend.phone}</p>
                      </div>
                      {isSelected && (
                        <Badge className="ml-2 bg-secondary text-secondary-foreground">
                          Added
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Add New Friend Button */}
          <Button
            variant="outline"
            className="w-full mb-4 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
            onClick={() => {}}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add New Friend
          </Button>

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            className="w-full h-12"
            size="lg"
            disabled={selectedFriends.size === 0}
          >
            Continue with {selectedFriends.size} friend{selectedFriends.size !== 1 ? 's' : ''}
          </Button>
        </div>
      </div>
    </div>
  );
}
