import { useRouter } from 'expo-router';
import { Check, Crown, Star, X, Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Dimensions, Pressable } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PurchasesPackage } from 'react-native-purchases';

import { COLORS, RADIUS, SHADOWS, SPACING, BORDERS, BRUTALIST_CARD, BRUTALIST_BUTTON } from '../constants/theme';
import { usePurchase } from '../src/contexts/PurchaseContext';

const { width } = Dimensions.get('window');

// Features comparison data
const FREE_FEATURES = [
  '1 proyecto activo',
  '5 ideas en backlog',
  '2 iteraciones IA/proyecto',
  'Ver tareas (sin editar)',
  'Badges basicos',
  'Notificaciones basicas',
];

const PRO_FEATURES = [
  'Proyectos ilimitados',
  'Ideas ilimitadas',
  'Iteraciones IA ilimitadas',
  'Editar tareas y fases',
  'Chat IA por idea',
  'Todos los badges',
  'Revisiones semanales',
  'Analytics de progreso',
  'Challenges y retos',
  'Soporte prioritario',
];

interface PackageCardProps {
  purchasePackage: PurchasesPackage;
  isPopular?: boolean;
  onPress: () => void;
  loading?: boolean;
}

/**
 * Neo-Brutalist Package Card
 */
function PackageCard({ purchasePackage, isPopular = false, onPress, loading = false }: PackageCardProps) {
  const period = purchasePackage.packageType === 'ANNUAL' ? 'ano' : 'mes';
  const price = purchasePackage.product.priceString;

  const savings = purchasePackage.packageType === 'ANNUAL'
    ? `Ahorras vs mensual`
    : null;

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.packageCard,
        isPopular && styles.popularCard,
        pressed && styles.packageCardPressed,
      ]}
    >
      {isPopular && (
        <View style={styles.popularBadge}>
          <Crown size={14} color={COLORS.text} />
          <Text style={styles.popularBadgeText}>MAS POPULAR</Text>
        </View>
      )}

      <Text style={styles.packageTitle}>
        {period === 'ano' ? 'PRO ANUAL' : 'PRO MENSUAL'}
      </Text>

      <View style={styles.priceContainer}>
        <Text style={styles.price}>{price}</Text>
        <Text style={styles.pricePeriod}>/{period}</Text>
      </View>

      {savings && (
        <View style={styles.savingsBadge}>
          <Text style={styles.savingsText}>{savings}</Text>
        </View>
      )}

      <View style={[
        styles.packageButton,
        isPopular && styles.popularButton,
        loading && styles.packageButtonDisabled,
      ]}>
        <Text style={styles.packageButtonText}>
          {loading ? 'PROCESANDO...' : 'SUSCRIBIRSE'}
        </Text>
      </View>
    </Pressable>
  );
}

interface FeatureItemProps {
  feature: string;
  isPro?: boolean;
}

function FeatureItem({ feature, isPro = false }: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <View style={[styles.featureIcon, isPro && styles.featureIconPro]}>
        {isPro ? (
          <Star size={14} color={COLORS.text} fill={COLORS.secondary} />
        ) : (
          <Check size={14} color={COLORS.text} />
        )}
      </View>
      <Text style={styles.featureText}>{feature}</Text>
    </View>
  );
}

/**
 * Neo-Brutalist Paywall Screen
 * - Bold, direct design
 * - No gradients, thick borders
 * - High contrast for clarity
 */
export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    offerings,
    loading: purchaseLoading,
    purchaseState,
    purchasePackage,
    restorePurchases,
  } = usePurchase();

  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);

  const handlePurchase = async (pkg: PurchasesPackage) => {
    setSelectedPackage(pkg);
    const result = await purchasePackage(pkg);

    if (result.success) {
      router.replace('/(tabs)/dashboard');
    }
    setSelectedPackage(null);
  };

  const handleRestore = async () => {
    const result = await restorePurchases();
    if (result.success) {
      router.replace('/(tabs)/dashboard');
    }
  };

  const handleClose = () => {
    router.back();
  };

  const monthlyPackage = offerings?.current?.monthly;
  const annualPackage = offerings?.current?.annual;

  if (purchaseLoading || !offerings) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>CARGANDO PLANES...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header with close button */}
      <View style={styles.header}>
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <X size={24} color={COLORS.text} strokeWidth={3} />
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Zap size={40} color={COLORS.text} fill={COLORS.secondary} />
          </View>
          <Text style={styles.heroTitle}>Desbloquea tu potencial</Text>
          <Text style={styles.heroSubtitle}>
            Funciones Pro disenadas para emprendedores ambiciosos
          </Text>
        </View>

        {/* Pricing packages */}
        <View style={styles.packagesSection}>
          <Text style={styles.sectionTitle}>ELIGE TU PLAN</Text>
          <View style={styles.packages}>
            {monthlyPackage && (
              <PackageCard
                purchasePackage={monthlyPackage}
                onPress={() => handlePurchase(monthlyPackage)}
                loading={selectedPackage?.identifier === monthlyPackage.identifier && purchaseState === 'loading'}
              />
            )}
            {annualPackage && (
              <PackageCard
                purchasePackage={annualPackage}
                isPopular
                onPress={() => handlePurchase(annualPackage)}
                loading={selectedPackage?.identifier === annualPackage.identifier && purchaseState === 'loading'}
              />
            )}
          </View>
        </View>

        {/* Features comparison */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>QUE OBTIENES CON PRO?</Text>

          <View style={styles.featuresGrid}>
            {/* Free features */}
            <View style={styles.featureColumn}>
              <Text style={styles.featureColumnTitle}>GRATUITO</Text>
              {FREE_FEATURES.map((feature, index) => (
                <FeatureItem key={index} feature={feature} />
              ))}
            </View>

            {/* Pro features */}
            <View style={[styles.featureColumn, styles.proColumn]}>
              <Text style={[styles.featureColumnTitle, styles.proColumnTitle]}>
                PRO
              </Text>
              {PRO_FEATURES.map((feature, index) => (
                <FeatureItem key={index} feature={feature} isPro />
              ))}
            </View>
          </View>
        </View>

        {/* Restore purchases button */}
        <View style={styles.footer}>
          <Pressable onPress={handleRestore} style={styles.restoreButton}>
            <Text style={styles.restoreButtonText}>RESTAURAR COMPRAS</Text>
          </Pressable>

          <Text style={styles.termsText}>
            Al suscribirte, aceptas nuestros Terminos de Servicio y Politica de Privacidad.
            Puedes cancelar en cualquier momento.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING(2),
    paddingVertical: SPACING(1),
  },
  closeButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.surface,
    borderWidth: BORDERS.medium,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING(2),
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // Hero section
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: SPACING(3),
    paddingVertical: SPACING(4),
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.secondary,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING(2),
    ...SHADOWS.card,
  },
  heroTitle: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: SPACING(1),
  },
  heroSubtitle: {
    color: COLORS.textMuted,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Packages section
  packagesSection: {
    paddingHorizontal: SPACING(2),
    marginBottom: SPACING(4),
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: SPACING(3),
  },
  packages: {
    gap: SPACING(2),
  },
  packageCard: {
    ...BRUTALIST_CARD,
    padding: SPACING(3),
    alignItems: 'center',
  },
  packageCardPressed: {
    ...SHADOWS.pressed,
    transform: [{ translateX: 2 }, { translateY: 2 }],
  },
  popularCard: {
    borderWidth: BORDERS.thick,
    borderColor: COLORS.secondary,
  },
  popularBadge: {
    position: 'absolute',
    top: -14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(0.5),
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING(0.5),
    paddingHorizontal: SPACING(1.5),
    borderRadius: RADIUS.xs,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.border,
  },
  popularBadgeText: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  packageTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: SPACING(1),
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING(1),
  },
  price: {
    color: COLORS.primary,
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -1,
  },
  pricePeriod: {
    color: COLORS.textMuted,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: SPACING(0.5),
  },
  savingsBadge: {
    backgroundColor: COLORS.tertiary,
    paddingVertical: SPACING(0.5),
    paddingHorizontal: SPACING(1.5),
    borderRadius: RADIUS.xs,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.border,
    marginBottom: SPACING(2),
  },
  savingsText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
  },
  packageButton: {
    ...BRUTALIST_BUTTON,
    width: '100%',
    paddingVertical: SPACING(1.5),
    alignItems: 'center',
  },
  popularButton: {
    backgroundColor: COLORS.secondary,
  },
  packageButtonDisabled: {
    opacity: 0.7,
  },
  packageButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // Features section
  featuresSection: {
    paddingHorizontal: SPACING(2),
    marginBottom: SPACING(4),
  },
  featuresGrid: {
    flexDirection: 'row',
    gap: SPACING(1.5),
  },
  featureColumn: {
    flex: 1,
    ...BRUTALIST_CARD,
    padding: SPACING(2),
  },
  proColumn: {
    borderColor: COLORS.secondary,
  },
  featureColumnTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: SPACING(2),
  },
  proColumnTitle: {
    color: COLORS.secondary,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING(1.5),
    gap: SPACING(1),
  },
  featureIcon: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.xs,
    backgroundColor: COLORS.backgroundAlt,
    borderWidth: BORDERS.thin,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureIconPro: {
    backgroundColor: COLORS.secondary,
  },
  featureText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },

  // Footer
  footer: {
    paddingHorizontal: SPACING(3),
    paddingBottom: SPACING(4),
    alignItems: 'center',
    gap: SPACING(2),
  },
  restoreButton: {
    paddingVertical: SPACING(1),
    paddingHorizontal: SPACING(2),
  },
  restoreButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  termsText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
  },
});
