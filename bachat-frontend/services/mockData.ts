/**
 * Initial Enterprise Seed Dataset for Bachat (Shrestha Services)
 */

export interface CustomerModel {
  id: number;
  name: string;
  corporateEmail: string;
  phoneNumber: string;
  address: string;
  panVatNumber: string;
  active: boolean;
  outstandingBalance: number;
  formattedOutstandingBalance: string;
  transactionCount: number;
  createdAt: string;
}

export interface TransactionModel {
  id: number;
  amount: number;
  formattedAmount: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  transactionDate: string; // YYYY-MM-DD
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  dueDate?: string; // YYYY-MM-DD
  daysOverdue?: number;
  customerId?: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  notes?: string;
  paymentReference?: string;
  createdByUsername?: string;
  createdAt: string;
}

export interface AuditLogModel {
  id: number;
  timestamp: string;
  username: string;
  action: string;
  ipAddress: string;
  targetEntity: string;
  details: string;
}

const getTodayDate = () => new Date().toISOString().split('T')[0];
const getOffsetDate = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_CUSTOMERS: CustomerModel[] = [
  {
    id: 1,
    name: 'Himalayan Tech Solutions Pvt. Ltd.',
    corporateEmail: 'billing@himalayantech.np',
    phoneNumber: '+977-9851023456',
    address: 'Pulchowk, Lalitpur',
    panVatNumber: '601248912',
    active: true,
    outstandingBalance: 0,
    formattedOutstandingBalance: 'NPR 0.00',
    transactionCount: 4,
    createdAt: '2026-08-15T09:00:00Z',
  },
  {
    id: 2,
    name: 'Kathmandu Logistics & Freight',
    corporateEmail: 'accounts@ktmlogistics.com',
    phoneNumber: '+977-9841345678',
    address: 'Tinkune, Kathmandu',
    panVatNumber: '602849102',
    active: true,
    outstandingBalance: 84500,
    formattedOutstandingBalance: 'NPR 84,500.00',
    transactionCount: 6,
    createdAt: '2026-07-10T11:30:00Z',
  },
  {
    id: 3,
    name: 'Sagarmatha Engineering Consult',
    corporateEmail: 'finance@sagarmathaeng.np',
    phoneNumber: '+977-9801239876',
    address: 'Baneshwor, Kathmandu',
    panVatNumber: '600491823',
    active: true,
    outstandingBalance: 96000,
    formattedOutstandingBalance: 'NPR 96,000.00',
    transactionCount: 3,
    createdAt: '2026-09-01T14:15:00Z',
  },
  {
    id: 4,
    name: 'Pokhara Retail & Distribution Network',
    corporateEmail: 'info@pokhararetail.np',
    phoneNumber: '+977-9812349012',
    address: 'New Road, Pokhara',
    panVatNumber: '603912048',
    active: true,
    outstandingBalance: 42000,
    formattedOutstandingBalance: 'NPR 42,000.00',
    transactionCount: 5,
    createdAt: '2026-06-20T10:00:00Z',
  },
  {
    id: 5,
    name: 'Patan Creative Media Labs',
    corporateEmail: 'accounts@patancreative.com',
    phoneNumber: '+977-9860128475',
    address: 'Jhamsikhel, Lalitpur',
    panVatNumber: '604819203',
    active: false,
    outstandingBalance: 0,
    formattedOutstandingBalance: 'NPR 0.00',
    transactionCount: 2,
    createdAt: '2026-05-12T16:45:00Z',
  },
];

export const INITIAL_TRANSACTIONS: TransactionModel[] = [
  {
    id: 1,
    amount: 125000,
    formattedAmount: 'NPR 125,000.00',
    type: 'INCOME',
    category: 'Enterprise Retainer',
    transactionDate: getOffsetDate(-2),
    status: 'PAID',
    customerId: 1,
    customerName: 'Himalayan Tech Solutions Pvt. Ltd.',
    customerPhone: '+977-9851023456',
    customerEmail: 'billing@himalayantech.np',
    notes: 'Monthly IT support & financial systems retainer for Oct 2026',
    paymentReference: 'NABIL-TX-882190',
    createdByUsername: 'admin@shrestha.com',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 2,
    amount: 84500,
    formattedAmount: 'NPR 84,500.00',
    type: 'INCOME',
    category: 'Consulting Fee',
    transactionDate: getOffsetDate(-25),
    dueDate: getOffsetDate(-8),
    daysOverdue: 8,
    status: 'OVERDUE',
    customerId: 2,
    customerName: 'Kathmandu Logistics & Freight',
    customerPhone: '+977-9841345678',
    customerEmail: 'accounts@ktmlogistics.com',
    notes: 'Phase 2 Enterprise Architecture deployment milestone invoice',
    paymentReference: 'INV-2026-092',
    createdByUsername: 'staff@shrestha.com',
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: 3,
    amount: 96000,
    formattedAmount: 'NPR 96,000.00',
    type: 'INCOME',
    category: 'System Integration',
    transactionDate: getOffsetDate(-4),
    dueDate: getOffsetDate(5),
    status: 'PENDING',
    customerId: 3,
    customerName: 'Sagarmatha Engineering Consult',
    customerPhone: '+977-9801239876',
    customerEmail: 'finance@sagarmathaeng.np',
    notes: 'ERP synchronization module final signoff installment',
    paymentReference: 'INV-2026-104',
    createdByUsername: 'admin@shrestha.com',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 4,
    amount: 42000,
    formattedAmount: 'NPR 42,000.00',
    type: 'INCOME',
    category: 'Cloud Migration',
    transactionDate: getOffsetDate(-18),
    dueDate: getOffsetDate(-3),
    daysOverdue: 3,
    status: 'OVERDUE',
    customerId: 4,
    customerName: 'Pokhara Retail & Distribution Network',
    customerPhone: '+977-9812349012',
    customerEmail: 'info@pokhararetail.np',
    notes: 'Migration support and server hardening fee',
    paymentReference: 'INV-2026-098',
    createdByUsername: 'staff@shrestha.com',
    createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
  },
  {
    id: 5,
    amount: 35000,
    formattedAmount: 'NPR 35,000.00',
    type: 'EXPENSE',
    category: 'Cloud Infrastructure',
    transactionDate: getOffsetDate(-5),
    status: 'PAID',
    notes: 'AWS / Cloud hosting and dedicated IP pool for Shrestha Services',
    paymentReference: 'AWS-INV-77491',
    createdByUsername: 'admin@shrestha.com',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 6,
    amount: 12500,
    formattedAmount: 'NPR 12,500.00',
    type: 'EXPENSE',
    category: 'High-Speed Fiber Internet',
    transactionDate: getOffsetDate(-7),
    status: 'PAID',
    notes: 'Corporate leased line 200Mbps symmetric',
    paymentReference: 'WLINK-OCT-26',
    createdByUsername: 'staff@shrestha.com',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 7,
    amount: 8400,
    formattedAmount: 'NPR 8,400.00',
    type: 'EXPENSE',
    category: 'Office Supplies & Hardware',
    transactionDate: getOffsetDate(-1),
    status: 'PAID',
    notes: 'Ergonomic keyboards, HDMI cables, printer cartridges',
    paymentReference: 'CASH-VOUCHER-441',
    createdByUsername: 'staff@shrestha.com',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 8,
    amount: 55000,
    formattedAmount: 'NPR 55,000.00',
    type: 'EXPENSE',
    category: 'Staff Payroll Advance',
    transactionDate: getTodayDate(),
    status: 'PAID',
    notes: 'Mid-month operational bonus and technical support stipend',
    paymentReference: 'BANK-TRANSFER-9102',
    createdByUsername: 'admin@shrestha.com',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogModel[] = [
  {
    id: 1,
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
    username: 'admin@shrestha.com',
    action: 'SYSTEM_BOOTSTRAP',
    ipAddress: '127.0.0.1',
    targetEntity: 'BachatCore',
    details: 'Enterprise financial ledger engine initialized with RBAC controls',
  },
  {
    id: 2,
    timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
    username: 'staff@shrestha.com',
    action: 'TRANSACTION_CREATE',
    ipAddress: '192.168.1.45',
    targetEntity: 'Transaction#2',
    details: 'Logged Consulting Fee invoice of NPR 84,500.00 for Kathmandu Logistics',
  },
  {
    id: 3,
    timestamp: new Date().toISOString(),
    username: 'admin@shrestha.com',
    action: 'SESSION_VERIFIED',
    ipAddress: '192.168.1.10',
    targetEntity: 'User#1',
    details: 'JWT session authenticated via expo-secure-store for Rajesh Shrestha',
  },
];
