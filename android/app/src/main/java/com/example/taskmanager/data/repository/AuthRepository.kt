package com.example.taskmanager.data.repository

import com.example.taskmanager.data.TokenStore
import com.example.taskmanager.data.api.ApiService
import com.example.taskmanager.data.api.ForgotPasswordRequest
import com.example.taskmanager.data.api.LoginRequest
import com.example.taskmanager.data.api.RegisterRequest
import com.example.taskmanager.data.api.ResetPasswordRequest
import com.example.taskmanager.data.model.AuthResponse
import com.example.taskmanager.data.model.ForgotPasswordResponse
import com.google.gson.JsonParser
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

sealed class AuthResult<out T> {
    data class Success<T>(val data: T) : AuthResult<T>()
    data class Error(val message: String) : AuthResult<Nothing>()
}

class AuthRepository(
    private val apiService: ApiService,
    private val tokenStore: TokenStore
) {

    suspend fun register(name: String, email: String, password: String): AuthResult<AuthResponse> =
        withContext(Dispatchers.IO) {
            try {
                val response = apiService.register(
                    RegisterRequest(name, email, password)
                )
                if (response.isSuccessful && response.body() != null) {
                    val body = response.body()!!
                    tokenStore.saveAuth(body.token, body.user.name, body.user.email)
                    AuthResult.Success(body)
                } else {
                    AuthResult.Error(extractError(response.errorBody()?.string()))
                }
            } catch (e: Exception) {
                AuthResult.Error(networkErrorMessage(e))
            }
        }

    suspend fun login(email: String, password: String): AuthResult<AuthResponse> =
        withContext(Dispatchers.IO) {
            try {
                val response = apiService.login(LoginRequest(email, password))
                if (response.isSuccessful && response.body() != null) {
                    val body = response.body()!!
                    tokenStore.saveAuth(body.token, body.user.name, body.user.email)
                    AuthResult.Success(body)
                } else {
                    AuthResult.Error(extractError(response.errorBody()?.string()))
                }
            } catch (e: Exception) {
                AuthResult.Error(networkErrorMessage(e))
            }
        }

    suspend fun forgotPassword(email: String): AuthResult<ForgotPasswordResponse> =
        withContext(Dispatchers.IO) {
            try {
                val response = apiService.forgotPassword(ForgotPasswordRequest(email))
                if (response.isSuccessful && response.body() != null) {
                    AuthResult.Success(response.body()!!)
                } else {
                    AuthResult.Error(extractError(response.errorBody()?.string()))
                }
            } catch (e: Exception) {
                AuthResult.Error(networkErrorMessage(e))
            }
        }

    suspend fun resetPassword(email: String, code: String, newPassword: String): AuthResult<String> =
        withContext(Dispatchers.IO) {
            try {
                val response = apiService.resetPassword(
                    ResetPasswordRequest(email, code, newPassword)
                )
                if (response.isSuccessful && response.body() != null) {
                    AuthResult.Success(response.body()!!.message)
                } else {
                    AuthResult.Error(extractError(response.errorBody()?.string()))
                }
            } catch (e: Exception) {
                AuthResult.Error(networkErrorMessage(e))
            }
        }

    suspend fun logout() {
        tokenStore.clear()
    }

    private fun extractError(errorBody: String?): String {
        if (errorBody.isNullOrBlank()) return "Something went wrong. Please try again."
        return try {
            val json = JsonParser.parseString(errorBody).asJsonObject
            json.get("error")?.asString
                ?: json.get("message")?.asString
                ?: "Something went wrong. Please try again."
        } catch (e: Exception) {
            "Something went wrong. Please try again."
        }
    }

    private fun networkErrorMessage(e: Exception): String {
        return when {
            e.message?.contains("Unable to resolve host", ignoreCase = true) == true ->
                "Cannot reach the server. Make sure the backend is running."
            e.message?.contains("timeout", ignoreCase = true) == true ->
                "Connection timed out. Please try again."
            e.message?.contains("Failed to connect", ignoreCase = true) == true ->
                "Could not connect to the server. Check your network."
            else -> "Network error: ${e.message ?: "unknown error"}"
        }
    }
}