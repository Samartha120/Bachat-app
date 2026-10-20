# 🏛️ Bachat (बचत) — Core Financial Engine for Shrestha Services

> **Bachat** (meaning *savings* and *meticulous budget management*) is an enterprise-grade, cross-platform financial operating system custom-built for **Shrestha Services**. Engineered with zero-compromise precision, it pairs a high-performance **React Native (Expo SDK 58 / Expo Go target)** mobile client with a standalone **Java 21 / Spring Boot 3.3** backend.

---

## 🌟 Executive Architectural Overview

```
                                      ┌────────────────────────────────────────┐
                                      │       Bachat Mobile Client (Expo)      │
                                      │  • Expo Router Tab Navigation (5 Tabs) │
                                      │  • react-native-gifted-charts Engine   │
                                      │  • expo-secure-store Token Manager     │
                                      │  • expo-clipboard & Share Automation   │
                                      └──────────────────┬─────────────────────┘
                                                         │
                                             RESTful / Stateless JWT
                                                         │
                                      ┌──────────────────▼─────────────────────┐
                                      │       Java 21 Spring Boot Backend      │
                                      │  • Spring Security 6 RBAC Filters      │
                                      │  • Bulletproof BigDecimal Math Core    │
                                      │  • JPA Time-Bucket Indexed Repository   │
                                      │  • Logback / SLF4J Compliance Audit    │
                                      └──────────────────┬─────────────────────┘
                                                         │
                                      ┌──────────────────▼─────────────────────┐
                                      │   H2 (Dev) / PostgreSQL (Production)   │
                                      └────────────────────────────────────────┘
```

---

## 📂 Project Directory Structure

```text
Bacchat-ShresthaServices/
├── .gitignore                                 # Unified Git ignore rules
├── README.md                                  # Enterprise architectural handbook
│
├── bachat-backend/                            # Standalone Java Spring Boot 3.x Backend
│   ├── pom.xml                                # Maven build config (Java 21, Spring Boot 3.3.4, JJWT, Validation)
│   └── src/
│       └── main/
│           ├── java/com/shrestha/bachat/
│           │   ├── BachatApplication.java      # Main Application entry point
│           │   ├── config/
│           │   │   ├── SecurityConfig.java     # Spring Security 6 RBAC, Stateless JWT filter, CORS
│           │   │   ├── JwtService.java         # HMAC-SHA256 signature validation & claim extraction
│           │   │   ├── JwtAuthenticationFilter.java # Bearer token interceptor + MDC IP/User audit populator
│           │   │   └── DataInitializer.java    # Seeds Admin/Staff users, corporate clients & ledger entries
│           │   ├── model/
│           │   │   ├── User.java               # User entity implementing UserDetails
│           │   │   ├── Role.java               # Enum: ROLE_OFFICE_ADMIN, ROLE_STAFF_USER
│           │   │   ├── Customer.java           # Corporate Client directory entity (PAN/VAT, Phone, Active)
│           │   │   ├── Transaction.java        # Financial ledger (BigDecimal amount, indices, overdue logic)
│           │   │   ├── TransactionType.java    # Enum: INCOME, EXPENSE
│           │   │   ├── TransactionStatus.java  # Enum: PAID, PENDING, OVERDUE
│           │   │   └── AuditLog.java           # Structured audit record (timestamp, username, action, ip, details)
│           │   ├── repository/
│           │   │   ├── UserRepository.java
│           │   │   ├── CustomerRepository.java # Search & active status queries
│           │   │   ├── TransactionRepository.java # Indexed date range sums & overdue queries
│           │   │   └── AuditLogRepository.java
│           │   ├── dto/
│           │   │   ├── AuthRequest.java        # Jakarta @NotBlank validation
│           │   │   ├── AuthResponse.java       # JWT token, role, corporate metadata
│           │   │   ├── TransactionRequest.java # Jakarta @NotNull, @DecimalMin, @Size validation
│           │   │   ├── TransactionResponse.java# Standardized financial DTO
│           │   │   ├── CustomerRequest.java    # Jakarta @Email, @NotBlank validation
│           │   │   ├── CustomerResponse.java   # Client DTO with computed outstanding balance
│           │   │   ├── LedgerSummaryResponse.java # Aggregated bucket metrics (Income, Expenses, Margin, Aging)
│           │   │   ├── TimeBucketChartPoint.java # Dual-bar charting points
│           │   │   ├── AuditLogResponse.java
│           │   │   └── ErrorResponse.java      # Standardized JSON error schema
│           │   ├── service/
│           │   │   ├── AuthService.java        # Authentication & JWT issuance
│           │   │   ├── TransactionService.java # Bulletproof BigDecimal calculations & auto-overdue update
│           │   │   ├── CustomerService.java    # Directory management & outstanding balances
│           │   │   ├── LedgerEngineService.java# Time-bucket aggregations (Today, Week, Month, Year)
│           │   │   └── AuditLogService.java    # SLF4J logger + DB persistence
│           │   ├── controller/
│           │   │   ├── AuthController.java     # /api/v1/auth
│           │   │   ├── TransactionController.java # /api/v1/transactions (RBAC-guarded)
│           │   │   ├── CustomerController.java # /api/v1/customers
│           │   │   ├── LedgerController.java   # /api/v1/ledger/summary
│           │   │   └── AuditLogController.java # /api/v1/audit-logs (Office Admin only)
│           │   └── exception/
│           │       ├── GlobalExceptionHandler.java # Standardized JSON error response handler
│           │       ├── ResourceNotFoundException.java
│           │       └── UnauthorizedOperationException.java
│           └── resources/
│               ├── application.yml             # H2/PostgreSQL config, JWT secret, corporate accounts
│               └── logback-spring.xml          # Dedicated file + console rolling audit appender
│
└── bachat-frontend/                           # Cross-platform Expo React Native Mobile Client
    ├── app/
    │   ├── _layout.tsx                         # Root layout with AuthProvider & LedgerProvider
    │   ├── modal.tsx                           # Corporate Payment Coordinates & Snapshot Sheet
    │   └── (tabs)/
    │       ├── _layout.tsx                     # 5-Tab Navigation Layout (Ledger, Entry, Receivables, Clients, Security)
    │       ├── index.tsx                       # Tab 1: Time-Bucket Ledger & Interactive GiftedCharts
    │       ├── entry.tsx                       # Tab 2: Heavy-Duty Manual Data Entry (Conditional Logic)
    │       ├── receivables.tsx                 # Tab 3: Overdue Alert Hub & One-Click Payment Reminders
    │       ├── customers.tsx                   # Tab 4: Corporate Client & Vendor Directory
    │       └── settings.tsx                    # Tab 5: RBAC Role Switcher, Session Token & Audit Trail
    ├── components/
    │   ├── HeaderBranding.tsx                  # "Bachat | Shrestha Services" with active role badge
    │   ├── StatusBadge.tsx                     # Emerald (Paid), Amber (Pending), Red (Overdue)
    │   ├── MetricCard.tsx                      # FinTech Zinc metric card with micro-trend
    │   ├── TimeBucketFilter.tsx                # Today | This Week | This Month | This Year pills
    │   ├── FinancialChart.tsx                  # High-performance GiftedCharts dual bar charts
    │   └── TransactionRow.tsx                  # Horizontal alignment, status pill & quick settle
    ├── constants/
    │   ├── Colors.ts                           # Modern FinTech Slate/Zinc/Emerald/Indigo palette
    │   └── Config.ts                           # Shrestha Services corporate payment credentials & accounts
    ├── context/
    │   ├── AuthContext.tsx                     # Session management, expo-secure-store handles, RBAC state
    │   └── LedgerContext.tsx                   # Live financial calculations & client balance sync
    └── services/
        ├── api.ts                              # SecureStore wrapper + fetch client with Bearer tokens
        └── mockData.ts                         # Enterprise seed dataset for standalone Expo Go preview
```

---

## 🔒 Enterprise Security & RBAC Specifications

| Feature | Office Admin (`ROLE_OFFICE_ADMIN`) | Staff User (`ROLE_STAFF_USER`) |
|---|---|---|
| **View Ledger & Metrics** | ✅ Full Access | ✅ Full Access |
| **Log New Transactions** | ✅ Allowed | ✅ Allowed |
| **Mark Invoices as Paid** | ✅ Allowed | ✅ Allowed |
| **Delete Transactions** | ✅ Authorized (Logged in Audit) | ❌ **Forbidden** (HTTP 403 / Alert) |
| **Add / Edit Clients** | ✅ Allowed | ✅ Allowed |
| **Activate / Deactivate Clients** | ✅ Authorized | ❌ **Forbidden** |
| **Access Audit Log Trail** | ✅ Authorized | ❌ **Forbidden** (HTTP 403) |

### Test Accounts Pre-Configured:
- **Office Admin**: `admin@shrestha.com` / `Admin@123`
- **Staff User**: `staff@shrestha.com` / `Staff@123`
*(You can also seamlessly switch roles live using the RBAC switcher on the **Security** tab!)*

---

## 🛠️ Step-by-Step Execution Guide

### 1. Launching the Expo Mobile App (Frontend)

```bash
cd bachat-frontend

# Start Expo development server (compatible with Expo Go app or Web)
npm start
# OR run directly on Web:
npm run web
```

- **Scan QR Code** with the **Expo Go** mobile app (iOS / Android) or press `w` to open in browser.
- The app operates with **hardware-backed secure storage (`expo-secure-store`)**, **clipboard integration (`expo-clipboard`)**, and native **GiftedCharts**.

### 2. Launching the Java Backend

The backend is configured for **Java 17+ (Java 21 LTS verified)**.

```powershell
cd bachat-backend

# Option A: Windows PowerShell using the included Maven Wrapper (Zero setup needed)
.\mvnw.ps1 spring-boot:run

# Option B: Using globally installed Maven
mvn spring-boot:run
```

- **Server Port**: `http://localhost:8080`
- **H2 Console**: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:bachatdb`, User: `sa`, Password: *empty*)
- **Audit Logs File**: Generated under `logs/bachat-audit.log` with rolling daily archives.

---

## 💳 Corporate Payment Coordinates Pre-Configured

- **Bank**: Nabil Bank Limited
- **Account Name**: Shrestha Services Pvt. Ltd.
- **Account Number**: `01001017500124`
- **Branch**: Pulchowk Branch, Lalitpur
- **eSewa / Khalti**: `9841234567`
- **Desk Contact**: `+977-1-5542100`

---

## 📄 License & Intellectual Property
Proprietary software custom-developed for **Shrestha Services**. All rights reserved.
