package com.supermark.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.supermark.app.data.model.Customer
import com.supermark.app.data.repository.CustomerRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject
import java.util.UUID

@HiltViewModel
class CustomerViewModel @Inject constructor(
    private val customerRepository: CustomerRepository
) : ViewModel() {

    private val _customers = MutableStateFlow<List<Customer>>(emptyList())
    val customers: StateFlow<List<Customer>> = _customers.asStateFlow()

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _customerCount = MutableStateFlow(0)
    val customerCount: StateFlow<Int> = _customerCount.asStateFlow()

    init {
        loadCustomers()
        loadCustomerCount()
    }

    private fun loadCustomers() {
        viewModelScope.launch {
            try {
                customerRepository.getAllCustomers().collect {
                    _customers.value = it
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to load customers"
            }
        }
    }

    private fun loadCustomerCount() {
        viewModelScope.launch {
            try {
                val count = customerRepository.getCustomerCount()
                _customerCount.value = count
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to load customer count"
            }
        }
    }

    fun addCustomer(
        name: String,
        email: String? = null,
        phone: String? = null,
        address: String? = null,
        city: String? = null,
        postalCode: String? = null,
        type: String = "individual"
    ) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val customer = Customer(
                    id = UUID.randomUUID().toString(),
                    name = name,
                    email = email,
                    phone = phone,
                    address = address,
                    city = city,
                    postalCode = postalCode,
                    type = type
                )
                customerRepository.insertCustomer(customer)
                loadCustomerCount()
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to add customer"
            } finally {
                _loading.value = false
            }
        }
    }

    fun updateCustomer(customer: Customer) {
        viewModelScope.launch {
            _loading.value = true
            try {
                customerRepository.updateCustomer(customer)
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to update customer"
            } finally {
                _loading.value = false
            }
        }
    }

    fun deleteCustomer(customerId: String) {
        viewModelScope.launch {
            _loading.value = true
            try {
                customerRepository.deleteCustomer(customerId)
                loadCustomerCount()
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to delete customer"
            } finally {
                _loading.value = false
            }
        }
    }

    fun searchCustomers(query: String) {
        viewModelScope.launch {
            try {
                customerRepository.searchCustomers(query).collect {
                    _customers.value = it
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to search customers"
            }
        }
    }

    fun clearError() {
        _error.value = null
    }
}
