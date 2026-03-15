package com.supermark.app.data.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.supermark.app.data.model.InventoryLog
import kotlinx.coroutines.flow.Flow

@Dao
interface InventoryLogDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLog(log: InventoryLog)

    @Delete
    suspend fun deleteLog(log: InventoryLog)

    @Query("SELECT * FROM inventory_logs WHERE id = :logId")
    suspend fun getLogById(logId: String): InventoryLog?

    @Query("SELECT * FROM inventory_logs WHERE productId = :productId")
    fun getLogsByProductId(productId: String): Flow<List<InventoryLog>>

    @Query("SELECT * FROM inventory_logs")
    fun getAllLogs(): Flow<List<InventoryLog>>

    @Query("SELECT COUNT(*) FROM inventory_logs")
    suspend fun getLogCount(): Int

    @Query("DELETE FROM inventory_logs WHERE id = :logId")
    suspend fun deleteLogById(logId: String)
}
