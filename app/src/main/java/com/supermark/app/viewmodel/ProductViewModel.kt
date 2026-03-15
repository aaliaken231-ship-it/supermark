package com.supermark.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.supermark.app.data.model.Product
import com.supermark.app.data.repository.ProductRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject
import java.util.UUID

@HiltViewModel
class ProductViewModel @Inject constructor(
    private val productRepository: ProductRepository
) : ViewModel() {

    private val _products = MutableStateFlow<List<Product>>(emptyList())
    val products: StateFlow<List<Product>> = _products.asStateFlow()

    private val _lowStockProducts = MutableStateFlow<List<Product>>(emptyList())
    val lowStockProducts: StateFlow<List<Product>> = _lowStockProducts.asStateFlow()

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _productCount = MutableStateFlow(0)
    val productCount: StateFlow<Int> = _productCount.asStateFlow()

    init {
        loadProducts()
        loadLowStockProducts()
        loadProductCount()
    }

    private fun loadProducts() {
        viewModelScope.launch {
            try {
                productRepository.getAllProducts().collect {
                    _products.value = it
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to load products"
            }
        }
    }

    private fun loadLowStockProducts() {
        viewModelScope.launch {
            try {
                productRepository.getLowStockProducts().collect {
                    _lowStockProducts.value = it
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to load low stock products"
            }
        }
    }

    private fun loadProductCount() {
        viewModelScope.launch {
            try {
                val count = productRepository.getProductCount()
                _productCount.value = count
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to load product count"
            }
        }
    }

    fun addProduct(
        name: String,
        category: String,
        price: Double,
        costPrice: Double,
        quantity: Int,
        sku: String,
        description: String? = null
    ) {
        viewModelScope.launch {
            _loading.value = true
            try {
                val product = Product(
                    id = UUID.randomUUID().toString(),
                    name = name,
                    category = category,
                    price = price,
                    costPrice = costPrice,
                    quantity = quantity,
                    sku = sku,
                    description = description
                )
                productRepository.insertProduct(product)
                loadProductCount()
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to add product"
            } finally {
                _loading.value = false
            }
        }
    }

    fun updateProduct(product: Product) {
        viewModelScope.launch {
            _loading.value = true
            try {
                productRepository.updateProduct(product)
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to update product"
            } finally {
                _loading.value = false
            }
        }
    }

    fun deleteProduct(productId: String) {
        viewModelScope.launch {
            _loading.value = true
            try {
                productRepository.deleteProduct(productId)
                loadProductCount()
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to delete product"
            } finally {
                _loading.value = false
            }
        }
    }

    fun searchProducts(query: String) {
        viewModelScope.launch {
            try {
                productRepository.searchProducts(query).collect {
                    _products.value = it
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to search products"
            }
        }
    }

    fun clearError() {
        _error.value = null
    }
}
