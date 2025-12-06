import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, UserPlus, Search, MapPin, Check, X, User } from 'lucide-react-native';
import { Avatar, AvatarFallback } from '../components/ui/Avatar';
import { successHaptic } from '../utils/haptics';
import { colors, colorOpacity } from '../constants/theme';
import { FriendsService, FriendRequest } from '../lib/friends';
import { Friend } from '../utils/types';
import Navbar from '../components/Navbar';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.25;

type Tab = 'friends' | 'requests' | 'search';

export default function AddFriendsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Friends state
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [searchResults, setSearchResults] = useState<Friend[]>([]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Search users when query changes
  useEffect(() => {
    if (activeTab === 'search' && searchQuery.trim().length >= 2) {
      const timeoutId = setTimeout(() => {
        searchUsers();
      }, 500);
      return () => clearTimeout(timeoutId);
    } else if (activeTab === 'search') {
      setSearchResults([]);
    }
  }, [searchQuery, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [friendsResult, pendingResult, sentResult] = await Promise.all([
        FriendsService.getFriends(),
        FriendsService.getPendingRequests(),
        FriendsService.getSentRequests(),
      ]);

      if (friendsResult.data) {
        // Map to include name property
        const mappedFriends: Friend[] = friendsResult.data.map(f => ({
          ...f,
          name: f.first_name && f.last_name 
            ? `${f.first_name} ${f.last_name}` 
            : f.username || 'Unknown',
        }));
        setFriends(mappedFriends);
      }
      if (pendingResult.data) setPendingRequests(pendingResult.data);
      if (sentResult.data) setSentRequests(sentResult.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const result = await FriendsService.searchUsers(searchQuery);
      if (result.data) {
        // Map to include name property
        const mappedResults: Friend[] = result.data.map(f => ({
          ...f,
          name: f.first_name && f.last_name 
            ? `${f.first_name} ${f.last_name}` 
            : f.username || 'Unknown',
        }));
        setSearchResults(mappedResults);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    setLoading(true);
    try {
      const result = await FriendsService.sendFriendRequest(userId);
      if (result.error) {
        Alert.alert('Error', result.error.message || 'Failed to send friend request');
      } else {
        successHaptic();
        Alert.alert('Success', 'Friend request sent!');
        await loadData();
        setSearchQuery('');
        setActiveTab('requests');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send friend request');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    setLoading(true);
    try {
      const result = await FriendsService.acceptFriendRequest(requestId);
      if (result.error) {
        Alert.alert('Error', result.error.message || 'Failed to accept friend request');
      } else {
        successHaptic();
        await loadData();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to accept friend request');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setLoading(true);
    try {
      const result = await FriendsService.rejectFriendRequest(requestId);
      if (result.error) {
        Alert.alert('Error', result.error.message || 'Failed to reject friend request');
      } else {
        successHaptic();
        await loadData();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to reject friend request');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (friend: Friend) => {
    if (friend.first_name && friend.last_name) {
      return `${friend.first_name[0]}${friend.last_name[0]}`.toUpperCase();
    }
    if (friend.name) {
      return friend.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    }
    return '?';
  };

  const getName = (friend: Friend) => {
    if (friend.first_name && friend.last_name) {
      return `${friend.first_name} ${friend.last_name}`;
    }
    return friend.name || friend.username || 'Unknown';
  };

  const renderFriends = () => {
    if (loading && friends.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (friends.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No friends yet. Search for users to add friends!</Text>
        </View>
      );
    }

    return friends.map((friend) => {
      const initials = getInitials(friend);
      const name = getName(friend);
      
      return (
        <Pressable
          key={friend.id}
          style={({ pressed }) => [
            styles.friendCard,
            { opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <View style={styles.friendCardContent}>
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-muted">
                <Text style={styles.avatarText}>{initials}</Text>
              </AvatarFallback>
            </Avatar>
            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>{name}</Text>
              {friend.username && (
                <Text style={styles.friendUsername}>@{friend.username}</Text>
              )}
              {friend.address && (
                <Text style={styles.friendAddress} numberOfLines={1}>{friend.address}</Text>
              )}
            </View>
          </View>
        </Pressable>
      );
    });
  };

  const renderPendingRequests = () => {
    if (loading && pendingRequests.length === 0 && sentRequests.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (pendingRequests.length === 0 && sentRequests.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No pending friend requests</Text>
        </View>
      );
    }

    return (
      <>
        {pendingRequests.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Received Requests</Text>
            {pendingRequests.map((request) => {
              const requester = request.requester;
              if (!requester) return null;
              
              const initials = requester.first_name && requester.last_name
                ? `${requester.first_name[0]}${requester.last_name[0]}`.toUpperCase()
                : requester.username?.[0]?.toUpperCase() || '?';
              const name = requester.first_name && requester.last_name
                ? `${requester.first_name} ${requester.last_name}`
                : requester.username || 'Unknown';

              return (
                <View key={request.id} style={styles.requestCard}>
                  <View style={styles.friendCardContent}>
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-muted">
                        <Text style={styles.avatarText}>{initials}</Text>
                      </AvatarFallback>
                    </Avatar>
                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName}>{name}</Text>
                      {requester.username && (
                        <Text style={styles.friendUsername}>@{requester.username}</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.requestActions}>
                    <Pressable
                      onPress={() => handleAcceptRequest(request.id)}
                      style={[styles.actionButton, styles.acceptButton]}
                      disabled={loading}
                    >
                      <Check size={18} color={colors.white} />
                    </Pressable>
                    <Pressable
                      onPress={() => handleRejectRequest(request.id)}
                      style={[styles.actionButton, styles.rejectButton]}
                      disabled={loading}
                    >
                      <X size={18} color={colors.white} />
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {sentRequests.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Sent Requests</Text>
            {sentRequests.map((request) => {
              const responder = request.responder;
              if (!responder) return null;
              
              const initials = responder.first_name && responder.last_name
                ? `${responder.first_name[0]}${responder.last_name[0]}`.toUpperCase()
                : responder.username?.[0]?.toUpperCase() || '?';
              const name = responder.first_name && responder.last_name
                ? `${responder.first_name} ${responder.last_name}`
                : responder.username || 'Unknown';

              return (
                <View key={request.id} style={styles.requestCard}>
                  <View style={styles.friendCardContent}>
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-muted">
                        <Text style={styles.avatarText}>{initials}</Text>
                      </AvatarFallback>
                    </Avatar>
                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName}>{name}</Text>
                      {responder.username && (
                        <Text style={styles.friendUsername}>@{responder.username}</Text>
                      )}
                      <Text style={styles.pendingText}>Pending...</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </>
        )}
      </>
    );
  };

  const renderSearchResults = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (searchQuery.trim().length < 2) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Type at least 2 characters to search</Text>
        </View>
      );
    }

    if (searchResults.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No users found</Text>
        </View>
      );
    }

    return searchResults.map((user) => {
      const initials = user.first_name && user.last_name
        ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
        : user.username?.[0]?.toUpperCase() || '?';
      const name = user.first_name && user.last_name
        ? `${user.first_name} ${user.last_name}`
        : user.username || 'Unknown';
      
      const isFriend = friends.some(f => f.id === user.id);
      const hasPendingRequest = sentRequests.some(r => r.responder_id === user.id);

      return (
        <View key={user.id} style={styles.requestCard}>
          <View style={styles.friendCardContent}>
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-muted">
                <Text style={styles.avatarText}>{initials}</Text>
              </AvatarFallback>
            </Avatar>
            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>{name}</Text>
              {user.username && (
                <Text style={styles.friendUsername}>@{user.username}</Text>
              )}
            </View>
          </View>
          {isFriend ? (
            <View style={styles.friendBadge}>
              <Text style={styles.friendBadgeText}>Friends</Text>
            </View>
          ) : hasPendingRequest ? (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>Pending</Text>
            </View>
          ) : (
            <Pressable
              onPress={() => handleSendRequest(user.id)}
              style={[styles.actionButton, styles.addButton]}
              disabled={loading}
            >
              <UserPlus size={18} color={colors.white} />
            </Pressable>
          )}
        </View>
      );
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.content}>
        {/* Header Section with Gradient */}
        <LinearGradient
          colors={colors.gradients.header}
          style={styles.headerSection}
        >
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              { opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <ArrowLeft size={24} color={colors.icon.white} />
          </Pressable>

          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <View style={styles.headerIconInner}>
                <View style={styles.personIcon}>
                  <View style={styles.personHead} />
                  <View style={styles.personBody} />
                </View>
                <View style={styles.pinIconOverlay}>
                  <MapPin size={14} color={colors.icon.white} fill={colors.icon.white} strokeWidth={2} />
                </View>
              </View>
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Add Friends</Text>
              <Text style={styles.headerSubtitle}>
                Manage your friends and requests
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <Pressable
            onPress={() => {
              setActiveTab('friends');
              setSearchQuery('');
            }}
            style={[styles.tab, activeTab === 'friends' && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === 'friends' && styles.tabTextActive]}>
              Friends ({friends.length})
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setActiveTab('requests');
              setSearchQuery('');
            }}
            style={[styles.tab, activeTab === 'requests' && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === 'requests' && styles.tabTextActive]}>
              Requests ({pendingRequests.length + sentRequests.length})
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setActiveTab('search');
              setSearchQuery('');
            }}
            style={[styles.tab, activeTab === 'search' && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === 'search' && styles.tabTextActive]}>
              Search
            </Text>
          </Pressable>
        </View>

        {/* Body Section */}
        <ScrollView
          style={styles.bodySection}
          contentContainerStyle={styles.bodyScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Search Bar - Only show in search tab */}
          {activeTab === 'search' && (
            <View style={styles.searchBar}>
              <Search size={20} color={colors.icon.muted} />
              <TextInput
                placeholder="Search by username, email, or name..."
                placeholderTextColor={colors.mutedForeground}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
                autoCapitalize="none"
              />
            </View>
          )}

          {/* Content based on active tab */}
          <View style={styles.friendsList}>
            {activeTab === 'friends' && renderFriends()}
            {activeTab === 'requests' && renderPendingRequests()}
            {activeTab === 'search' && renderSearchResults()}
          </View>
        </ScrollView>
      </View>
      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
  },
  content: {
    flex: 1,
  },
  headerSection: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 24,
    height: HEADER_HEIGHT,
    minHeight: 180,
    maxHeight: 220,
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colorOpacity.white['20'],
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerIconInner: {
    position: 'relative',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  personIcon: {
    position: 'relative',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  personHead: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.icon.white,
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
  },
  personBody: {
    width: 16,
    height: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.icon.white,
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
  },
  pinIconOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colorOpacity.white['20'],
    borderRadius: 8,
    padding: 2,
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colorOpacity.white['80'],
    fontWeight: '400',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.mutedForeground,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  bodySection: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bodyScrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.foreground,
  },
  friendsList: {
    gap: 12,
  },
  friendCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  requestCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  friendCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarFallback: {
    backgroundColor: colors.muted,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.foreground,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.foreground,
    marginBottom: 2,
  },
  friendUsername: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginBottom: 2,
  },
  friendAddress: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  pendingText: {
    fontSize: 12,
    color: colors.secondary,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 8,
    marginBottom: 8,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: colors.secondary,
  },
  rejectButton: {
    backgroundColor: colors.destructive,
  },
  addButton: {
    backgroundColor: colors.primary,
  },
  friendBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colorOpacity.secondary['20'],
  },
  friendBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondary,
  },
  pendingBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colorOpacity.primary['20'],
  },
  pendingBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
});
