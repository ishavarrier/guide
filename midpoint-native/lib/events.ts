import { supabase, Event, EventInvitation, PollVote } from './supabase'

export class EventsService {
  /**
   * Create a new event and invite users
   */
  static async createEvent(
    title: string,
    location: string,
    createdBy: string,
    invitedUserIds: string[],
    date?: string,
    time?: string
  ): Promise<{ data: Event | null; error: any }> {
    try {
      console.log('📝 EventService.createEvent called with:', {
        title,
        location,
        createdBy,
        invitedUserIds,
        date,
        time,
      });

      // Create the event
      const eventData: any = {
        title,
        location,
        created_by: createdBy,
      };
      
      // Add date and time if provided
      if (date) {
        eventData.date = date;
      }
      if (time) {
        eventData.time = time;
      }

      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single()

      if (eventError) {
        console.error('❌ Supabase error creating event:', eventError);
        console.error('Error code:', eventError.code);
        console.error('Error message:', eventError.message);
        console.error('Error details:', eventError.details);
        console.error('Error hint:', eventError.hint);
        throw eventError;
      }
      
      if (!event) {
        console.error('❌ No event returned from insert');
        return { data: null, error: { message: 'Failed to create event' } }
      }

      console.log('✅ Event created in database:', event.id);

      // Create invitations for all invited users (including creator if they're in the list)
      const invitations = invitedUserIds.map((userId) => ({
        event_id: event.id,
        user_id: userId,
        status: 'pending' as const,
      }))

      const { error: inviteError } = await supabase
        .from('event_invitations')
        .insert(invitations)

      if (inviteError) {
        console.error('Error creating invitations:', inviteError)
        // Event was created but invitations failed - still return success
        // but log the error
      }

      return { data: event, error: null }
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Failed to create event' } }
    }
  }

  /**
   * Record a vote on a time poll option
   */
  static async recordVote(
    eventId: string,
    userId: string,
    timeOption: string
  ): Promise<{ data: PollVote | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('poll_votes')
        .insert({
          event_id: eventId,
          user_id: userId,
          time_option: timeOption,
        })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      // If it's a unique constraint violation, the user already voted - that's okay
      if (error.code === '23505') {
        return { data: null, error: { message: 'Already voted on this time option' } }
      }
      return { data: null, error: { message: error.message || 'Failed to record vote' } }
    }
  }

  /**
   * Remove a vote (toggle off)
   */
  static async removeVote(
    eventId: string,
    userId: string,
    timeOption: string
  ): Promise<{ data: null; error: any }> {
    try {
      const { error } = await supabase
        .from('poll_votes')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .eq('time_option', timeOption)

      if (error) throw error
      return { data: null, error: null }
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Failed to remove vote' } }
    }
  }

  /**
   * Get event with all details (invitations and votes)
   */
  static async getEventWithDetails(
    eventId: string
  ): Promise<{ data: any | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          invitations:event_invitations(
            *,
            user:users(id, username, first_name, last_name, email)
          ),
          votes:poll_votes(
            *,
            user:users(id, username, first_name, last_name)
          )
        `)
        .eq('id', eventId)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Failed to get event' } }
    }
  }

  /**
   * Update invitation status (accept/decline)
   */
  static async updateInvitationStatus(
    eventId: string,
    userId: string,
    status: 'accepted' | 'declined'
  ): Promise<{ data: EventInvitation | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('event_invitations')
        .update({
          status,
          responded_at: new Date().toISOString(),
        })
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Failed to update invitation status' } }
    }
  }

  /**
   * Get all events for a user (created by or invited to)
   */
  static async getUserEvents(userId: string): Promise<{ data: Event[] | null; error: any }> {
    try {
      // Get events where user is creator
      const { data: createdEvents, error: createdError } = await supabase
        .from('events')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false })

      if (createdError) {
        console.error('Error fetching created events:', createdError)
      }

      // Get events where user is invited
      const { data: invitations, error: inviteError } = await supabase
        .from('event_invitations')
        .select('event_id')
        .eq('user_id', userId)

      if (inviteError) {
        console.error('Error fetching invitations:', inviteError)
        // Return created events even if invitations fail
        return { data: createdEvents || [], error: null }
      }

      const invitedEventIds = invitations?.map(inv => inv.event_id) || []
      
      let invitedEvents: any[] = []
      if (invitedEventIds.length > 0) {
        const { data: invited, error: invitedError } = await supabase
          .from('events')
          .select('*')
          .in('id', invitedEventIds)
          .order('created_at', { ascending: false })

        if (!invitedError && invited) {
          invitedEvents = invited
        }
      }

      // Combine and deduplicate events
      const allEvents = [...(createdEvents || []), ...invitedEvents]
      const uniqueEvents = allEvents.filter((event, index, self) =>
        index === self.findIndex(e => e.id === event.id)
      )

      // Sort by created_at descending
      const sortedEvents = uniqueEvents.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      return { data: sortedEvents, error: null }
    } catch (error: any) {
      console.error('Error in getUserEvents:', error)
      return { data: null, error: { message: error.message || 'Failed to get events' } }
    }
  }

  /**
   * Propose/vote for an alternative location
   * This both proposes the location (if first time) and votes for it
   */
  static async proposeLocation(
    eventId: string,
    userId: string,
    placeId: string,
    name: string,
    address: string,
    coordinates: { lat: number; lng: number }
  ): Promise<{ data: any | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('event_location_votes')
        .insert({
          event_id: eventId,
          user_id: userId,
          place_id: placeId,
          name,
          address,
          coordinates,
        })
        .select()
        .single()

      if (error) {
        // If it's a unique constraint violation, user already voted for this location
        if (error.code === '23505') {
          return { data: null, error: { message: 'You already voted for this location' } }
        }
        throw error
      }
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Failed to propose location' } }
    }
  }

  /**
   * Remove vote for a location (toggle off)
   */
  static async removeLocationVote(
    eventId: string,
    userId: string,
    placeId: string
  ): Promise<{ data: null; error: any }> {
    try {
      const { error } = await supabase
        .from('event_location_votes')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .eq('place_id', placeId)

      if (error) throw error
      return { data: null, error: null }
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Failed to remove location vote' } }
    }
  }

  /**
   * Get all location proposals with vote counts and voters
   * Groups by place_id and includes user info
   */
  static async getLocationProposals(
    eventId: string
  ): Promise<{ data: any[] | null; error: any }> {
    try {
      const { data: votes, error } = await supabase
        .from('event_location_votes')
        .select(`
          *,
          user:users(id, username, first_name, last_name)
        `)
        .eq('event_id', eventId)
        .order('voted_at', { ascending: false })

      if (error) throw error

      if (!votes || votes.length === 0) {
        return { data: [], error: null }
      }

      // Group by place_id to get unique locations with vote counts
      const locationMap = new Map<string, any>()

      votes.forEach((vote: any) => {
        const placeId = vote.place_id
        if (!locationMap.has(placeId)) {
          locationMap.set(placeId, {
            place_id: placeId,
            name: vote.name,
            address: vote.address,
            coordinates: vote.coordinates,
            vote_count: 0,
            voters: [],
            first_proposed_at: vote.voted_at,
          })
        }

        const location = locationMap.get(placeId)!
        location.vote_count++
        if (vote.user) {
          location.voters.push({
            id: vote.user.id,
            username: vote.user.username,
            first_name: vote.user.first_name,
            last_name: vote.user.last_name,
            voted_at: vote.voted_at,
          })
        }
      })

      // Convert map to array and sort by vote count (descending)
      const locations = Array.from(locationMap.values()).sort(
        (a, b) => b.vote_count - a.vote_count
      )

      return { data: locations, error: null }
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Failed to get location proposals' } }
    }
  }
}

