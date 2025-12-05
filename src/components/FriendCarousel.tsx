import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { UserPlus } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { selectionHaptic } from "../utils/haptics";

interface Friend {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
}

interface FriendCarouselProps {
  onFriendsChange: (friends: Friend[]) => void;
}

export function FriendCarousel({ onFriendsChange }: FriendCarouselProps) {
  // Mock friends list - in real app, this would come from contacts/API
  const [allFriends, setAllFriends] = useState<Friend[]>([
    { id: "1", name: "Sarah", phone: "(555) 234-5678", avatar: "" },
    { id: "2", name: "Mike", phone: "(555) 345-6789", avatar: "" },
    { id: "3", name: "Emma", phone: "(555) 456-7890", avatar: "" },
  ]);

  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(
    new Set()
  );
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const addAnchorRef = useRef<HTMLDivElement | null>(null);
  const [popoverPos, setPopoverPos] = useState<{
    top: number;
    left: number;
  } | null>(null);

  useEffect(() => {
    if (!isAddOpen) return;
    const el = addAnchorRef.current;
    if (!el) return;
    const compute = () => {
      const rect = el.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const POPOVER_WIDTH = 256; // w-64
      const MARGIN = 8;
      const center = rect.left + rect.width / 2;
      const minCenter = MARGIN + POPOVER_WIDTH / 2;
      const maxCenter = viewportWidth - MARGIN - POPOVER_WIDTH / 2;
      const clampedCenter = Math.max(minCenter, Math.min(maxCenter, center));
      setPopoverPos({ top: rect.bottom + 8, left: clampedCenter });
    };
    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("scroll", compute, true);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", compute, true);
    };
  }, [isAddOpen]);

  const toggleFriend = (friend: Friend) => {
    selectionHaptic();
    const newSelected = new Set(selectedFriends);
    if (newSelected.has(friend.id)) {
      newSelected.delete(friend.id);
    } else {
      newSelected.add(friend.id);
    }
    setSelectedFriends(newSelected);

    // Update parent with selected friends
    const selected = allFriends.filter((f) => newSelected.has(f.id));
    onFriendsChange(selected);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-secondary">Invite Friends</h3>
        <span className="text-sm text-muted-foreground">
          {selectedFriends.size} selected
        </span>
      </div>

      {/* Horizontal scrolling carousel */}
      <div className="relative -mx-6 px-6">
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth hide-scrollbar touch-pan-x">
          {allFriends.map((friend) => {
            const isSelected = selectedFriends.has(friend.id);
            return (
              <button
                key={friend.id}
                onClick={() => toggleFriend(friend)}
                className="flex-shrink-0 snap-start no-min-touch active:scale-95 transition-transform"
              >
                <div className="flex flex-col items-center gap-2 w-20">
                  <div className="relative">
                    <Avatar
                      className={`w-16 h-16 transition-all duration-200 ${
                        isSelected
                          ? "ring-4 ring-secondary shadow-lg scale-105"
                          : "ring-2 ring-border hover:ring-secondary/50"
                      }`}
                    >
                      <AvatarImage src={friend.avatar} alt={friend.name} />
                      <AvatarFallback
                        className={`transition-colors ${
                          isSelected
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {friend.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-secondary rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-200">
                        <svg
                          className="w-4 h-4 text-secondary-foreground"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-sm text-center line-clamp-1 w-full transition-colors ${
                      isSelected ? "text-secondary" : "text-foreground"
                    }`}
                  >
                    {friend.name}
                  </span>
                </div>
              </button>
            );
          })}

          {/* Add new friend button + anchored popover */}
          <div
            ref={addAnchorRef}
            className="relative flex-shrink-0 snap-start no-min-touch"
          >
            <button onClick={() => setIsAddOpen((v) => !v)} className="">
              <div className="flex flex-col items-center gap-2 w-20">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-secondary bg-secondary/5 flex items-center justify-center hover:bg-secondary/10 transition-colors">
                  <UserPlus className="w-6 h-6 text-secondary" />
                </div>
                <span className="text-sm text-center text-secondary">Add</span>
              </div>
            </button>
            {/* popover rendered in portal below */}
          </div>
        </div>

        {/* Scroll fade indicators */}
        <div className="absolute left-0 top-0 bottom-4 w-12 bg-gradient-to-r from-background via-background/80 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-background via-background/80 to-transparent pointer-events-none" />
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      {/* Portal popover to avoid clipping by overflow-hidden ancestors */}
      {isAddOpen &&
        popoverPos &&
        createPortal(
          <div
            className="z-50"
            style={{
              position: "fixed",
              top: popoverPos.top,
              left: popoverPos.left,
              transform: "translateX(-50%)",
            }}
          >
            <div className="w-64 rounded-xl border border-secondary/20 bg-background shadow-xl p-3">
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 bg-background border-l border-t border-secondary/20" />
              <h3 className="text-sm font-medium mb-2">Add Friend</h3>
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-9 bg-input-background border-secondary/30 focus:border-secondary"
                  autoComplete="name"
                />
                <Input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="h-9 bg-input-background border-secondary/30 focus:border-secondary"
                  autoComplete="tel"
                />
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const name = newName.trim();
                    const phone = newPhone.trim();
                    if (!name) return;
                    const friend: Friend = {
                      id: String(Date.now()),
                      name,
                      phone,
                      avatar: "",
                    };
                    setAllFriends([...allFriends, friend]);
                    setNewName("");
                    setNewPhone("");
                    setIsAddOpen(false);
                  }}
                  disabled={!newName.trim()}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
