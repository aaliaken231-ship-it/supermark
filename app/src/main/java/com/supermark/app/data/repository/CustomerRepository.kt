package com.supermark.app.data.repository

import com.supermark.app.data.dao.CustomerDao
import com.supermark.app.data.model.Customer
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CustomerRepository @Inject constructor(
    private val customerDao: CustomerDao
) {

    fun getAllCustomers(): Flow<List<Customer>> = customerDao.getAllCustomers()

    fun getCustomersByType(type: String): Flow<List<Customer>> = 
        customerDao.getCustomersByType(type)

    fun searchCustomers(query: String): Flow<List<Customer>> = 
        customerDao.searchCustomers("%$query%")

    suspend fun getCustomerById(customerId: String): Customer? = withContext(Dispatchers.IO) {
        customerDao.getCustomerById(customerId)
    }

    suspend fun insertCustomer(customer: Customer) = withContext(Dispatchers.IO) {
        customerDao.insertCustomer(customer)
    }

    suspend fun updateCustomer(customer: Customer) = withContext(Dispatchers.IO) {
        customerDao.updateCustomer(customer)
    }

    suspend fun deleteCustomer(customerId: String) = withContext(Dispatchers.IO) {
        customerDao.deleteCustomerById(customerId)
    }

    suspend fun getCustomerCount(): Int = withContext(Dispatchers.IO) {
        customerDao.getCustomerCount()
    }
}
