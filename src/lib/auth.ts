import { supabase, User, LoginCredentials, RegisterData } from './supabase'

export class AuthService {
  // Sign up a new user - Direct database insert
  static async signUp(userData: RegisterData) {
    try {
      // Check if user already exists by email
      const { exists: emailExists } = await this.checkUserExists(userData.email)
      if (emailExists) {
        return { data: null, error: { message: 'User with this email already exists. Please sign in instead.' } }
      }

      // Check if username already exists
      const { exists: usernameExists } = await this.checkUsernameExists(userData.username)
      if (usernameExists) {
        return { data: null, error: { message: 'Username is already taken. Please choose a different username.' } }
      }

      // Insert user data directly into our custom users table
      const { data, error } = await supabase
        .from('users')
        .insert({
          username: userData.username,
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          phone: userData.phone,
          address: userData.address,
          password_hash: userData.password // Note: In production, hash this password
        })
        .select()
        .single()

      if (error) throw error

      // Create a mock user object for consistency
      const mockUser = {
        id: data.id,
        email: data.email,
        user_metadata: {
          username: data.username,
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          address: data.address
        }
      }

      return { 
        data: { 
          user: mockUser, 
          profile: data 
        }, 
        error: null 
      }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Simple username and password validation
  static async signIn(credentials: LoginCredentials) {
    try {
      // Query the users table directly
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', credentials.username)
        .eq('password_hash', credentials.password)

      if (error) {
        return { data: null, error: { message: 'Database error. Please try again.' } }
      }

      if (!users || users.length === 0) {
        return { data: null, error: { message: 'Invalid username or password.' } }
      }

      const user = users[0];

      // Create a simple user object
      const mockUser = {
        id: user.id,
        email: user.email,
        user_metadata: {
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          address: user.address
        }
      }

      return { 
        data: { 
          user: mockUser, 
          profile: user 
        }, 
        error: null 
      }
    } catch (error) {
      return { data: null, error: { message: 'An error occurred. Please try again.' } }
    }
  }

  // Check if user exists by email (for verification)
  static async checkUserExists(email: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, username, first_name, last_name')
        .eq('email', email)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      return { exists: !!data, user: data, error: null }
    } catch (error) {
      return { exists: false, user: null, error }
    }
  }

  // Check if username exists
  static async checkUsernameExists(username: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username')
        .eq('username', username)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      return { exists: !!data, user: data, error: null }
    } catch (error) {
      return { exists: false, user: null, error }
    }
  }

  // Get current user profile
  static async getCurrentUser() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return { user: null, profile: null, error: authError }
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      return { user, profile, error: null }
    } catch (error) {
      return { user: null, profile: null, error }
    }
  }

  // Sign out
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  }
}
