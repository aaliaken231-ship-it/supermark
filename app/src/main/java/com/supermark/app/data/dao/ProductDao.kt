package com.supermark.app.data.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.supermark.app.data.model.Product
import kotlinx.coroutines.flow.Flow

@Dao
interface ProductDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProduct(product: Product)

    @Update
    suspend fun updateProduct(product: Product)

    @Delete
    suspend fun deleteProduct(product: Product)

    @Query("SELECT * FROM products WHERE id = :productId")
    suspend fun getProductById(productId: String): Product?

    @Query("SELECT * FROM products")
    fun getAllProducts(): Flow<List<Product>>

    @Query("SELECT * FROM products WHERE category = :category")
    fun getProductsByCategory(category: String): Flow<List<Product>>

    @Query("SELECT * FROM products WHERE active = 1")
    fun getActiveProducts(): Flow<List<Product>>

    @Query("SELECT * FROM products WHERE quantity <= minQuantity")
    fun getLowStockProducts(): Flow<List<Product>>

    @Query("SELECT * FROM products WHERE name LIKE :query OR sku LIKE :query")
    fun searchProducts(query: String): Flow<List<Product>>

    @Query("SELECT COUNT(*) FROM products")
    suspend fun getProductCount(): Int

    @Query("UPDATE products SET quantity = quantity + :amount WHERE id = :productId")
    suspend fun increaseQuantity(productId: String, amount: Int)

    @Query("UPDATE products SET quantity = quantity - :amount WHERE id = :productId")
    suspend fun decreaseQuantity(productId: String, amount: Int)

    @Query("DELETE FROM products WHERE id = :productId")
    suspend fun deleteProductById(productId: String)
}
