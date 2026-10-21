import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CustomerModel, TransactionModel } from '@/services/mockData';
import { useLedger } from '@/context/LedgerContext';
import { Palette } from '@/constants/Colors';
import { CONFIG } from '@/constants/Config';
import { TransactionRow } from './TransactionRow';

interface PartyKhataModalProps {
  visible: boolean;
  customer: CustomerModel | null;
  onClose: () => void;
}

export const PartyKhataModal: React.FC<PartyKhataModalProps> = ({
  visible,
  customer,
  onClose,
}) => {
  const { transactions } = useLedger();
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  if (!customer) return null;

  // Filter all transactions belonging to this customer
  const partyTransactions = transactions.filter(t => t.customerId === customer.id);

  const displayedTx = partyTransactions.filter(t => {
    if (filterType === 'ALL') return true;
    return t.type === filterType;
  });

  const totalInvoiced = partyTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalSettled = partyTransactions
    .filter(t => t.type === 'INCOME' && t.status === 'PAID')
    .reduce((acc, t) => acc + t.amount, 0);

  const balanceDue = customer.outstandingBalance || 0;

  const handleShareStatement = async () => {
    try {
      const txLines = partyTransactions
        .map(
          t =>
            `• ${t.transactionDate}: ${t.category} -> ${CONFIG.CURRENCY_SYMBOL} ${t.amount.toLocaleString('en-IN')} [${t.status}]`
        )
        .join('\n');

      const message =
        `📋 *KHATA STATEMENT - SHRESTHA SERVICES*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `*Party:* ${customer.name}\n` +
        `*Contact:* ${customer.phoneNumber}\n` +
        (customer.panVatNumber ? `*PAN/VAT:* ${customer.panVatNumber}\n` : '') +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `*Total Billed:* ${CONFIG.CURRENCY_SYMBOL} ${totalInvoiced.toLocaleString('en-IN')}\n` +
        `*Total Received:* ${CONFIG.CURRENCY_SYMBOL} ${totalSettled.toLocaleString('en-IN')}\n` +
        `*Net Balance Due (लिनुपर्ने):* ${CONFIG.CURRENCY_SYMBOL} ${balanceDue.toLocaleString('en-IN')}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `*Transaction History:*\n${txLines || 'No entries recorded'}\n\n` +
        `*Payment Coordinates:*\n` +
        `• Bank: ${CONFIG.PAYMENT_INFO.BANK_NAME}\n` +
        `• A/C: ${CONFIG.PAYMENT_INFO.ACCOUNT_NUMBER} (${CONFIG.PAYMENT_INFO.ACCOUNT_NAME})\n` +
        `• eSewa / Khalti: ${CONFIG.PAYMENT_INFO.ESEWA_ID}\n\n` +
        `_Generated via Bachat Khata Engine_`;

      await Share.share({
        message,
        title: `Khata Statement - ${customer.name}`,
      });
    } catch (e) {
      console.warn('Share statement failed:', e);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerCompany}>{customer.name}</Text>
            <Text style={styles.headerSubtitle}>खाता विवरण (Party Ledger)</Text>
          </View>

          <TouchableOpacity
            style={styles.shareHeaderBtn}
            onPress={handleShareStatement}
            activeOpacity={0.8}
          >
            <Ionicons name="share-social-outline" size={18} color="#10B981" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
          {/* Party Hero Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {customer.name.slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={styles.heroInfo}>
                <Text style={styles.clientName}>{customer.name}</Text>
                <Text style={styles.clientContact}>{customer.phoneNumber}</Text>
                {customer.corporateEmail && (
                  <Text style={styles.clientEmail}>{customer.corporateEmail}</Text>
                )}
                {customer.panVatNumber && (
                  <Text style={styles.clientPan}>PAN/VAT: {customer.panVatNumber}</Text>
                )}
              </View>
            </View>

            <View style={styles.heroDivider} />

            <View style={styles.balanceGrid}>
              <View style={styles.balanceCol}>
                <Text style={styles.balanceLabel}>कुल कारोबार (Total Billed)</Text>
                <Text style={styles.balanceValue}>
                  {CONFIG.CURRENCY_SYMBOL} {totalInvoiced.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.balanceCol}>
                <Text style={styles.balanceLabel}>रकम आयो (Received)</Text>
                <Text style={[styles.balanceValue, { color: Palette.emerald }]}>
                  {CONFIG.CURRENCY_SYMBOL} {totalSettled.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.balanceCol}>
                <Text style={styles.balanceLabel}>लिनुपर्ने बाँकी (Net Due)</Text>
                <Text
                  style={[
                    styles.balanceValue,
                    { color: balanceDue > 0 ? '#F43F5E' : Palette.emerald },
                  ]}
                >
                  {CONFIG.CURRENCY_SYMBOL} {balanceDue.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Statement Share Button */}
          <TouchableOpacity
            style={styles.sendStatementBtn}
            onPress={handleShareStatement}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
            <Text style={styles.sendStatementText}>
              Send WhatsApp Statement & Bank Details
            </Text>
          </TouchableOpacity>

          {/* Filter Pills */}
          <View style={styles.filterSection}>
            <Text style={styles.txListTitle}>
              लेनदेन इतिहास ({partyTransactions.length} Transactions)
            </Text>
            <View style={styles.filterPills}>
              {(['ALL', 'INCOME', 'EXPENSE'] as const).map(f => (
                <TouchableOpacity
                  key={f}
                  style={[styles.pill, filterType === f && styles.pillActive]}
                  onPress={() => setFilterType(f)}
                >
                  <Text
                    style={[
                      styles.pillText,
                      filterType === f && styles.pillTextActive,
                    ]}
                  >
                    {f === 'ALL' ? 'All' : f === 'INCOME' ? 'Inflow (+)' : 'Outflow (-)'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Transactions List */}
          {displayedTx.length > 0 ? (
            displayedTx.map(tx => <TransactionRow key={tx.id} transaction={tx} />)
          ) : (
            <View style={styles.emptyWrap}>
              <Ionicons name="receipt-outline" size={32} color="#334155" />
              <Text style={styles.emptyText}>कुनै कारोबार भेटिएन (No Entries)</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06090F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
    backgroundColor: '#0B0F19',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  headerCompany: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 2,
  },
  shareHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#0C121E',
    borderRadius: 18,
    margin: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  heroTop: {
    flexDirection: 'row',
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#10B981',
  },
  heroInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  clientName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  clientContact: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  clientEmail: {
    fontSize: 11,
    color: '#64748B',
  },
  clientPan: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '700',
    marginTop: 2,
  },
  heroDivider: {
    height: 1,
    backgroundColor: '#1E293B',
    marginVertical: 14,
  },
  balanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceCol: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  sendStatementBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(37, 211, 102, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(37, 211, 102, 0.25)',
    borderRadius: 12,
    marginHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    marginBottom: 16,
  },
  sendStatementText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#25D366',
  },
  filterSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  txListTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  filterPills: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pillActive: {
    backgroundColor: '#1E293B',
  },
  pillText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  pillTextActive: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  emptyWrap: {
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
  },
});
