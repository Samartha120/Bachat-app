import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { HeaderBranding } from '@/components/HeaderBranding';
import { useLedger } from '@/context/LedgerContext';
import { CONFIG } from '@/constants/Config';
import { Palette } from '@/constants/Colors';

const PAYMENT_MODES = [
  { id: 'CASH', label: 'Cash (नगद)', icon: 'cash-outline' },
  { id: 'BANK', label: 'Nabil Bank', icon: 'business-outline' },
  { id: 'ESEWA', label: 'eSewa', icon: 'phone-portrait-outline' },
  { id: 'KHALTI', label: 'Khalti', icon: 'wallet-outline' },
  { id: 'CHEQUE', label: 'Cheque', icon: 'document-text-outline' },
];

export default function FastDataEntryScreen() {
  const params = useLocalSearchParams<{ preselectedType?: string }>();
  const { addTransaction, customers } = useLedger();

  // Form State
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [amountStr, setAmountStr] = useState('');
  const [category, setCategory] = useState(CONFIG.DEFAULT_CATEGORIES.INCOME[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [paymentMode, setPaymentMode] = useState<string>('BANK');
  const [status, setStatus] = useState<'PAID' | 'PENDING'>('PAID');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | undefined>(undefined);
  const [dueDateDays, setDueDateDays] = useState<number>(7);
  const [notes, setNotes] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (params.preselectedType === 'EXPENSE') {
      setType('EXPENSE');
      setCategory(CONFIG.DEFAULT_CATEGORIES.EXPENSE[0]);
    } else if (params.preselectedType === 'INCOME') {
      setType('INCOME');
      setCategory(CONFIG.DEFAULT_CATEGORIES.INCOME[0]);
    }
  }, [params.preselectedType]);

  const categoryList =
    type === 'INCOME'
      ? CONFIG.DEFAULT_CATEGORIES.INCOME
      : CONFIG.DEFAULT_CATEGORIES.EXPENSE;

  const today = new Date().toISOString().split('T')[0];

  const computeDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + dueDateDays);
    return d.toISOString().split('T')[0];
  };

  const handleTypeChange = (newType: 'INCOME' | 'EXPENSE') => {
    setType(newType);
    setCategory(
      newType === 'INCOME'
        ? CONFIG.DEFAULT_CATEGORIES.INCOME[0]
        : CONFIG.DEFAULT_CATEGORIES.EXPENSE[0]
    );
  };

  const handleAddQuickAmount = (increment: number) => {
    const current = parseFloat(amountStr.replace(/[^0-9.]/g, '')) || 0;
    const next = current + increment;
    setAmountStr(next.toString());
  };

  const handleSubmit = async () => {
    const rawAmount = parseFloat(amountStr.replace(/[^0-9.]/g, ''));
    if (isNaN(rawAmount) || rawAmount <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid transaction amount.');
      return;
    }

    const finalCategory = customCategory.trim() || category;

    if (status === 'PENDING' && !selectedCustomerId) {
      Alert.alert(
        'Party Required',
        'For pending receivables / payables, a party must be selected from the Khata directory.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

      const refNote = [
        paymentRef ? `Ref: ${paymentRef}` : '',
        `Mode: ${paymentMode}`,
        notes ? notes.trim() : '',
      ]
        .filter(Boolean)
        .join(' | ');

      const success = await addTransaction({
        amount: rawAmount,
        type,
        category: finalCategory,
        transactionDate: today,
        status,
        dueDate: status === 'PENDING' ? computeDueDate() : undefined,
        customerId: selectedCustomerId,
        customerName: selectedCustomer ? selectedCustomer.name : undefined,
        customerPhone: selectedCustomer ? selectedCustomer.phoneNumber : undefined,
        customerEmail: selectedCustomer ? selectedCustomer.corporateEmail : undefined,
        notes: refNote || undefined,
        paymentReference: paymentRef.trim() || `${paymentMode}-${Date.now().toString().slice(-6)}`,
      });

      if (success) {
        Alert.alert(
          'Karobar Recorded',
          `Successfully saved ${type === 'INCOME' ? 'रकम आयो' : 'रकम गयो'} of ${CONFIG.CURRENCY_SYMBOL} ${rawAmount.toLocaleString('en-IN')}.`,
          [
            {
              text: 'View Daybook',
              onPress: () => router.push('/(tabs)'),
            },
            {
              text: 'Record Another',
              onPress: () => {
                setAmountStr('');
                setNotes('');
                setPaymentRef('');
                setSelectedCustomerId(undefined);
              },
            },
          ]
        );
      }
    } catch (e: any) {
      Alert.alert('Submission Error', e.message || 'Failed to save transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <HeaderBranding subtitle="नयाँ कारोबार (Record Transaction)" />

          {/* Inflow vs Outflow Big Tactile Selector */}
          <View style={styles.typeSelectorContainer}>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                type === 'INCOME' && styles.typeBtnIncomeActive,
              ]}
              onPress={() => handleTypeChange('INCOME')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="arrow-down-circle"
                size={18}
                color={type === 'INCOME' ? '#FFFFFF' : '#64748B'}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.typeBtnText,
                  type === 'INCOME' && styles.typeBtnTextActive,
                ]}
              >
                + रकम आयो (Inflow)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeBtn,
                type === 'EXPENSE' && styles.typeBtnExpenseActive,
              ]}
              onPress={() => handleTypeChange('EXPENSE')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="arrow-up-circle"
                size={18}
                color={type === 'EXPENSE' ? '#FFFFFF' : '#64748B'}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.typeBtnText,
                  type === 'EXPENSE' && styles.typeBtnTextActive,
                ]}
              >
                - रकम गयो (Outflow)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Amount Card with Calculator-Style Increments */}
          <View style={styles.amountInputCard}>
            <Text style={styles.fieldLabel}>TRANSACTION AMOUNT (रकम)</Text>
            <View style={styles.amountInputRow}>
              <Text style={styles.currencyPrefix}>{CONFIG.CURRENCY_SYMBOL}</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                placeholderTextColor="#334155"
                keyboardType="numeric"
                value={amountStr}
                onChangeText={setAmountStr}
              />
            </View>

            {/* Quick Amount Chips */}
            <View style={styles.quickAmountRow}>
              {[1000, 5000, 10000, 50000, 100000].map(val => (
                <TouchableOpacity
                  key={val}
                  style={styles.quickAmountChip}
                  onPress={() => handleAddQuickAmount(val)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickAmountText}>
                    +{val >= 100000 ? '1L' : val >= 1000 ? `${val / 1000}k` : val}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Party (Khata) Selection */}
          <View style={styles.formSection}>
            <View style={styles.partyHeaderRow}>
              <Text style={styles.fieldLabel}>ASSIGN PARTY / CLIENT (पार्टी)</Text>
              {selectedCustomerId && (
                <TouchableOpacity onPress={() => setSelectedCustomerId(undefined)}>
                  <Text style={styles.clearPartyText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.customerScroll}>
              <TouchableOpacity
                style={[
                  styles.customerChip,
                  !selectedCustomerId && styles.customerChipSelected,
                ]}
                onPress={() => setSelectedCustomerId(undefined)}
              >
                <Text
                  style={[
                    styles.customerChipText,
                    !selectedCustomerId && styles.customerChipTextSelected,
                  ]}
                >
                  General Office
                </Text>
              </TouchableOpacity>

              {customers
                .filter(c => c.active)
                .map(c => {
                  const isSelected = selectedCustomerId === c.id;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        styles.customerChip,
                        isSelected && styles.customerChipSelected,
                      ]}
                      onPress={() => setSelectedCustomerId(c.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="person"
                        size={12}
                        color={isSelected ? '#F8FAFC' : '#64748B'}
                        style={{ marginRight: 5 }}
                      />
                      <Text
                        style={[
                          styles.customerChipText,
                          isSelected && styles.customerChipTextSelected,
                        ]}
                        numberOfLines={1}
                      >
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>
          </View>

          {/* Payment Mode (Cash / Bank / eSewa / Khalti) */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>PAYMENT MODE (भुक्तानी माध्यम)</Text>
            <View style={styles.paymentModesRow}>
              {PAYMENT_MODES.map(mode => {
                const isSelected = paymentMode === mode.id;
                return (
                  <TouchableOpacity
                    key={mode.id}
                    style={[
                      styles.modeChip,
                      isSelected && styles.modeChipSelected,
                    ]}
                    onPress={() => setPaymentMode(mode.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={mode.icon as any}
                      size={14}
                      color={isSelected ? '#10B981' : '#64748B'}
                    />
                    <Text
                      style={[
                        styles.modeChipText,
                        isSelected && styles.modeChipTextSelected,
                      ]}
                    >
                      {mode.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Settlement Status (Paid vs Due / Credit) */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>TRANSACTION STATUS (स्थिति)</Text>
            <View style={styles.statusToggleRow}>
              <TouchableOpacity
                style={[
                  styles.statusToggleBtn,
                  status === 'PAID' && styles.statusPaidActive,
                ]}
                onPress={() => setStatus('PAID')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={status === 'PAID' ? Palette.emerald : '#64748B'}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.statusToggleText,
                    status === 'PAID' && styles.statusPaidTextActive,
                  ]}
                >
                  चुक्ता भयो (Paid Immediately)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusToggleBtn,
                  status === 'PENDING' && styles.statusPendingActive,
                ]}
                onPress={() => setStatus('PENDING')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="time"
                  size={16}
                  color={status === 'PENDING' ? Palette.amber : '#64748B'}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.statusToggleText,
                    status === 'PENDING' && styles.statusPendingTextActive,
                  ]}
                >
                  उधारो / बाँकी (Credit / Due)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* If Pending / Credit, Due Date Options */}
          {status === 'PENDING' && (
            <View style={styles.conditionalCard}>
              <Text style={styles.conditionalFieldLabel}>
                DUE DATE (भाखा मिति): {computeDueDate()}
              </Text>
              <View style={styles.dueDaysRow}>
                {[3, 7, 15, 30].map(days => (
                  <TouchableOpacity
                    key={days}
                    style={[
                      styles.dueDayChip,
                      dueDateDays === days && styles.dueDayChipActive,
                    ]}
                    onPress={() => setDueDateDays(days)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dueDayText,
                        dueDateDays === days && styles.dueDayTextActive,
                      ]}
                    >
                      +{days} Days
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Category Presets */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>CATEGORY PRESET (शिर्षक)</Text>
            <View style={styles.chipGrid}>
              {categoryList.map(cat => {
                const isSelected = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      isSelected && (type === 'INCOME' ? styles.chipActiveIncome : styles.chipActiveExpense),
                    ]}
                    onPress={() => setCategory(cat)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        isSelected && styles.categoryChipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Notes & Voucher Reference */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>BILL / VOUCHER NUMBER (बिल / भौचर नं.)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. INV-2026-104 or CASH-REC-01"
              placeholderTextColor="#64748B"
              value={paymentRef}
              onChangeText={setPaymentRef}
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>MEMO / REMARKS (कैफियत)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="e.g. Final installment, hardware procurement fee..."
              placeholderTextColor="#64748B"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                type === 'INCOME'
                  ? ['#10B981', '#059669']
                  : ['#EF4444', '#DC2626']
              }
              style={styles.submitGradient}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#FFFFFF"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.submitBtnText}>
                {isSubmitting ? 'Saving to Bachat...' : 'Save Karobar Entry (सुरक्षित गर्नुहोस्)'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  typeSelectorContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 10,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 10,
  },
  typeBtnIncomeActive: {
    backgroundColor: '#10B981',
  },
  typeBtnExpenseActive: {
    backgroundColor: '#EF4444',
  },
  typeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  typeBtnTextActive: {
    color: '#FFFFFF',
  },
  amountInputCard: {
    backgroundColor: '#0D1322',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyPrefix: {
    fontSize: 26,
    fontWeight: '800',
    color: '#94A3B8',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '900',
    color: '#F8FAFC',
    padding: 0,
  },
  quickAmountRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  quickAmountChip: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  formSection: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  partyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearPartyText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '600',
  },
  customerScroll: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  customerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1322',
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    maxWidth: 200,
  },
  customerChipSelected: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  customerChipText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  customerChipTextSelected: {
    color: '#10B981',
    fontWeight: '700',
  },
  paymentModesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1322',
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 6,
  },
  modeChipSelected: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  modeChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  modeChipTextSelected: {
    color: '#10B981',
    fontWeight: '700',
  },
  statusToggleRow: {
    gap: 8,
  },
  statusToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1322',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 10,
    padding: 11,
  },
  statusPaidActive: {
    borderColor: Palette.emerald,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  statusPendingActive: {
    borderColor: Palette.amber,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  statusToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  statusPaidTextActive: {
    color: Palette.emerald,
    fontWeight: '700',
  },
  statusPendingTextActive: {
    color: Palette.amber,
    fontWeight: '700',
  },
  conditionalCard: {
    backgroundColor: '#0D1322',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  conditionalFieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FCD34D',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  dueDaysRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dueDayChip: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  dueDayChipActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: Palette.amber,
  },
  dueDayText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  dueDayTextActive: {
    color: Palette.amber,
    fontWeight: '700',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#0D1322',
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  chipActiveIncome: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: Palette.emerald,
  },
  chipActiveExpense: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: Palette.rose,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  categoryChipTextActive: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: '#0D1322',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#1E293B',
    color: '#F8FAFC',
    fontSize: 13,
  },
  notesInput: {
    backgroundColor: '#0D1322',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#1E293B',
    color: '#F8FAFC',
    fontSize: 13,
    minHeight: 46,
  },
  submitBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginTop: 14,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
