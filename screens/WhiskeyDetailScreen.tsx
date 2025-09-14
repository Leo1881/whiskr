import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  WhiskeyService,
  ReviewService,
  UserService,
} from '../services/whiskeyService';

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

export default function WhiskeyDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { whiskeyId } = route.params as { whiskeyId: string };

  const [whiskey, setWhiskey] = useState<Whiskey | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadWhiskeyDetails();
  }, [whiskeyId]);

  const loadWhiskeyDetails = async () => {
    try {
      const whiskeyData = await WhiskeyService.getWhiskeyById(whiskeyId);
      setWhiskey(whiskeyData);
    } catch (error) {
      console.error('Error loading whiskey details:', error);
      Alert.alert('Error', 'Failed to load whiskey details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToFavorites = async () => {
    try {
      if (isFavorite) {
        await UserService.removeFromFavorites(whiskeyId);
        setIsFavorite(false);
      } else {
        await UserService.addToFavorites(whiskeyId);
        setIsFavorite(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>Loading whiskey details...</Text>
      </View>
    );
  }

  if (!whiskey) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Whiskey not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{
          uri:
            whiskey.image_url ||
            'https://via.placeholder.com/300x400/8B4513/FFFFFF?text=Whiskey',
        }}
        style={styles.whiskeyImage}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{whiskey.name}</Text>
          <Text style={styles.brand}>{whiskey.brand}</Text>
          <Text style={styles.distillery}>{whiskey.distillery}</Text>
        </View>

        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>
            ⭐ {whiskey.average_rating.toFixed(1)} ({whiskey.review_count}{' '}
            reviews)
          </Text>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type:</Text>
            <Text style={styles.detailValue}>
              {whiskey.type.replace('_', ' ')}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Region:</Text>
            <Text style={styles.detailValue}>{whiskey.region}</Text>
          </View>
          {whiskey.age && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Age:</Text>
              <Text style={styles.detailValue}>{whiskey.age} years</Text>
            </View>
          )}
          {whiskey.abv && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>ABV:</Text>
              <Text style={styles.detailValue}>{whiskey.abv}%</Text>
            </View>
          )}
        </View>

        {whiskey.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.description}>{whiskey.description}</Text>
          </View>
        )}

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.favoriteButton]}
            onPress={handleAddToFavorites}
          >
            <Text style={styles.actionButtonText}>
              {isFavorite ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.reviewButton]}
            onPress={() => {
              // TODO: Navigate to review screen
              Alert.alert(
                'Coming Soon',
                'Review feature will be implemented soon'
              );
            }}
          >
            <Text style={styles.actionButtonText}>⭐ Write a Review</Text>
          </TouchableOpacity>
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
  },
  loadingText: {
    marginTop: 10,
    color: '#8B4513',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
  },
  whiskeyImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 5,
  },
  brand: {
    fontSize: 18,
    color: '#666',
    marginBottom: 2,
  },
  distillery: {
    fontSize: 16,
    color: '#888',
  },
  ratingContainer: {
    marginBottom: 20,
  },
  rating: {
    fontSize: 16,
    color: '#8B4513',
    fontWeight: '600',
  },
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  detailValue: {
    fontSize: 16,
    color: '#666',
    textTransform: 'capitalize',
  },
  descriptionContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  actionsContainer: {
    gap: 10,
  },
  actionButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  favoriteButton: {
    backgroundColor: '#8B4513',
  },
  reviewButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#8B4513',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
