// This is a utility script to add sample users to your Supabase database
// You can run this in your browser console or create a temporary component to execute it

import { supabase } from '../lib/supabase'

export const addSampleUsers = async () => {
  const sampleUsers = [
    {
      username: 'johndoe',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      password_hash: 'password123', // In production, this should be hashed
      address: '123 Main St, New York, NY 10001'
    },
    {
      username: 'janesmith',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+1-555-0456',
      password_hash: 'password123',
      address: '456 Oak Ave, Los Angeles, CA 90210'
    },
    {
      username: 'mikejohnson',
      first_name: 'Mike',
      last_name: 'Johnson',
      email: 'mike.johnson@example.com',
      phone: '+1-555-0789',
      password_hash: 'password123',
      address: '789 Pine Rd, Chicago, IL 60601'
    }
  ]

  try {
    console.log('Adding sample users to database...')
    
    for (const user of sampleUsers) {
      const { data, error } = await supabase
        .from('users')
        .insert([user])
        .select()

      if (error) {
        console.error(`Error adding user ${user.email}:`, error)
      } else {
        console.log(`Successfully added user: ${user.email}`, data)
      }
    }
    
    console.log('Sample users added successfully!')
    console.log('You can now test login with:')
    console.log('- Email: john.doe@example.com, Password: password123')
    console.log('- Email: jane.smith@example.com, Password: password123')
    console.log('- Email: mike.johnson@example.com, Password: password123')
    
  } catch (error) {
    console.error('Error adding sample users:', error)
  }
}

// Uncomment the line below to run this function
// addSampleUsers()
