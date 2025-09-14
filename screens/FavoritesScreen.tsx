import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { UserService } from '../services/whiskeyService';

interface Favorite {
  id: string;
  created_at: string;
  whiskeys: {
    id: string;
    name: string;
    brand: string;
    distillery: string;
    type: string;
    region: string;
    age?: number;
    abv?: number;
    image_url?: string;
    average_rating: number;
    review_count: number;
  };
}

export default function FavoritesScreen() {
  const navigation = useNavigation();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      // For now, we'll use a mock user ID since we don't have the current user context
      // In a real app, you'd get this from the auth context
      const mockUserId = 'current-user-id';
      const favoritesData = await UserService.getFavorites(mockUserId);
      setFavorites(favoritesData || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderFavoriteItem = ({ item }: { item: Favorite }) => (
    <TouchableOpacity
      style={styles.favoriteItem}
      onPress={() =>
        navigation.navigate('WhiskeyDetail', { whiskeyId: item.whiskeys.id })
      }
    >
      <Image
        source={{
          uri:
            item.whiskeys.image_url ||
            'https://via.placeholder.com/80x120/8B4513/FFFFFF?text=Whiskey',
        }}
        style={styles.whiskeyImage}
        resizeMode="cover"
      />
      <View style={styles.whiskeyInfo}>
        <Text style={styles.whiskeyName} numberOfLines={2}>
          {item.whiskeys.name}
        </Text>
        <Text style={styles.whiskeyBrand}>{item.whiskeys.brand}</Text>
        <Text style={styles.whiskeyDetails}>
          {item.whiskeys.type.replace('_', ' ')} • {item.whiskeys.region}
          {item.whiskeys.age && ` • ${item.whiskeys.age} years`}
        </Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>
            ⭐ {item.whiskeys.average_rating.toFixed(1)} (
            {item.whiskeys.review_count} reviews)
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>Loading your favorites...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Favorites Yet</Text>
          <Text style={styles.emptyText}>
            Start exploring whiskeys and add them to your favorites!
          </Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Text style={styles.exploreButtonText}>🔍 Explore Whiskeys</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#8B4513',
    fontSize: 16,
  },
  list: {
    flex: 1,
  },
  favoriteItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 10,
    padding: 10,
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    color: '#8B4513',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  exploreButton: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
