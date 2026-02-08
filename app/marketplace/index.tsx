import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMarketplace } from '../../hooks/useMarketplace';
import { useSubscription } from '../../hooks/useSubscription';
import { useUser } from '../../hooks/useUser';
import MarketplaceCard from '../../components/MarketplaceCard';
import { MarketplaceCoach } from '../../types';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';

const CATEGORIES = ['All', 'Productivity', 'Strategy', 'Career', 'Creative', 'Mindset', 'Habits', 'Custom'];
const SORT_OPTIONS = [
  { label: 'Popular', value: 'downloads' as const },
  { label: 'Newest', value: 'newest' as const },
  { label: 'A-Z', value: 'name' as const },
];

export default function MarketplaceScreen() {
  const router = useRouter();
  const { coaches, isLoading, error, browse, importCoach, filters, setFilters } = useMarketplace();
  const { subscription } = useSubscription();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    browse();
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setFilters(prev => ({ ...prev, category }));
    browse({ category });
  }, [browse, setFilters]);

  const handleSortChange = useCallback((sort: 'downloads' | 'newest' | 'name') => {
    setFilters(prev => ({ ...prev, sort }));
    browse({ sort });
  }, [browse, setFilters]);

  const handleSearch = useCallback(() => {
    browse({ query: searchQuery });
  }, [browse, searchQuery]);

  const handleAddCoach = useCallback(async (mc: MarketplaceCoach) => {
    try {
      const local = await importCoach(mc);
      Alert.alert(
        'Added!',
        `${local.name} has been added to your coaches.`,
        [
          { text: 'OK' },
          {
            text: 'Open',
            onPress: () => router.push({ pathname: '/coach/[id]', params: { id: local.id } }),
          },
        ]
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to import coach.');
    }
  }, [importCoach, router]);

  const handlePreview = useCallback((mc: MarketplaceCoach) => {
    router.push({ pathname: '/marketplace/[id]', params: { id: mc.id } });
  }, [router]);

  const renderItem = useCallback(({ item }: { item: MarketplaceCoach }) => (
    <MarketplaceCard
      coach={item}
      onPreview={() => handlePreview(item)}
      onAdd={() => handleAddCoach(item)}
    />
  ), [handlePreview, handleAddCoach]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Community Agents</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          placeholder="Search agents..."
          placeholderTextColor={COLORS.textMuted}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => { setSearchQuery(''); browse({ query: '' }); }}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.filterPill,
              filters.category === cat && { backgroundColor: COLORS.accent },
            ]}
            onPress={() => handleCategoryChange(cat)}
          >
            <Text style={[
              styles.filterText,
              filters.category === cat && styles.filterTextActive,
            ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.sortRow}>
        {SORT_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.sortPill,
              filters.sort === opt.value && styles.sortPillActive,
            ]}
            onPress={() => handleSortChange(opt.value)}
          >
            <Text style={[
              styles.sortText,
              filters.sort === opt.value && styles.sortTextActive,
            ]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Loading community agents...</Text>
        </View>
      ) : error ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cloud-offline-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>Marketplace Unavailable</Text>
          <Text style={styles.emptySubtext}>
            {error.includes('not configured')
              ? 'Marketplace integration is not configured yet.'
              : 'Could not connect. Try again later.'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => browse()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={coaches}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No agents found</Text>
              <Text style={styles.emptySubtext}>Try a different search or category</Text>
            </View>
          }
        />
      )}

      {subscription.tier === 'creator' && (
        <View style={styles.publishBar}>
          <TouchableOpacity
            style={styles.publishButton}
            onPress={() => {
              Alert.alert(
                'Publish Agent',
                'To publish, export a custom agent from the coach detail screen.'
              );
            }}
          >
            <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" />
            <Text style={styles.publishText}>Publish Your Agent</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  filterRow: {
    maxHeight: 44,
    marginBottom: SPACING.xs,
  },
  filterContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterText: {
    ...TYPOGRAPHY.label,
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  sortRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sortPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    backgroundColor: 'transparent',
  },
  sortPillActive: {
    backgroundColor: COLORS.surface,
  },
  sortText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  sortTextActive: {
    color: COLORS.text,
  },
  list: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
    gap: SPACING.sm,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textSecondary,
  },
  emptySubtext: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.accent,
  },
  retryText: {
    ...TYPOGRAPHY.button,
    color: '#FFFFFF',
    fontSize: 14,
  },
  publishBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  publishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
  },
  publishText: {
    ...TYPOGRAPHY.button,
    color: '#FFFFFF',
    fontSize: 14,
  },
});
