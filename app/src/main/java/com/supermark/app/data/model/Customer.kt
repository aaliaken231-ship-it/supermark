package com.supermark.app.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.google.gson.annotations.SerializedName

@Entity(tableName = "customers")
data class Customer(
    @PrimaryKey
    @SerializedName("id")
    val id: String,

    @SerializedName("name")
    val name: String,

    @SerializedName("email")
    val email: String? = null,

    @SerializedName("phone")
    val phone: String? = null,

    @SerializedName("address")
    val address: String? = null,

    @SerializedName("city")
    val city: String? = null,

    @SerializedName("postalCode")
    val postalCode: String? = null,

    @SerializedName("country")
    val country: String? = null,

    @SerializedName("idNumber")
    val idNumber: String? = null,

    @SerializedName("type")
    val type: String = "individual", // individual, company

    @SerializedName("totalPurchases")
    val totalPurchases: Double = 0.0,

    @SerializedName("createdAt")
    val createdAt: Long = System.currentTimeMillis(),

    @SerializedName("updatedAt")
    val updatedAt: Long = System.currentTimeMillis()
)
