import React from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

import { CONFIG } from '@/constants/Config';
import { Palette } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useLedger } from '@/context/LedgerContext';

export default function ModalScreen() {
  const { user, isAdmin } = useAuth();
  const { totalIncome, totalExpenses, netMargin, agingReceivables } = useLedger();
  const [copied, setCopied] = React.useState(false);

  const copyBankInfo = async () => {
    const text = `Corporate Payment Account - Shrestha Services\nBank: ${CONFIG.PAYMENT_INFO.BANK_NAME}\nAccount: ${CONFIG.PAYMENT_INFO.ACCOUNT_NUMBER}\nAccount Name: ${CONFIG.PAYMENT_INFO.ACCOUNT_NAME}\neSewa / Khalti: ${CONFIG.PAYMENT_INFO.ESEWA_ID}`;
    await Clipboard.setStringAsync(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Top Drag Indicator */}
      <View style={styles.dragHandle} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.appTitle}>Bachat</Text>
            <Text style={styles.companySub}>{CONFIG.COMPANY_NAME} • Executive Core</Text>
          </View>
          <Pressable style={styles.closeBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={20} color="#94A3B8" />
          </Pressable>
        </View>

        {/* Quick Snapshot */}
        <View style={styles.snapshotCard}>
          <Text style={styles.snapshotTitle}>CURRENT PERIOD SNAPSHOT</Text>
          <View style={styles.statGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>NET MARGIN</Text>
              <Text style={[styles.statValue, { color: netMargin >= 0 ? Palette.emerald : Palette.rose }]}>
                NPR {netMargin.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>OUTSTANDING RECEIVABLES</Text>
              <Text style={[styles.statValue, { color: Palette.amber }]}>
                NPR {agingReceivables.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </View>

        {/* Corporate Banking Card */}
        <View style={styles.bankCard}>
          <View style={styles.bankTopRow}>
            <Ionicons name="card" size={20} color={Palette.emerald} />
            <Text style={styles.bankTitle}>Corporate Settlement Coordinates</Text>
          </View>

          <View style={styles.bankInfoItem}>
            <Text style={styles.infoLabel}>Primary Bank</Text>
            <Text style={styles.infoVal}>{CONFIG.PAYMENT_INFO.BANK_NAME}</Text>
          </View>

          <View style={styles.bankInfoItem}>
            <Text style={styles.infoLabel}>Account Name</Text>
            <Text style={styles.infoVal}>{CONFIG.PAYMENT_INFO.ACCOUNT_NAME}</Text>
          </View>

          <View style={styles.bankInfoItem}>
            <Text style={styles.infoLabel}>Account Number</Text>
            <Text style={[styles.infoVal, { color: Palette.emerald, fontWeight: '800' }]}>
              {CONFIG.PAYMENT_INFO.ACCOUNT_NUMBER}
            </Text>
          </View>

          <View style={styles.bankInfoItem}>
            <Text style={styles.infoLabel}>Digital Wallet (eSewa / Khalti)</Text>
            <Text style={styles.infoVal}>{CONFIG.PAYMENT_INFO.ESEWA_ID}</Text>
          </View>

          <Pressable style={styles.copyBtn} onPress={copyBankInfo}>
            <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.copyBtnText}>{copied ? 'Copied to Clipboard' : 'Copy Payment Coordinates'}</Text>
          </Pressable>
        </View>

        {/* Enterprise Security Badge */}
        <View style={styles.securityBox}>
          <Ionicons name="shield-checkmark" size={18} color={Palette.indigo} style={{ marginRight: 8 }} />
          <Text style={styles.securityText}>
            Operating under {user?.role || 'Authenticated'} credentials. All transactions protected with Java 21 BigDecimal precision arithmetic.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080C15',
    paddingTop: 12,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334155',
    alignSelf: 'center',
    marginBottom: 12,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  companySub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  snapshotCard: {
    backgroundColor: '#111726',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  snapshotTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  statGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
  },
  bankCard: {
    backgroundColor: '#111726',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  bankTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  bankTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  bankInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  infoVal: {
    fontSize: 12,
    color: '#F8FAFC',
    fontWeight: '600',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.indigo,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 14,
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
  },
  securityText: {
    flex: 1,
    fontSize: 11,
    color: '#A5B4FC',
    lineHeight: 16,
  },
});
