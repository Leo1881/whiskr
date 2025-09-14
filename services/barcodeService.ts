import { WhiskeyService } from './whiskeyService';

export class BarcodeService {
  // Scan barcode and get whiskey info
  static async scanBarcode(barcode: string) {
    try {
      // First, try to find in our database
      const whiskey = await WhiskeyService.getWhiskeyByBarcode(barcode);
      if (whiskey) {
        return {
          found: true,
          source: 'database',
          whiskey,
        };
      }

      // If not found in database, try external APIs
      const externalData = await this.fetchFromExternalAPI(barcode);
      if (externalData) {
        return {
          found: true,
          source: 'external',
          whiskey: externalData,
        };
      }

      return {
        found: false,
        source: null,
        whiskey: null,
      };
    } catch (error) {
      console.error('Barcode scan error:', error);
      throw error;
    }
  }

  // Fetch whiskey data from external APIs
  private static async fetchFromExternalAPI(barcode: string) {
    try {
      // Try UPC Database API first
      const upcData = await this.fetchFromUPCDatabase(barcode);
      if (upcData) return upcData;

      // Try Open Food Facts API
      const offData = await this.fetchFromOpenFoodFacts(barcode);
      if (offData) return offData;

      return null;
    } catch (error) {
      console.error('External API error:', error);
      return null;
    }
  }

  // Fetch from UPC Database API
  private static async fetchFromUPCDatabase(barcode: string) {
    try {
      const response = await fetch(
        `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`
      );
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const item = data.items[0];
        return this.parseUPCDatabaseItem(item);
      }
      return null;
    } catch (error) {
      console.error('UPC Database API error:', error);
      return null;
    }
  }

  // Fetch from Open Food Facts API
  private static async fetchFromOpenFoodFacts(barcode: string) {
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      const data = await response.json();

      if (data.status === 1 && data.product) {
        return this.parseOpenFoodFactsProduct(data.product);
      }
      return null;
    } catch (error) {
      console.error('Open Food Facts API error:', error);
      return null;
    }
  }

  // Parse UPC Database item to whiskey format
  private static parseUPCDatabaseItem(item: any) {
    return {
      name: item.title || 'Unknown Whiskey',
      brand: this.extractBrand(item.title) || 'Unknown Brand',
      distillery: this.extractDistillery(item.title) || 'Unknown Distillery',
      type: 'other' as const,
      region: 'other' as const,
      description: item.description || '',
      image_url: item.images?.[0] || null,
      barcode: item.upc || item.ean || item.isbn,
    };
  }

  // Parse Open Food Facts product to whiskey format
  private static parseOpenFoodFactsProduct(product: any) {
    return {
      name: product.product_name || 'Unknown Whiskey',
      brand: product.brands || 'Unknown Brand',
      distillery:
        this.extractDistillery(product.product_name) || 'Unknown Distillery',
      type: 'other' as const,
      region: 'other' as const,
      description: product.generic_name || '',
      image_url: product.image_url || null,
      barcode: product.code,
    };
  }

  // Helper function to extract brand from title
  private static extractBrand(title: string): string | null {
    if (!title) return null;

    // Common whiskey brand patterns
    const brandPatterns = [
      /^([^,]+)/, // First part before comma
      /^([^-\s]+)/, // First word
    ];

    for (const pattern of brandPatterns) {
      const match = title.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return null;
  }

  // Helper function to extract distillery from title
  private static extractDistillery(title: string): string | null {
    if (!title) return null;

    // Look for common distillery indicators
    const distilleryPatterns = [
      /distilled by ([^,]+)/i,
      /distillery: ([^,]+)/i,
      /at ([^,]+) distillery/i,
    ];

    for (const pattern of distilleryPatterns) {
      const match = title.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return null;
  }

  // Add scanned whiskey to database
  static async addScannedWhiskey(whiskeyData: any) {
    try {
      const whiskey = await WhiskeyService.addWhiskey(whiskeyData);
      return whiskey;
    } catch (error) {
      console.error('Error adding scanned whiskey:', error);
      throw error;
    }
  }
}
