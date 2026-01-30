import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { usePurchase } from '../contexts/PurchaseContext';

// Subscription limits for free tier
export const FREE_LIMITS = {
  projects: 1,
  ideas: 5,
  iterationsPerProject: 2,
} as const;

// PRO-only features
export type ProFeature =
  | 'edit_tasks'
  | 'idea_chat'
  | 'idea_attachments'
  | 'all_badges'
  | 'challenges'
  | 'advanced_analytics'
  | 'custom_themes';

const PRO_FEATURE_NAMES: Record<ProFeature, string> = {
  edit_tasks: 'Editar tareas',
  idea_chat: 'Chat IA por idea',
  idea_attachments: 'Adjuntos en ideas',
  all_badges: 'Todos los badges',
  challenges: 'Challenges y retos',
  advanced_analytics: 'Analytics avanzados',
  custom_themes: 'Temas personalizados',
};

/**
 * Hook to check and enforce PRO features
 */
export function useProFeature() {
  const { isPro } = usePurchase();
  const router = useRouter();

  /**
   * Check if user can access a PRO feature
   */
  const canAccess = useCallback(
    (feature: ProFeature): boolean => {
      return isPro;
    },
    [isPro]
  );

  /**
   * Check limit and return whether action is allowed
   */
  const checkLimit = useCallback(
    (type: keyof typeof FREE_LIMITS, currentCount: number): boolean => {
      if (isPro) return true;
      return currentCount < FREE_LIMITS[type];
    },
    [isPro]
  );

  /**
   * Show upgrade prompt if user tries to access PRO feature
   */
  const requirePro = useCallback(
    (feature: ProFeature, onCancel?: () => void): boolean => {
      if (isPro) return true;

      const featureName = PRO_FEATURE_NAMES[feature];

      Alert.alert(
        'Funcion Pro',
        `"${featureName}" esta disponible solo para usuarios Pro. ¿Quieres ver los planes?`,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: onCancel,
          },
          {
            text: 'Ver planes',
            onPress: () => router.push('/paywall'),
          },
        ]
      );

      return false;
    },
    [isPro, router]
  );

  /**
   * Show upgrade prompt if user hits a limit
   */
  const requireUpgradeForLimit = useCallback(
    (type: keyof typeof FREE_LIMITS, currentCount: number, onCancel?: () => void): boolean => {
      if (isPro) return true;

      const limit = FREE_LIMITS[type];
      if (currentCount < limit) return true;

      const limitNames: Record<keyof typeof FREE_LIMITS, string> = {
        projects: 'proyectos',
        ideas: 'ideas',
        iterationsPerProject: 'iteraciones IA',
      };

      Alert.alert(
        'Limite alcanzado',
        `Has alcanzado el limite de ${limit} ${limitNames[type]} del plan gratuito. Actualiza a Pro para desbloquear mas.`,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: onCancel,
          },
          {
            text: 'Ver planes',
            onPress: () => router.push('/paywall'),
          },
        ]
      );

      return false;
    },
    [isPro, router]
  );

  return {
    isPro,
    canAccess,
    checkLimit,
    requirePro,
    requireUpgradeForLimit,
    limits: FREE_LIMITS,
  };
}
