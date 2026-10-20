import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Palette } from '@/constants/Colors';

interface StatusBadgeProps {
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  daysOverdue?: number;
  size?: 'small' | 'medium';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, daysOverdue, size = 'medium' }) => {
  let bg = Palette.emeraldMuted;
  let fg = Palette.emerald;
  let iconName: keyof typeof Ionicons.glyphMap = 'checkmark-circle';
  let label = 'PAID';

  if (status === 'PENDING') {
    bg = Palette.amberMuted;
    fg = Palette.amber;
    iconName = 'time-outline';
    label = 'PENDING';
  } else if (status === 'OVERDUE') {
    bg = Palette.roseMuted;
    fg = Palette.rose;
    iconName = 'alert-circle';
    label = daysOverdue ? `OVERDUE (${daysOverdue}d)` : 'OVERDUE';
  }

  const isSmall = size === 'small';

  return (
    <View style={[styles.badge, { backgroundColor: bg }, isSmall && styles.badgeSmall]}>
      <Ionicons name={iconName} size={isSmall ? 10 : 12} color={fg} style={{ marginRight: 4 }} />
      <Text style={[styles.text, { color: fg }, isSmall && styles.textSmall]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  textSmall: {
    fontSize: 10,
    fontWeight: '600',
  },
});
