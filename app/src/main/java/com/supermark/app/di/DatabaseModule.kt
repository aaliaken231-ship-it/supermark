package com.supermark.app.di

import android.content.Context
import androidx.room.Room
import com.supermark.app.data.database.SuperMarkDatabase
import com.supermark.app.data.dao.CustomerDao
import com.supermark.app.data.dao.InventoryLogDao
import com.supermark.app.data.dao.LicenseDao
import com.supermark.app.data.dao.ProductDao
import com.supermark.app.data.dao.SaleDao
import com.supermark.app.data.dao.TransactionDao
import com.supermark.app.data.dao.UserDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Singleton
    @Provides
    fun provideSuperMarkDatabase(
        @ApplicationContext context: Context
    ): SuperMarkDatabase {
        return Room.databaseBuilder(
            context,
            SuperMarkDatabase::class.java,
            "supermark_database"
        ).build()
    }

    @Singleton
    @Provides
    fun provideUserDao(database: SuperMarkDatabase): UserDao =
        database.userDao()

    @Singleton
    @Provides
    fun provideProductDao(database: SuperMarkDatabase): ProductDao =
        database.productDao()

    @Singleton
    @Provides
    fun provideCustomerDao(database: SuperMarkDatabase): CustomerDao =
        database.customerDao()

    @Singleton
    @Provides
    fun provideSaleDao(database: SuperMarkDatabase): SaleDao =
        database.saleDao()

    @Singleton
    @Provides
    fun provideTransactionDao(database: SuperMarkDatabase): TransactionDao =
        database.transactionDao()

    @Singleton
    @Provides
    fun provideLicenseDao(database: SuperMarkDatabase): LicenseDao =
        database.licenseDao()

    @Singleton
    @Provides
    fun provideInventoryLogDao(database: SuperMarkDatabase): InventoryLogDao =
        database.inventoryLogDao()
}
