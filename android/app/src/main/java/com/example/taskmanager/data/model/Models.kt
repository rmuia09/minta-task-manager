package com.example.taskmanager.data.model

import com.google.gson.annotations.SerializedName

data class User(
    val id: Int,
    val name: String,
    val email: String
)

data class AuthResponse(
    val token: String,
    val user: User
)

data class ForgotPasswordResponse(
    val message: String,
    @SerializedName("devResetCode") val devResetCode: String? = null
)

data class ResetPasswordResponse(
    val message: String
)

data class Task(
    val id: Int,
    val title: String,
    val description: String? = null,
    @SerializedName("due_date") val dueDate: String? = null,
    val priority: String = "medium",
    val project: String = "personal",
    val completed: Boolean = false,
    @SerializedName("created_at") val createdAt: String? = null
)

data class TaskRequest(
    val title: String,
    val description: String? = null,
    @SerializedName("due_date") val dueDate: String? = null,
    val priority: String = "medium",
    val project: String = "personal",
    val completed: Boolean? = null
)

data class ErrorResponse(
    val error: String? = null,
    val message: String? = null
)