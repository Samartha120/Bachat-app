import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { HeaderBranding } from '@/components/HeaderBranding';
import { useLedger } from '@/context/LedgerContext';
import { useAuth } from '@/context/AuthContext';
import { Palette } from '@/constants/Colors';
import { CustomerModel } from '@/services/mockData';

export default function CustomersScreen() {
  const { customers, addCustomer, toggleCustomerActive } = useLedger();
  const { isAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // New Client Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [panVat, setPanVat] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCustomers = customers.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.corporateEmail && c.corporateEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.phoneNumber.includes(searchQuery) ||
      (c.panVatNumber && c.panVatNumber.includes(searchQuery));

    const matchesActive = showActiveOnly ? c.active : true;
    return matchesSearch && matchesActive;
  });

  const handleCreateCustomer = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Corporate/Client name is required.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Validation Error', 'Primary phone contact is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addCustomer({
        name: name.trim(),
        corporateEmail: email.trim(),
        phoneNumber: phone.trim(),
        address: address.trim(),
        panVatNumber: panVat.trim(),
        active: true,
      });

      Alert.alert('Client Enrolled', `${name} has been enrolled in the corporate directory.`);
      setName('');
      setEmail('');
      setPhone('');
      setAddress('');
      setPanVat('');
      setModalVisible(false);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create customer profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = (c: CustomerModel) => {
    if (!isAdmin) {
      Alert.alert(
        'RBAC Privilege Denied',
        'Only Office Admins can change client status. Staff users have view/entry privileges only.'
      );
      return;
    }

    Alert.alert(
      c.active ? 'Deactivate Client' : 'Activate Client',
      `Are you sure you want to ${c.active ? 'deactivate' : 'activate'} ${c.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: c.active ? 'Deactivate' : 'Activate',
          style: c.active ? 'destructive' : 'default',
          onPress: () => toggleCustomerActive(c.id),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <HeaderBranding subtitle="Corporate Client & Vendor Directory" />

        {/* Directory Stats Banner */}
        <View style={styles.statsCard}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>ACTIVE CLIENTS</Text>
            <Text style={styles.statValue}>
              {customers.filter(c => c.active).length}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>OUTSTANDING RECEIVABLES</Text>
            <Text style={[styles.statValue, { color: Palette.amber }]}>
              {customers.filter(c => c.outstandingBalance > 0).length} Profiles
            </Text>
          </View>
        </View>

        {/* Search & Action Bar */}
        <View style={styles.actionBar}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={16} color="#64748B" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search clients, PAN/VAT, phone..."
              placeholderTextColor="#64748B"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <Pressable
            style={styles.addClientBtn}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="person-add" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.addClientBtnText}>Add Client</Text>
          </Pressable>
        </View>

        {/* Active Toggle */}
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Show only active corporate accounts</Text>
          <Pressable
            style={[styles.switchTrack, showActiveOnly && styles.switchTrackActive]}
            onPress={() => setShowActiveOnly(!showActiveOnly)}
          >
            <View style={[styles.switchThumb, showActiveOnly && styles.switchThumbActive]} />
          </Pressable>
        </View>

        {/* Customer Cards List */}
        <View style={styles.listContainer}>
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map(c => {
              const hasDebt = c.outstandingBalance > 0;
              return (
                <View
                  key={c.id}
                  style={[
                    styles.customerCard,
                    !c.active && styles.customerCardInactive,
                  ]}
                >
                  <View style={styles.customerTop}>
                    <View style={styles.customerAvatar}>
                      <Ionicons
                        name="business"
                        size={18}
                        color={c.active ? Palette.indigo : '#64748B'}
                      />
                    </View>

                    <View style={{ flex: 1, marginRight: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.customerName} numberOfLines={1}>
                          {c.name}
                        </Text>
                        {!c.active && (
                          <View style={styles.inactiveBadge}>
                            <Text style={styles.inactiveBadgeText}>DEACTIVATED</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.customerSub}>
                        {c.panVatNumber ? `PAN: ${c.panVatNumber}` : 'PAN/VAT: Unregistered'} • {c.transactionCount} transactions
                      </Text>
                    </View>

                    <Pressable
                      style={styles.moreBtn}
                      onPress={() => handleToggleActive(c)}
                    >
                      <Ionicons
                        name={c.active ? 'radio-button-on' : 'radio-button-off'}
                        size={18}
                        color={c.active ? Palette.emerald : '#64748B'}
                      />
                    </Pressable>
                  </View>

                  {/* Contact Row */}
                  <View style={styles.contactRow}>
                    <View style={styles.contactItem}>
                      <Ionicons name="call-outline" size={13} color="#64748B" />
                      <Text style={styles.contactText}>{c.phoneNumber}</Text>
                    </View>
                    {c.corporateEmail && (
                      <View style={styles.contactItem}>
                        <Ionicons name="mail-outline" size={13} color="#64748B" />
                        <Text style={styles.contactText} numberOfLines={1}>
                          {c.corporateEmail}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Outstanding Ledger Footnote */}
                  <View style={styles.balanceRow}>
                    <Text style={styles.balanceLabel}>OUTSTANDING LEDGER BALANCE:</Text>
                    <Text
                      style={[
                        styles.balanceValue,
                        hasDebt ? { color: Palette.amber } : { color: Palette.emerald },
                      ]}
                    >
                      {c.formattedOutstandingBalance}
                    </Text>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={38} color="#334155" />
              <Text style={styles.emptyTitle}>No Matching Clients</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search query or add a new client to the directory.
              </Text>
            </View>
          )}
        </View>

        {/* Modal: Add Client */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Enroll New Corporate Client</Text>
                  <Text style={styles.modalSubtitle}>Shrestha Services Directory</Text>
                </View>
                <Pressable onPress={() => setModalVisible(false)}>
                  <Ionicons name="close-circle" size={24} color="#94A3B8" />
                </Pressable>
              </View>

              <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
                <View style={styles.modalField}>
                  <Text style={styles.fieldLabel}>COMPANY / CLIENT NAME *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. Kathmandu Engineering Consult"
                    placeholderTextColor="#64748B"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <View style={styles.modalField}>
                  <Text style={styles.fieldLabel}>PRIMARY CONTACT PHONE *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="+977-98XXXXXXXX"
                    placeholderTextColor="#64748B"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>

                <View style={styles.modalField}>
                  <Text style={styles.fieldLabel}>CORPORATE BILLING EMAIL</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="billing@company.com.np"
                    placeholderTextColor="#64748B"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <View style={styles.modalField}>
                  <Text style={styles.fieldLabel}>PAN / VAT NUMBER</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="9-digit tax ID"
                    placeholderTextColor="#64748B"
                    keyboardType="number-pad"
                    value={panVat}
                    onChangeText={setPanVat}
                  />
                </View>

                <View style={styles.modalField}>
                  <Text style={styles.fieldLabel}>OFFICE / BILLING ADDRESS</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. Pulchowk, Lalitpur"
                    placeholderTextColor="#64748B"
                    value={address}
                    onChangeText={setAddress}
                  />
                </View>
              </ScrollView>

              <Pressable
                style={[styles.saveModalBtn, isSubmitting && { opacity: 0.6 }]}
                onPress={handleCreateCustomer}
                disabled={isSubmitting}
              >
                <Text style={styles.saveModalBtnText}>
                  {isSubmitting ? 'Saving Profile...' : 'Save & Link to Ledger'}
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
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
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#111726',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  statBox: {
    flex: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#1E293B',
    marginHorizontal: 12,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 4,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111726',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 13,
    padding: 0,
  },
  addClientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.indigo,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addClientBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 6,
  },
  toggleLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  switchTrack: {
    width: 38,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1E293B',
    padding: 2,
    justifyContent: 'center',
  },
  switchTrackActive: {
    backgroundColor: Palette.emeraldDark,
  },
  switchThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#94A3B8',
  },
  switchThumbActive: {
    backgroundColor: '#FFFFFF',
    transform: [{ translateX: 16 }],
  },
  listContainer: {
    paddingHorizontal: 16,
    marginTop: 4,
  },
  customerCard: {
    backgroundColor: Palette.cardDark,
    borderRadius: 14,
    padding: 14,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: Palette.borderDark,
  },
  customerCardInactive: {
    opacity: 0.65,
    borderColor: '#334155',
  },
  customerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  customerName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  inactiveBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  inactiveBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FCA5A5',
  },
  customerSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  moreBtn: {
    padding: 4,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
  },
  balanceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  balanceValue: {
    fontSize: 13,
    fontWeight: '800',
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  modalField: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#111726',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
    color: '#F8FAFC',
    fontSize: 13,
  },
  saveModalBtn: {
    backgroundColor: Palette.emeraldDark,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  saveModalBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
