import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TransactionModel } from '@/services/mockData';
import { StatusBadge } from './StatusBadge';
import { Palette } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useLedger } from '@/context/LedgerContext';

interface TransactionRowProps {
  transaction: TransactionModel;
  onPress?: () => void;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({ transaction, onPress }) => {
  const { isAdmin } = useAuth();
  const { deleteTransaction, markAsPaid } = useLedger();

  const isIncome = transaction.type === 'INCOME';
  const amountColor = isIncome ? Palette.emerald : '#F8FAFC';

  const handleDelete = () => {
    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete this ${transaction.type.toLowerCase()} record of ${transaction.formattedAmount}? This action will be recorded in the audit trail.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteTransaction(transaction.id),
        },
      ]
    );
  };

  const handleMarkPaid = () => {
    Alert.alert(
      'Mark as Paid',
      `Record full settlement for ${transaction.customerName || transaction.category} of ${transaction.formattedAmount}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm Settlement', onPress: () => markAsPaid(transaction.id) },
      ]
    );
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.containerPressed]}
      onPress={onPress}
    >
      {/* Category Icon */}
      <View
        style={[
          styles.iconBox,
          { backgroundColor: isIncome ? Palette.emeraldMuted : 'rgba(255, 255, 255, 0.05)' },
        ]}
      >
        <Ionicons
          name={
            isIncome
              ? 'trending-down-outline'
              : 'trending-up-outline'
          }
          size={18}
          color={isIncome ? Palette.emerald : '#94A3B8'}
        />
      </View>

      {/* Middle Column: Title, Customer, Date */}
      <View style={styles.detailsCol}>
        <View style={styles.titleRow}>
          <Text style={styles.categoryTitle} numberOfLines={1}>
            {transaction.category}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.dateText}>{transaction.transactionDate}</Text>
          {transaction.customerName && (
            <>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.customerName} numberOfLines={1}>
                {transaction.customerName}
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Right Column: Amount & Status Badge */}
      <View style={styles.amountCol}>
        <Text style={[styles.amountText, { color: amountColor }]}>
          {isIncome ? '+' : '-'} {transaction.formattedAmount}
        </Text>
        <View style={styles.badgeRow}>
          <StatusBadge
            status={transaction.status}
            daysOverdue={transaction.daysOverdue}
            size="small"
          />
        </View>
      </View>

      {/* Quick Action menu for Admin (Delete) or Pending item (Mark Paid) */}
      <View style={styles.actionsBox}>
        {transaction.status !== 'PAID' && (
          <Pressable
            style={styles.actionBtn}
            onPress={handleMarkPaid}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="checkmark-done" size={16} color={Palette.emerald} />
          </Pressable>
        )}
        {isAdmin && (
          <Pressable
            style={styles.actionBtn}
            onPress={handleDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={15} color="#64748B" />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.cardDark,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: Palette.borderDark,
  },
  containerPressed: {
    backgroundColor: Palette.cardDarkHover,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailsCol: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  dateText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  metaDot: {
    marginHorizontal: 4,
    color: '#475569',
    fontSize: 10,
  },
  customerName: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
    flexShrink: 1,
  },
  amountCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginRight: 8,
  },
  amountText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  badgeRow: {
    marginTop: 4,
  },
  actionsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
});
