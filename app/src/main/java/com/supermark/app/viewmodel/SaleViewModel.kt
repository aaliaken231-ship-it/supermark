package com.supermark.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.supermark.app.data.model.Sale
import com.supermark.app.data.model.SaleItem
import com.supermark.app.data.repository.SaleRepository
import com.supermark.app.data.repository.UserRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject
import java.util.UUID

@HiltViewModel
class SaleViewModel @Inject constructor(
    private val saleRepository: SaleRepository,
    private val userRepository: UserRepository
) : ViewModel() {

    private val _sales = MutableStateFlow<List<Sale>>(emptyList())
    val sales: StateFlow<List<Sale>> = _sales.asStateFlow()

    private val _saleItems = MutableStateFlow<List<SaleItem>>(emptyList())
    val saleItems: StateFlow<List<SaleItem>> = _saleItems.asStateFlow()

    private val _totalSales = MutableStateFlow(0.0)
    val totalSales: StateFlow<Double> = _totalSales.asStateFlow()

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _saleCount = MutableStateFlow(0)
    val saleCount: StateFlow<Int> = _saleCount.asStateFlow()

    init {
        loadSales()
        loadTotalSales()
        loadSaleCount()
    }

    private fun loadSales() {
        viewModelScope.launch {
            try {
                saleRepository.getAllSales().collect {
                    _sales.value = it
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to load sales"
            }
        }
    }

    private fun loadTotalSales() {
        viewModelScope.launch {
            try {
                val now = System.currentTimeMillis()
                val startOfDay = (now / (1000 * 60 * 60 * 24)) * (1000 * 60 * 60 * 24)
                val endOfDay = startOfDay + (1000 * 60 * 60 * 24)
                val total = saleRepository.getTotalSales(startOfDay, endOfDay) ?: 0.0
                _totalSales.value = total
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to load total sales"
            }
        }
    }

    private fun loadSaleCount() {
        viewModelScope.launch {
            try {
                val count = saleRepository.getSaleCount()
                _saleCount.value = count
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to load sale count"
            }
        }
    }

    fun createSale(
        customerId: String?,
        totalAmount: Double,
        tax: Double = 0.0,
        discount: Double = 0.0,
        paymentMethod: String,
        saleItems: List<SaleItem>,
        notes: String? = null
    ) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val userId = userRepository.getCurrentUserId() ?: return@launch
                val invoiceNumber = "INV-${System.currentTimeMillis()}"
                
                val sale = Sale(
                    id = UUID.randomUUID().toString(),
                    invoiceNumber = invoiceNumber,
                    customerId = customerId,
                    userId = userId,
                    totalAmount = totalAmount,
                    tax = tax,
                    discount = discount,
                    paymentMethod = paymentMethod,
                    notes = notes
                )

                saleRepository.createSaleWithItems(sale, saleItems)
                loadTotalSales()
                loadSaleCount()
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to create sale"
            } finally {
                _loading.value = false
            }
        }
    }

    fun deleteSale(saleId: String) {
        viewModelScope.launch {
            _loading.value = true
            try {
                saleRepository.deleteSale(saleId)
                loadSaleCount()
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to delete sale"
            } finally {
                _loading.value = false
            }
        }
    }

    fun getSaleDetails(saleId: String) {
        viewModelScope.launch {
            try {
                saleRepository.getSaleItems(saleId).collect {
                    _saleItems.value = it
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to load sale details"
            }
        }
    }

    fun clearError() {
        _error.value = null
    }
}
