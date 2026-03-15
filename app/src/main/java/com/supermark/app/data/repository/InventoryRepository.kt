package com.supermark.app.data.repository

import com.supermark.app.data.dao.InventoryLogDao
import com.supermark.app.data.dao.ProductDao
import com.supermark.app.data.model.InventoryLog
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton
import java.util.UUID

@Singleton
class InventoryRepository @Inject constructor(
    private val inventoryLogDao: InventoryLogDao,
    private val productDao: ProductDao
) {

    fun getLogs(): Flow<List<InventoryLog>> = inventoryLogDao.getAllLogs()

    fun getLogsByProductId(productId: String): Flow<List<InventoryLog>> =
        inventoryLogDao.getLogsByProductId(productId)

    suspend fun addInventory(
        productId: String,
        quantity: Int,
        createdBy: String,
        reason: String? = null
    ) = withContext(Dispatchers.IO) {
        productDao.increaseQuantity(productId, quantity)
        inventoryLogDao.insertLog(
            InventoryLog(
                id = UUID.randomUUID().toString(),
                productId = productId,
                type = "in",
                quantity = quantity,
                reason = reason,
                createdBy = createdBy
            )
        )
    }

    suspend fun removeInventory(
        productId: String,
        quantity: Int,
        createdBy: String,
        reason: String? = null
    ) = withContext(Dispatchers.IO) {
        productDao.decreaseQuantity(productId, quantity)
        inventoryLogDao.insertLog(
            InventoryLog(
                id = UUID.randomUUID().toString(),
                productId = productId,
                type = "out",
                quantity = quantity,
                reason = reason,
                createdBy = createdBy
            )
        )
    }

    suspend fun adjustInventory(
        productId: String,
        quantity: Int,
        createdBy: String,
        reason: String? = null
    ) = withContext(Dispatchers.IO) {
        val product = productDao.getProductById(productId) ?: return@withContext
        val currentQuantity = product.quantity
        val newQuantity = quantity
        val difference = newQuantity - currentQuantity

        if (difference > 0) {
            productDao.increaseQuantity(productId, difference)
        } else if (difference < 0) {
            productDao.decreaseQuantity(productId, -difference)
        }

        inventoryLogDao.insertLog(
            InventoryLog(
                id = UUID.randomUUID().toString(),
                productId = productId,
                type = "adjustment",
                quantity = difference,
                reason = reason,
                createdBy = createdBy
            )
        )
    }

    suspend fun getLogCount(): Int = withContext(Dispatchers.IO) {
        inventoryLogDao.getLogCount()
    }
}
