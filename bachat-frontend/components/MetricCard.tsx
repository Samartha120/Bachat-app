import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Palette } from '@/constants/Colors';

interface MetricCardProps {
  title: string;
  amount: number;
  type: 'income' | 'expense' | 'margin' | 'receivables';
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  amount,
  type,
  subtitle,
  icon,
}) => {
  let accentColor = Palette.emerald;
  let bgMuted = Palette.emeraldMuted;

  if (type === 'expense') {
    accentColor = Palette.rose;
    bgMuted = Palette.roseMuted;
  } else if (type === 'margin') {
    accentColor = amount >= 0 ? Palette.emerald : Palette.rose;
    bgMuted = amount >= 0 ? Palette.emeraldMuted : Palette.roseMuted;
  } else if (type === 'receivables') {
    accentColor = Palette.amber;
    bgMuted = Palette.amberMuted;
  }

  const formattedAmount = 'NPR ' + Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.iconContainer, { backgroundColor: bgMuted }]}>
          <Ionicons name={icon} size={15} color={accentColor} />
        </View>
      </View>

      <Text style={[styles.amount, { color: type === 'margin' && amount < 0 ? Palette.rose : '#F8FAFC' }]}>
        {type === 'margin' && amount < 0 ? '-' : ''}
        {formattedAmount}
      </Text>

      {subtitle ? (
        <Text style={styles.subtitle}>{subtitle}</Text>
      ) : (
        <View style={styles.statusIndicator}>
          <View style={[styles.dot, { backgroundColor: accentColor }]} />
          <Text style={styles.statusText}>
            {type === 'income' ? 'Cash inflow' : type === 'expense' ? 'Cash outflow' : type === 'margin' ? 'Net balance' : 'Pending collection'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
    backgroundColor: Palette.cardDark,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Palette.borderDark,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  amount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
    marginVertical: 4,
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
});
