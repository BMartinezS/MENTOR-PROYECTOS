import { useRef, useCallback } from 'react';
import { Animated, Easing } from 'react-native';
import { ANIMATIONS } from '../../constants/theme';
import { haptics } from './haptics';

// Simple press animation using built-in Animated API
export function usePressAnimation(onPress?: () => void, scale = 0.95) {
  const animatedValue = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    haptics.button();
    Animated.spring(animatedValue, {
      toValue: scale,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  }, [animatedValue, scale]);

  const onPressOut = useCallback(() => {
    Animated.spring(animatedValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();

    if (onPress) {
      setTimeout(() => onPress(), 50);
    }
  }, [animatedValue, onPress]);

  const animatedStyle = {
    transform: [{ scale: animatedValue }],
  };

  return {
    onPressIn,
    onPressOut,
    animatedStyle,
  };
}

// Card press animation
export function useCardAnimation(onPress?: () => void) {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    haptics.card();
    Animated.spring(scaleValue, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  }, [scaleValue]);

  const onPressOut = useCallback(() => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();

    if (onPress) {
      setTimeout(() => {
        haptics.navigate();
        onPress();
      }, 50);
    }
  }, [scaleValue, onPress]);

  const animatedStyle = {
    transform: [{ scale: scaleValue }],
  };

  return {
    onPressIn,
    onPressOut,
    animatedStyle,
  };
}

// Fade in animation
export function useFadeInAnimation(delay = 0) {
  const opacity = useRef(new Animated.Value(0)).current;

  const startAnimation = useCallback(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: ANIMATIONS.duration.normal,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  // Auto-start animation with delay
  setTimeout(startAnimation, delay);

  return {
    opacity,
  };
}

// Shimmer animation for skeleton loading
export function useShimmerAnimation() {
  const shimmerValue = useRef(new Animated.Value(0)).current;

  const startShimmer = useCallback(() => {
    Animated.loop(
      Animated.timing(shimmerValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    ).start();
  }, [shimmerValue]);

  // Auto-start shimmer
  setTimeout(startShimmer, 0);

  const animatedStyle = {
    opacity: shimmerValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.3, 0.7, 0.3],
    }),
  };

  return animatedStyle;
}