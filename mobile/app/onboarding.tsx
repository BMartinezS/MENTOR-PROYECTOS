import { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';
import Screen from './components/Screen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Bienvenido a Mentor',
    description: 'Tu copiloto para proyectos personales',
  },
  {
    id: '2',
    title: 'Planifica con IA',
    description: 'La IA divide tu proyecto en pasos alcanzables',
  },
  {
    id: '3',
    title: 'Mantente enfocado',
    description: 'Check-ins diarios te mantienen en el camino',
  },
  {
    id: '4',
    title: 'Comienza ahora',
    description: 'Crea tu primer proyecto y alcanza tus metas',
  },
];

const ONBOARDING_KEY = 'hasSeenOnboarding';

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList<OnboardingSlide>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isLastSlide = currentIndex === SLIDES.length - 1;

  const completeOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (error) {
      // Silent fail - user can still use the app
      console.warn('Failed to save onboarding state:', error);
    }
    router.replace('/(tabs)/dashboard');
  }, [router]);

  const handleNext = useCallback(() => {
    if (isLastSlide) {
      void completeOnboarding();
    } else {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  }, [currentIndex, isLastSlide, completeOnboarding]);

  const handleSkip = useCallback(() => {
    void completeOnboarding();
  }, [completeOnboarding]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderSlide = useCallback(({ item }: { item: OnboardingSlide }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.slideContent}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  }, []);

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {SLIDES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <Screen padded={false}>
      <View style={styles.container}>
        {/* Skip button */}
        <View style={styles.header}>
          {!isLastSlide && (
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Saltar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Slides */}
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={renderSlide}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
        />

        {/* Footer with dots and button */}
        <View style={styles.footer}>
          {renderDots()}
          <TouchableOpacity
            onPress={handleNext}
            style={[
              styles.nextButton,
              isLastSlide && styles.nextButtonPrimary,
            ]}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.nextButtonText,
                isLastSlide && styles.nextButtonTextPrimary,
              ]}
            >
              {isLastSlide ? 'Comenzar' : 'Siguiente'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
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
    paddingHorizontal: SPACING(2.5),
    paddingTop: SPACING(2),
    minHeight: SPACING(6),
  },
  skipButton: {
    padding: SPACING(1),
  },
  skipText: {
    color: COLORS.textMuted,
    fontSize: 16,
    fontWeight: '500',
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING(4),
  },
  slideContent: {
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.display,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING(2),
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: SPACING(2.5),
    paddingBottom: SPACING(4),
    alignItems: 'center',
    gap: SPACING(3),
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: SPACING(1),
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: RADIUS.full,
  },
  dotActive: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  dotInactive: {
    backgroundColor: COLORS.borderLight,
  },
  nextButton: {
    width: '100%',
    backgroundColor: COLORS.backgroundAlt,
    paddingVertical: SPACING(2),
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  nextButtonPrimary: {
    backgroundColor: COLORS.primary,
  },
  nextButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonTextPrimary: {
    color: '#FFFFFF',
  },
});
