import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';

import { HeaderBranding } from '@/components/HeaderBranding';
import { useAuth, UserRole } from '@/context/AuthContext';
import { useLedger } from '@/context/LedgerContext';
import { CONFIG } from '@/constants/Config';
import { Palette } from '@/constants/Colors';

export default function SecuritySettingsScreen() {
  const { user, isAdmin, switchRole, lockApp, logout, savedPin, setCustomPin } = useAuth();
  const { auditLogs } = useLedger();

  const [copiedAccount, setCopiedAccount] = useState(false);
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const handleRoleSwitch = async (role: UserRole) => {
    await switchRole(role);
    Alert.alert(
      'Session Context Switched',
      `Active context switched to ${role === 'ROLE_OFFICE_ADMIN' ? 'Executive Handler (Admin)' : 'Staff Operator'}. Permissions are updated dynamically.`
    );
  };

  const handleChangePin = async () => {
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      Alert.alert('Invalid PIN', 'Security PIN must be exactly 4 numeric digits.');
      return;
    }
    if (newPin !== confirmPin) {
      Alert.alert('PIN Mismatch', 'The confirmation PIN does not match.');
      return;
    }

    const success = await setCustomPin(newPin);
    if (success) {
      Alert.alert('Security PIN Updated', 'Your new 4-digit office vault PIN is active.');
      setNewPin('');
      setConfirmPin('');
      setPinModalVisible(false);
    }
  };

  const copyBankDetails = async () => {
    const text =
      `Bank: ${CONFIG.PAYMENT_INFO.BANK_NAME}\n` +
      `Account Name: ${CONFIG.PAYMENT_INFO.ACCOUNT_NAME}\n` +
      `Account Number: ${CONFIG.PAYMENT_INFO.ACCOUNT_NUMBER}\n` +
      `Branch: ${CONFIG.PAYMENT_INFO.BRANCH}\n` +
      `eSewa / Khalti: ${CONFIG.PAYMENT_INFO.ESEWA_ID}`;
    await Clipboard.setStringAsync(text);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2500);
  };

  const handleLogout = () => {
    Alert.alert(
      'Lock & Sign Out',
      'Are you sure you want to lock the vault and sign out of Bachat?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Lock Vault',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <HeaderBranding subtitle="Vault Security & Handler Access" />

        {/* VAULT SECURITY LOCK CARD */}
        <View style={styles.vaultSecurityCard}>
          <LinearGradient
            colors={['#10B981', '#047857']}
            style={styles.vaultIconBox}
          >
            <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
          </LinearGradient>

          <View style={styles.vaultTextWrap}>
            <Text style={styles.vaultTitle}>Office Security Vault</Text>
            <Text style={styles.vaultSubtitle}>
              Hardware Keychain PIN: •••• ({savedPin})
            </Text>
          </View>

          <TouchableOpacity
            style={styles.instantLockBtn}
            onPress={lockApp}
            activeOpacity={0.8}
          >
            <Ionicons name="lock-closed" size={14} color="#FFFFFF" />
            <Text style={styles.instantLockText}>Lock Now</Text>
          </TouchableOpacity>
        </View>

        {/* PIN Management Action Row */}
        <View style={styles.pinManageRow}>
          <TouchableOpacity
            style={styles.pinActionBtn}
            onPress={() => setPinModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="key-outline" size={16} color="#10B981" />
            <Text style={styles.pinActionText}>Change 4-Digit Security PIN</Text>
            <Ionicons name="chevron-forward" size={14} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* ACTIVE HANDLER PROFILE */}
        <View style={styles.userCard}>
          <View style={styles.userAvatar}>
            <Ionicons
              name={isAdmin ? 'shield-checkmark' : 'person'}
              size={22}
              color={isAdmin ? '#10B981' : '#F59E0B'}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{user?.fullName || 'Active Handler'}</Text>
            <Text style={styles.userEmail}>{user?.username}</Text>
            <View style={styles.rolePillWrap}>
              <View
                style={[
                  styles.rolePill,
                  { backgroundColor: isAdmin ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)' },
                ]}
              >
                <Text
                  style={[
                    styles.rolePillText,
                    { color: isAdmin ? '#10B981' : '#F59E0B' },
                  ]}
                >
                  {isAdmin ? 'EXECUTIVE HANDLER (FULL CONTROL)' : 'STAFF OPERATOR (ENTRY ONLY)'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* RBAC ROLE CONTEXT SWITCHER */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>ROLE-BASED ACCESS CONTROL (RBAC)</Text>
          <Text style={styles.sectionDesc}>
            Verify permission separation. Office Handler has full delete, audit, and client toggle rights; Staff has entry and read access only.
          </Text>

          <View style={styles.roleButtonRow}>
            <TouchableOpacity
              style={[
                styles.roleBtn,
                isAdmin && styles.roleBtnActiveAdmin,
              ]}
              onPress={() => handleRoleSwitch('ROLE_OFFICE_ADMIN')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="shield"
                size={16}
                color={isAdmin ? '#FFFFFF' : '#64748B'}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.roleBtnText, isAdmin && styles.roleBtnTextActive]}>
                Executive Handler
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleBtn,
                !isAdmin && styles.roleBtnActiveStaff,
              ]}
              onPress={() => handleRoleSwitch('ROLE_STAFF_USER')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="person"
                size={16}
                color={!isAdmin ? '#FFFFFF' : '#64748B'}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.roleBtnText, !isAdmin && styles.roleBtnTextActive]}>
                Staff Operator
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* CORPORATE PAYMENT COORDINATES */}
        <View style={styles.sectionCard}>
          <View style={styles.coordHeader}>
            <View>
              <Text style={styles.sectionHeaderTitle}>SHRESTHA SERVICES BANK DETAILS</Text>
              <Text style={styles.sectionDesc}>
                Attached automatically to client payment notices & receipts.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.copyBtn}
              onPress={copyBankDetails}
              activeOpacity={0.7}
            >
              <Ionicons
                name={copiedAccount ? 'checkmark' : 'copy-outline'}
                size={15}
                color={copiedAccount ? '#10B981' : '#94A3B8'}
              />
              <Text style={[styles.copyBtnText, copiedAccount && { color: '#10B981' }]}>
                {copiedAccount ? 'Copied' : 'Copy'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bankDetailTable}>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Bank Name:</Text>
              <Text style={styles.bankValue}>{CONFIG.PAYMENT_INFO.BANK_NAME}</Text>
            </View>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Account Name:</Text>
              <Text style={styles.bankValue}>{CONFIG.PAYMENT_INFO.ACCOUNT_NAME}</Text>
            </View>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Account Number:</Text>
              <Text style={[styles.bankValue, { color: '#10B981', fontWeight: '800' }]}>
                {CONFIG.PAYMENT_INFO.ACCOUNT_NUMBER}
              </Text>
            </View>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Branch:</Text>
              <Text style={styles.bankValue}>{CONFIG.PAYMENT_INFO.BRANCH}</Text>
            </View>
            <View style={[styles.bankRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.bankLabel}>eSewa / Khalti ID:</Text>
              <Text style={[styles.bankValue, { color: '#818CF8', fontWeight: '800' }]}>
                {CONFIG.PAYMENT_INFO.ESEWA_ID}
              </Text>
            </View>
          </View>
        </View>

        {/* AUDIT LOG TRAIL */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>SLF4J SECURITY AUDIT TRAIL</Text>
          <Text style={styles.sectionDesc}>
            Chronological log of administrative actions, logins, and financial events.
          </Text>

          <View style={styles.auditLogContainer}>
            {auditLogs.slice(0, 5).map(log => (
              <View key={log.id} style={styles.auditLogRow}>
                <View style={styles.auditDot} />
                <View style={styles.auditContent}>
                  <View style={styles.auditMetaRow}>
                    <Text style={styles.auditAction}>{log.action}</Text>
                    <Text style={styles.auditTime}>{log.timestamp ? log.timestamp.replace('T', ' ').slice(0, 16) : ''}</Text>
                  </View>
                  <Text style={styles.auditUser}>Handler: {log.username} ({log.ipAddress})</Text>
                  <Text style={styles.auditDetails}>{log.details}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* LOCK & LOGOUT BUTTON */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="lock-closed-outline" size={18} color="#EF4444" style={{ marginRight: 8 }} />
          <Text style={styles.logoutBtnText}>Lock Vault & Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Change PIN Modal */}
      <Modal
        visible={pinModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPinModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pinModalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Security PIN</Text>
              <TouchableOpacity onPress={() => setPinModalVisible(false)}>
                <Ionicons name="close" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Enter a new 4-digit PIN for quick office entry.
            </Text>

            <View style={styles.pinInputWrap}>
              <Text style={styles.pinInputLabel}>NEW 4-DIGIT PIN</Text>
              <TextInput
                style={styles.pinTextInput}
                placeholder="••••"
                placeholderTextColor="#475569"
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                value={newPin}
                onChangeText={setNewPin}
              />
            </View>

            <View style={styles.pinInputWrap}>
              <Text style={styles.pinInputLabel}>CONFIRM PIN</Text>
              <TextInput
                style={styles.pinTextInput}
                placeholder="••••"
                placeholderTextColor="#475569"
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                value={confirmPin}
                onChangeText={setConfirmPin}
              />
            </View>

            <TouchableOpacity
              style={styles.savePinBtn}
              onPress={handleChangePin}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.savePinGrad}
              >
                <Text style={styles.savePinText}>Save Security PIN</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  vaultSecurityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1322',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 14,
  },
  vaultIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vaultTextWrap: {
    flex: 1,
  },
  vaultTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  vaultSubtitle: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 2,
  },
  instantLockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 5,
  },
  instantLockText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F87171',
  },
  pinManageRow: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  pinActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1322',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
  },
  pinActionText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1322',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#141D2F',
    borderWidth: 1,
    borderColor: '#24324D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  userEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  rolePillWrap: {
    marginTop: 6,
  },
  rolePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  rolePillText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionCard: {
    backgroundColor: '#0D1322',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  sectionHeaderTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  sectionDesc: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    marginBottom: 10,
    lineHeight: 16,
  },
  roleButtonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingVertical: 10,
    borderRadius: 10,
  },
  roleBtnActiveAdmin: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  roleBtnActiveStaff: {
    backgroundColor: '#F59E0B',
    borderColor: '#D97706',
  },
  roleBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  roleBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  coordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141D2F',
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  copyBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  bankDetailTable: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 12,
    marginTop: 8,
  },
  bankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  bankLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  bankValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  auditLogContainer: {
    marginTop: 6,
    gap: 10,
  },
  auditLogRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  auditDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginTop: 6,
    marginRight: 10,
  },
  auditContent: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  auditMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  auditAction: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  auditTime: {
    fontSize: 10,
    color: '#64748B',
  },
  auditUser: {
    fontSize: 10,
    color: '#10B981',
    marginTop: 2,
    fontWeight: '600',
  },
  auditDetails: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 13,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pinModalBox: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#0C121E',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  modalSub: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 16,
  },
  pinInputWrap: {
    marginBottom: 12,
  },
  pinInputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 6,
  },
  pinTextInput: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
    color: '#F8FAFC',
    fontSize: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    textAlign: 'center',
    letterSpacing: 8,
  },
  savePinBtn: {
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  savePinGrad: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  savePinText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
