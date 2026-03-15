package com.supermark.app.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.google.gson.annotations.SerializedName

@Entity(tableName = "licenses")
data class License(
    @PrimaryKey
    @SerializedName("id")
    val id: String,

    @SerializedName("userId")
    val userId: String,

    @SerializedName("key")
    val key: String,

    @SerializedName("plan")
    val plan: String, // free, basic, professional, enterprise

    @SerializedName("maxUsers")
    val maxUsers: Int,

    @SerializedName("maxProducts")
    val maxProducts: Int,

    @SerializedName("maxSalesPerMonth")
    val maxSalesPerMonth: Int,

    @SerializedName("expiresAt")
    val expiresAt: Long,

    @SerializedName("status")
    val status: String = "active", // active, expired, suspended

    @SerializedName("createdAt")
    val createdAt: Long = System.currentTimeMillis(),

    @SerializedName("updatedAt")
    val updatedAt: Long = System.currentTimeMillis()
)
