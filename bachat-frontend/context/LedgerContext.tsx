import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  CustomerModel,
  TransactionModel,
  AuditLogModel,
  INITIAL_CUSTOMERS,
  INITIAL_TRANSACTIONS,
  INITIAL_AUDIT_LOGS,
} from '@/services/mockData';
import { useAuth } from './AuthContext';
import { Alert } from 'react-native';

export type TimeBucket = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_YEAR';

export interface ChartDataPoint {
  label: string;
  value: number;
  dataPointText?: string;
  frontColor?: string;
}

interface LedgerContextType {
  timeBucket: TimeBucket;
  setTimeBucket: (bucket: TimeBucket) => void;
  transactions: TransactionModel[];
  filteredTransactions: TransactionModel[];
  customers: CustomerModel[];
  auditLogs: AuditLogModel[];
  totalIncome: number;
  totalExpenses: number;
  netMargin: number;
  agingReceivables: number;
  overdueReceivables: number;
  overdueTransactions: TransactionModel[];
  pendingTransactions: TransactionModel[];
  chartData: {
    incomeData: ChartDataPoint[];
    expenseData: ChartDataPoint[];
  };
  addTransaction: (tx: Omit<TransactionModel, 'id' | 'createdAt' | 'formattedAmount'>) => Promise<boolean>;
  deleteTransaction: (id: number) => Promise<boolean>;
  markAsPaid: (id: number) => Promise<boolean>;
  addCustomer: (customer: Omit<CustomerModel, 'id' | 'createdAt' | 'outstandingBalance' | 'formattedOutstandingBalance' | 'transactionCount'>) => Promise<CustomerModel>;
  updateCustomer: (id: number, data: Partial<CustomerModel>) => Promise<boolean>;
  toggleCustomerActive: (id: number) => Promise<boolean>;
  refreshData: () => Promise<void>;
  isRefreshing: boolean;
}

const LedgerContext = createContext<LedgerContextType | undefined>(undefined);

export const LedgerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const [timeBucket, setTimeBucket] = useState<TimeBucket>('THIS_MONTH');
  const [transactions, setTransactions] = useState<TransactionModel[]>(INITIAL_TRANSACTIONS);
  const [customers, setCustomers] = useState<CustomerModel[]>(INITIAL_CUSTOMERS);
  const [auditLogs, setAuditLogs] = useState<AuditLogModel[]>(INITIAL_AUDIT_LOGS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Synchronize overdue status dynamically based on current date
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setTransactions(prev =>
      prev.map(t => {
        if (t.status === 'PENDING' && t.dueDate && t.dueDate < today) {
          const days = Math.floor((new Date(today).getTime() - new Date(t.dueDate).getTime()) / (1000 * 3600 * 24));
          return {
            ...t,
            status: 'OVERDUE',
            daysOverdue: days,
          };
        }
        return t;
      })
    );
  }, []);

  // Filter transactions based on selected Time Bucket
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return transactions.filter(t => {
      const txDate = new Date(t.transactionDate);
      if (timeBucket === 'TODAY') {
        return t.transactionDate === todayStr;
      }
      if (timeBucket === 'THIS_WEEK') {
        const startOfWeek = new Date(now);
        const day = startOfWeek.getDay() || 7;
        startOfWeek.setDate(startOfWeek.getDate() - day + 1);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        return txDate >= startOfWeek && txDate <= endOfWeek;
      }
      if (timeBucket === 'THIS_MONTH') {
        return (
          txDate.getFullYear() === now.getFullYear() &&
          txDate.getMonth() === now.getMonth()
        );
      }
      if (timeBucket === 'THIS_YEAR') {
        return txDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [transactions, timeBucket]);

  // Key Aggregation Metrics
  const totalIncome = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const totalExpenses = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const netMargin = useMemo(() => {
    return totalIncome - totalExpenses;
  }, [totalIncome, totalExpenses]);

  // Aging receivables (All pending & overdue income across all time)
  const agingReceivables = useMemo(() => {
    return transactions
      .filter(t => t.type === 'INCOME' && (t.status === 'PENDING' || t.status === 'OVERDUE'))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const overdueReceivables = useMemo(() => {
    return transactions
      .filter(t => t.type === 'INCOME' && t.status === 'OVERDUE')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const overdueTransactions = useMemo(() => {
    return transactions.filter(t => t.status === 'OVERDUE');
  }, [transactions]);

  const pendingTransactions = useMemo(() => {
    return transactions.filter(t => t.status === 'PENDING');
  }, [transactions]);

  // Chart Data Preparation tailored for react-native-gifted-charts
  const chartData = useMemo(() => {
    if (timeBucket === 'TODAY') {
      const inc = totalIncome;
      const exp = totalExpenses;
      return {
        incomeData: [
          { label: 'Morning', value: Math.round(inc * 0.4) },
          { label: 'Afternoon', value: Math.round(inc * 0.35) },
          { label: 'Evening', value: Math.round(inc * 0.25) },
        ],
        expenseData: [
          { label: 'Morning', value: Math.round(exp * 0.3) },
          { label: 'Afternoon', value: Math.round(exp * 0.45) },
          { label: 'Evening', value: Math.round(exp * 0.25) },
        ],
      };
    }

    if (timeBucket === 'THIS_WEEK') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return {
        incomeData: days.map((day, idx) => ({
          label: day,
          value: Math.round((totalIncome / 7) * (0.6 + (idx % 3) * 0.35)),
        })),
        expenseData: days.map((day, idx) => ({
          label: day,
          value: Math.round((totalExpenses / 7) * (0.5 + ((idx + 1) % 4) * 0.3)),
        })),
      };
    }

    if (timeBucket === 'THIS_YEAR') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return {
        incomeData: months.map((m, idx) => ({
          label: m,
          value: Math.round((totalIncome / 12) * (0.5 + (idx % 5) * 0.25)),
        })),
        expenseData: months.map((m, idx) => ({
          label: m,
          value: Math.round((totalExpenses / 12) * (0.4 + ((idx + 2) % 4) * 0.3)),
        })),
      };
    }

    // Default: THIS_MONTH (4 Weeks)
    const weeks = ['W1', 'W2', 'W3', 'W4'];
    return {
      incomeData: weeks.map((w, idx) => ({
        label: w,
        value: Math.round((totalIncome / 4) * (0.7 + (idx % 2) * 0.4)),
      })),
      expenseData: weeks.map((w, idx) => ({
        label: w,
        value: Math.round((totalExpenses / 4) * (0.6 + ((idx + 1) % 3) * 0.35)),
      })),
    };
  }, [timeBucket, totalIncome, totalExpenses]);

  // Recalculate customer balances whenever transactions change
  useEffect(() => {
    setCustomers(prev =>
      prev.map(c => {
        const custTx = transactions.filter(t => t.customerId === c.id);
        const outstanding = custTx
          .filter(t => t.status === 'PENDING' || t.status === 'OVERDUE')
          .reduce((sum, t) => sum + t.amount, 0);

        return {
          ...c,
          transactionCount: custTx.length,
          outstandingBalance: outstanding,
          formattedOutstandingBalance: 'NPR ' + outstanding.toLocaleString('en-US', { minimumFractionDigits: 2 }),
        };
      })
    );
  }, [transactions]);

  // Transaction Operations
  const addTransaction = async (txData: Omit<TransactionModel, 'id' | 'createdAt' | 'formattedAmount'>) => {
    const today = new Date().toISOString().split('T')[0];
    let status = txData.status;
    let daysOverdue: number | undefined;

    if (status === 'PENDING' && txData.dueDate && txData.dueDate < today) {
      status = 'OVERDUE';
      daysOverdue = Math.floor((new Date(today).getTime() - new Date(txData.dueDate).getTime()) / (1000 * 3600 * 24));
    }

    const newTx: TransactionModel = {
      ...txData,
      id: Date.now(),
      status,
      daysOverdue,
      formattedAmount: 'NPR ' + txData.amount.toLocaleString('en-US', { minimumFractionDigits: 2 }),
      createdByUsername: user?.username || 'admin@shrestha.com',
      createdAt: new Date().toISOString(),
    };

    setTransactions(prev => [newTx, ...prev]);

    // Record Audit Log
    const newLog: AuditLogModel = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      username: user?.username || 'SYSTEM',
      action: 'TRANSACTION_CREATE',
      ipAddress: '127.0.0.1',
      targetEntity: `Transaction#${newTx.id}`,
      details: `Created ${newTx.type} of ${newTx.formattedAmount} in category '${newTx.category}'`,
    };
    setAuditLogs(prev => [newLog, ...prev]);

    return true;
  };

  const deleteTransaction = async (id: number) => {
    if (!isAdmin) {
      Alert.alert(
        'RBAC Permission Denied',
        'Staff Users do not have authorization to delete financial records. Contact an Office Admin.'
      );
      return false;
    }

    const target = transactions.find(t => t.id === id);
    setTransactions(prev => prev.filter(t => t.id !== id));

    const newLog: AuditLogModel = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      username: user?.username || 'admin@shrestha.com',
      action: 'TRANSACTION_DELETE',
      ipAddress: '127.0.0.1',
      targetEntity: `Transaction#${id}`,
      details: target ? `Deleted ${target.type} of ${target.formattedAmount}` : `Deleted transaction #${id}`,
    };
    setAuditLogs(prev => [newLog, ...prev]);

    return true;
  };

  const markAsPaid = async (id: number) => {
    setTransactions(prev =>
      prev.map(t => (t.id === id ? { ...t, status: 'PAID', daysOverdue: undefined } : t))
    );

    const newLog: AuditLogModel = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      username: user?.username || 'SYSTEM',
      action: 'TRANSACTION_STATUS_PAID',
      ipAddress: '127.0.0.1',
      targetEntity: `Transaction#${id}`,
      details: `Marked invoice transaction #${id} as PAID`,
    };
    setAuditLogs(prev => [newLog, ...prev]);

    return true;
  };

  // Customer Operations
  const addCustomer = async (data: Omit<CustomerModel, 'id' | 'createdAt' | 'outstandingBalance' | 'formattedOutstandingBalance' | 'transactionCount'>): Promise<CustomerModel> => {
    const newCustomer: CustomerModel = {
      ...data,
      id: Date.now(),
      outstandingBalance: 0,
      formattedOutstandingBalance: 'NPR 0.00',
      transactionCount: 0,
      createdAt: new Date().toISOString(),
    };

    setCustomers(prev => [newCustomer, ...prev]);

    const newLog: AuditLogModel = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      username: user?.username || 'SYSTEM',
      action: 'CUSTOMER_CREATE',
      ipAddress: '127.0.0.1',
      targetEntity: `Customer#${newCustomer.id}`,
      details: `Added new corporate client: ${newCustomer.name}`,
    };
    setAuditLogs(prev => [newLog, ...prev]);

    return newCustomer;
  };

  const updateCustomer = async (id: number, data: Partial<CustomerModel>) => {
    setCustomers(prev => prev.map(c => (c.id === id ? { ...c, ...data } : c)));

    const newLog: AuditLogModel = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      username: user?.username || 'SYSTEM',
      action: 'CUSTOMER_UPDATE',
      ipAddress: '127.0.0.1',
      targetEntity: `Customer#${id}`,
      details: `Updated client details for ID #${id}`,
    };
    setAuditLogs(prev => [newLog, ...prev]);

    return true;
  };

  const toggleCustomerActive = async (id: number) => {
    if (!isAdmin) {
      Alert.alert('Permission Denied', 'Only Office Admins can change client active/deactive status.');
      return false;
    }

    setCustomers(prev =>
      prev.map(c => {
        if (c.id === id) {
          const nextActive = !c.active;
          const newLog: AuditLogModel = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            username: user?.username || 'SYSTEM',
            action: nextActive ? 'CUSTOMER_ACTIVATE' : 'CUSTOMER_DEACTIVATE',
            ipAddress: '127.0.0.1',
            targetEntity: `Customer#${id}`,
            details: `Set ${c.name} active status to ${nextActive}`,
          };
          setAuditLogs(l => [newLog, ...l]);
          return { ...c, active: nextActive };
        }
        return c;
      })
    );
    return true;
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    // Simulate lightning-fast network sync
    await new Promise(res => setTimeout(res, 600));
    setIsRefreshing(false);
  };

  return (
    <LedgerContext.Provider
      value={{
        timeBucket,
        setTimeBucket,
        transactions,
        filteredTransactions,
        customers,
        auditLogs,
        totalIncome,
        totalExpenses,
        netMargin,
        agingReceivables,
        overdueReceivables,
        overdueTransactions,
        pendingTransactions,
        chartData,
        addTransaction,
        deleteTransaction,
        markAsPaid,
        addCustomer,
        updateCustomer,
        toggleCustomerActive,
        refreshData,
        isRefreshing,
      }}>
      {children}
    </LedgerContext.Provider>
  );
};

export const useLedger = () => {
  const context = useContext(LedgerContext);
  if (!context) {
    throw new Error('useLedger must be used within a LedgerProvider');
  }
  return context;
};
