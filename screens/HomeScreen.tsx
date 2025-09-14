import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { WhiskeyService } from '../services/whiskeyService';

interface Whiskey {
  id: string;
  name: string;
  brand: string;
  distillery: string;
  type: string;
  region: string;
  age?: number;
  abv?: number;
  description?: string;
  image_url?: string;
  average_rating: number;
  review_count: number;
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const [featuredWhiskeys, setFeaturedWhiskeys] = useState<Whiskey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedWhiskeys();
  }, []);

  const loadFeaturedWhiskeys = async () => {
    try {
      const whiskeys = await WhiskeyService.searchWhiskeys({
        limit: 6,
        minRating: 3.5,
      });
      setFeaturedWhiskeys(whiskeys || []);
    } catch (error) {
      console.error('Error loading featured whiskeys:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderWhiskeyCard = (whiskey: Whiskey) => (
    <TouchableOpacity
      key={whiskey.id}
      style={styles.whiskeyCard}
      onPress={() =>
        navigation.navigate('WhiskeyDetail', { whiskeyId: whiskey.id })
      }
    >
      <Image
        source={{
          uri:
            whiskey.image_url ||
            'https://via.placeholder.com/150x200/8B4513/FFFFFF?text=Whiskey',
        }}
        style={styles.whiskeyImage}
        resizeMode="cover"
      />
      <View style={styles.whiskeyInfo}>
        <Text style={styles.whiskeyName} numberOfLines={2}>
          {whiskey.name}
        </Text>
        <Text style={styles.whiskeyBrand}>{whiskey.brand}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>
            ⭐ {whiskey.average_rating.toFixed(1)} ({whiskey.review_count})
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>Loading featured whiskeys...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome to Whiskr</Text>
        <Text style={styles.subtitle}>Discover your next favorite whiskey</Text>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Search')}
        >
          <Text style={styles.actionButtonText}>🔍 Search Whiskeys</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Search')}
        >
          <Text style={styles.actionButtonText}>📱 Scan Barcode</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Whiskeys</Text>
        <Text style={styles.sectionSubtitle}>
          Highly rated by our community
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
        >
          {featuredWhiskeys.map(renderWhiskeyCard)}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{featuredWhiskeys.length}+</Text>
            <Text style={styles.statLabel}>Whiskeys</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4.2</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>50+</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#8B4513',
    fontSize: 16,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  quickActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#8B4513',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginLeft: 20,
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 20,
    marginBottom: 15,
  },
  horizontalScroll: {
    paddingLeft: 20,
  },
  whiskeyCard: {
    width: 150,
    marginRight: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  whiskeyImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
  },
  whiskeyInfo: {
    padding: 10,
  },
  whiskeyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  whiskeyBrand: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    color: '#8B4513',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});
