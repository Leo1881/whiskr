import { supabase, Whiskey, Review, Profile } from '../lib/supabase';

export class WhiskeyService {
  // Search whiskeys with filters
  static async searchWhiskeys(filters: {
    query?: string;
    type?: string;
    region?: string;
    minAge?: number;
    maxAge?: number;
    minRating?: number;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase.from('whiskey_with_ratings').select('*');

    if (filters.query) {
      query = query.or(
        `name.ilike.%${filters.query}%,brand.ilike.%${filters.query}%,distillery.ilike.%${filters.query}%`
      );
    }

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.region) {
      query = query.eq('region', filters.region);
    }

    if (filters.minAge) {
      query = query.gte('age', filters.minAge);
    }

    if (filters.maxAge) {
      query = query.lte('age', filters.maxAge);
    }

    if (filters.minRating) {
      query = query.gte('average_rating', filters.minRating);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 20) - 1
      );
    }

    const { data, error } = await query.order('average_rating', {
      ascending: false,
    });

    if (error) throw error;
    return data;
  }

  // Get whiskey by ID
  static async getWhiskeyById(id: string) {
    const { data, error } = await supabase
      .from('whiskey_with_ratings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Get whiskey by barcode
  static async getWhiskeyByBarcode(barcode: string) {
    const { data, error } = await supabase
      .from('whiskey_with_ratings')
      .select('*')
      .eq('barcode', barcode)
      .single();

    if (error) throw error;
    return data;
  }

  // Get reviews for a whiskey
  static async getWhiskeyReviews(whiskeyId: string, limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from('reviews')
      .select(
        `
        *,
        profiles:user_id (
          username,
          avatar_url
        )
      `
      )
      .eq('whiskey_id', whiskeyId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  }

  // Add a new whiskey (admin function)
  static async addWhiskey(
    whiskey: Omit<Whiskey, 'id' | 'created_at' | 'updated_at'>
  ) {
    const { data, error } = await supabase
      .from('whiskeys')
      .insert([whiskey])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export class ReviewService {
  // Add a review
  static async addReview(review: {
    whiskey_id: string;
    rating: number;
    tasting_notes?: string;
    tags?: string[];
  }) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('reviews')
      .insert([
        {
          ...review,
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update a review
  static async updateReview(
    reviewId: string,
    updates: {
      rating?: number;
      tasting_notes?: string;
      tags?: string[];
    }
  ) {
    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', reviewId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete a review
  static async deleteReview(reviewId: string) {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;
  }

  // Get user's reviews
  static async getUserReviews(userId: string, limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from('reviews')
      .select(
        `
        *,
        whiskeys:whiskey_id (
          name,
          brand,
          distillery,
          image_url
        )
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  }
}

export class UserService {
  // Get user profile
  static async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  // Update user profile
  static async updateProfile(
    userId: string,
    updates: {
      username?: string;
      avatar_url?: string;
      preferences?: any;
    }
  ) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Add whiskey to favorites
  static async addToFavorites(whiskeyId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_favorites')
      .insert([
        {
          user_id: user.id,
          whiskey_id: whiskeyId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Remove whiskey from favorites
  static async removeFromFavorites(whiskeyId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('whiskey_id', whiskeyId);

    if (error) throw error;
  }

  // Get user's favorite whiskeys
  static async getFavorites(userId: string, limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from('user_favorites')
      .select(
        `
        *,
        whiskeys:whiskey_id (
          *,
          average_rating,
          review_count
        )
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  }
}
