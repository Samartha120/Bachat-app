import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Share,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

import { HeaderBranding } from '@/components/HeaderBranding';
import { StatusBadge } from '@/components/StatusBadge';
import { useLedger } from '@/context/LedgerContext';
import { CONFIG } from '@/constants/Config';
import { Palette } from '@/constants/Colors';
import { TransactionModel } from '@/services/mockData';

export default function ReceivablesScreen() {
  const {
    agingReceivables,
    overdueReceivables,
    overdueTransactions,
    pendingTransactions,
    markAsPaid,
    refreshData,
    isRefreshing,
  } = useLedger();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'OVERDUE' | 'PENDING'>('ALL');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const outstandingList =
    activeFilter === 'OVERDUE'
      ? overdueTransactions
      : activeFilter === 'PENDING'
      ? pendingTransactions
      : [...overdueTransactions, ...pendingTransactions];

  const generateReminderText = (item: TransactionModel) => {
    const customer = item.customerName || 'Valued Client';
    const invoiceRef = item.paymentReference || `INV-${item.id}`;
    const daysNotice =
      item.status === 'OVERDUE'
        ? `(OVERDUE by ${item.daysOverdue || 0} days)`
        : `(Due on ${item.dueDate || 'scheduled date'})`;

    return `Dear ${customer},\n\nThis is a formal payment notice from Shrestha Services regarding your outstanding invoice #${invoiceRef}.\n\nCategory: ${item.category}\nOutstanding Amount: ${item.formattedAmount}\nStatus: ${item.status} ${daysNotice}\n\nCorporate Payment Accounts:\n• Bank: ${CONFIG.PAYMENT_INFO.BANK_NAME}\n• A/C Name: ${CONFIG.PAYMENT_INFO.ACCOUNT_NAME}\n• A/C No: ${CONFIG.PAYMENT_INFO.ACCOUNT_NUMBER}\n• eSewa / Khalti: ${CONFIG.PAYMENT_INFO.ESEWA_ID}\n\nPlease share transaction voucher once settled to ${CONFIG.PAYMENT_INFO.OFFICE_EMAIL} or call ${CONFIG.PAYMENT_INFO.OFFICE_CONTACT}.\n\nThank you for partnering with Shrestha Services.\n— Generated via Bachat Executive Financial Engine`;
  };

  const handleCopyReminder = async (item: TransactionModel) => {
    const text = generateReminderText(item);
    await Clipboard.setStringAsync(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleShareReminder = async (item: TransactionModel) => {
    const text = generateReminderText(item);
    try {
      await Share.share({
        title: `Payment Notice: Shrestha Services - ${item.customerName || item.category}`,
        message: text,
      });
    } catch (e) {
      console.warn('Share dismissed or failed:', e);
    }
  };

  const handleSettle = (item: TransactionModel) => {
    Alert.alert(
      'Confirm Settlement',
      `Record full payment receipt for ${item.customerName || item.category} of ${item.formattedAmount}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Receipt',
          onPress: () => markAsPaid(item.id),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshData}
            tintColor={Palette.emerald}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <HeaderBranding subtitle="Accounts Receivable & One-Click Reminders" />

        {/* OVERDUE ALERT HUB BANNER */}
        <View style={styles.alertHubCard}>
          <View style={styles.alertHeader}>
            <View style={styles.alertIconPulse}>
              <Ionicons name="warning" size={20} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertHubTitle}>Overdue Debt Alert Hub</Text>
              <Text style={styles.alertHubSubtitle}>
                {overdueTransactions.length} customer invoices require urgent recovery action
              </Text>
            </View>
          </View>

          <View style={styles.alertStatsRow}>
            <View style={styles.alertStatBox}>
              <Text style={styles.alertStatLabel}>OVERDUE CAPITAL</Text>
              <Text style={styles.alertStatValueOverdue}>
                NPR {overdueReceivables.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.alertStatDivider} />
            <View style={styles.alertStatBox}>
              <Text style={styles.alertStatLabel}>TOTAL AGING DEBT</Text>
              <Text style={styles.alertStatValueTotal}>
                NPR {agingReceivables.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </View>

        {/* Filter Tabs: All vs Overdue vs Pending */}
        <View style={styles.filterSegment}>
          <Pressable
            style={[styles.segmentBtn, activeFilter === 'ALL' && styles.segmentBtnActive]}
            onPress={() => setActiveFilter('ALL')}
          >
            <Text style={[styles.segmentText, activeFilter === 'ALL' && styles.segmentTextActive]}>
              All ({overdueTransactions.length + pendingTransactions.length})
            </Text>
          </Pressable>
          <Pressable
            style={[styles.segmentBtn, activeFilter === 'OVERDUE' && styles.segmentBtnActive]}
            onPress={() => setActiveFilter('OVERDUE')}
          >
            <Text style={[styles.segmentText, activeFilter === 'OVERDUE' && styles.segmentTextActive]}>
              Overdue ({overdueTransactions.length})
            </Text>
          </Pressable>
          <Pressable
            style={[styles.segmentBtn, activeFilter === 'PENDING' && styles.segmentBtnActive]}
            onPress={() => setActiveFilter('PENDING')}
          >
            <Text style={[styles.segmentText, activeFilter === 'PENDING' && styles.segmentTextActive]}>
              Pending ({pendingTransactions.length})
            </Text>
          </Pressable>
        </View>

        {/* Success Toast when copied */}
        {copiedId && (
          <View style={styles.copiedToast}>
            <Ionicons name="checkmark-circle" size={16} color={Palette.emerald} />
            <Text style={styles.copiedToastText}>
              Professional payment reminder copied with corporate bank details!
            </Text>
          </View>
        )}

        {/* Outstanding Invoices List */}
        <View style={styles.listContainer}>
          {outstandingList.length > 0 ? (
            outstandingList.map(item => {
              const isOverdue = item.status === 'OVERDUE';
              return (
                <View
                  key={item.id}
                  style={[
                    styles.invoiceCard,
                    isOverdue && styles.invoiceCardOverdue,
                  ]}
                >
                  {/* Top Row: Customer Name & Amount */}
                  <View style={styles.cardTopRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.customerName} numberOfLines={1}>
                        {item.customerName || item.category}
                      </Text>
                      <Text style={styles.categorySub}>{item.category}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.amountText}>{item.formattedAmount}</Text>
                      <StatusBadge status={item.status} daysOverdue={item.daysOverdue} />
                    </View>
                  </View>

                  {/* Due Date & Contact Details */}
                  <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                      <Ionicons name="calendar-outline" size={13} color="#64748B" />
                      <Text style={styles.detailText}>
                        Due: {item.dueDate || 'N/A'}
                      </Text>
                    </View>
                    {item.customerPhone && (
                      <View style={styles.detailItem}>
                        <Ionicons name="call-outline" size={13} color="#64748B" />
                        <Text style={styles.detailText}>{item.customerPhone}</Text>
                      </View>
                    )}
                  </View>

                  {item.notes && (
                    <Text style={styles.memoText} numberOfLines={2}>
                      "{item.notes}"
                    </Text>
                  )}

                  {/* Action Buttons Row */}
                  <View style={styles.actionRow}>
                    {/* One-Click Copy */}
                    <Pressable
                      style={styles.actionButtonOutline}
                      onPress={() => handleCopyReminder(item)}
                    >
                      <Ionicons
                        name={copiedId === item.id ? 'checkmark' : 'copy-outline'}
                        size={15}
                        color={Palette.indigo}
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.actionButtonOutlineText}>
                        {copiedId === item.id ? 'Copied' : 'Copy Notice'}
                      </Text>
                    </Pressable>

                    {/* Native Share */}
                    <Pressable
                      style={styles.actionButtonShare}
                      onPress={() => handleShareReminder(item)}
                    >
                      <Ionicons
                        name="share-social-outline"
                        size={15}
                        color="#F8FAFC"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.actionButtonShareText}>Share</Text>
                    </Pressable>

                    {/* Quick Settle */}
                    <Pressable
                      style={styles.actionButtonSettle}
                      onPress={() => handleSettle(item)}
                    >
                      <Ionicons
                        name="checkmark-done"
                        size={15}
                        color="#FFFFFF"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.actionButtonSettleText}>Settle</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="shield-checkmark" size={42} color={Palette.emerald} />
              <Text style={styles.emptyTitle}>All Accounts Settled</Text>
              <Text style={styles.emptySubtitle}>
                No outstanding or overdue receivables in this view. Excellent cash collection!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#080C15',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  alertHubCard: {
    backgroundColor: '#151C2C',
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    shadowColor: '#EF4444',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  alertIconPulse: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertHubTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.2,
  },
  alertHubSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  alertStatsRow: {
    flexDirection: 'row',
    backgroundColor: '#0B0F19',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  alertStatBox: {
    flex: 1,
  },
  alertStatDivider: {
    width: 1,
    backgroundColor: '#1E293B',
    marginHorizontal: 12,
  },
  alertStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  alertStatValueOverdue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#EF4444',
    marginTop: 4,
  },
  alertStatValueTotal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 4,
  },
  filterSegment: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginHorizontal: 16,
    marginVertical: 6,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  segmentBtnActive: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  copiedToast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: Palette.emerald,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginVertical: 6,
    gap: 8,
  },
  copiedToastText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A7F3D0',
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
    marginTop: 6,
  },
  invoiceCard: {
    backgroundColor: Palette.cardDark,
    borderRadius: 14,
    padding: 14,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: Palette.borderDark,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  invoiceCardOverdue: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: '#131A29',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.2,
  },
  categorySub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginVertical: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  memoText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: 4,
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  actionButtonOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.indigoMuted,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonOutlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.indigo,
  },
  actionButtonShare: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonShareText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  actionButtonSettle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.emeraldDark,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonSettleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    padding: 36,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
});
