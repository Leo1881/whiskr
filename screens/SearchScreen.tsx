import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
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

const WHISKEY_TYPES = [
  { label: 'All Types', value: '' },
  { label: 'Single Malt', value: 'single_malt' },
  { label: 'Blended Malt', value: 'blended_malt' },
  { label: 'Bourbon', value: 'bourbon' },
  { label: 'Rye', value: 'rye' },
  { label: 'Irish', value: 'irish' },
  { label: 'Japanese', value: 'japanese' },
];

const REGIONS = [
  { label: 'All Regions', value: '' },
  { label: 'Islay', value: 'islay' },
  { label: 'Speyside', value: 'speyside' },
  { label: 'Highland', value: 'highland' },
  { label: 'Kentucky', value: 'kentucky' },
  { label: 'Ireland', value: 'ireland' },
  { label: 'Japan', value: 'japan' },
];

export default function SearchScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [whiskeys, setWhiskeys] = useState<Whiskey[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    // Load some initial whiskeys
    loadWhiskeys();
  }, []);

  const loadWhiskeys = async (filters: any = {}) => {
    setLoading(true);
    try {
      const results = await WhiskeyService.searchWhiskeys({
        query: searchQuery || undefined,
        type: selectedType || undefined,
        region: selectedRegion || undefined,
        limit: 20,
        ...filters,
      });
      setWhiskeys(results || []);
      setHasSearched(true);
    } catch (error) {
      console.error('Error searching whiskeys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadWhiskeys();
  };

  const handleFilterChange = (type: string, value: string) => {
    if (type === 'whiskey_type') {
      setSelectedType(value);
    } else if (type === 'region') {
      setSelectedRegion(value);
    }
    // Auto-search when filters change
    setTimeout(() => {
      loadWhiskeys();
    }, 100);
  };

  const renderWhiskeyItem = ({ item }: { item: Whiskey }) => (
    <TouchableOpacity
      style={styles.whiskeyItem}
      onPress={() =>
        navigation.navigate('WhiskeyDetail', { whiskeyId: item.id })
      }
    >
      <Image
        source={{
          uri:
            item.image_url ||
            'https://via.placeholder.com/80x120/8B4513/FFFFFF?text=Whiskey',
        }}
        style={styles.whiskeyImage}
        resizeMode="cover"
      />
      <View style={styles.whiskeyInfo}>
        <Text style={styles.whiskeyName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.whiskeyBrand}>{item.brand}</Text>
        <Text style={styles.whiskeyDetails}>
          {item.type.replace('_', ' ')} • {item.region}
          {item.age && ` • ${item.age} years`}
        </Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>
            ⭐ {item.average_rating.toFixed(1)} ({item.review_count} reviews)
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterButton = (
    label: string,
    value: string,
    type: string,
    isSelected: boolean
  ) => (
    <TouchableOpacity
      key={value}
      style={[styles.filterButton, isSelected && styles.filterButtonSelected]}
      onPress={() => handleFilterChange(type, value)}
    >
      <Text
        style={[
          styles.filterButtonText,
          isSelected && styles.filterButtonTextSelected,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search whiskeys, brands, distilleries..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <Text style={styles.filterTitle}>Type:</Text>
        <View style={styles.filterRow}>
          {WHISKEY_TYPES.map((type) =>
            renderFilterButton(
              type.label,
              type.value,
              'whiskey_type',
              selectedType === type.value
            )
          )}
        </View>

        <Text style={styles.filterTitle}>Region:</Text>
        <View style={styles.filterRow}>
          {REGIONS.map((region) =>
            renderFilterButton(
              region.label,
              region.value,
              'region',
              selectedRegion === region.value
            )
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B4513" />
          <Text style={styles.loadingText}>Searching whiskeys...</Text>
        </View>
      ) : (
        <FlatList
          data={whiskeys}
          renderItem={renderWhiskeyItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            hasSearched ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No whiskeys found</Text>
                <Text style={styles.emptySubtext}>
                  Try adjusting your search or filters
                </Text>
              </View>
            ) : null
          }
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
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  searchButton: {
    marginLeft: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B4513',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 18,
    color: '#fff',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 8,
    marginTop: 5,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterButtonSelected: {
    backgroundColor: '#8B4513',
    borderColor: '#8B4513',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
  },
  filterButtonTextSelected: {
    color: '#fff',
  },
  list: {
    flex: 1,
  },
  whiskeyItem: {
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});
