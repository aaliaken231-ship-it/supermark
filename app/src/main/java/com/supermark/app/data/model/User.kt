package com.supermark.app.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.google.gson.annotations.SerializedName

@Entity(tableName = "users")
data class User(
    @PrimaryKey
    @SerializedName("id")
    val id: String,

    @SerializedName("email")
    val email: String,

    @SerializedName("name")
    val name: String,

    @SerializedName("password")
    val password: String? = null,

    @SerializedName("role")
    val role: String = "user", // admin, manager, user

    @SerializedName("phone")
    val phone: String? = null,

    @SerializedName("address")
    val address: String? = null,

    @SerializedName("profileImage")
    val profileImage: String? = null,

    @SerializedName("createdAt")
    val createdAt: Long = System.currentTimeMillis(),

    @SerializedName("updatedAt")
    val updatedAt: Long = System.currentTimeMillis()
)
