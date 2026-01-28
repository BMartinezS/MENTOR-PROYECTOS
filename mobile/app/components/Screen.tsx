import { PropsWithChildren } from 'react';
import { SafeAreaView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, GRADIENTS, SPACING } from '../../constants/theme';

type Props = PropsWithChildren<{
  center?: boolean;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}>;

export default function Screen({ center, children, padded = true, style }: Props) {
  return (
    <View style={styles.root}>
      <LinearGradient colors={GRADIENTS.background as [string, string]} style={StyleSheet.absoluteFill} />
      <View style={styles.blob} />
      <SafeAreaView style={styles.safeArea}>
        <View
          style={[
            styles.container,
            padded ? styles.padded : null,
            center ? styles.center : null,
            style,
          ]}
        >
          {children}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  blob: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: COLORS.primaryDark,
    opacity: 0.25,
    top: -60,
    right: -60,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: SPACING(2),
    paddingTop: SPACING(2),
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

