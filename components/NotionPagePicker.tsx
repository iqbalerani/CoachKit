import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchNotionPages } from '../services/notion';
import { NotionPage } from '../types';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../constants/typography';

interface NotionPagePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (page: NotionPage) => void;
  filter?: 'page' | 'database';
  title?: string;
  accentColor?: string;
}

export default function NotionPagePicker({
  visible,
  onClose,
  onSelect,
  filter,
  title = 'Select a Page',
  accentColor = COLORS.accent,
}: NotionPagePickerProps) {
  const [query, setQuery] = useState('');
  const [pages, setPages] = useState<NotionPage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const search = useCallback(async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const results = await searchNotionPages(
        searchQuery || undefined,
        filter
      );
      setPages(results);
    } catch (error) {
      console.error('Notion search error:', error);
      setPages([]);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (visible) {
      search('');
    }
  }, [visible, search]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      search(query);
    }, 400);
    return () => clearTimeout(timer);
  }, [query, visible, search]);

  const handleSelect = (page: NotionPage) => {
    onSelect(page);
    onClose();
    setQuery('');
  };

  const renderItem = ({ item }: { item: NotionPage }) => (
    <TouchableOpacity
      style={styles.pageItem}
      onPress={() => handleSelect(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.pageIcon}>{item.icon || '📄'}</Text>
      <View style={styles.pageInfo}>
        <Text style={styles.pageTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.pageDate}>
          Edited {new Date(item.lastEditedTime).toLocaleDateString()}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search pages..."
            placeholderTextColor={COLORS.textMuted}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={accentColor} />
            <Text style={styles.loadingText}>Searching Notion...</Text>
          </View>
        ) : (
          <FlatList
            data={pages}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {query ? 'No pages found' : 'No accessible pages'}
                </Text>
                <Text style={styles.emptySubtext}>
                  Make sure you shared pages with the integration
                </Text>
              </View>
            }
          />
        )}
      </View>
    </Modal>
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
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
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
    margin: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  list: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  pageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pageIcon: {
    fontSize: 20,
    width: 32,
    textAlign: 'center',
  },
  pageInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  pageTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  pageDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
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
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
