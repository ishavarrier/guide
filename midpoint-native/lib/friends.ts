import { supabase } from './supabase';

export interface FriendRequest {
  id: string;
  requester_id: string;
  responder_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  requester?: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    address?: string;
  };
  responder?: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    address?: string;
  };
}

export interface Friend {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
}

export class FriendsService {
  private static currentUserId: string | null = null;

  static setCurrentUserId(userId: string) {
    this.currentUserId = userId;
  }

  static getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  // Get current user ID from auth or stored value
  private static async getUserId(): Promise<string | null> {
    if (this.currentUserId) {
      return this.currentUserId;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Get user ID from users table
        const { data: profile } = await supabase
          .from('users')
          .select('id')
          .eq('email', user.email)
          .single();
        
        if (profile) {
          this.currentUserId = profile.id;
          return profile.id;
        }
      }
    } catch (error) {
      console.error('Error getting user ID:', error);
    }
    
    return null;
  }

  // Send a friend request
  static async sendFriendRequest(responderId: string) {
    try {
      const requesterId = await this.getUserId();
      if (!requesterId) {
        return { data: null, error: { message: 'User not authenticated' } };
      }

      if (requesterId === responderId) {
        return { data: null, error: { message: 'Cannot send friend request to yourself' } };
      }

      // Check if request already exists
      const { data: existingRequests } = await supabase
        .from('friend_requests')
        .select('*')
        .or(`and(requester_id.eq.${requesterId},responder_id.eq.${responderId}),and(requester_id.eq.${responderId},responder_id.eq.${requesterId})`);
      
      const existing = existingRequests && existingRequests.length > 0 ? existingRequests[0] : null;

      if (existing) {
        if (existing.status === 'accepted') {
          return { data: null, error: { message: 'Already friends with this user' } };
        }
        if (existing.status === 'pending') {
          return { data: null, error: { message: 'Friend request already sent' } };
        }
      }

      const { data, error } = await supabase
        .from('friend_requests')
        .insert({
          requester_id: requesterId,
          responder_id: responderId,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Failed to send friend request' } };
    }
  }

  // Accept a friend request
  static async acceptFriendRequest(requestId: string) {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        return { data: null, error: { message: 'User not authenticated' } };
      }

      const { data, error } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId)
        .eq('responder_id', userId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Failed to accept friend request' } };
    }
  }

  // Reject a friend request
  static async rejectFriendRequest(requestId: string) {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        return { data: null, error: { message: 'User not authenticated' } };
      }

      const { data, error } = await supabase
        .from('friend_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId)
        .eq('responder_id', userId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Failed to reject friend request' } };
    }
  }

  // Get all accepted friends
  static async getFriends(): Promise<{ data: Friend[] | null; error: any }> {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        return { data: null, error: { message: 'User not authenticated' } };
      }

      // Get all accepted friend requests where user is requester or responder
      const { data: requests, error } = await supabase
        .from('friend_requests')
        .select(`
          id,
          requester_id,
          responder_id,
          requester:users!requester_id(id, username, first_name, last_name, email, phone, address),
          responder:users!responder_id(id, username, first_name, last_name, email, phone, address)
        `)
        .eq('status', 'accepted')
        .or(`requester_id.eq.${userId},responder_id.eq.${userId}`);

      if (error) throw error;

      // Map to Friend objects
      const friends: Friend[] = (requests || []).map((req) => {
        const friend = req.requester_id === userId ? req.responder : req.requester;
        return {
          id: friend.id,
          username: friend.username,
          first_name: friend.first_name,
          last_name: friend.last_name,
          email: friend.email,
          phone: friend.phone,
          address: friend.address,
        };
      });

      return { data: friends, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Failed to get friends' } };
    }
  }

  // Get pending friend requests (received)
  static async getPendingRequests(): Promise<{ data: FriendRequest[] | null; error: any }> {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        return { data: null, error: { message: 'User not authenticated' } };
      }

      const { data, error } = await supabase
        .from('friend_requests')
        .select(`
          id,
          requester_id,
          responder_id,
          status,
          created_at,
          updated_at,
          requester:users!requester_id(id, username, first_name, last_name, email, address)
        `)
        .eq('responder_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Failed to get pending requests' } };
    }
  }

  // Get sent friend requests (pending)
  static async getSentRequests(): Promise<{ data: FriendRequest[] | null; error: any }> {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        return { data: null, error: { message: 'User not authenticated' } };
      }

      const { data, error } = await supabase
        .from('friend_requests')
        .select(`
          id,
          requester_id,
          responder_id,
          status,
          created_at,
          updated_at,
          responder:users!responder_id(id, username, first_name, last_name, email, address)
        `)
        .eq('requester_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Failed to get sent requests' } };
    }
  }

  // Search users by username or email
  static async searchUsers(query: string): Promise<{ data: Friend[] | null; error: any }> {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        return { data: null, error: { message: 'User not authenticated' } };
      }

      if (!query || query.trim().length < 2) {
        return { data: [], error: null };
      }

      const searchTerm = query.trim();
      const { data, error } = await supabase
        .from('users')
        .select('id, username, first_name, last_name, email, phone, address')
        .neq('id', userId)
        .or(`username.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
        .limit(20);

      if (error) throw error;

      const users: Friend[] = (data || []).map((user) => ({
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        address: user.address,
      }));

      return { data: users, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Failed to search users' } };
    }
  }
}

