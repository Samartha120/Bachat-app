import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TransactionModel } from '@/services/mockData';
import { StatusBadge } from './StatusBadge';
import { Palette } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useLedger } from '@/context/LedgerContext';
import { TransactionVoucherModal } from './TransactionVoucherModal';

interface TransactionRowProps {
  transaction: TransactionModel;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({ transaction }) => {
  const { isAdmin } = useAuth();
  const { deleteTransaction, markAsPaid } = useLedger();
  const [modalVisible, setModalVisible] = useState(false);

  const isIncome = transaction.type === 'INCOME';
  const amountColor = isIncome ? Palette.emerald : '#F43F5E';

  const handleDelete = () => {
    Alert.alert(
      'Confirm Deletion',
      `Delete this ${transaction.type.toLowerCase()} record of ${transaction.formattedAmount}? Action will be recorded in audit log.`,
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
      'Mark as Settled',
      `Record full settlement for ${transaction.customerName || transaction.category} (${transaction.formattedAmount})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => markAsPaid(transaction.id) },
      ]
    );
  };

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        {/* Karobar In/Out Arrow Icon */}
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: isIncome
                ? 'rgba(16, 185, 129, 0.12)'
                : 'rgba(239, 68, 68, 0.12)',
            },
          ]}
        >
          <Ionicons
            name={isIncome ? 'arrow-down' : 'arrow-up'}
            size={18}
            color={isIncome ? Palette.emerald : '#F43F5E'}
          />
        </View>

        {/* Middle Column: Title, Customer, Payment Mode */}
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
      </TouchableOpacity>

      {/* Voucher Detail Modal */}
      <TransactionVoucherModal
        visible={modalVisible}
        transaction={transaction}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1322',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginHorizontal: 16,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#1E293B',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
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
    marginHorizontal: 5,
    color: '#334155',
    fontSize: 10,
  },
  customerName: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    flexShrink: 1,
  },
  amountCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amountText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  badgeRow: {
    marginTop: 3,
  },
});
