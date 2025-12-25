import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../shared/theme';

type TabName = 'Services' | 'Request' | 'Account' | 'Support';

interface ClientTabsProps {
  currentTab: TabName;
  onTabChange: (tab: TabName) => void;
}

export const ClientTabs: React.FC<ClientTabsProps> = ({ currentTab, onTabChange }) => {
  const tabs: TabName[] = ['Services', 'Request', 'Account', 'Support'];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={styles.tab}
          onPress={() => onTabChange(tab)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              currentTab === tab && styles.tabTextActive,
            ]}
          >
            {tab}
          </Text>
          {currentTab === tab && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    paddingBottom: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '80%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
});
