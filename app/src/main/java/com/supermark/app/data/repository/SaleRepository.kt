package com.supermark.app.data.repository

import com.supermark.app.data.dao.SaleDao
import com.supermark.app.data.model.Sale
import com.supermark.app.data.model.SaleItem
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton
import java.util.UUID

@Singleton
class SaleRepository @Inject constructor(
    private val saleDao: SaleDao
) {

    fun getAllSales(): Flow<List<Sale>> = saleDao.getAllSales()

    fun getSalesByUserId(userId: String): Flow<List<Sale>> = saleDao.getSalesByUserId(userId)

    fun getSalesByCustomerId(customerId: String): Flow<List<Sale>> = 
        saleDao.getSalesByCustomerId(customerId)

    fun getSalesByStatus(status: String): Flow<List<Sale>> = saleDao.getSalesByStatus(status)

    suspend fun getSaleById(saleId: String): Sale? = withContext(Dispatchers.IO) {
        saleDao.getSaleById(saleId)
    }

    suspend fun insertSale(sale: Sale) = withContext(Dispatchers.IO) {
        saleDao.insertSale(sale)
    }

    suspend fun updateSale(sale: Sale) = withContext(Dispatchers.IO) {
        saleDao.updateSale(sale)
    }

    suspend fun deleteSale(saleId: String) = withContext(Dispatchers.IO) {
        saleDao.deleteSaleById(saleId)
    }

    suspend fun insertSaleItem(saleItem: SaleItem) = withContext(Dispatchers.IO) {
        saleDao.insertSaleItem(saleItem)
    }

    fun getSaleItems(saleId: String): Flow<List<SaleItem>> = saleDao.getSaleItems(saleId)

    suspend fun getTotalSales(startDate: Long, endDate: Long): Double? = withContext(Dispatchers.IO) {
        saleDao.getTotalSales(startDate, endDate)
    }

    suspend fun getSaleCount(): Int = withContext(Dispatchers.IO) {
        saleDao.getSaleCount()
    }

    suspend fun createSaleWithItems(
        sale: Sale,
        items: List<SaleItem>
    ) = withContext(Dispatchers.IO) {
        saleDao.insertSale(sale)
        items.forEach { saleDao.insertSaleItem(it) }
    }
}
