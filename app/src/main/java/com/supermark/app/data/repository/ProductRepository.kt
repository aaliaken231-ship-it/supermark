package com.supermark.app.data.repository

import com.supermark.app.data.dao.ProductDao
import com.supermark.app.data.model.Product
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ProductRepository @Inject constructor(
    private val productDao: ProductDao
) {

    fun getAllProducts(): Flow<List<Product>> = productDao.getAllProducts()

    fun getActiveProducts(): Flow<List<Product>> = productDao.getActiveProducts()

    fun getProductsByCategory(category: String): Flow<List<Product>> = 
        productDao.getProductsByCategory(category)

    fun getLowStockProducts(): Flow<List<Product>> = productDao.getLowStockProducts()

    fun searchProducts(query: String): Flow<List<Product>> = productDao.searchProducts("%$query%")

    suspend fun getProductById(productId: String): Product? = withContext(Dispatchers.IO) {
        productDao.getProductById(productId)
    }

    suspend fun insertProduct(product: Product) = withContext(Dispatchers.IO) {
        productDao.insertProduct(product)
    }

    suspend fun updateProduct(product: Product) = withContext(Dispatchers.IO) {
        productDao.updateProduct(product)
    }

    suspend fun deleteProduct(productId: String) = withContext(Dispatchers.IO) {
        productDao.deleteProductById(productId)
    }

    suspend fun increaseQuantity(productId: String, amount: Int) = withContext(Dispatchers.IO) {
        productDao.increaseQuantity(productId, amount)
    }

    suspend fun decreaseQuantity(productId: String, amount: Int) = withContext(Dispatchers.IO) {
        productDao.decreaseQuantity(productId, amount)
    }

    suspend fun getProductCount(): Int = withContext(Dispatchers.IO) {
        productDao.getProductCount()
    }
}
