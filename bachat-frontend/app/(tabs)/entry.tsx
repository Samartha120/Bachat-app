import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { HeaderBranding } from '@/components/HeaderBranding';
import { useLedger } from '@/context/LedgerContext';
import { CONFIG } from '@/constants/Config';
import { Palette } from '@/constants/Colors';

export default function FastDataEntryScreen() {
  const { addTransaction, customers } = useLedger();

  // Form State
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [amountStr, setAmountStr] = useState('');
  const [category, setCategory] = useState(CONFIG.DEFAULT_CATEGORIES.INCOME[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [status, setStatus] = useState<'PAID' | 'PENDING'>('PAID');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | undefined>(undefined);
  const [dueDateDays, setDueDateDays] = useState<number>(7);
  const [customDueDate, setCustomDueDate] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active categories based on selected Type
  const categoryList =
    type === 'INCOME'
      ? CONFIG.DEFAULT_CATEGORIES.INCOME
      : CONFIG.DEFAULT_CATEGORIES.EXPENSE;

  // Format today's date
  const today = new Date().toISOString().split('T')[0];

  // Compute calculated due date
  const computeDueDate = () => {
    if (customDueDate) return customDueDate;
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

  const handleSubmit = async () => {
    const rawAmount = parseFloat(amountStr.replace(/[^0-9.]/g, ''));
    if (isNaN(rawAmount) || rawAmount <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid monetary amount greater than 0.');
      return;
    }

    const finalCategory = customCategory.trim() || category;
    if (!finalCategory) {
      Alert.alert('Validation Error', 'Please select or enter a transaction category.');
      return;
    }

    // Conditional Form Logic Check for Pending Status
    if (status === 'PENDING') {
      if (!selectedCustomerId) {
        Alert.alert(
          'Customer Required',
          'For pending transactions / receivables, a client or vendor mapping is strictly required.'
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

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
        notes: notes.trim() || undefined,
        paymentReference: paymentRef.trim() || undefined,
      });

      if (success) {
        Alert.alert(
          'Transaction Logged',
          `Successfully recorded ${type} of NPR ${rawAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}.`,
          [
            {
              text: 'View Ledger',
              onPress: () => router.push('/(tabs)'),
            },
            {
              text: 'New Entry',
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
      Alert.alert('Submission Failed', e.message || 'An error occurred while logging transaction.');
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
          <HeaderBranding subtitle="Rapid Financial Data Entry System" />

          {/* Type Toggle: Inflow vs Outflow */}
          <View style={styles.typeSelectorContainer}>
            <Pressable
              style={[
                styles.typeBtn,
                type === 'INCOME' && styles.typeBtnIncomeActive,
              ]}
              onPress={() => handleTypeChange('INCOME')}
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
                Inflow (Income)
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.typeBtn,
                type === 'EXPENSE' && styles.typeBtnExpenseActive,
              ]}
              onPress={() => handleTypeChange('EXPENSE')}
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
                Outflow (Expense)
              </Text>
            </Pressable>
          </View>

          {/* Amount Large Input */}
          <View style={styles.amountInputCard}>
            <Text style={styles.fieldLabel}>TRANSACTION AMOUNT ({CONFIG.CURRENCY})</Text>
            <View style={styles.amountInputRow}>
              <Text style={styles.currencyPrefix}>{CONFIG.CURRENCY_SYMBOL}</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor="#334155"
                keyboardType="decimal-pad"
                value={amountStr}
                onChangeText={setAmountStr}
                autoFocus
              />
            </View>

            {/* Fast Quick Amount Chips */}
            <View style={styles.quickAmountRow}>
              {[5000, 15000, 50000, 100000].map(val => (
                <Pressable
                  key={val}
                  style={styles.quickAmountChip}
                  onPress={() => setAmountStr(val.toString())}
                >
                  <Text style={styles.quickAmountText}>+{val >= 1000 ? `${val / 1000}k` : val}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Category Picker */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>CATEGORY PRESET</Text>
            <View style={styles.chipGrid}>
              {categoryList.map(cat => {
                const isSelected = category === cat && !customCategory;
                return (
                  <Pressable
                    key={cat}
                    style={[
                      styles.categoryChip,
                      isSelected && (type === 'INCOME' ? styles.chipActiveIncome : styles.chipActiveExpense),
                    ]}
                    onPress={() => {
                      setCategory(cat);
                      setCustomCategory('');
                    }}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        isSelected && styles.categoryChipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Settlement Status Toggle: Paid vs Pending */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>SETTLEMENT STATUS</Text>
            <View style={styles.statusToggleRow}>
              <Pressable
                style={[
                  styles.statusToggleBtn,
                  status === 'PAID' && styles.statusPaidActive,
                ]}
                onPress={() => setStatus('PAID')}
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
                  Settled / Paid Immediately
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.statusToggleBtn,
                  status === 'PENDING' && styles.statusPendingActive,
                ]}
                onPress={() => setStatus('PENDING')}
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
                  Pending Receivable / Payable
                </Text>
              </Pressable>
            </View>
          </View>

          {/* CONDITIONAL LOGIC: If Pending, require Customer & Due Date */}
          {status === 'PENDING' && (
            <View style={styles.conditionalCard}>
              <View style={styles.conditionalHeader}>
                <Ionicons name="alert-circle-outline" size={16} color={Palette.amber} />
                <Text style={styles.conditionalTitle}>Receivable Tracking Requirements</Text>
              </View>

              {/* Customer Selector */}
              <Text style={styles.conditionalFieldLabel}>ASSIGN CLIENT / VENDOR *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.customerScroll}>
                {customers
                  .filter(c => c.active)
                  .map(c => {
                    const isSelected = selectedCustomerId === c.id;
                    return (
                      <Pressable
                        key={c.id}
                        style={[
                          styles.customerChip,
                          isSelected && styles.customerChipSelected,
                        ]}
                        onPress={() => setSelectedCustomerId(c.id)}
                      >
                        <Ionicons
                          name="business"
                          size={14}
                          color={isSelected ? '#F8FAFC' : '#64748B'}
                          style={{ marginRight: 6 }}
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
                      </Pressable>
                    );
                  })}
              </ScrollView>

              {/* Due Date Options */}
              <Text style={[styles.conditionalFieldLabel, { marginTop: 12 }]}>
                PAYMENT DUE WINDOW: {computeDueDate()}
              </Text>
              <View style={styles.dueDaysRow}>
                {[3, 7, 15, 30].map(days => (
                  <Pressable
                    key={days}
                    style={[
                      styles.dueDayChip,
                      dueDateDays === days && styles.dueDayChipActive,
                    ]}
                    onPress={() => {
                      setDueDateDays(days);
                      setCustomDueDate('');
                    }}
                  >
                    <Text
                      style={[
                        styles.dueDayText,
                        dueDateDays === days && styles.dueDayTextActive,
                      ]}
                    >
                      +{days} Days
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Notes & Memo */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>MEMO / AUDIT NOTES</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="e.g. Monthly cloud hosting, invoice #092 milestone payment..."
              placeholderTextColor="#64748B"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Payment Reference */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>PAYMENT REFERENCE (VOUCHER / BANK REF)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. NABIL-TX-99021, CHEQUE-441..."
              placeholderTextColor="#64748B"
              value={paymentRef}
              onChangeText={setPaymentRef}
            />
          </View>

          {/* Submit Action Button */}
          <Pressable
            style={[
              styles.submitBtn,
              type === 'INCOME' ? styles.submitBtnIncome : styles.submitBtnExpense,
              isSubmitting && { opacity: 0.6 },
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Ionicons name="save-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.submitBtnText}>
              {isSubmitting ? 'Logging to Bachat Engine...' : 'Commit Transaction to Ledger'}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
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
  typeSelectorContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 10,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 9,
  },
  typeBtnIncomeActive: {
    backgroundColor: Palette.emeraldDark,
  },
  typeBtnExpenseActive: {
    backgroundColor: '#B91C1C',
  },
  typeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  typeBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  amountInputCard: {
    backgroundColor: Palette.cardDark,
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: Palette.borderDark,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
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
    fontWeight: '800',
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
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  quickAmountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  formSection: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#111726',
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  chipActiveIncome: {
    backgroundColor: Palette.emeraldMuted,
    borderColor: Palette.emerald,
  },
  chipActiveExpense: {
    backgroundColor: Palette.roseMuted,
    borderColor: Palette.rose,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  categoryChipTextActive: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  statusToggleRow: {
    gap: 8,
  },
  statusToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111726',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 10,
    padding: 12,
  },
  statusPaidActive: {
    borderColor: Palette.emerald,
    backgroundColor: Palette.emeraldMuted,
  },
  statusPendingActive: {
    borderColor: Palette.amber,
    backgroundColor: Palette.amberMuted,
  },
  statusToggleText: {
    fontSize: 13,
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
    backgroundColor: '#151C2C',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  conditionalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  conditionalTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FCD34D',
  },
  conditionalFieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  customerScroll: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  customerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    maxWidth: 240,
  },
  customerChipSelected: {
    backgroundColor: Palette.indigo,
    borderColor: '#818CF8',
  },
  customerChipText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  customerChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dueDaysRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  dueDayChip: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  dueDayChipActive: {
    backgroundColor: Palette.amberMuted,
    borderColor: Palette.amber,
  },
  dueDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  dueDayTextActive: {
    color: Palette.amber,
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: '#111726',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
    color: '#F8FAFC',
    fontSize: 13,
  },
  notesInput: {
    backgroundColor: '#111726',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
    color: '#F8FAFC',
    fontSize: 13,
    minHeight: 50,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginTop: 14,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  submitBtnIncome: {
    backgroundColor: Palette.emeraldDark,
  },
  submitBtnExpense: {
    backgroundColor: '#B91C1C',
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
