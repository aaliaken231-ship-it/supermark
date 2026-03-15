package com.supermark.app.data.repository

import com.supermark.app.data.dao.TransactionDao
import com.supermark.app.data.model.Transaction
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton
import java.util.UUID

@Singleton
class TransactionRepository @Inject constructor(
    private val transactionDao: TransactionDao
) {

    fun getAllTransactions(): Flow<List<Transaction>> = transactionDao.getAllTransactions()

    fun getTransactionsByUserId(userId: String): Flow<List<Transaction>> = 
        transactionDao.getTransactionsByUserId(userId)

    fun getTransactionsByType(type: String): Flow<List<Transaction>> = 
        transactionDao.getTransactionsByType(type)

    suspend fun getTransactionById(transactionId: String): Transaction? = withContext(Dispatchers.IO) {
        transactionDao.getTransactionById(transactionId)
    }

    suspend fun insertTransaction(transaction: Transaction) = withContext(Dispatchers.IO) {
        transactionDao.insertTransaction(transaction)
    }

    suspend fun updateTransaction(transaction: Transaction) = withContext(Dispatchers.IO) {
        transactionDao.updateTransaction(transaction)
    }

    suspend fun deleteTransaction(transactionId: String) = withContext(Dispatchers.IO) {
        transactionDao.deleteTransactionById(transactionId)
    }

    suspend fun getTotalDeposits(): Double? = withContext(Dispatchers.IO) {
        transactionDao.getTotalDeposits()
    }

    suspend fun getTotalWithdrawals(): Double? = withContext(Dispatchers.IO) {
        transactionDao.getTotalWithdrawals()
    }

    suspend fun getTransactionCount(): Int = withContext(Dispatchers.IO) {
        transactionDao.getTransactionCount()
    }

    suspend fun createDeposit(
        userId: String,
        amount: Double,
        description: String? = null,
        reference: String? = null
    ) = withContext(Dispatchers.IO) {
        insertTransaction(
            Transaction(
                id = UUID.randomUUID().toString(),
                userId = userId,
                type = "deposit",
                amount = amount,
                description = description,
                reference = reference
            )
        )
    }

    suspend fun createWithdrawal(
        userId: String,
        amount: Double,
        description: String? = null,
        reference: String? = null
    ) = withContext(Dispatchers.IO) {
        insertTransaction(
            Transaction(
                id = UUID.randomUUID().toString(),
                userId = userId,
                type = "withdrawal",
                amount = amount,
                description = description,
                reference = reference
            )
        )
    }
}
