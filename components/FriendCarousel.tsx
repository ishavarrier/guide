import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { UserPlus, Search, X } from "lucide-react-native";
import * as Contacts from "expo-contacts";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/Avatar";
import { selectionHaptic } from "../utils/haptics";
import { Friend } from "../utils/types";
import { colors, colorOpacity } from "../constants/theme";
import { FriendsService } from "../lib/friends";

interface FriendCarouselProps {
  onFriendsChange: (friends: Friend[]) => void;
}

export function FriendCarousel({ onFriendsChange }: FriendCarouselProps) {
  const [allFriends, setAllFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(
    new Set()
  );
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);

  // Contacts state
  const [contacts, setContacts] = useState<Friend[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Friend[]>([]);
  const [contactsSearchQuery, setContactsSearchQuery] = useState("");
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [contactsPermissionGranted, setContactsPermissionGranted] =
    useState(false);

  // Load friends from database
  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    setIsLoadingFriends(true);
    try {
      const result = await FriendsService.getFriends();
      if (result.data) {
        // Convert database friends to Friend format
        const formattedFriends: Friend[] = result.data.map((f) => ({
          id: f.id,
          name: f.first_name && f.last_name 
            ? `${f.first_name} ${f.last_name}` 
            : f.username || 'Unknown',
          phone: f.phone,
          avatar: '',
          username: f.username,
          first_name: f.first_name,
          last_name: f.last_name,
          email: f.email,
          address: f.address,
        }));
        setAllFriends(formattedFriends);
      }
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setIsLoadingFriends(false);
    }
  };

  // Load contacts from device
  const loadContacts = useCallback(async () => {
    try {
      setIsLoadingContacts(true);
      const { status } = await Contacts.requestPermissionsAsync();

      if (status !== "granted") {
        setContactsPermissionGranted(false);
        Alert.alert(
          "Permission Required",
          "Please grant contacts permission to import friends from your contacts.",
          [{ text: "OK" }]
        );
        setIsLoadingContacts(false);
        return;
      }

      setContactsPermissionGranted(true);
      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Image,
        ],
      });

      // Convert contacts to Friend format
      const formattedContacts: Friend[] = data
        .filter(
          (contact) =>
            contact.name &&
            contact.phoneNumbers &&
            contact.phoneNumbers.length > 0
        )
        .map((contact) => {
          const phoneNumber = contact.phoneNumbers?.[0]?.number || "";
          return {
            id: contact.id || String(Date.now() + Math.random()),
            name: contact.name || "Unknown",
            phone: phoneNumber,
            avatar: contact.imageUri || "",
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));

      setContacts(formattedContacts);
      setFilteredContacts(formattedContacts);
    } catch (error) {
      console.error("Error loading contacts:", error);
      Alert.alert("Error", "Failed to load contacts. Please try again.");
    } finally {
      setIsLoadingContacts(false);
    }
  }, []);

  // Filter contacts based on search query
  useEffect(() => {
    if (contactsSearchQuery.trim() === "") {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter(
        (contact) =>
          contact.name
            .toLowerCase()
            .includes(contactsSearchQuery.toLowerCase()) ||
          contact.phone.includes(contactsSearchQuery)
      );
      setFilteredContacts(filtered);
    }
  }, [contactsSearchQuery, contacts]);

  // Load contacts when modal opens
  useEffect(() => {
    if (isAddOpen) {
      loadContacts();
    }
  }, [isAddOpen, loadContacts]);

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

  const addContactAsFriend = (contact: Friend) => {
    selectionHaptic();
    // Check if contact already exists in allFriends
    const existingFriend = allFriends.find(
      (f) => f.id === contact.id || f.phone === contact.phone
    );

    if (existingFriend) {
      // If exists, just toggle selection
      toggleFriend(existingFriend);
    } else {
      // Add new friend and select it
      const newFriendList = [...allFriends, contact];
      setAllFriends(newFriendList);
      const newSelected = new Set(selectedFriends);
      newSelected.add(contact.id);
      setSelectedFriends(newSelected);
      onFriendsChange(newFriendList.filter((f) => newSelected.has(f.id)));
    }
    setIsAddOpen(false);
  };

  const renderFriend = ({ item: friend }: { item: Friend }) => {
    const isSelected = selectedFriends.has(friend.id);
    // Get initials from name or first_name/last_name
    let firstInitial = '?';
    if (friend.first_name && friend.last_name) {
      firstInitial = `${friend.first_name[0]}${friend.last_name[0]}`.toUpperCase();
    } else if (friend.name) {
      firstInitial = friend.name.trim()[0]?.toUpperCase() || '?';
    } else if (friend.username) {
      firstInitial = friend.username[0]?.toUpperCase() || '?';
    }

    return (
      <Pressable
        onPress={() => toggleFriend(friend)}
        style={({ pressed }) => [
          styles.friendItem,
          { opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <View style={styles.friendAvatarContainer}>
          <View
            style={[
              styles.friendAvatar,
              isSelected && styles.friendAvatarSelected,
            ]}
          >
            {friend.avatar ? (
              <Avatar className="w-16 h-16" style={styles.friendAvatarInner}>
                <AvatarImage src={friend.avatar} alt={friend.name} />
                <AvatarFallback style={styles.friendAvatarFallback}>
                  <Text style={styles.friendAvatarText}>{firstInitial}</Text>
                </AvatarFallback>
              </Avatar>
            ) : (
              <Text style={styles.friendAvatarText}>{firstInitial}</Text>
            )}
          </View>
          {isSelected && (
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedBadgeText}>✓</Text>
            </View>
          )}
        </View>
        <Text
          style={[
            styles.friendName,
            isSelected && styles.friendNameSelected,
          ]}
          numberOfLines={1}
        >
          {friend.name}
        </Text>
      </Pressable>
    );
  };

  const renderAddButton = () => (
    <Pressable
      onPress={() => setIsAddOpen(true)}
      style={({ pressed }) => [
        styles.friendItem,
        { opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View style={styles.addButtonAvatar}>
        <UserPlus size={24} color={colors.secondary} />
      </View>
      <Text style={styles.addButtonText}>Add</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Invite Friends</Text>
        <Text style={styles.selectedCount}>
          {selectedFriends.size} selected
        </Text>
      </View>

      <FlatList
        data={[
          ...allFriends,
          { id: "add", name: "Add", phone: "", avatar: "" },
        ]}
        renderItem={({ item }) =>
          item.id === "add" ? renderAddButton() : renderFriend({ item })
        }
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
      {/* Add Friend Modal */}
      <Modal
        visible={isAddOpen}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setIsAddOpen(false);
          setContactsSearchQuery("");
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Friends</Text>
              <Pressable
                onPress={() => {
                  setIsAddOpen(false);
                  setContactsSearchQuery("");
                }}
                style={styles.closeButton}
              >
                <X size={24} color={colors.icon.foreground} />
              </Pressable>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Search size={20} color={colors.icon.muted} style={styles.searchIcon} />
              <TextInput
                placeholder="Search contacts..."
                value={contactsSearchQuery}
                onChangeText={setContactsSearchQuery}
                style={styles.searchInput}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {contactsSearchQuery.length > 0 && (
                <Pressable
                  onPress={() => setContactsSearchQuery("")}
                  style={styles.clearSearchButton}
                >
                  <X size={16} color={colors.icon.muted} />
                </Pressable>
              )}
            </View>

            {/* Contacts List */}
            {isLoadingContacts ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.secondary} />
                <Text style={styles.loadingText}>Loading contacts...</Text>
              </View>
            ) : contactsPermissionGranted && filteredContacts.length > 0 ? (
              <View style={styles.contactsListContainer}>
                <FlatList
                  data={filteredContacts}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => addContactAsFriend(item)}
                      style={styles.contactItem}
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={item.avatar} alt={item.name} />
                        <AvatarFallback className="bg-secondary/10">
                          <Text style={styles.contactAvatarText}>
                            {item.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </Text>
                        </AvatarFallback>
                      </Avatar>
                      <View style={styles.contactInfo}>
                        <Text style={styles.contactName}>{item.name}</Text>
                        {item.phone && (
                          <Text style={styles.contactPhone}>{item.phone}</Text>
                        )}
                      </View>
                    </Pressable>
                  )}
                  style={styles.contactsList}
                  showsVerticalScrollIndicator={true}
                />
              </View>
            ) : contactsPermissionGranted && filteredContacts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {contactsSearchQuery
                    ? "No contacts found"
                    : "No contacts available"}
                </Text>
              </View>
            ) : (
              <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>
                  Contacts permission is required to import friends.
                </Text>
                <Pressable
                  onPress={loadContacts}
                  style={[
                    styles.button,
                    styles.buttonPrimary,
                    styles.retryButton,
                  ]}
                >
                  <Text style={styles.buttonPrimaryText}>Grant Permission</Text>
                </Pressable>
              </View>
            )}

            {/* Manual Add Option */}
            <View style={styles.manualAddSection}>
              <Text style={styles.manualAddLabel}>Or add manually:</Text>
              <TextInput
                placeholder="Name"
                value={newName}
                onChangeText={setNewName}
                style={styles.input}
                autoCapitalize="words"
              />
              <TextInput
                placeholder="Phone (optional)"
                value={newPhone}
                onChangeText={setNewPhone}
                style={styles.input}
                keyboardType="phone-pad"
              />
              <Pressable
                onPress={() => {
                  const name = newName.trim();
                  const phone = newPhone.trim();
                  if (!name) return;
                  const next = [
                    ...allFriends,
                    { id: String(Date.now()), name, phone, avatar: "" },
                  ];
                  setAllFriends(next);
                  setNewName("");
                  setNewPhone("");
                  setIsAddOpen(false);
                  setContactsSearchQuery("");
                }}
                style={[
                  styles.button,
                  !newName.trim()
                    ? styles.buttonDisabled
                    : styles.buttonPrimary,
                ]}
                disabled={!newName.trim()}
              >
                <Text style={styles.buttonPrimaryText}>Add Manually</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.primary,
  },
  selectedCount: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
  listContainer: {
    paddingHorizontal: 0,
  },
  friendItem: {
    alignItems: "center",
    width: 80,
    marginRight: 16,
  },
  friendAvatarContainer: {
    position: "relative",
    marginBottom: 8,
  },
  friendAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colorOpacity.primary['30'],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
  },
  friendAvatarSelected: {
    borderColor: colors.secondary,
    borderWidth: 3,
  },
  friendAvatarInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  friendAvatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colorOpacity.primary['30'],
    justifyContent: "center",
    alignItems: "center",
  },
  friendAvatarText: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.primary,
  },
  selectedBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.card,
  },
  selectedBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.white,
  },
  friendName: {
    fontSize: 14,
    color: colors.foreground,
    textAlign: "center",
  },
  friendNameSelected: {
    color: colors.secondary,
    fontWeight: "500",
  },
  addButtonAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.secondary,
    backgroundColor: colorOpacity.secondary['10'],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  addButtonText: {
    fontSize: 14,
    color: colors.secondary,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    maxHeight: "90%",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: colors.foreground,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    backgroundColor: colors.inputBackground,
    color: colors.foreground,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  button: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonOutlineText: {
    color: colors.foreground,
  },
  buttonPrimary: {
    backgroundColor: colors.secondary,
  },
  buttonDisabled: {
    backgroundColor: colorOpacity.secondary['50'],
  },
  buttonPrimaryText: {
    color: colors.white,
    fontWeight: "600",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: colors.inputBackground,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.foreground,
  },
  clearSearchButton: {
    padding: 4,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    color: colors.mutedForeground,
    fontSize: 14,
  },
  contactsListContainer: {
    maxHeight: 300,
    marginBottom: 16,
  },
  contactsList: {
    flexGrow: 0,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.muted,
  },
  contactInfo: {
    marginLeft: 12,
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.foreground,
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
  contactAvatarText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.secondary,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: colors.mutedForeground,
    fontSize: 14,
  },
  permissionContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  permissionText: {
    color: colors.mutedForeground,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 8,
  },
  manualAddSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
    marginTop: 8,
  },
  manualAddLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.foreground,
    marginBottom: 8,
  },
});
