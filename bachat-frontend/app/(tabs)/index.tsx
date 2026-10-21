import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const cashInAnim = useRef(new Animated.Value(0)).current;
  const cashOutAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: true }),
      ]),
      Animated.timing(cashInAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(cashOutAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

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
        {/* Executive Header */}
        <HeaderBranding subtitle="Financial Dashboard" />

        {/* Time Period Tabs */}
        <TimeBucketFilter selected={timeBucket} onSelect={setTimeBucket} />

        {/* Overdue Alert */}
        {overdueTransactions.length > 0 && (
          <TouchableOpacity
            style={styles.overdueBanner}
            onPress={() => router.push('/(tabs)/receivables')}
            activeOpacity={0.8}
          >
            <View style={styles.overdueIconWrap}>
              <Ionicons name="alert-circle" size={16} color="#FFFFFF" />
            </View>
            <View style={styles.overdueTextWrap}>
              <Text style={styles.overdueTitle}>
                {overdueTransactions.length} Overdue Payment{overdueTransactions.length > 1 ? 's' : ''}
              </Text>
              <Text style={styles.overdueSubtitle}>
                Tap to review and send reminders
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#EF4444" />
          </TouchableOpacity>
        )}

        {/* Hero Balance Card */}
        <Animated.View
          style={[
            styles.heroCardContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['#0E1A2E', '#0A1120', '#070C17']}
            style={styles.heroCardGradient}
          >
            <View style={styles.heroTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroSubtitle}>NET CASH BALANCE</Text>
                <Text style={styles.heroMainAmount}>
                  {netMargin >= 0 ? '' : '- '}{formatNpr(netMargin)}
                </Text>
              </View>

              <View
                style={[
                  styles.netStatusPill,
                  {
                    backgroundColor: netMargin >= 0
                      ? 'rgba(16, 185, 129, 0.12)'
                      : 'rgba(244, 63, 94, 0.12)',
                  },
                ]}
              >
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

            {/* Inflow vs Outflow */}
            <View style={styles.heroFlowRow}>
              <Animated.View style={[styles.flowMetric, { opacity: cashInAnim }]}>
                <View style={styles.flowIconIn}>
                  <Ionicons name="arrow-down" size={14} color="#10B981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.flowLabel}>Cash In</Text>
                  <Text style={styles.flowAmountIn}>+ {formatNpr(totalIncome)}</Text>
                </View>
              </Animated.View>

              <View style={styles.flowVerticalDivider} />

              <Animated.View style={[styles.flowMetric, { opacity: cashOutAnim }]}>
                <View style={styles.flowIconOut}>
                  <Ionicons name="arrow-up" size={14} color="#F43F5E" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.flowLabel}>Cash Out</Text>
                  <Text style={styles.flowAmountOut}>- {formatNpr(totalExpenses)}</Text>
                </View>
              </Animated.View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Quick Action Buttons */}
        <View style={styles.quickActionRow}>
          <TouchableOpacity
            style={styles.gotCashButton}
            onPress={() => router.push({ pathname: '/(tabs)/entry', params: { preselectedType: 'INCOME' } })}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="arrow-down-circle" size={18} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Record Income</Text>
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
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="arrow-up-circle" size={18} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Record Expense</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Pending Receivables Card */}
        <TouchableOpacity
          style={styles.receivableQuickCard}
          onPress={() => router.push('/(tabs)/receivables')}
          activeOpacity={0.8}
        >
          <View style={styles.rqLeft}>
            <View style={styles.rqIconWrap}>
              <Ionicons name="time" size={16} color="#F59E0B" />
            </View>
            <View style={{ flexShrink: 1 }}>
              <Text style={styles.rqTitle} numberOfLines={1}>Pending Receivables</Text>
              <Text style={styles.rqSubtitle} numberOfLines={1}>
                Uncollected invoices across clients
              </Text>
            </View>
          </View>
          <View style={styles.rqRight}>
            <Text style={styles.rqAmount}>{formatNpr(agingReceivables)}</Text>
            <Ionicons name="chevron-forward" size={14} color="#64748B" />
          </View>
        </TouchableOpacity>

        {/* Cash Flow Chart */}
        <FinancialChart
          incomeData={chartData.incomeData}
          expenseData={chartData.expenseData}
          title="Cash Flow Overview"
        />

        {/* Daybook Section Header */}
        <View style={styles.ledgerHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <Text style={styles.sectionSubtitle}>
              {displayedTransactions.length} entries for selected period
            </Text>
          </View>

          {/* Filter Pills */}
          <View style={styles.filterPills}>
            {(['ALL', 'INCOME', 'EXPENSE', 'DUE'] as const).map(filter => {
              const active = selectedFilter === filter;
              const label =
                filter === 'ALL'
                  ? 'All'
                  : filter === 'INCOME'
                  ? 'In'
                  : filter === 'EXPENSE'
                  ? 'Out'
                  : 'Due';
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
          <Ionicons name="search" size={15} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by party, category, or bill..."
            placeholderTextColor="#475569"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>

        {/* Transaction List */}
        {displayedTransactions.length > 0 ? (
          displayedTransactions.map(tx => (
            <TransactionRow key={tx.id} transaction={tx} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={36} color="#1E293B" />
            <Text style={styles.emptyTitle}>No Transactions Found</Text>
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
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  overdueIconWrap: {
    width: 30,
    height: 30,
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
    fontSize: 10,
    color: '#F87171',
    marginTop: 1,
  },
  heroCardContainer: {
    marginHorizontal: 16,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(30, 41, 59, 0.7)',
    marginVertical: 6,
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
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1.2,
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
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
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
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flowIconOut: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
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
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
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
    borderRadius: 12,
    overflow: 'hidden',
  },
  gaveCashButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  receivableQuickCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0C1220',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 12,
  },
  rqLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  rqIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
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
    fontSize: 13,
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
    paddingHorizontal: 9,
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
    backgroundColor: '#0C1220',
    borderRadius: 10,
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
