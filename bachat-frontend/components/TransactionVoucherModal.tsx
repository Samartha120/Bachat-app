import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TransactionModel } from '@/services/mockData';
import { Palette } from '@/constants/Colors';
import { CONFIG } from '@/constants/Config';
import { StatusBadge } from './StatusBadge';
import { useAuth } from '@/context/AuthContext';
import { useLedger } from '@/context/LedgerContext';

interface TransactionVoucherModalProps {
  visible: boolean;
  transaction: TransactionModel | null;
  onClose: () => void;
}

export const TransactionVoucherModal: React.FC<TransactionVoucherModalProps> = ({
  visible,
  transaction,
  onClose,
}) => {
  const { isAdmin } = useAuth();
  const { markAsPaid, deleteTransaction } = useLedger();

  if (!transaction) return null;

  const isIncome = transaction.type === 'INCOME';

  const handleShareReceipt = async () => {
    try {
      const message =
        `📄 *SHRESTHA SERVICES - PAYMENT VOUCHER*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `• *Voucher Ref:* ${transaction.paymentReference || 'TX-' + transaction.id}\n` +
        `• *Date:* ${transaction.transactionDate}\n` +
        `• *Party:* ${transaction.customerName || 'Office Operational'}\n` +
        `• *Category:* ${transaction.category}\n` +
        `• *Amount:* ${isIncome ? '+' : '-'} ${transaction.formattedAmount}\n` +
        `• *Status:* ${transaction.status}\n` +
        (transaction.dueDate ? `• *Due Date:* ${transaction.dueDate}\n` : '') +
        (transaction.notes ? `• *Notes:* ${transaction.notes}\n` : '') +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `*Accounts Desk:* ${CONFIG.PAYMENT_INFO.OFFICE_CONTACT}\n` +
        `*Email:* ${CONFIG.PAYMENT_INFO.OFFICE_EMAIL}\n` +
        `_Generated via Bachat Core Engine_`;

      await Share.share({
        message,
        title: `Voucher - ${transaction.paymentReference || transaction.id}`,
      });
    } catch (e) {
      console.warn('Share voucher failed:', e);
    }
  };

  const handleSettle = () => {
    Alert.alert(
      'Confirm Settlement',
      `Mark this transaction of ${transaction.formattedAmount} as PAID?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Settle',
          onPress: async () => {
            await markAsPaid(transaction.id);
            onClose();
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Record',
      `Are you sure you want to delete this ${transaction.category} transaction? This action will be audited.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTransaction(transaction.id);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.brandTitle}>SHRESTHA SERVICES</Text>
              <Text style={styles.voucherSubtitle}>Official Karobar Voucher</Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Amount Hero */}
          <View
            style={[
              styles.amountHero,
              {
                backgroundColor: isIncome
                  ? 'rgba(16, 185, 129, 0.08)'
                  : 'rgba(239, 68, 68, 0.08)',
                borderColor: isIncome
                  ? 'rgba(16, 185, 129, 0.25)'
                  : 'rgba(239, 68, 68, 0.25)',
              },
            ]}
          >
            <Text style={styles.amountLabel}>
              {isIncome ? 'रकम आयो (Cash Inflow)' : 'रकम गयो (Cash Outflow)'}
            </Text>
            <Text
              style={[
                styles.amountValue,
                { color: isIncome ? Palette.emerald : '#F43F5E' },
              ]}
            >
              {isIncome ? '+' : '-'} {transaction.formattedAmount}
            </Text>
            <View style={styles.badgeWrap}>
              <StatusBadge
                status={transaction.status}
                daysOverdue={transaction.daysOverdue}
              />
            </View>
          </View>

          {/* Details Table */}
          <View style={styles.detailsList}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Party / Client</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {transaction.customerName || 'General Office Expense'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>{transaction.category}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction Date</Text>
              <Text style={styles.detailValue}>{transaction.transactionDate}</Text>
            </View>

            {transaction.dueDate && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Payment Due Date</Text>
                <Text style={[styles.detailValue, { color: '#F87171', fontWeight: '700' }]}>
                  {transaction.dueDate}
                </Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Voucher / Ref #</Text>
              <Text style={[styles.detailValue, { fontFamily: 'monospace' }]}>
                {transaction.paymentReference || `TX-${transaction.id}`}
              </Text>
            </View>

            {transaction.notes && (
              <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.detailLabel}>Memo / Notes</Text>
                <Text style={styles.detailNotes}>{transaction.notes}</Text>
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.shareBtn}
              onPress={handleShareReceipt}
              activeOpacity={0.8}
            >
              <Ionicons name="share-social-outline" size={16} color="#10B981" />
              <Text style={styles.shareBtnText}>Share Receipt</Text>
            </TouchableOpacity>

            {transaction.status !== 'PAID' && (
              <TouchableOpacity
                style={styles.settleBtn}
                onPress={handleSettle}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-done" size={16} color="#FFFFFF" />
                <Text style={styles.settleBtnText}>Mark as Settled</Text>
              </TouchableOpacity>
            )}

            {isAdmin && (
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={handleDelete}
                activeOpacity={0.8}
              >
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  sheetContainer: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#0C121E',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 1.5,
  },
  voucherSubtitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountHero: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  badgeWrap: {
    marginTop: 6,
  },
  detailsList: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
    maxWidth: 200,
    textAlign: 'right',
  },
  detailNotes: {
    fontSize: 11,
    color: '#94A3B8',
    maxWidth: 180,
    textAlign: 'right',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },
  shareBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  settleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },
  settleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  deleteBtn: {
    width: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderRadius: 10,
  },
});
