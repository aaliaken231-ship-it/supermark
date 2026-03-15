package com.supermark.app.data.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.supermark.app.data.dao.CustomerDao
import com.supermark.app.data.dao.InventoryLogDao
import com.supermark.app.data.dao.LicenseDao
import com.supermark.app.data.dao.ProductDao
import com.supermark.app.data.dao.SaleDao
import com.supermark.app.data.dao.TransactionDao
import com.supermark.app.data.dao.UserDao
import com.supermark.app.data.model.Customer
import com.supermark.app.data.model.InventoryLog
import com.supermark.app.data.model.License
import com.supermark.app.data.model.Product
import com.supermark.app.data.model.Sale
import com.supermark.app.data.model.SaleItem
import com.supermark.app.data.model.Transaction
import com.supermark.app.data.model.User

@Database(
    entities = [
        User::class,
        Product::class,
        Customer::class,
        Sale::class,
        SaleItem::class,
        Transaction::class,
        License::class,
        InventoryLog::class
    ],
    version = 1,
    exportSchema = false
)
abstract class SuperMarkDatabase : RoomDatabase() {

    abstract fun userDao(): UserDao
    abstract fun productDao(): ProductDao
    abstract fun customerDao(): CustomerDao
    abstract fun saleDao(): SaleDao
    abstract fun transactionDao(): TransactionDao
    abstract fun licenseDao(): LicenseDao
    abstract fun inventoryLogDao(): InventoryLogDao

    companion object {
        private var instance: SuperMarkDatabase? = null

        fun getInstance(context: Context): SuperMarkDatabase {
            return instance ?: synchronized(this) {
                instance ?: buildDatabase(context).also { instance = it }
            }
        }

        private fun buildDatabase(context: Context): SuperMarkDatabase {
            return Room.databaseBuilder(
                context.applicationContext,
                SuperMarkDatabase::class.java,
                "supermark_database"
            ).build()
        }
    }
}
