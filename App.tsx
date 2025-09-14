import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import { supabase } from './lib/supabase';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [whiskeys, setWhiskeys] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    checkAuth();
    loadWhiskeys();
  }, []);

  const checkAuth = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWhiskeys = async () => {
    try {
      const { data, error } = await supabase
        .from('whiskey_with_ratings')
        .select('*')
        .limit(10);

      if (error) throw error;
      setWhiskeys(data || []);
    } catch (error) {
      console.error('Error loading whiskeys:', error);
    }
  };

  const signInAsGuest = async () => {
    // Create a mock user object for demo purposes
    const mockUser = {
      id: 'demo-user-123',
      email: 'demo@whiskr.com',
      user_metadata: {
        username: 'Demo User',
      },
    };
    setUser(mockUser);
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>Loading Whiskr...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🍾 Welcome to Whiskr</Text>
          <Text style={styles.subtitle}>
            Sign in to discover your next favorite whiskey
          </Text>
        </View>

        <View style={styles.authContainer}>
          <TouchableOpacity style={styles.signInButton} onPress={signInAsGuest}>
            <Text style={styles.buttonText}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>

        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🍾 Whiskr</Text>
        <Text style={styles.subtitle}>Welcome back, {user.email}!</Text>
        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search whiskeys..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Featured Whiskeys</Text>
        {whiskeys.map((whiskey) => (
          <View key={whiskey.id} style={styles.whiskeyCard}>
            <Image
              source={{
                uri:
                  whiskey.image_url ||
                  'https://via.placeholder.com/80x120/8B4513/FFFFFF?text=Whiskey',
              }}
              style={styles.whiskeyImage}
            />
            <View style={styles.whiskeyInfo}>
              <Text style={styles.whiskeyName}>{whiskey.name}</Text>
              <Text style={styles.whiskeyBrand}>{whiskey.brand}</Text>
              <Text style={styles.whiskeyDetails}>
                {whiskey.type.replace('_', ' ')} • {whiskey.region}
                {whiskey.age && ` • ${whiskey.age} years`}
              </Text>
              <Text style={styles.rating}>
                ⭐ {whiskey.average_rating?.toFixed(1) || '0.0'} (
                {whiskey.review_count || 0} reviews)
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#8B4513',
    marginTop: 10,
  },
  header: {
    backgroundColor: '#8B4513',
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  signInButton: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    marginTop: 10,
    padding: 10,
  },
  signOutText: {
    color: '#fff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 15,
  },
  whiskeyCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  whiskeyImage: {
    width: 60,
    height: 90,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  whiskeyInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'space-between',
  },
  whiskeyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  whiskeyBrand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  whiskeyDetails: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
    textTransform: 'capitalize',
  },
  rating: {
    fontSize: 12,
    color: '#8B4513',
    fontWeight: '500',
  },
});
