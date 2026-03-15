package com.supermark.app.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.google.gson.annotations.SerializedName

@Entity(tableName = "inventory_logs")
data class InventoryLog(
    @PrimaryKey
    @SerializedName("id")
    val id: String,

    @SerializedName("productId")
    val productId: String,

    @SerializedName("type")
    val type: String, // in, out, adjustment

    @SerializedName("quantity")
    val quantity: Int,

    @SerializedName("reason")
    val reason: String? = null,

    @SerializedName("reference")
    val reference: String? = null,

    @SerializedName("createdBy")
    val createdBy: String,

    @SerializedName("createdAt")
    val createdAt: Long = System.currentTimeMillis()
)
