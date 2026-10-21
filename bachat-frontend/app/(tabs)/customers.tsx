import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { HeaderBranding } from '@/components/HeaderBranding';
import { useLedger } from '@/context/LedgerContext';
import { useAuth } from '@/context/AuthContext';
import { Palette } from '@/constants/Colors';
import { CustomerModel } from '@/services/mockData';
import { CONFIG } from '@/constants/Config';
import { PartyKhataModal } from '@/components/PartyKhataModal';

export default function CustomersScreen() {
  const { customers, addCustomer, toggleCustomerActive } = useLedger();
  const { isAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'DUE' | 'SETTLED'>('ALL');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerModel | null>(null);

  // New Client Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [panVat, setPanVat] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalReceivables = customers.reduce(
    (acc, c) => acc + (c.outstandingBalance || 0),
    0
  );

  const filteredCustomers = customers.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.corporateEmail && c.corporateEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.phoneNumber.includes(searchQuery) ||
      (c.panVatNumber && c.panVatNumber.includes(searchQuery));

    if (!matchesSearch) return false;

    if (filterType === 'DUE') return (c.outstandingBalance || 0) > 0;
    if (filterType === 'SETTLED') return (c.outstandingBalance || 0) === 0;
    return true;
  });

  const handleSendReminder = async (c: CustomerModel) => {
    try {
      const balance = c.outstandingBalance || 0;
      const message =
        `🙏 *NAMASTE, ${c.name.toUpperCase()}*\n\n` +
        `This is a gentle reminder from *Shrestha Services* regarding outstanding invoice dues of *${CONFIG.CURRENCY_SYMBOL} ${balance.toLocaleString('en-IN')}*.\n\n` +
        `*Corporate Payment Details:*\n` +
        `• Bank: ${CONFIG.PAYMENT_INFO.BANK_NAME}\n` +
        `• Account No: ${CONFIG.PAYMENT_INFO.ACCOUNT_NUMBER}\n` +
        `• Account Name: ${CONFIG.PAYMENT_INFO.ACCOUNT_NAME}\n` +
        `• eSewa / Khalti: ${CONFIG.PAYMENT_INFO.ESEWA_ID}\n\n` +
        `Kindly initiate settlement or contact accounts at ${CONFIG.PAYMENT_INFO.OFFICE_CONTACT}.\n\n` +
        `Thank you for your business!`;

      await Share.share({
        message,
        title: `Payment Reminder - ${c.name}`,
      });
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

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

      Alert.alert('Party Added', `${name} has been enrolled in the Khata directory.`);
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <HeaderBranding subtitle="पार्टी हिसाब-किताब (Khata Parties)" />

        {/* Karobar Party Balance Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryIconWrapGet}>
              <Ionicons name="arrow-down-circle" size={18} color="#10B981" />
            </View>
            <View>
              <Text style={styles.summaryLabel}>लिनुपर्ने बाँकी (You'll Get)</Text>
              <Text style={styles.summaryAmountGet}>
                {CONFIG.CURRENCY_SYMBOL} {totalReceivables.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryBox}>
            <View style={styles.summaryIconWrapGive}>
              <Ionicons name="arrow-up-circle" size={18} color="#94A3B8" />
            </View>
            <View>
              <Text style={styles.summaryLabel}>तिर्नुपर्ने (You'll Give)</Text>
              <Text style={styles.summaryAmountGive}>
                {CONFIG.CURRENCY_SYMBOL} 0
              </Text>
            </View>
          </View>
        </View>

        {/* Search & Enrol Bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={16} color="#64748B" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by party, PAN/VAT, phone..."
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

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.addBtnGradient}
            >
              <Ionicons name="person-add" size={16} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <View style={styles.filterPillsRow}>
          {(['ALL', 'DUE', 'SETTLED'] as const).map(f => {
            const active = filterType === f;
            const label =
              f === 'ALL'
                ? `All Parties (${customers.length})`
                : f === 'DUE'
                ? `लिनुपर्ने बाँकी (${customers.filter(c => (c.outstandingBalance || 0) > 0).length})`
                : `हिसाब चुक्ता (${customers.filter(c => (c.outstandingBalance || 0) === 0).length})`;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.filterPill, active && styles.filterPillActive]}
                onPress={() => setFilterType(f)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    active && styles.filterPillTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Party Cards List */}
        <View style={styles.customerList}>
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map(customer => {
              const balance = customer.outstandingBalance || 0;
              const hasDebt = balance > 0;

              return (
                <TouchableOpacity
                  key={customer.id}
                  style={styles.customerCard}
                  onPress={() => setSelectedCustomer(customer)}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardHeader}>
                    {/* Avatar Initials */}
                    <View
                      style={[
                        styles.avatarBox,
                        { borderColor: hasDebt ? '#F43F5E' : '#10B981' },
                      ]}
                    >
                      <Text style={styles.avatarText}>
                        {customer.name.slice(0, 2).toUpperCase()}
                      </Text>
                    </View>

                    {/* Customer Info */}
                    <View style={styles.infoCol}>
                      <View style={styles.nameRow}>
                        <Text style={styles.customerName} numberOfLines={1}>
                          {customer.name}
                        </Text>
                        {!customer.active && (
                          <View style={styles.inactiveBadge}>
                            <Text style={styles.inactiveText}>Inactive</Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.contactRow}>
                        <Ionicons name="call-outline" size={12} color="#64748B" />
                        <Text style={styles.contactText}>{customer.phoneNumber}</Text>
                        {customer.panVatNumber && (
                          <>
                            <Text style={styles.dot}>•</Text>
                            <Text style={styles.panText}>PAN: {customer.panVatNumber}</Text>
                          </>
                        )}
                      </View>
                    </View>

                    {/* Outstanding Balance */}
                    <View style={styles.balanceCol}>
                      <Text
                        style={[
                          styles.balanceAmount,
                          { color: hasDebt ? '#F43F5E' : '#10B981' },
                        ]}
                      >
                        {hasDebt ? 'लिनुपर्ने' : 'चुक्ता'}
                      </Text>
                      <Text
                        style={[
                          styles.balanceValue,
                          { color: hasDebt ? '#F8FAFC' : '#10B981' },
                        ]}
                      >
                        {CONFIG.CURRENCY_SYMBOL} {balance.toLocaleString('en-IN')}
                      </Text>
                    </View>
                  </View>

                  {/* Bottom Action Footer */}
                  <View style={styles.cardFooter}>
                    <TouchableOpacity
                      style={styles.viewLedgerBtn}
                      onPress={() => setSelectedCustomer(customer)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="book-outline" size={14} color="#94A3B8" />
                      <Text style={styles.viewLedgerText}>खाता हेर्नुहोस् (Ledger)</Text>
                    </TouchableOpacity>

                    {hasDebt && (
                      <TouchableOpacity
                        style={styles.remindBtn}
                        onPress={() => handleSendReminder(customer)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="logo-whatsapp" size={14} color="#25D366" />
                        <Text style={styles.remindBtnText}>Remind</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={38} color="#24324D" />
              <Text style={styles.emptyTitle}>कुनै पार्टी भेटिएन (No Parties)</Text>
              <Text style={styles.emptySubtitle}>
                Add your clients and suppliers to start tracking their Khata accounts.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Party Khata Ledger Modal */}
      <PartyKhataModal
        visible={!!selectedCustomer}
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />

      {/* Add Client / Party Modal */}
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
                <Text style={styles.modalTitle}>नयाँ पार्टी थप्नुहोस्</Text>
                <Text style={styles.modalSubtitle}>Enrol Client or Supplier to Khata</Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalClose}
              >
                <Ionicons name="close" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PARTY / CLIENT NAME *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Annapurna Media Network Pvt. Ltd."
                  placeholderTextColor="#475569"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PRIMARY CONTACT NUMBER *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="+977-98XXXXXXXX"
                  placeholderTextColor="#475569"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CORPORATE EMAIL</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="accounts@client.com.np"
                  placeholderTextColor="#475569"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PAN / VAT NUMBER</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="9-Digit PAN/VAT Registration"
                  placeholderTextColor="#475569"
                  keyboardType="numeric"
                  value={panVat}
                  onChangeText={setPanVat}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>OFFICE / BILLING ADDRESS</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Pulchowk, Lalitpur"
                  placeholderTextColor="#475569"
                  value={address}
                  onChangeText={setAddress}
                />
              </View>

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleCreateCustomer}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.submitGradient}
                >
                  <Text style={styles.modalSubmitText}>
                    {isSubmitting ? 'Enrolling...' : 'Save Party to Khata'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
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
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: '#0D1322',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 14,
  },
  summaryBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryIconWrapGet: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryIconWrapGive: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  summaryAmountGet: {
    fontSize: 15,
    fontWeight: '800',
    color: '#10B981',
    marginTop: 2,
  },
  summaryAmountGive: {
    fontSize: 15,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#1E293B',
    marginHorizontal: 12,
  },
  searchRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 6,
    gap: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1322',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
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
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
  },
  addBtnGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterPillsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginVertical: 6,
  },
  filterPill: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  filterPillActive: {
    backgroundColor: '#1E293B',
    borderColor: '#10B981',
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  customerList: {
    paddingHorizontal: 16,
    marginTop: 6,
    gap: 10,
  },
  customerCard: {
    backgroundColor: '#0D1322',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#141D2F',
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    maxWidth: 160,
  },
  inactiveBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  inactiveText: {
    fontSize: 9,
    color: '#EF4444',
    fontWeight: '700',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 4,
  },
  contactText: {
    fontSize: 11,
    color: '#64748B',
  },
  dot: {
    color: '#334155',
    fontSize: 10,
  },
  panText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  balanceCol: {
    alignItems: 'flex-end',
  },
  balanceAmount: {
    fontSize: 10,
    fontWeight: '700',
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  viewLedgerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewLedgerText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  remindBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 211, 102, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(37, 211, 102, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
  },
  remindBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#25D366',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#0C121E',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  modalClose: {
    padding: 4,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  modalInput: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: '#F8FAFC',
    fontSize: 13,
  },
  modalSubmitBtn: {
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalSubmitText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
