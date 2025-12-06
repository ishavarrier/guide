import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions, RefreshControl, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Calendar, MapPin, Clock, Users, ThumbsUp, Navigation } from 'lucide-react-native';
import { successHaptic } from '../utils/haptics';
import { colors, colorOpacity } from '../constants/theme';
import { EventsService } from '../lib/events';
import { supabase } from '../lib/supabase';
import { FriendsService } from '../lib/friends';
import { AuthService } from '../lib/auth';
import Navbar from '../components/Navbar';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.25;

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [eventApprovals, setEventApprovals] = useState<Record<string, { accepted: number; total: number }>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Get current user ID
  const getCurrentUserId = async (): Promise<string> => {
    // First, check if user ID was set during login (stored in FriendsService)
    const storedUserId = FriendsService.getCurrentUserId();
    if (storedUserId) {
      return storedUserId;
    }

    // Try to get authenticated user from Supabase Auth (if using Supabase Auth)
    const authResult = await AuthService.getCurrentUser();
    if (authResult.profile?.id) {
      // Store it for future use
      FriendsService.setCurrentUserId(authResult.profile.id);
      return authResult.profile.id;
    }

    // If no user found, throw an error instead of using a random user
    throw new Error('User not logged in. Please log in to continue.');
  };

  const fetchEvents = async () => {
    try {
      const userId = await getCurrentUserId();
      const { data, error } = await EventsService.getUserEvents(userId);

      if (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
      } else {
        const eventsList = data || [];
        setEvents(eventsList);

        // Fetch approval counts for each event
        const approvals: Record<string, { accepted: number; total: number }> = {};
        
        for (const event of eventsList) {
          try {
            const { data: invitations, error: invError } = await supabase
              .from('event_invitations')
              .select('status')
              .eq('event_id', event.id);

            if (!invError && invitations) {
              const accepted = invitations.filter(inv => inv.status === 'accepted').length;
              approvals[event.id] = {
                accepted,
                total: invitations.length,
              };
            }
          } catch (err) {
            console.error(`Error fetching approvals for event ${event.id}:`, err);
            approvals[event.id] = { accepted: 0, total: 0 };
          }
        }

        setEventApprovals(approvals);
      }
    } catch (error) {
      console.error('Error getting user ID:', error);
      setEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const handleEventPress = (eventId: string) => {
    successHaptic();
    router.push({
      pathname: '/poll',
      params: { eventId },
    });
  };

  const openAddressInMaps = (address: string) => {
    successHaptic();
    
    // Encode the address for URL
    const encodedAddress = encodeURIComponent(address);
    
    // Try to open in Apple Maps first on iOS, then fallback to Google Maps
    if (Platform.OS === 'ios') {
      const appleMapsUrl = `maps://maps.apple.com/?q=${encodedAddress}`;
      Linking.openURL(appleMapsUrl).catch(() => {
        // Fallback to Google Maps if Apple Maps fails
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
        Linking.openURL(googleMapsUrl).catch((err) => {
          console.error("Failed to open maps:", err);
        });
      });
    } else {
      // Android - use Google Maps
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      Linking.openURL(googleMapsUrl).catch((err) => {
        console.error("Failed to open Google Maps:", err);
      });
    }
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
              <Calendar size={28} color={colors.icon.white} strokeWidth={2} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Your Events</Text>
              <Text style={styles.headerSubtitle}>
                {loading ? 'Loading...' : `${events.length} ${events.length === 1 ? 'event' : 'events'}`}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Body Section - Events List */}
        <ScrollView
          style={styles.bodySection}
          contentContainerStyle={styles.bodyScrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Loading events...</Text>
            </View>
          ) : events.length === 0 ? (
            <View style={styles.emptyState}>
              <Calendar size={48} color={colors.icon.muted} />
              <Text style={styles.emptyStateText}>No events yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Create your first event to get started!
              </Text>
            </View>
          ) : (
            events.map((event) => {
              const approval = eventApprovals[event.id] || { accepted: 0, total: 0 };
              return (
                <Pressable
                  key={event.id}
                  onPress={() => handleEventPress(event.id)}
                  style={({ pressed }) => [
                    styles.eventCard,
                    { opacity: pressed ? 0.9 : 1 },
                  ]}
                >
                  {/* Event Header */}
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    {/* Approval Badge */}
                    {approval.total > 0 && (
                      <View style={styles.approvalBadge}>
                        <ThumbsUp size={14} color={colors.secondary} />
                        <Text style={styles.approvalText}>
                          {approval.accepted}/{approval.total}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Event Details */}
                  <View style={styles.eventDetails}>
                    <View style={styles.detailRow}>
                      <MapPin size={16} color={colors.icon.muted} />
                      <Text style={styles.detailText} numberOfLines={2}>{event.location}</Text>
                      <Pressable
                        onPress={() => openAddressInMaps(event.location)}
                        style={({ pressed }) => [
                          styles.shareButton,
                          { opacity: pressed ? 0.7 : 1 },
                        ]}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Navigation size={16} color={colors.secondary} />
                      </Pressable>
                    </View>
                    {event.created_at && (
                      <View style={styles.detailRow}>
                        <Calendar size={16} color={colors.icon.muted} />
                        <Text style={styles.detailText}>
                          {new Date(event.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })
          )}
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
  bodySection: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bodyScrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100,
  },
  eventCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    flex: 1,
  },
  approvalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colorOpacity.secondary['20'],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  approvalText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.secondary,
  },
  participantCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 12,
  },
  participantCount: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.mutedForeground,
  },
  eventDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.mutedForeground,
    flex: 1,
  },
  shareButton: {
    padding: 4,
    marginLeft: 4,
  },
  participantsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  participantTag: {
    backgroundColor: colorOpacity.primary['20'],
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  participantTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
});

