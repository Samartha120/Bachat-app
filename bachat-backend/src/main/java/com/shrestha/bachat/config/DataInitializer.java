package com.shrestha.bachat.config;

import com.shrestha.bachat.model.*;
import com.shrestha.bachat.repository.AuditLogRepository;
import com.shrestha.bachat.repository.CustomerRepository;
import com.shrestha.bachat.repository.TransactionRepository;
import com.shrestha.bachat.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final TransactionRepository transactionRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @SuppressWarnings("null")
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        log.info("Initializing Bachat Financial Core database for Shrestha Services...");

        // 1. Seed RBAC Users
        User admin = User.builder()
                .username("admin@shrestha.com")
                .password(passwordEncoder.encode("Admin@123"))
                .fullName("Rajesh Shrestha (Admin)")
                .role(Role.ROLE_OFFICE_ADMIN)
                .enabled(true)
                .build();

        User staff = User.builder()
                .username("staff@shrestha.com")
                .password(passwordEncoder.encode("Staff@123"))
                .fullName("Sunita Shrestha (Staff)")
                .role(Role.ROLE_STAFF_USER)
                .enabled(true)
                .build();

        userRepository.saveAll(List.of(admin, staff));

        // 2. Seed Corporate Clients
        Customer c1 = Customer.builder()
                .name("Himalayan Tech Solutions Pvt. Ltd.")
                .corporateEmail("billing@himalayantech.np")
                .phoneNumber("+977-9851023456")
                .address("Pulchowk, Lalitpur")
                .panVatNumber("601248912")
                .active(true)
                .build();

        Customer c2 = Customer.builder()
                .name("Kathmandu Logistics & Freight")
                .corporateEmail("accounts@ktmlogistics.com")
                .phoneNumber("+977-9841345678")
                .address("Tinkune, Kathmandu")
                .panVatNumber("602849102")
                .active(true)
                .build();

        Customer c3 = Customer.builder()
                .name("Sagarmatha Engineering Consult")
                .corporateEmail("finance@sagarmathaeng.np")
                .phoneNumber("+977-9801239876")
                .address("Baneshwor, Kathmandu")
                .panVatNumber("600491823")
                .active(true)
                .build();

        Customer c4 = Customer.builder()
                .name("Pokhara Retail & Distribution Network")
                .corporateEmail("info@pokhararetail.np")
                .phoneNumber("+977-9812349012")
                .address("New Road, Pokhara")
                .panVatNumber("603912048")
                .active(true)
                .build();

        Customer c5 = Customer.builder()
                .name("Patan Creative Media Labs")
                .corporateEmail("accounts@patancreative.com")
                .phoneNumber("+977-9860128475")
                .address("Jhamsikhel, Lalitpur")
                .panVatNumber("604819203")
                .active(false) // Deactivated for demonstration
                .build();

        customerRepository.saveAll(List.of(c1, c2, c3, c4, c5));

        // 3. Seed Realistic Financial Transactions
        LocalDate today = LocalDate.now();

        // Income - Paid
        Transaction t1 = Transaction.builder()
                .amount(new BigDecimal("125000.00"))
                .type(TransactionType.INCOME)
                .category("Enterprise Retainer")
                .transactionDate(today.minusDays(2))
                .status(TransactionStatus.PAID)
                .customer(c1)
                .notes("Monthly IT support & financial systems retainer for Oct 2026")
                .paymentReference("NABIL-TX-882190")
                .createdBy(admin)
                .build();

        // Income - Overdue (Past due date!)
        Transaction t2 = Transaction.builder()
                .amount(new BigDecimal("84500.00"))
                .type(TransactionType.INCOME)
                .category("Consulting Fee")
                .transactionDate(today.minusDays(25))
                .dueDate(today.minusDays(8))
                .status(TransactionStatus.OVERDUE)
                .customer(c2)
                .notes("Phase 2 Enterprise Architecture deployment milestone invoice")
                .paymentReference("INV-2026-092")
                .createdBy(staff)
                .build();

        // Income - Pending (Due in 5 days)
        Transaction t3 = Transaction.builder()
                .amount(new BigDecimal("96000.00"))
                .type(TransactionType.INCOME)
                .category("System Integration")
                .transactionDate(today.minusDays(4))
                .dueDate(today.plusDays(5))
                .status(TransactionStatus.PENDING)
                .customer(c3)
                .notes("ERP synchronization module final signoff installment")
                .paymentReference("INV-2026-104")
                .createdBy(admin)
                .build();

        // Income - Overdue (Past due date!)
        Transaction t4 = Transaction.builder()
                .amount(new BigDecimal("42000.00"))
                .type(TransactionType.INCOME)
                .category("Cloud Migration")
                .transactionDate(today.minusDays(18))
                .dueDate(today.minusDays(3))
                .status(TransactionStatus.OVERDUE)
                .customer(c4)
                .notes("Migration support and server hardening fee")
                .paymentReference("INV-2026-098")
                .createdBy(staff)
                .build();

        // Expenses - Paid
        Transaction t5 = Transaction.builder()
                .amount(new BigDecimal("35000.00"))
                .type(TransactionType.EXPENSE)
                .category("Cloud Infrastructure")
                .transactionDate(today.minusDays(5))
                .status(TransactionStatus.PAID)
                .notes("AWS / Cloud hosting and dedicated IP pool for Shrestha Services")
                .paymentReference("AWS-INV-77491")
                .createdBy(admin)
                .build();

        Transaction t6 = Transaction.builder()
                .amount(new BigDecimal("12500.00"))
                .type(TransactionType.EXPENSE)
                .category("High-Speed Fiber Internet")
                .transactionDate(today.minusDays(7))
                .status(TransactionStatus.PAID)
                .notes("Corporate leased line 200Mbps symmetric")
                .paymentReference("WLINK-OCT-26")
                .createdBy(staff)
                .build();

        Transaction t7 = Transaction.builder()
                .amount(new BigDecimal("8400.00"))
                .type(TransactionType.EXPENSE)
                .category("Office Supplies & Hardware")
                .transactionDate(today.minusDays(1))
                .status(TransactionStatus.PAID)
                .notes("Ergonomic keyboards, HDMI cables, printer cartridges")
                .paymentReference("CASH-VOUCHER-441")
                .createdBy(staff)
                .build();

        Transaction t8 = Transaction.builder()
                .amount(new BigDecimal("55000.00"))
                .type(TransactionType.EXPENSE)
                .category("Staff Payroll Advance")
                .transactionDate(today)
                .status(TransactionStatus.PAID)
                .notes("Mid-month operational bonus and technical support stipend")
                .paymentReference("BANK-TRANSFER-9102")
                .createdBy(admin)
                .build();

        transactionRepository.saveAll(List.of(t1, t2, t3, t4, t5, t6, t7, t8));

        // 4. Initial Audit Logs
        AuditLog a1 = AuditLog.builder()
                .timestamp(LocalDateTime.now().minusDays(2))
                .username("admin@shrestha.com")
                .action("SYSTEM_BOOTSTRAP")
                .ipAddress("127.0.0.1")
                .targetEntity("BachatCore")
                .details("Enterprise financial ledger engine initialized with RBAC controls")
                .build();

        AuditLog a2 = AuditLog.builder()
                .timestamp(LocalDateTime.now().minusDays(1))
                .username("staff@shrestha.com")
                .action("TRANSACTION_CREATE")
                .ipAddress("192.168.1.45")
                .targetEntity("Transaction#2")
                .details("Logged Consulting Fee invoice of NPR 84,500.00 for Kathmandu Logistics")
                .build();

        auditLogRepository.saveAll(List.of(a1, a2));

        log.info("Bachat Financial Core initialized successfully. Default credentials: admin@shrestha.com / Admin@123, staff@shrestha.com / Staff@123");
    }
}
