package com.supermark.app.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.google.gson.annotations.SerializedName

@Entity(tableName = "products")
data class Product(
    @PrimaryKey
    @SerializedName("id")
    val id: String,

    @SerializedName("name")
    val name: String,

    @SerializedName("category")
    val category: String,

    @SerializedName("price")
    val price: Double,

    @SerializedName("costPrice")
    val costPrice: Double,

    @SerializedName("quantity")
    val quantity: Int,

    @SerializedName("minQuantity")
    val minQuantity: Int = 10,

    @SerializedName("sku")
    val sku: String,

    @SerializedName("barcode")
    val barcode: String? = null,

    @SerializedName("description")
    val description: String? = null,

    @SerializedName("image")
    val image: String? = null,

    @SerializedName("unit")
    val unit: String = "piece",

    @SerializedName("active")
    val active: Boolean = true,

    @SerializedName("createdAt")
    val createdAt: Long = System.currentTimeMillis(),

    @SerializedName("updatedAt")
    val updatedAt: Long = System.currentTimeMillis()
)
