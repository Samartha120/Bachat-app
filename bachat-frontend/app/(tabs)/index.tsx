import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  TextInput,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { HeaderBranding } from '@/components/HeaderBranding';
import { TimeBucketFilter } from '@/components/TimeBucketFilter';
import { MetricCard } from '@/components/MetricCard';
import { FinancialChart } from '@/components/FinancialChart';
import { TransactionRow } from '@/components/TransactionRow';
import { useLedger } from '@/context/LedgerContext';
import { Palette } from '@/constants/Colors';

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
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  const displayedTransactions = filteredTransactions.filter(t => {
    const matchesSearch =
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.customerName && t.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType =
      selectedFilter === 'ALL' ? true : t.type === selectedFilter;

    return matchesSearch && matchesType;
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
        {/* Corporate Header */}
        <HeaderBranding subtitle="Real-Time Ledger & Aggregation Engine" />

        {/* Time-Bucket Filter Segment */}
        <TimeBucketFilter selected={timeBucket} onSelect={setTimeBucket} />

        {/* Overdue Alert Banner (Surfaces if unpaid past due) */}
        {overdueTransactions.length > 0 && (
          <Pressable
            style={styles.overdueBanner}
            onPress={() => router.push('/(tabs)/receivables')}
          >
            <View style={styles.overdueIconWrap}>
              <Ionicons name="alert-circle" size={18} color="#FFFFFF" />
            </View>
            <View style={styles.overdueTextWrap}>
              <Text style={styles.overdueTitle}>
                {overdueTransactions.length} Overdue Receivables Alert
              </Text>
              <Text style={styles.overdueSubtitle}>
                Outstanding payments past due date require client notice. Tap to review.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#EF4444" />
          </Pressable>
        )}

        {/* Key Metrics 2x2 Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricsRow}>
            <MetricCard
              title="Total Inflow"
              amount={totalIncome}
              type="income"
              icon="arrow-down-circle"
            />
            <MetricCard
              title="Total Outflow"
              amount={totalExpenses}
              type="expense"
              icon="arrow-up-circle"
            />
          </View>
          <View style={styles.metricsRow}>
            <MetricCard
              title="Net Margin"
              amount={netMargin}
              type="margin"
              icon="stats-chart"
            />
            <MetricCard
              title="Aging Receivables"
              amount={agingReceivables}
              type="receivables"
              subtitle="Pending collection"
              icon="time"
            />
          </View>
        </View>

        {/* Interactive Cash Flow Chart */}
        <FinancialChart
          incomeData={chartData.incomeData}
          expenseData={chartData.expenseData}
          title="Cash Flow Velocity"
        />

        {/* Recent Ledger Entries Header */}
        <View style={styles.ledgerHeader}>
          <View>
            <Text style={styles.sectionTitle}>Transactional Ledger</Text>
            <Text style={styles.sectionSubtitle}>
              Showing {displayedTransactions.length} of {filteredTransactions.length} entries
            </Text>
          </View>

          {/* Quick Filter Pills */}
          <View style={styles.filterPills}>
            <Pressable
              style={[styles.miniPill, selectedFilter === 'ALL' && styles.miniPillActive]}
              onPress={() => setSelectedFilter('ALL')}
            >
              <Text style={[styles.miniPillText, selectedFilter === 'ALL' && styles.miniPillTextActive]}>
                All
              </Text>
            </Pressable>
            <Pressable
              style={[styles.miniPill, selectedFilter === 'INCOME' && styles.miniPillActive]}
              onPress={() => setSelectedFilter('INCOME')}
            >
              <Text style={[styles.miniPillText, selectedFilter === 'INCOME' && styles.miniPillTextActive]}>
                Inflow
              </Text>
            </Pressable>
            <Pressable
              style={[styles.miniPill, selectedFilter === 'EXPENSE' && styles.miniPillActive]}
              onPress={() => setSelectedFilter('EXPENSE')}
            >
              <Text style={[styles.miniPillText, selectedFilter === 'EXPENSE' && styles.miniPillTextActive]}>
                Outflow
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={16} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search category, client, or memo..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#64748B" />
            </Pressable>
          )}
        </View>

        {/* Transaction Rows */}
        {displayedTransactions.length > 0 ? (
          displayedTransactions.map(tx => (
            <TransactionRow key={tx.id} transaction={tx} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={36} color="#334155" />
            <Text style={styles.emptyTitle}>No Transactions Found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search criteria or switch to another time bucket.
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
    backgroundColor: '#080C15',
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
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
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
    fontSize: 13,
    fontWeight: '700',
    color: '#FCA5A5',
  },
  overdueSubtitle: {
    fontSize: 11,
    color: '#F87171',
    marginTop: 1,
  },
  metricsGrid: {
    paddingHorizontal: 16,
    gap: 10,
    marginVertical: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
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
    backgroundColor: '#111726',
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
    fontSize: 15,
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
