import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { CustomerInfo, PurchasesOfferings, PurchasesPackage } from 'react-native-purchases';
import { Alert, Platform } from 'react-native';

import {
  purchaseService,
  UserSubscriptionInfo,
  PurchaseResult,
  PurchaseState,
} from '../services/purchaseService';
import { useAuth } from './AuthContext';
import { REVENUECAT_API_KEY } from '../services/config';

// Select the correct API key based on platform
const getRevenueCatApiKey = (): string => {
  return Platform.OS === 'ios' ? REVENUECAT_API_KEY.ios : REVENUECAT_API_KEY.android;
};

type PurchaseContextValue = {
  // Estado de suscripción
  subscriptionInfo: UserSubscriptionInfo;
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOfferings | null;

  // Estados de UI
  purchaseState: PurchaseState;
  loading: boolean;

  // Funciones
  initializePurchases: () => Promise<void>;
  purchasePackage: (purchasePackage: PurchasesPackage) => Promise<PurchaseResult>;
  restorePurchases: () => Promise<PurchaseResult>;
  refreshCustomerInfo: () => Promise<void>;

  // Helpers
  isPro: boolean;
  isActive: boolean;
};

const PurchaseContext = createContext<PurchaseContextValue>({} as PurchaseContextValue);

export function usePurchase() {
  return useContext(PurchaseContext);
}

export function PurchaseProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();

  // Estado de suscripción
  const [subscriptionInfo, setSubscriptionInfo] = useState<UserSubscriptionInfo>({
    tier: 'free',
    isActive: false,
  });
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);

  // Estados de UI
  const [purchaseState, setPurchaseState] = useState<PurchaseState>('idle');
  const [loading, setLoading] = useState(true);

  /**
   * Inicializa RevenueCat cuando el usuario hace login
   */
  const initializePurchases = useCallback(async () => {
    try {
      if (!user || !token) {
        console.log('No user logged in, skipping RevenueCat initialization');
        setLoading(false);
        return;
      }

      setLoading(true);

      // Inicializar RevenueCat con el ID del usuario
      const apiKey = getRevenueCatApiKey();
      await purchaseService.initialize(apiKey, user.id.toString());

      // Obtener información del cliente
      const customerInfo = await purchaseService.getCustomerInfo();
      if (customerInfo) {
        setCustomerInfo(customerInfo);
        const subscriptionInfo = purchaseService.getSubscriptionInfo(customerInfo);
        setSubscriptionInfo(subscriptionInfo);
      }

      // Obtener ofertas disponibles
      const offerings = await purchaseService.getOfferings();
      setOfferings(offerings);

      console.log('RevenueCat initialized successfully');
    } catch (error) {
      console.error('Failed to initialize purchases:', error);

      // Cargar info desde cache como fallback
      const cachedInfo = await purchaseService.getCachedSubscriptionInfo();
      setSubscriptionInfo(cachedInfo);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  /**
   * Procesa una compra
   */
  const purchasePackage = useCallback(async (purchasePackage: PurchasesPackage): Promise<PurchaseResult> => {
    try {
      setPurchaseState('loading');

      const result = await purchaseService.purchasePackage(purchasePackage);

      if (result.success && result.customerInfo) {
        setCustomerInfo(result.customerInfo);
        const newSubscriptionInfo = purchaseService.getSubscriptionInfo(result.customerInfo);
        setSubscriptionInfo(newSubscriptionInfo);
        setPurchaseState('success');

        Alert.alert(
          '¡Suscripción activada!',
          'Ahora tienes acceso a todas las funciones Pro',
          [{ text: 'Genial!', style: 'default' }]
        );
      } else {
        setPurchaseState('error');
        if (!result.error?.includes('cancelled')) {
          Alert.alert(
            'Error en la compra',
            result.error || 'Ocurrió un error procesando tu compra',
            [{ text: 'OK', style: 'default' }]
          );
        }
      }

      return result;
    } catch (error) {
      console.error('Purchase package error:', error);
      setPurchaseState('error');
      Alert.alert(
        'Error',
        'No se pudo procesar la compra. Inténtalo de nuevo.',
        [{ text: 'OK', style: 'default' }]
      );

      return {
        success: false,
        error: 'Purchase failed unexpectedly',
      };
    }
  }, []);

  /**
   * Restaura compras previas
   */
  const restorePurchases = useCallback(async (): Promise<PurchaseResult> => {
    try {
      setPurchaseState('loading');

      const result = await purchaseService.restorePurchases();

      if (result.success && result.customerInfo) {
        setCustomerInfo(result.customerInfo);
        const newSubscriptionInfo = purchaseService.getSubscriptionInfo(result.customerInfo);
        setSubscriptionInfo(newSubscriptionInfo);

        if (newSubscriptionInfo.isActive) {
          Alert.alert(
            'Compras restauradas',
            'Tus suscripciones han sido restauradas exitosamente',
            [{ text: 'Genial!', style: 'default' }]
          );
          setPurchaseState('success');
        } else {
          Alert.alert(
            'Sin compras previas',
            'No encontramos suscripciones asociadas a esta cuenta',
            [{ text: 'OK', style: 'default' }]
          );
          setPurchaseState('idle');
        }
      } else {
        setPurchaseState('error');
        Alert.alert(
          'Error',
          result.error || 'No se pudieron restaurar las compras',
          [{ text: 'OK', style: 'default' }]
        );
      }

      return result;
    } catch (error) {
      console.error('Restore purchases error:', error);
      setPurchaseState('error');
      Alert.alert(
        'Error',
        'No se pudieron restaurar las compras. Inténtalo de nuevo.',
        [{ text: 'OK', style: 'default' }]
      );

      return {
        success: false,
        error: 'Restore failed unexpectedly',
      };
    }
  }, []);

  /**
   * Refresca la información del cliente
   */
  const refreshCustomerInfo = useCallback(async () => {
    try {
      const customerInfo = await purchaseService.getCustomerInfo();
      if (customerInfo) {
        setCustomerInfo(customerInfo);
        const newSubscriptionInfo = purchaseService.getSubscriptionInfo(customerInfo);
        setSubscriptionInfo(newSubscriptionInfo);
      }
    } catch (error) {
      console.error('Failed to refresh customer info:', error);
    }
  }, []);

  // Inicializar cuando el usuario esté disponible
  useEffect(() => {
    initializePurchases();
  }, [initializePurchases]);

  // Limpiar cache cuando el usuario hace logout
  useEffect(() => {
    if (!user && !token) {
      purchaseService.clearCache();
      setSubscriptionInfo({ tier: 'free', isActive: false });
      setCustomerInfo(null);
      setOfferings(null);
      setPurchaseState('idle');
    }
  }, [user, token]);

  // Valores computados
  const isPro = useMemo(() => {
    return subscriptionInfo.tier === 'pro' && subscriptionInfo.isActive;
  }, [subscriptionInfo]);

  const isActive = useMemo(() => {
    return subscriptionInfo.isActive;
  }, [subscriptionInfo]);

  const value = useMemo<PurchaseContextValue>(
    () => ({
      // Estado de suscripción
      subscriptionInfo,
      customerInfo,
      offerings,

      // Estados de UI
      purchaseState,
      loading,

      // Funciones
      initializePurchases,
      purchasePackage,
      restorePurchases,
      refreshCustomerInfo,

      // Helpers
      isPro,
      isActive,
    }),
    [
      subscriptionInfo,
      customerInfo,
      offerings,
      purchaseState,
      loading,
      initializePurchases,
      purchasePackage,
      restorePurchases,
      refreshCustomerInfo,
      isPro,
      isActive,
    ]
  );

  return <PurchaseContext.Provider value={value}>{children}</PurchaseContext.Provider>;
}