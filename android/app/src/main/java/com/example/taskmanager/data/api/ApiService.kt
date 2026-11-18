package com.example.taskmanager.data.api

import com.example.taskmanager.data.model.AuthResponse
import com.example.taskmanager.data.model.ForgotPasswordResponse
import com.example.taskmanager.data.model.ResetPasswordResponse
import com.example.taskmanager.data.model.Task
import com.example.taskmanager.data.model.TaskRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path

interface ApiService {

    @POST("api/auth/register")
    suspend fun register(@Body body: RegisterRequest): Response<AuthResponse>

    @POST("api/auth/login")
    suspend fun login(@Body body: LoginRequest): Response<AuthResponse>

    @POST("api/auth/forgot-password")
    suspend fun forgotPassword(@Body body: ForgotPasswordRequest): Response<ForgotPasswordResponse>

    @POST("api/auth/reset-password")
    suspend fun resetPassword(@Body body: ResetPasswordRequest): Response<ResetPasswordResponse>

    @GET("api/tasks")
    suspend fun getTasks(@Header("Authorization") token: String): Response<List<Task>>

    @POST("api/tasks")
    suspend fun createTask(
        @Header("Authorization") token: String,
        @Body body: TaskRequest
    ): Response<Task>

    @PUT("api/tasks/{id}")
    suspend fun updateTask(
        @Header("Authorization") token: String,
        @Path("id") id: Int,
        @Body body: TaskRequest
    ): Response<Task>

    @DELETE("api/tasks/{id}")
    suspend fun deleteTask(
        @Header("Authorization") token: String,
        @Path("id") id: Int
    ): Response<ResetPasswordResponse>
}

data class RegisterRequest(
    val name: String,
    val email: String,
    val password: String
)

data class LoginRequest(
    val email: String,
    val password: String
)

data class ForgotPasswordRequest(
    val email: String
)

data class ResetPasswordRequest(
    val email: String,
    val code: String,
    val newPassword: String
)