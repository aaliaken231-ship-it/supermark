package com.supermark.app.di

import com.supermark.app.data.dao.CustomerDao
import com.supermark.app.data.dao.InventoryLogDao
import com.supermark.app.data.dao.LicenseDao
import com.supermark.app.data.dao.ProductDao
import com.supermark.app.data.dao.SaleDao
import com.supermark.app.data.dao.TransactionDao
import com.supermark.app.data.dao.UserDao
import com.supermark.app.data.repository.CustomerRepository
import com.supermark.app.data.repository.InventoryRepository
import com.supermark.app.data.repository.LicenseRepository
import com.supermark.app.data.repository.ProductRepository
import com.supermark.app.data.repository.SaleRepository
import com.supermark.app.data.repository.TransactionRepository
import com.supermark.app.data.repository.UserRepository
import androidx.security.crypto.EncryptedSharedPreferences
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object RepositoryModule {

    @Singleton
    @Provides
    fun provideUserRepository(
        userDao: UserDao,
        encryptedPreferences: EncryptedSharedPreferences
    ): UserRepository = UserRepository(userDao, encryptedPreferences)

    @Singleton
    @Provides
    fun provideProductRepository(productDao: ProductDao): ProductRepository =
        ProductRepository(productDao)

    @Singleton
    @Provides
    fun provideCustomerRepository(customerDao: CustomerDao): CustomerRepository =
        CustomerRepository(customerDao)

    @Singleton
    @Provides
    fun provideSaleRepository(saleDao: SaleDao): SaleRepository =
        SaleRepository(saleDao)

    @Singleton
    @Provides
    fun provideTransactionRepository(transactionDao: TransactionDao): TransactionRepository =
        TransactionRepository(transactionDao)

    @Singleton
    @Provides
    fun provideInventoryRepository(
        inventoryLogDao: InventoryLogDao,
        productDao: ProductDao
    ): InventoryRepository = InventoryRepository(inventoryLogDao, productDao)

    @Singleton
    @Provides
    fun provideLicenseRepository(licenseDao: LicenseDao): LicenseRepository =
        LicenseRepository(licenseDao)
}
