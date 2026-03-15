package com.supermark.app.data.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.supermark.app.data.model.Sale
import com.supermark.app.data.model.SaleItem
import kotlinx.coroutines.flow.Flow

@Dao
interface SaleDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSale(sale: Sale)

    @Update
    suspend fun updateSale(sale: Sale)

    @Delete
    suspend fun deleteSale(sale: Sale)

    @Query("SELECT * FROM sales WHERE id = :saleId")
    suspend fun getSaleById(saleId: String): Sale?

    @Query("SELECT * FROM sales")
    fun getAllSales(): Flow<List<Sale>>

    @Query("SELECT * FROM sales WHERE status = :status")
    fun getSalesByStatus(status: String): Flow<List<Sale>>

    @Query("SELECT * FROM sales WHERE userId = :userId")
    fun getSalesByUserId(userId: String): Flow<List<Sale>>

    @Query("SELECT * FROM sales WHERE customerId = :customerId")
    fun getSalesByCustomerId(customerId: String): Flow<List<Sale>>

    @Query("SELECT SUM(totalAmount) FROM sales WHERE createdAt >= :startDate AND createdAt <= :endDate")
    suspend fun getTotalSales(startDate: Long, endDate: Long): Double?

    @Query("SELECT COUNT(*) FROM sales")
    suspend fun getSaleCount(): Int

    @Query("DELETE FROM sales WHERE id = :saleId")
    suspend fun deleteSaleById(saleId: String)

    // Sale Items
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSaleItem(saleItem: SaleItem)

    @Query("SELECT * FROM sale_items WHERE saleId = :saleId")
    fun getSaleItems(saleId: String): Flow<List<SaleItem>>

    @Delete
    suspend fun deleteSaleItem(saleItem: SaleItem)
}
