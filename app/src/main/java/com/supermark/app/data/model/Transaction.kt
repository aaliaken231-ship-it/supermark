package com.supermark.app.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.google.gson.annotations.SerializedName

@Entity(tableName = "transactions")
data class Transaction(
    @PrimaryKey
    @SerializedName("id")
    val id: String,

    @SerializedName("userId")
    val userId: String,

    @SerializedName("type")
    val type: String, // deposit, withdrawal

    @SerializedName("amount")
    val amount: Double,

    @SerializedName("description")
    val description: String? = null,

    @SerializedName("reference")
    val reference: String? = null,

    @SerializedName("status")
    val status: String = "completed", // pending, completed, failed

    @SerializedName("createdAt")
    val createdAt: Long = System.currentTimeMillis(),

    @SerializedName("updatedAt")
    val updatedAt: Long = System.currentTimeMillis()
)
