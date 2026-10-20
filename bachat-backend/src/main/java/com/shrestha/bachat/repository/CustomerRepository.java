package com.shrestha.bachat.repository;

import com.shrestha.bachat.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    List<Customer> findByActiveTrueOrderByNameAsc();

    @Query("SELECT c FROM Customer c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(c.corporateEmail) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR c.phoneNumber LIKE CONCAT('%', :query, '%')")
    List<Customer> searchCustomers(@Param("query") String query);
}
