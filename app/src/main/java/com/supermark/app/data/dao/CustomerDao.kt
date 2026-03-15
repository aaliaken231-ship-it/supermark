package com.supermark.app.data.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.supermark.app.data.model.Customer
import kotlinx.coroutines.flow.Flow

@Dao
interface CustomerDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCustomer(customer: Customer)

    @Update
    suspend fun updateCustomer(customer: Customer)

    @Delete
    suspend fun deleteCustomer(customer: Customer)

    @Query("SELECT * FROM customers WHERE id = :customerId")
    suspend fun getCustomerById(customerId: String): Customer?

    @Query("SELECT * FROM customers")
    fun getAllCustomers(): Flow<List<Customer>>

    @Query("SELECT * FROM customers WHERE name LIKE :query OR email LIKE :query OR phone LIKE :query")
    fun searchCustomers(query: String): Flow<List<Customer>>

    @Query("SELECT * FROM customers WHERE type = :type")
    fun getCustomersByType(type: String): Flow<List<Customer>>

    @Query("SELECT COUNT(*) FROM customers")
    suspend fun getCustomerCount(): Int

    @Query("DELETE FROM customers WHERE id = :customerId")
    suspend fun deleteCustomerById(customerId: String)
}
