import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

import { HeaderBranding } from '@/components/HeaderBranding';
import { useAuth, UserRole } from '@/context/AuthContext';
import { useLedger } from '@/context/LedgerContext';
import { CONFIG } from '@/constants/Config';
import { Palette } from '@/constants/Colors';

export default function SecuritySettingsScreen() {
  const { user, isAdmin, switchRole } = useAuth();
  const { auditLogs } = useLedger();

  const [copiedAccount, setCopiedAccount] = useState(false);

  const handleRoleSwitch = async (role: UserRole) => {
    await switchRole(role);
    Alert.alert(
      'RBAC Role Updated',
      `Session context switched to ${role === 'ROLE_OFFICE_ADMIN' ? 'Office Admin' : 'Staff User'}. Permissions are now dynamically applied across all tabs.`
    );
  };

  const copyBankDetails = async () => {
    const text = `Bank: ${CONFIG.PAYMENT_INFO.BANK_NAME}\nAccount Name: ${CONFIG.PAYMENT_INFO.ACCOUNT_NAME}\nAccount Number: ${CONFIG.PAYMENT_INFO.ACCOUNT_NUMBER}\nBranch: ${CONFIG.PAYMENT_INFO.BRANCH}\neSewa / Khalti: ${CONFIG.PAYMENT_INFO.ESEWA_ID}`;
    await Clipboard.setStringAsync(text);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2500);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <HeaderBranding subtitle="Enterprise RBAC & Security Controls" />

        {/* ACTIVE USER SESSION CARD */}
        <View style={styles.userCard}>
          <View style={styles.userAvatar}>
            <Ionicons
              name={isAdmin ? 'shield-checkmark' : 'person'}
              size={24}
              color={isAdmin ? Palette.indigo : Palette.amber}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{user?.fullName || 'Active User'}</Text>
            <Text style={styles.userEmail}>{user?.username}</Text>
            <View style={styles.rolePillWrap}>
              <View
                style={[
                  styles.rolePill,
                  { backgroundColor: isAdmin ? Palette.indigoMuted : Palette.amberMuted },
                ]}
              >
                <Text
                  style={[
                    styles.rolePillText,
                    { color: isAdmin ? Palette.indigo : Palette.amber },
                  ]}
                >
                  {isAdmin ? 'ROLE_OFFICE_ADMIN (FULL ACCESS)' : 'ROLE_STAFF_USER (RESTRICTED)'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* RBAC ROLE SWITCHER FOR DEMONSTRATION */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>ROLE-BASED ACCESS CONTROL (RBAC) TESTER</Text>
          <Text style={styles.sectionDesc}>
            Toggle between roles to verify permission checks (Office Admin has full delete & audit privileges; Staff User has data-entry and view privileges).
          </Text>

          <View style={styles.roleButtonRow}>
            <Pressable
              style={[
                styles.roleBtn,
                isAdmin && styles.roleBtnActiveAdmin,
              ]}
              onPress={() => handleRoleSwitch('ROLE_OFFICE_ADMIN')}
            >
              <Ionicons
                name="shield"
                size={16}
                color={isAdmin ? '#FFFFFF' : '#64748B'}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.roleBtnText, isAdmin && styles.roleBtnTextActive]}>
                Office Admin
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.roleBtn,
                !isAdmin && styles.roleBtnActiveStaff,
              ]}
              onPress={() => handleRoleSwitch('ROLE_STAFF_USER')}
            >
              <Ionicons
                name="briefcase"
                size={16}
                color={!isAdmin ? '#FFFFFF' : '#64748B'}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.roleBtnText, !isAdmin && styles.roleBtnTextActive]}>
                Staff User
              </Text>
            </Pressable>
          </View>
        </View>

        {/* TOKEN & SECURITY STATUS */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>ENCRYPTED SESSION CREDENTIALS</Text>
          <View style={styles.securityItem}>
            <Ionicons name="key" size={16} color={Palette.emerald} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.securityTitle}>Secure Storage Container</Text>
              <Text style={styles.securityValue}>Hardware Keychain via expo-secure-store</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>ENCRYPTED</Text>
            </View>
          </View>

          <View style={styles.securityItem}>
            <Ionicons name="finger-print" size={16} color={Palette.indigo} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.securityTitle}>JWT Signature</Text>
              <Text style={styles.securityValue}>HMAC-SHA256 (Stateless 24h Exp.)</Text>
            </View>
          </View>
        </View>

        {/* CORPORATE SETTLEMENT DETAILS */}
        <View style={styles.sectionCard}>
          <View style={styles.bankHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>SHRESTHA SERVICES CORPORATE BANKING</Text>
            <Pressable onPress={copyBankDetails}>
              <Text style={styles.copyLinkText}>
                {copiedAccount ? 'Copied!' : 'Copy Info'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.bankDetailsBox}>
            <View style={styles.bankRow}>
              <Text style={styles.bankKey}>Bank Name:</Text>
              <Text style={styles.bankVal}>{CONFIG.PAYMENT_INFO.BANK_NAME}</Text>
            </View>
            <View style={styles.bankRow}>
              <Text style={styles.bankKey}>Account Name:</Text>
              <Text style={styles.bankVal}>{CONFIG.PAYMENT_INFO.ACCOUNT_NAME}</Text>
            </View>
            <View style={styles.bankRow}>
              <Text style={styles.bankKey}>Account No:</Text>
              <Text style={[styles.bankVal, { color: Palette.emerald, fontWeight: '800' }]}>
                {CONFIG.PAYMENT_INFO.ACCOUNT_NUMBER}
              </Text>
            </View>
            <View style={styles.bankRow}>
              <Text style={styles.bankKey}>eSewa / Khalti:</Text>
              <Text style={styles.bankVal}>{CONFIG.PAYMENT_INFO.ESEWA_ID}</Text>
            </View>
          </View>
        </View>

        {/* AUDIT LOG TRAIL */}
        <View style={styles.sectionCard}>
          <View style={styles.bankHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>ENTERPRISE AUDIT TRAIL</Text>
            <View style={styles.logCountBadge}>
              <Text style={styles.logCountText}>{auditLogs.length} Events</Text>
            </View>
          </View>
          <Text style={styles.sectionDesc}>
            Logback/SLF4J compliant compliance log. Captures timestamps, operators, target IDs and client IPs.
          </Text>

          {auditLogs.slice(0, 10).map(log => (
            <View key={log.id} style={styles.auditLogItem}>
              <View style={styles.auditTopRow}>
                <View style={styles.auditActionTag}>
                  <Text style={styles.auditActionText}>{log.action}</Text>
                </View>
                <Text style={styles.auditTime}>
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <Text style={styles.auditDetails}>{log.details}</Text>
              <View style={styles.auditMetaRow}>
                <Text style={styles.auditMetaText}>User: {log.username}</Text>
                <Text style={styles.auditMetaDot}>•</Text>
                <Text style={styles.auditMetaText}>IP: {log.ipAddress}</Text>
              </View>
            </View>
          ))}
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111726',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  rolePillWrap: {
    marginTop: 6,
  },
  rolePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  rolePillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionCard: {
    backgroundColor: Palette.cardDark,
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: Palette.borderDark,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  sectionDesc: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    marginBottom: 12,
    lineHeight: 16,
  },
  roleButtonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  roleBtnActiveAdmin: {
    backgroundColor: Palette.indigo,
    borderColor: '#818CF8',
  },
  roleBtnActiveStaff: {
    backgroundColor: Palette.amber,
    borderColor: '#FCD34D',
  },
  roleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  roleBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  securityTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  securityValue: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  verifiedBadge: {
    backgroundColor: Palette.emeraldMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: '800',
    color: Palette.emerald,
  },
  bankHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  copyLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.indigo,
  },
  bankDetailsBox: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 6,
  },
  bankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bankKey: {
    fontSize: 12,
    color: '#64748B',
  },
  bankVal: {
    fontSize: 12,
    color: '#F8FAFC',
    fontWeight: '600',
  },
  logCountBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  logCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  auditLogItem: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 12,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  auditTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  auditActionTag: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  auditActionText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#A5B4FC',
  },
  auditTime: {
    fontSize: 11,
    color: '#64748B',
  },
  auditDetails: {
    fontSize: 12,
    color: '#F8FAFC',
    marginVertical: 2,
  },
  auditMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  auditMetaText: {
    fontSize: 10,
    color: '#64748B',
  },
  auditMetaDot: {
    marginHorizontal: 6,
    color: '#475569',
  },
});
