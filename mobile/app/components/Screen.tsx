import { PropsWithChildren } from 'react';
import { SafeAreaView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { COLORS, SPACING } from '../../constants/theme';

type Props = PropsWithChildren<{
  center?: boolean;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}>;

/**
 * Minimalist Screen wrapper
 * - Clean, solid background
 * - Generous padding
 */
export default function Screen({ center, children, padded = true, style }: Props) {
  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <View
          style={[
            styles.container,
            padded && styles.padded,
            center && styles.center,
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
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: SPACING(2.5),
    paddingTop: SPACING(2),
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
