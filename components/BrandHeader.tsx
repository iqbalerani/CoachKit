import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUser } from '../hooks/useUser';
import { AnimatedPressable } from './animated';
import { COLORS } from '../constants/colors';
import { SPACING } from '../constants/typography';

interface BrandHeaderProps {
  showAvatar?: boolean;
}

export default function BrandHeader({ showAvatar = true }: BrandHeaderProps) {
  const router = useRouter();
  const { user } = useUser();

  return (
    <View style={styles.header}>
      <SafeAreaView edges={['top']}>
        <View style={styles.headerContent}>
          <Text style={styles.brandText}>
            <Text style={styles.brandCoach}>Coach</Text>
            <Text style={styles.brandKit}>Kit</Text>
          </Text>
          {showAvatar && (
            <AnimatedPressable
              style={styles.avatar}
              onPress={() => router.push('/settings')}
            >
              <Text style={styles.avatarText}>
                {(user?.name || '?')[0].toUpperCase()}
              </Text>
            </AnimatedPressable>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.headerBorder,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  brandText: {
    fontSize: 22,
    fontWeight: '800',
  },
  brandCoach: {
    color: COLORS.text,
  },
  brandKit: {
    color: COLORS.accent,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent + '20',
    borderWidth: 1.5,
    borderColor: COLORS.accent + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.accent,
  },
});
