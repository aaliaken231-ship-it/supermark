package com.supermark.app.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.google.gson.annotations.SerializedName

@Entity(tableName = "sales")
data class Sale(
    @PrimaryKey
    @SerializedName("id")
    val id: String,

    @SerializedName("invoiceNumber")
    val invoiceNumber: String,

    @SerializedName("customerId")
    val customerId: String? = null,

    @SerializedName("userId")
    val userId: String,

    @SerializedName("totalAmount")
    val totalAmount: Double,

    @SerializedName("tax")
    val tax: Double = 0.0,

    @SerializedName("discount")
    val discount: Double = 0.0,

    @SerializedName("paymentMethod")
    val paymentMethod: String, // cash, card, check, transfer

    @SerializedName("status")
    val status: String = "completed", // draft, completed, cancelled

    @SerializedName("notes")
    val notes: String? = null,

    @SerializedName("createdAt")
    val createdAt: Long = System.currentTimeMillis(),

    @SerializedName("updatedAt")
    val updatedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "sale_items")
data class SaleItem(
    @PrimaryKey
    @SerializedName("id")
    val id: String,

    @SerializedName("saleId")
    val saleId: String,

    @SerializedName("productId")
    val productId: String,

    @SerializedName("quantity")
    val quantity: Int,

    @SerializedName("unitPrice")
    val unitPrice: Double,

    @SerializedName("totalPrice")
    val totalPrice: Double,

    @SerializedName("createdAt")
    val createdAt: Long = System.currentTimeMillis()
)
