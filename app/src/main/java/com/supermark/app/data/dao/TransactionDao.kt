package com.supermark.app.data.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.supermark.app.data.model.Transaction
import kotlinx.coroutines.flow.Flow

@Dao
interface TransactionDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTransaction(transaction: Transaction)

    @Update
    suspend fun updateTransaction(transaction: Transaction)

    @Delete
    suspend fun deleteTransaction(transaction: Transaction)

    @Query("SELECT * FROM transactions WHERE id = :transactionId")
    suspend fun getTransactionById(transactionId: String): Transaction?

    @Query("SELECT * FROM transactions")
    fun getAllTransactions(): Flow<List<Transaction>>

    @Query("SELECT * FROM transactions WHERE userId = :userId")
    fun getTransactionsByUserId(userId: String): Flow<List<Transaction>>

    @Query("SELECT * FROM transactions WHERE type = :type")
    fun getTransactionsByType(type: String): Flow<List<Transaction>>

    @Query("SELECT SUM(amount) FROM transactions WHERE type = 'deposit' AND status = 'completed'")
    suspend fun getTotalDeposits(): Double?

    @Query("SELECT SUM(amount) FROM transactions WHERE type = 'withdrawal' AND status = 'completed'")
    suspend fun getTotalWithdrawals(): Double?

    @Query("SELECT COUNT(*) FROM transactions")
    suspend fun getTransactionCount(): Int

    @Query("DELETE FROM transactions WHERE id = :transactionId")
    suspend fun deleteTransactionById(transactionId: String)
}
