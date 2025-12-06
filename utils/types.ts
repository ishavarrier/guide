export interface Friend {
  id: string;
  name: string;
  phone?: string;
  avatar?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  address?: string;
}

export interface LocationEntry {
  id: string;
  personName: string;
  location: string;
  isMe?: boolean;
}

export interface Vote {
  userId: string;
  userName: string;
  status: "confirmed" | "denied" | "suggested";
  suggestion?: string;
  timestamp: string;
}

export interface Place {
  id: string;
  name: string;
  rating: number;
  distance: string;
  address: string;
  usersGoing: number;
  lat: number;
  lng: number;
}

export type Screen = "login" | "locations" | "map" | "poll";

export interface LoginPageProps {
  onComplete: () => void;
}

export interface LocationsPageProps {
  onBack: () => void;
  onSearch: (
    locations: LocationEntry[],
    activity: string,
    friends: Friend[]
  ) => void;
}

export interface MidpointMapPageProps {
  activity: string;
  onBack: () => void;
  onShare: () => void;
}

export interface SharePollPageProps {
  onBack: () => void;
}

export interface FriendCarouselProps {
  onFriendsChange: (friends: Friend[]) => void;
}

export interface ActivitySelectorProps {
  selected: string;
  onSelect: (activity: string) => void;
}
