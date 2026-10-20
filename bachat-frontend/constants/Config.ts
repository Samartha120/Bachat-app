/**
 * Bachat Configuration Constants for Shrestha Services
 */

export const CONFIG = {
  COMPANY_NAME: 'Shrestha Services',
  APP_NAME: 'Bachat',
  APP_TAGLINE: 'Enterprise Financial Engine',
  CURRENCY: 'NPR',
  CURRENCY_SYMBOL: 'Rs.',
  API_BASE_URL: 'http://localhost:8080/api/v1',
  
  // Corporate Payment Details for Automated Reminders
  PAYMENT_INFO: {
    BANK_NAME: 'Nabil Bank Limited',
    ACCOUNT_NAME: 'Shrestha Services Pvt. Ltd.',
    ACCOUNT_NUMBER: '01001017500124',
    BRANCH: 'Pulchowk Branch, Lalitpur',
    ESEWA_ID: '9841234567',
    KHALTI_ID: '9841234567',
    OFFICE_CONTACT: '+977-1-5542100',
    OFFICE_EMAIL: 'accounts@shresthaservices.com.np',
  },

  DEFAULT_CATEGORIES: {
    INCOME: [
      'Enterprise Retainer',
      'Consulting Fee',
      'System Integration',
      'Cloud Migration',
      'Annual Maintenance (AMC)',
      'Hardware Procurement Margin',
      'Other Income',
    ],
    EXPENSE: [
      'Cloud Infrastructure',
      'High-Speed Fiber Internet',
      'Staff Payroll Advance',
      'Office Supplies & Hardware',
      'Corporate Tax & Duties',
      'Utilities & Electricity',
      'Travel & Client Meetings',
      'Software Licenses',
      'Miscellaneous',
    ],
  },
};
