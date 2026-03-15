package com.supermark.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.supermark.app.data.model.Transaction
import com.supermark.app.data.repository.TransactionRepository
import com.supermark.app.data.repository.UserRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class TransactionViewModel @Inject constructor(
    private val transactionRepository: TransactionRepository,
    private val userRepository: UserRepository
) : ViewModel() {

    private val _transactions = MutableStateFlow<List<Transaction>>(emptyList())
    val transactions: StateFlow<List<Transaction>> = _transactions.asStateFlow()

    private val _totalDeposits = MutableStateFlow(0.0)
    val totalDeposits: StateFlow<Double> = _totalDeposits.asStateFlow()

    private val _totalWithdrawals = MutableStateFlow(0.0)
    val totalWithdrawals: StateFlow<Double> = _totalWithdrawals.asStateFlow()

    private val _balance = MutableStateFlow(0.0)
    val balance: StateFlow<Double> = _balance.asStateFlow()

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    init {
        loadTransactions()
        loadBalances()
    }

    private fun loadTransactions() {
        viewModelScope.launch {
            try {
                transactionRepository.getAllTransactions().collect {
                    _transactions.value = it
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to load transactions"
            }
        }
    }

    private fun loadBalances() {
        viewModelScope.launch {
            try {
                val deposits = transactionRepository.getTotalDeposits() ?: 0.0
                val withdrawals = transactionRepository.getTotalWithdrawals() ?: 0.0
                _totalDeposits.value = deposits
                _totalWithdrawals.value = withdrawals
                _balance.value = deposits - withdrawals
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to load balances"
            }
        }
    }

    fun addDeposit(
        amount: Double,
        description: String? = null,
        reference: String? = null
    ) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val userId = userRepository.getCurrentUserId() ?: return@launch
                transactionRepository.createDeposit(userId, amount, description, reference)
                loadBalances()
                loadTransactions()
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to add deposit"
            } finally {
                _loading.value = false
            }
        }
    }

    fun addWithdrawal(
        amount: Double,
        description: String? = null,
        reference: String? = null
    ) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val userId = userRepository.getCurrentUserId() ?: return@launch
                transactionRepository.createWithdrawal(userId, amount, description, reference)
                loadBalances()
                loadTransactions()
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to add withdrawal"
            } finally {
                _loading.value = false
            }
        }
    }

    fun deleteTransaction(transactionId: String) {
        viewModelScope.launch {
            _loading.value = true
            try {
                transactionRepository.deleteTransaction(transactionId)
                loadBalances()
                loadTransactions()
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to delete transaction"
            } finally {
                _loading.value = false
            }
        }
    }

    fun clearError() {
        _error.value = null
    }
}
