import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesOfferings,
  PurchasesPackage,
  LOG_LEVEL,
} from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Product identifiers configurados en App Store Connect / Google Play Console
export const PRODUCT_IDS = {
  MONTHLY_PRO: 'mentor_pro_monthly',
  ANNUAL_PRO: 'mentor_pro_annual',
} as const;

// Entitlements configurados en RevenueCat dashboard
export const ENTITLEMENTS = {
  PRO: 'pro',
} as const;

export type SubscriptionTier = 'free' | 'pro';
export type PurchaseState = 'loading' | 'success' | 'error' | 'cancelled' | 'idle';

export interface PurchaseResult {
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}

export interface UserSubscriptionInfo {
  tier: SubscriptionTier;
  isActive: boolean;
  expirationDate?: string;
  originalPurchaseDate?: string;
  productIdentifier?: string;
}

class PurchaseService {
  private isConfigured = false;

  /**
   * Inicializa RevenueCat con la API key
   */
  async initialize(apiKey: string, userId?: string): Promise<void> {
    try {
      if (this.isConfigured) {
        console.log('RevenueCat already configured');
        return;
      }

      // Configurar RevenueCat
      Purchases.setLogLevel(LOG_LEVEL.INFO);

      await Purchases.configure({
        apiKey,
        appUserID: userId, // Sincronizar con nuestro user ID
      });

      this.isConfigured = true;
      console.log('RevenueCat configured successfully');

      // Obtener info inicial del usuario
      await this.getCustomerInfo();
    } catch (error) {
      console.error('Failed to configure RevenueCat:', error);
      throw new Error('Failed to initialize purchase service');
    }
  }

  /**
   * Obtiene información de suscripción del usuario
   */
  async getCustomerInfo(): Promise<CustomerInfo | null> {
    try {
      if (!this.isConfigured) {
        console.warn('RevenueCat not configured yet');
        return null;
      }

      const customerInfo = await Purchases.getCustomerInfo();
      await this.cacheCustomerInfo(customerInfo);
      return customerInfo;
    } catch (error) {
      console.error('Failed to get customer info:', error);
      return null;
    }
  }

  /**
   * Obtiene las ofertas disponibles (precios desde las stores)
   */
  async getOfferings(): Promise<PurchasesOfferings | null> {
    try {
      if (!this.isConfigured) {
        throw new Error('RevenueCat not configured');
      }

      const offerings = await Purchases.getOfferings();
      return offerings;
    } catch (error) {
      console.error('Failed to get offerings:', error);
      return null;
    }
  }

  /**
   * Compra un producto específico
   */
  async purchasePackage(purchasePackage: PurchasesPackage): Promise<PurchaseResult> {
    try {
      if (!this.isConfigured) {
        throw new Error('RevenueCat not configured');
      }

      const { customerInfo } = await Purchases.purchasePackage(purchasePackage);
      await this.cacheCustomerInfo(customerInfo);

      return {
        success: true,
        customerInfo,
      };
    } catch (error: any) {
      console.error('Purchase failed:', error);

      if (error.userCancelled) {
        return {
          success: false,
          error: 'Purchase was cancelled',
        };
      }

      return {
        success: false,
        error: error.message || 'Purchase failed',
      };
    }
  }

  /**
   * Restaura compras previas (requerido por iOS)
   */
  async restorePurchases(): Promise<PurchaseResult> {
    try {
      if (!this.isConfigured) {
        throw new Error('RevenueCat not configured');
      }

      const customerInfo = await Purchases.restorePurchases();
      await this.cacheCustomerInfo(customerInfo);

      return {
        success: true,
        customerInfo,
      };
    } catch (error: any) {
      console.error('Restore purchases failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to restore purchases',
      };
    }
  }

  /**
   * Verifica si el usuario tiene una suscripción Pro activa
   */
  isPro(customerInfo?: CustomerInfo): boolean {
    if (!customerInfo) return false;
    return customerInfo.entitlements.active[ENTITLEMENTS.PRO] != null;
  }

  /**
   * Obtiene información detallada de la suscripción
   */
  getSubscriptionInfo(customerInfo?: CustomerInfo): UserSubscriptionInfo {
    if (!customerInfo) {
      return {
        tier: 'free',
        isActive: false,
      };
    }

    const proEntitlement = customerInfo.entitlements.active[ENTITLEMENTS.PRO];

    if (proEntitlement) {
      return {
        tier: 'pro',
        isActive: true,
        expirationDate: proEntitlement.expirationDate,
        originalPurchaseDate: proEntitlement.originalPurchaseDate,
        productIdentifier: proEntitlement.productIdentifier,
      };
    }

    return {
      tier: 'free',
      isActive: false,
    };
  }

  /**
   * Cachea la información del cliente localmente
   */
  private async cacheCustomerInfo(customerInfo: CustomerInfo): Promise<void> {
    try {
      const subscriptionInfo = this.getSubscriptionInfo(customerInfo);
      await AsyncStorage.setItem('subscription_info', JSON.stringify(subscriptionInfo));
    } catch (error) {
      console.error('Failed to cache customer info:', error);
    }
  }

  /**
   * Obtiene la información de suscripción desde cache
   */
  async getCachedSubscriptionInfo(): Promise<UserSubscriptionInfo> {
    try {
      const cached = await AsyncStorage.getItem('subscription_info');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('Failed to get cached subscription info:', error);
    }

    return {
      tier: 'free',
      isActive: false,
    };
  }

  /**
   * Limpia la cache de suscripción (útil en logout)
   */
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem('subscription_info');
    } catch (error) {
      console.error('Failed to clear subscription cache:', error);
    }
  }

  /**
   * Obtiene el precio formateado para mostrar en la UI
   */
  getFormattedPrice(purchasePackage: PurchasesPackage): string {
    return purchasePackage.product.priceString;
  }

  /**
   * Obtiene la duración de la suscripción para mostrar
   */
  getSubscriptionPeriod(purchasePackage: PurchasesPackage): string {
    const period = purchasePackage.packageType;
    switch (period) {
      case 'MONTHLY':
        return 'mes';
      case 'ANNUAL':
        return 'año';
      default:
        return 'mes';
    }
  }
}

// Singleton instance
export const purchaseService = new PurchaseService();

// Helper hook para usar en componentes React
export const usePurchaseService = () => {
  return purchaseService;
};