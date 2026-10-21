import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { HeaderBranding } from '@/components/HeaderBranding';
import { TimeBucketFilter } from '@/components/TimeBucketFilter';
import { FinancialChart } from '@/components/FinancialChart';
import { TransactionRow } from '@/components/TransactionRow';
import { useLedger } from '@/context/LedgerContext';
import { Palette } from '@/constants/Colors';
import { CONFIG } from '@/constants/Config';

export default function LedgerScreen() {
  const {
    timeBucket,
    setTimeBucket,
    filteredTransactions,
    totalIncome,
    totalExpenses,
    netMargin,
    agingReceivables,
    overdueTransactions,
    chartData,
    refreshData,
    isRefreshing,
  } = useLedger();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE' | 'DUE'>('ALL');

  const formatNpr = (val: number) => {
    return `${CONFIG.CURRENCY_SYMBOL} ${Math.abs(val).toLocaleString('en-IN')}`;
  };

  const displayedTransactions = filteredTransactions.filter(t => {
    const matchesSearch =
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.customerName && t.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'INCOME') return t.type === 'INCOME';
    if (selectedFilter === 'EXPENSE') return t.type === 'EXPENSE';
    if (selectedFilter === 'DUE') return t.status === 'OVERDUE' || t.status === 'PENDING';
    return true;
  });

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
        {/* Executive Header with instant lock */}
        <HeaderBranding subtitle="Karobar & Cashbook Engine" />

        {/* Karobar Time Period Tabs (Day / Week / Month / Year) */}
        <TimeBucketFilter selected={timeBucket} onSelect={setTimeBucket} />

        {/* Overdue Debt Alert Banner */}
        {overdueTransactions.length > 0 && (
          <TouchableOpacity
            style={styles.overdueBanner}
            onPress={() => router.push('/(tabs)/receivables')}
            activeOpacity={0.8}
          >
            <View style={styles.overdueIconWrap}>
              <Ionicons name="alert-circle" size={18} color="#FFFFFF" />
            </View>
            <View style={styles.overdueTextWrap}>
              <Text style={styles.overdueTitle}>
                {overdueTransactions.length} Overdue Receivables Alert (लिनुपर्ने बाँकी)
              </Text>
              <Text style={styles.overdueSubtitle}>
                Clients have overdue bills past payment date. Tap to send reminders.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#EF4444" />
          </TouchableOpacity>
        )}

        {/* Hero Karobar Cashbook Card */}
        <View style={styles.heroCardContainer}>
          <LinearGradient
            colors={['#101C33', '#0C1322', '#080D1A']}
            style={styles.heroCardGradient}
          >
            <View style={styles.heroTopRow}>
              <View>
                <Text style={styles.heroSubtitle}>NET CASH BALANCE • कुल बाँकी नगद</Text>
                <Text style={styles.heroMainAmount}>
                  {netMargin >= 0 ? '' : '- '}{formatNpr(netMargin)}
                </Text>
              </View>

              <View style={styles.netStatusPill}>
                <Ionicons
                  name={netMargin >= 0 ? 'trending-up' : 'trending-down'}
                  size={14}
                  color={netMargin >= 0 ? '#10B981' : '#F43F5E'}
                />
                <Text
                  style={[
                    styles.netStatusText,
                    { color: netMargin >= 0 ? '#10B981' : '#F43F5E' },
                  ]}
                >
                  {netMargin >= 0 ? 'Surplus' : 'Deficit'}
                </Text>
              </View>
            </View>

            <View style={styles.heroDivider} />

            {/* Inflow vs Outflow Mini Counters */}
            <View style={styles.heroFlowRow}>
              {/* Cash In */}
              <View style={styles.flowMetric}>
                <View style={styles.flowIconIn}>
                  <Ionicons name="arrow-down" size={14} color="#10B981" />
                </View>
                <View>
                  <Text style={styles.flowLabel}>रकम आयो (Cash In)</Text>
                  <Text style={styles.flowAmountIn}>+ {formatNpr(totalIncome)}</Text>
                </View>
              </View>

              <View style={styles.flowVerticalDivider} />

              {/* Cash Out */}
              <View style={styles.flowMetric}>
                <View style={styles.flowIconOut}>
                  <Ionicons name="arrow-up" size={14} color="#F43F5E" />
                </View>
                <View>
                  <Text style={styles.flowLabel}>रकम गयो (Cash Out)</Text>
                  <Text style={styles.flowAmountOut}>- {formatNpr(totalExpenses)}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Karobar Dual Quick-Action Buttons */}
        <View style={styles.quickActionRow}>
          <TouchableOpacity
            style={styles.gotCashButton}
            onPress={() => router.push({ pathname: '/(tabs)/entry', params: { preselectedType: 'INCOME' } })}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.actionGradient}
            >
              <Ionicons name="arrow-down-circle" size={18} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>+ रकम आयो (Inflow)</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gaveCashButton}
            onPress={() => router.push({ pathname: '/(tabs)/entry', params: { preselectedType: 'EXPENSE' } })}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              style={styles.actionGradient}
            >
              <Ionicons name="arrow-up-circle" size={18} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>- रकम गयो (Outflow)</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Receivables & Khata Snapshot Card */}
        <TouchableOpacity
          style={styles.receivableQuickCard}
          onPress={() => router.push('/(tabs)/receivables')}
          activeOpacity={0.8}
        >
          <View style={styles.rqLeft}>
            <View style={styles.rqIconWrap}>
              <Ionicons name="time" size={18} color="#F59E0B" />
            </View>
            <View>
              <Text style={styles.rqTitle}>Pending Credit • लिनुपर्ने बाँकी रकम</Text>
              <Text style={styles.rqSubtitle}>
                Total uncollected invoices across clients
              </Text>
            </View>
          </View>
          <View style={styles.rqRight}>
            <Text style={styles.rqAmount}>{formatNpr(agingReceivables)}</Text>
            <Ionicons name="chevron-forward" size={16} color="#64748B" />
          </View>
        </TouchableOpacity>

        {/* Interactive Cash Flow Chart */}
        <FinancialChart
          incomeData={chartData.incomeData}
          expenseData={chartData.expenseData}
          title="Cash Flow Dynamics"
        />

        {/* Karobar Daybook Entries Header */}
        <View style={styles.ledgerHeader}>
          <View>
            <Text style={styles.sectionTitle}>दैनिक कारोबार (Daybook)</Text>
            <Text style={styles.sectionSubtitle}>
              {displayedTransactions.length} entries for selected period
            </Text>
          </View>

          {/* Quick Filter Pills */}
          <View style={styles.filterPills}>
            {(['ALL', 'INCOME', 'EXPENSE', 'DUE'] as const).map(filter => {
              const active = selectedFilter === filter;
              const label =
                filter === 'ALL'
                  ? 'All'
                  : filter === 'INCOME'
                  ? 'आयो'
                  : filter === 'EXPENSE'
                  ? 'गयो'
                  : 'बाँकी';
              return (
                <TouchableOpacity
                  key={filter}
                  style={[styles.miniPill, active && styles.miniPillActive]}
                  onPress={() => setSelectedFilter(filter)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.miniPillText,
                      active && styles.miniPillTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={16} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search party, category, or bill #..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>

        {/* Daybook Transaction Stream */}
        {displayedTransactions.length > 0 ? (
          displayedTransactions.map(tx => (
            <TransactionRow key={tx.id} transaction={tx} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={38} color="#24324D" />
            <Text style={styles.emptyTitle}>कुनै कारोबार भेटिएन (No Transactions)</Text>
            <Text style={styles.emptySubtitle}>
              Tap the buttons above to record an income or expense entry.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#06090F',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  overdueBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  overdueIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  overdueTextWrap: {
    flex: 1,
  },
  overdueTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FCA5A5',
  },
  overdueSubtitle: {
    fontSize: 11,
    color: '#F87171',
    marginTop: 2,
  },
  heroCardContainer: {
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E293B',
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  heroCardGradient: {
    padding: 18,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroMainAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  netStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  netStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 14,
  },
  heroFlowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flowMetric: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  flowIconIn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flowIconOut: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flowLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  flowAmountIn: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10B981',
    marginTop: 1,
  },
  flowAmountOut: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F43F5E',
    marginTop: 1,
  },
  flowVerticalDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 8,
  },
  quickActionRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 10,
    marginTop: 10,
    marginBottom: 6,
  },
  gotCashButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  gaveCashButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#EF4444',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  receivableQuickCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0D1322',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 12,
  },
  rqLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rqIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rqTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  rqSubtitle: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  rqRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rqAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F59E0B',
  },
  ledgerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  filterPills: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  miniPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  miniPillActive: {
    backgroundColor: '#1E293B',
  },
  miniPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  miniPillTextActive: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1322',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#F8FAFC',
    padding: 0,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    marginTop: 16,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 260,
  },
});
