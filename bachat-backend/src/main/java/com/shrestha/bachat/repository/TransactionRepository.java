package com.shrestha.bachat.repository;

import com.shrestha.bachat.model.Transaction;
import com.shrestha.bachat.model.TransactionStatus;
import com.shrestha.bachat.model.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByTransactionDateBetweenOrderByTransactionDateDescCreatedAtDesc(
            LocalDate startDate, LocalDate endDate);

    Page<Transaction> findAllByOrderByTransactionDateDescCreatedAtDesc(Pageable pageable);

    List<Transaction> findByStatusOrderByDueDateAsc(TransactionStatus status);

    List<Transaction> findByStatusInOrderByDueDateAsc(List<TransactionStatus> statuses);

    @Query("SELECT t FROM Transaction t WHERE t.status = :status AND t.dueDate < :currentDate ORDER BY t.dueDate ASC")
    List<Transaction> findOverdueTransactions(
            @Param("status") TransactionStatus status,
            @Param("currentDate") LocalDate currentDate);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.type = :type AND t.transactionDate BETWEEN :startDate AND :endDate")
    BigDecimal sumAmountByTypeAndDateRange(
            @Param("type") TransactionType type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.type = :type AND t.status IN :statuses")
    BigDecimal sumAmountByTypeAndStatuses(
            @Param("type") TransactionType type,
            @Param("statuses") List<TransactionStatus> statuses);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.customer.id = :customerId AND t.status IN ('PENDING', 'OVERDUE')")
    BigDecimal sumOutstandingByCustomer(@Param("customerId") Long customerId);

    List<Transaction> findByCustomerIdOrderByTransactionDateDesc(Long customerId);
}
