import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, Crown, Star, X, Zap } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Dimensions, Alert } from 'react-native';
import { Button, Text, ActivityIndicator } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PurchasesPackage } from 'react-native-purchases';

import { COLORS, GRADIENTS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { usePurchase } from './contexts/PurchaseContext';

const { width } = Dimensions.get('window');

// Features comparison data
const FREE_FEATURES = [
  '1 proyecto activo',
  '2 check-ins por semana',
  '1 iteración de plan con IA',
  'Ver tareas (sin editar)',
  'Notificaciones básicas',
];

const PRO_FEATURES = [
  'Proyectos ilimitados',
  'Check-ins ilimitados',
  'Iteraciones de plan ilimitadas',
  'Editar tareas y fases',
  'Revisiones semanales detalladas',
  'Analytics de progreso',
  'Configuración personalizada',
  'Soporte prioritario',
];

interface PackageCardProps {
  purchasePackage: PurchasesPackage;
  isPopular?: boolean;
  onPress: () => void;
  loading?: boolean;
}

function PackageCard({ purchasePackage, isPopular = false, onPress, loading = false }: PackageCardProps) {
  const period = purchasePackage.packageType === 'ANNUAL' ? 'año' : 'mes';
  const price = purchasePackage.product.priceString;

  // Calcular descuento para plan anual
  const monthlyPrice = purchasePackage.packageType === 'ANNUAL'
    ? purchasePackage.product.price / 12
    : purchasePackage.product.price;
  const savings = purchasePackage.packageType === 'ANNUAL'
    ? `Ahorras ${((12 * 12 - purchasePackage.product.price) / 12).toFixed(0)}% vs mensual`
    : null;

  return (
    <View style={[styles.packageCard, isPopular && styles.popularCard]}>
      {isPopular && (
        <View style={styles.popularBadge}>
          <Crown size={16} color={COLORS.background} />
          <Text style={styles.popularBadgeText}>MÁS POPULAR</Text>
        </View>
      )}

      <LinearGradient
        colors={isPopular ? GRADIENTS.cardHover : GRADIENTS.card}
        style={styles.packageGradient}
      />

      <View style={styles.packageContent}>
        <View style={styles.packageHeader}>
          <Text style={[styles.packageTitle, isPopular && { color: COLORS.secondary }]}>
            {period === 'año' ? 'Pro Anual' : 'Pro Mensual'}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{price}</Text>
            <Text style={styles.pricePeriod}>/{period}</Text>
          </View>
          {savings && (
            <Text style={styles.savings}>{savings}</Text>
          )}
        </View>

        <Button
          mode="contained"
          onPress={onPress}
          loading={loading}
          disabled={loading}
          style={[
            styles.packageButton,
            isPopular && styles.popularButton,
            { backgroundColor: isPopular ? COLORS.secondary : COLORS.primary }
          ]}
          labelStyle={[
            styles.packageButtonLabel,
            { color: isPopular ? COLORS.background : COLORS.background }
          ]}
        >
          {loading ? 'Procesando...' : 'Suscribirse'}
        </Button>
      </View>
    </View>
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
          <Star size={16} color={COLORS.secondary} fill={COLORS.secondary} />
        ) : (
          <Check size={16} color={COLORS.primary} />
        )}
      </View>
      <Text style={[styles.featureText, isPro && styles.featureTextPro]}>
        {feature}
      </Text>
    </View>
  );
}

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
      // Redirect to dashboard after successful purchase
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

  // Get packages from offerings
  const monthlyPackage = offerings?.current?.monthly;
  const annualPackage = offerings?.current?.annual;

  if (purchaseLoading || !offerings) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient colors={GRADIENTS.background} style={styles.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando planes...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={GRADIENTS.background} style={styles.background} />

      {/* Header with close button */}
      <View style={styles.header}>
        <Button
          onPress={handleClose}
          style={styles.closeButton}
          contentStyle={styles.closeButtonContent}
        >
          <X size={24} color={COLORS.text} />
        </Button>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Zap size={48} color={COLORS.secondary} fill={COLORS.secondary} />
          </View>
          <Text style={styles.heroTitle}>Desbloquea tu potencial</Text>
          <Text style={styles.heroSubtitle}>
            Lleva tus proyectos al siguiente nivel con funciones Pro diseñadas para emprendedores ambiciosos
          </Text>
        </View>

        {/* Pricing packages */}
        <View style={styles.packagesSection}>
          <Text style={styles.sectionTitle}>Elige tu plan</Text>
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
          <Text style={styles.sectionTitle}>¿Qué obtienes con Pro?</Text>

          <View style={styles.featuresGrid}>
            {/* Free features */}
            <View style={styles.featureColumn}>
              <Text style={styles.featureColumnTitle}>Plan Gratuito</Text>
              {FREE_FEATURES.map((feature, index) => (
                <FeatureItem key={index} feature={feature} />
              ))}
            </View>

            {/* Pro features */}
            <View style={[styles.featureColumn, styles.proColumn]}>
              <Text style={[styles.featureColumnTitle, styles.proColumnTitle]}>
                Plan Pro ⭐
              </Text>
              {PRO_FEATURES.map((feature, index) => (
                <FeatureItem key={index} feature={feature} isPro />
              ))}
            </View>
          </View>
        </View>

        {/* Restore purchases button */}
        <View style={styles.footer}>
          <Button
            mode="text"
            onPress={handleRestore}
            style={styles.restoreButton}
            labelStyle={styles.restoreButtonLabel}
          >
            Restaurar compras
          </Button>

          <Text style={styles.termsText}>
            Al suscribirte, aceptas nuestros Términos de Servicio y Política de Privacidad.
            Puedes cancelar en cualquier momento desde la configuración de tu dispositivo.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING(2),
    paddingVertical: SPACING(1),
  },
  closeButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: RADIUS.sm,
  },
  closeButtonContent: {
    paddingHorizontal: SPACING(1),
    paddingVertical: SPACING(0.5),
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
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
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
    borderRadius: 40,
    backgroundColor: `${COLORS.secondary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING(2),
    ...SHADOWS.glow,
  },
  heroTitle: {
    ...TYPOGRAPHY.display,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING(1),
  },
  heroSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Packages section
  packagesSection: {
    paddingHorizontal: SPACING(2),
    marginBottom: SPACING(4),
  },
  sectionTitle: {
    ...TYPOGRAPHY.headline,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING(3),
  },
  packages: {
    gap: SPACING(2),
  },
  packageCard: {
    position: 'relative',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  popularCard: {
    borderWidth: 2,
    borderColor: COLORS.secondary,
    ...SHADOWS.premium,
  },
  popularBadge: {
    position: 'absolute',
    top: -1,
    left: width * 0.25,
    right: width * 0.25,
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING(0.5),
    paddingHorizontal: SPACING(1),
    borderBottomLeftRadius: RADIUS.sm,
    borderBottomRightRadius: RADIUS.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING(0.5),
    zIndex: 1,
  },
  popularBadgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.background,
    fontWeight: '700',
    fontSize: 10,
  },
  packageGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  packageContent: {
    padding: SPACING(3),
  },
  packageHeader: {
    alignItems: 'center',
    marginBottom: SPACING(2),
  },
  packageTitle: {
    ...TYPOGRAPHY.title,
    color: COLORS.text,
    marginBottom: SPACING(1),
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING(0.5),
  },
  price: {
    ...TYPOGRAPHY.display,
    fontSize: 36,
    color: COLORS.primary,
    fontWeight: '800',
  },
  pricePeriod: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
    marginLeft: SPACING(0.5),
  },
  savings: {
    ...TYPOGRAPHY.caption,
    color: COLORS.secondary,
    fontWeight: '600',
    backgroundColor: `${COLORS.secondary}20`,
    paddingHorizontal: SPACING(1),
    paddingVertical: SPACING(0.5),
    borderRadius: RADIUS.sm,
  },
  packageButton: {
    borderRadius: RADIUS.md,
    paddingVertical: SPACING(0.5),
  },
  popularButton: {
    ...SHADOWS.glow,
  },
  packageButtonLabel: {
    ...TYPOGRAPHY.label,
    fontWeight: '700',
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
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING(2),
    ...SHADOWS.card,
  },
  proColumn: {
    borderWidth: 1,
    borderColor: COLORS.secondary,
    backgroundColor: `${COLORS.secondary}05`,
  },
  featureColumnTitle: {
    ...TYPOGRAPHY.label,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING(2),
    fontWeight: '700',
  },
  proColumnTitle: {
    color: COLORS.secondary,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING(1.5),
  },
  featureIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING(1),
  },
  featureIconPro: {
    backgroundColor: `${COLORS.secondary}20`,
  },
  featureText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    flex: 1,
    lineHeight: 16,
  },
  featureTextPro: {
    color: COLORS.text,
    fontWeight: '500',
  },

  // Footer
  footer: {
    paddingHorizontal: SPACING(3),
    paddingBottom: SPACING(4),
    alignItems: 'center',
    gap: SPACING(2),
  },
  restoreButton: {
    marginBottom: SPACING(1),
  },
  restoreButtonLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.primary,
  },
  termsText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
});