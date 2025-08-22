export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface GeolocationAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  formatted: string;
  coordinates: GeolocationCoordinates;
}

export class GeolocationService {
  private static instance: GeolocationService;

  static getInstance(): GeolocationService {
    if (!GeolocationService.instance) {
      GeolocationService.instance = new GeolocationService();
    }
    return GeolocationService.instance;
  }

  async getCurrentLocation(): Promise<GeolocationCoordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes cache
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          let errorMessage = 'Unknown geolocation error';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          reject(new Error(errorMessage));
        },
        options
      );
    });
  }

  async reverseGeocode(coordinates: GeolocationCoordinates): Promise<GeolocationAddress> {
    try {
      // Use Google Maps Geocoding API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.latitude},${coordinates.longitude}&key=${process.env.GOOGLE_MAPS_API_KEY || ''}`
      );
      
      if (!response.ok) {
        throw new Error(`Google Maps API failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status !== 'OK' || !data.results.length) {
        throw new Error('No address found for coordinates');
      }
      
      return this.parseGoogleMapsResponse(data.results[0], coordinates);
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      // Fallback to MapBox API
      return this.reverseGeocodeMapBox(coordinates);
    }
  }

  private async reverseGeocodeMapBox(coordinates: GeolocationCoordinates): Promise<GeolocationAddress> {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates.longitude},${coordinates.latitude}.json?access_token=${process.env.MAPBOX_API_KEY || ''}`
      );
      
      if (!response.ok) {
        throw new Error(`MapBox API failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.features.length) {
        throw new Error('No address found for coordinates');
      }
      
      return this.parseMapBoxResponse(data.features[0], coordinates);
    } catch (error) {
      console.error('MapBox geocoding failed:', error);
      throw new Error('Failed to get address from coordinates');
    }
  }

  private parseGoogleMapsResponse(result: any, coordinates: GeolocationCoordinates): GeolocationAddress {
    const components = result.address_components;
    
    let street = '';
    let city = '';
    let state = '';
    let zip = '';
    
    components.forEach((component: any) => {
      const types = component.types;
      
      if (types.includes('street_number')) {
        street = component.long_name + ' ';
      } else if (types.includes('route')) {
        street += component.long_name;
      } else if (types.includes('locality')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        state = component.short_name;
      } else if (types.includes('postal_code')) {
        zip = component.long_name;
      }
    });
    
    return {
      street: street.trim(),
      city,
      state,
      zip,
      formatted: result.formatted_address,
      coordinates
    };
  }

  private parseMapBoxResponse(feature: any, coordinates: GeolocationCoordinates): GeolocationAddress {
    const context = feature.context || [];
    const address = feature.place_name;
    
    let city = '';
    let state = '';
    let zip = '';
    
    context.forEach((item: any) => {
      if (item.id.startsWith('place')) {
        city = item.text;
      } else if (item.id.startsWith('region')) {
        state = item.short_code?.replace('US-', '') || item.text;
      } else if (item.id.startsWith('postcode')) {
        zip = item.text;
      }
    });
    
    // Extract street from address
    const street = feature.address ? `${feature.address} ${feature.text}` : feature.text;
    
    return {
      street,
      city,
      state,
      zip,
      formatted: address,
      coordinates
    };
  }

  async getCurrentAddress(): Promise<GeolocationAddress> {
    console.log('🌍 Getting current location...');
    
    try {
      const coordinates = await this.getCurrentLocation();
      console.log('📍 Location found:', coordinates);
      
      const address = await this.reverseGeocode(coordinates);
      console.log('🏠 Address resolved:', address.formatted);
      
      return address;
    } catch (error) {
      console.error('Failed to get current address:', error);
      throw error;
    }
  }
}
