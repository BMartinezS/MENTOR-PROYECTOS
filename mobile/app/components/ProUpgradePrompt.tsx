import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, Lock, Star } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';

import { COLORS, GRADIENTS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { usePurchase } from '../../src/contexts/PurchaseContext';

interface ProUpgradePromptProps {
  /** Feature that requires Pro */
  feature: string;
  /** Description of the feature */
  description?: string;
  /** What the user gets by upgrading */
  benefit?: string;
  /** Compact version for inline display */
  compact?: boolean;
  /** Custom action instead of navigating to paywall */
  onUpgrade?: () => void;
  /** Custom styling */
  style?: any;
}

export default function ProUpgradePrompt({
  feature,
  description,
  benefit = 'Desbloquea esta función y muchas más con Pro',
  compact = false,
  onUpgrade,
  style,
}: ProUpgradePromptProps) {
  const router = useRouter();
  const { isPro } = usePurchase();

  // Don't show if user is already Pro
  if (isPro) {
    return null;
  }

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      router.push('/paywall');
    }
  };

  if (compact) {
    return (
      <Pressable style={[styles.compactContainer, style]} onPress={handleUpgrade}>
        <LinearGradient
          colors={['rgba(255, 215, 0, 0.1)', 'rgba(255, 215, 0, 0.05)']}
          style={styles.compactGradient}
        />
        <View style={styles.compactContent}>
          <View style={styles.compactLeft}>
            <Crown size={20} color={COLORS.secondary} />
            <Text style={styles.compactText} numberOfLines={1}>
              {feature} requiere Pro
            </Text>
          </View>
          <Text style={styles.upgradeLink}>Upgrade</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Card style={styles.card}>
        <LinearGradient
          colors={GRADIENTS.cardHover}
          style={styles.gradient}
        />

        <View style={styles.content}>
          {/* Header with icon */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Crown size={32} color={COLORS.secondary} fill={COLORS.secondary} />
            </View>
            <View style={styles.lockBadge}>
              <Lock size={12} color={COLORS.background} />
            </View>
          </View>

          {/* Content */}
          <View style={styles.textContent}>
            <Text style={styles.title}>{feature}</Text>
            {description && (
              <Text style={styles.description}>{description}</Text>
            )}
            <Text style={styles.benefit}>{benefit}</Text>
          </View>

          {/* Features list */}
          <View style={styles.features}>
            <FeatureBullet text="Proyectos ilimitados" />
            <FeatureBullet text="Check-ins sin límites" />
            <FeatureBullet text="Edición avanzada" />
            <FeatureBullet text="Analytics de progreso" />
          </View>

          {/* Action button */}
          <Button
            mode="contained"
            onPress={handleUpgrade}
            style={styles.upgradeButton}
            labelStyle={styles.upgradeButtonLabel}
            contentStyle={styles.upgradeButtonContent}
          >
            <Crown size={18} color={COLORS.background} />
            <Text style={styles.upgradeButtonText}>Upgrade a Pro</Text>
          </Button>

          {/* Pricing info */}
          <Text style={styles.pricing}>
            Desde $12/mes • Cancela cuando quieras
          </Text>
        </View>
      </Card>
    </View>
  );
}

interface FeatureBulletProps {
  text: string;
}

function FeatureBullet({ text }: FeatureBulletProps) {
  return (
    <View style={styles.featureBullet}>
      <Star size={12} color={COLORS.secondary} fill={COLORS.secondary} />
      <Text style={styles.featureBulletText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: SPACING(2),
  },
  card: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: `${COLORS.secondary}40`,
    ...SHADOWS.card,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    padding: SPACING(3),
    alignItems: 'center',
  },

  // Header
  header: {
    position: 'relative',
    marginBottom: SPACING(2),
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${COLORS.secondary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.glow,
  },
  lockBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },

  // Text content
  textContent: {
    alignItems: 'center',
    marginBottom: SPACING(3),
  },
  title: {
    ...TYPOGRAPHY.title,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING(1),
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING(1),
    lineHeight: 22,
  },
  benefit: {
    ...TYPOGRAPHY.label,
    color: COLORS.secondary,
    textAlign: 'center',
    fontWeight: '600',
  },

  // Features
  features: {
    alignSelf: 'stretch',
    marginBottom: SPACING(3),
    gap: SPACING(1),
  },
  featureBullet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(1),
    justifyContent: 'center',
  },
  featureBulletText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontWeight: '500',
  },

  // Upgrade button
  upgradeButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: RADIUS.md,
    marginBottom: SPACING(1),
    ...SHADOWS.glow,
  },
  upgradeButtonContent: {
    paddingVertical: SPACING(1),
    paddingHorizontal: SPACING(2),
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(1),
  },
  upgradeButtonLabel: {
    color: COLORS.background,
  },
  upgradeButtonText: {
    ...TYPOGRAPHY.label,
    color: COLORS.background,
    fontWeight: '700',
  },

  // Pricing
  pricing: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  // Compact version
  compactContainer: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${COLORS.secondary}30`,
  },
  compactGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING(2),
  },
  compactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING(1),
    flex: 1,
  },
  compactText: {
    ...TYPOGRAPHY.label,
    color: COLORS.text,
    flex: 1,
  },
  upgradeLink: {
    ...TYPOGRAPHY.label,
    color: COLORS.secondary,
    fontWeight: '600',
  },
});