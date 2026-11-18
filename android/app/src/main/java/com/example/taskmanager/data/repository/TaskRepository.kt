package com.example.taskmanager.data.repository

import com.example.taskmanager.data.TokenStore
import com.example.taskmanager.data.api.ApiService
import com.example.taskmanager.data.model.Task
import com.example.taskmanager.data.model.TaskRequest
import com.google.gson.JsonParser
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withContext

sealed class TaskResult<out T> {
    data class Success<T>(val data: T) : TaskResult<T>()
    data class Error(val message: String) : TaskResult<Nothing>()
}

class TaskRepository(
    private val apiService: ApiService,
    private val tokenStore: TokenStore
) {

    private suspend fun getToken(): String? = tokenStore.token.first()

    suspend fun getTasks(): TaskResult<List<Task>> = withContext(Dispatchers.IO) {
        try {
            val token = getToken() ?: return@withContext TaskResult.Error("Not authenticated")
            val response = apiService.getTasks("Bearer $token")
            if (response.isSuccessful && response.body() != null) {
                TaskResult.Success(response.body()!!)
            } else {
                TaskResult.Error(extractError(response.errorBody()?.string()))
            }
        } catch (e: Exception) {
            TaskResult.Error(networkErrorMessage(e))
        }
    }

    suspend fun createTask(
        title: String,
        description: String?,
        dueDate: String?,
        priority: String,
        project: String
    ): TaskResult<Task> = withContext(Dispatchers.IO) {
        try {
            val token = getToken() ?: return@withContext TaskResult.Error("Not authenticated")
            val response = apiService.createTask(
                "Bearer $token",
                TaskRequest(title, description, dueDate, priority, project)
            )
            if (response.isSuccessful && response.body() != null) {
                TaskResult.Success(response.body()!!)
            } else {
                TaskResult.Error(extractError(response.errorBody()?.string()))
            }
        } catch (e: Exception) {
            TaskResult.Error(networkErrorMessage(e))
        }
    }

    suspend fun updateTask(
        task: Task,
        title: String,
        description: String?,
        dueDate: String?,
        priority: String,
        project: String,
        completed: Boolean
    ): TaskResult<Task> = withContext(Dispatchers.IO) {
        try {
            val token = getToken() ?: return@withContext TaskResult.Error("Not authenticated")
            val response = apiService.updateTask(
                "Bearer $token",
                task.id,
                TaskRequest(title, description, dueDate, priority, project, completed)
            )
            if (response.isSuccessful && response.body() != null) {
                TaskResult.Success(response.body()!!)
            } else {
                TaskResult.Error(extractError(response.errorBody()?.string()))
            }
        } catch (e: Exception) {
            TaskResult.Error(networkErrorMessage(e))
        }
    }

    suspend fun toggleTaskCompleted(task: Task): TaskResult<Task> = withContext(Dispatchers.IO) {
        try {
            val token = getToken() ?: return@withContext TaskResult.Error("Not authenticated")
            val response = apiService.updateTask(
                "Bearer $token",
                task.id,
                TaskRequest(
                    title = task.title,
                    description = task.description,
                    dueDate = task.dueDate,
                    priority = task.priority,
                    project = task.project,
                    completed = !task.completed
                )
            )
            if (response.isSuccessful && response.body() != null) {
                TaskResult.Success(response.body()!!)
            } else {
                TaskResult.Error(extractError(response.errorBody()?.string()))
            }
        } catch (e: Exception) {
            TaskResult.Error(networkErrorMessage(e))
        }
    }

    suspend fun deleteTask(task: Task): TaskResult<Unit> = withContext(Dispatchers.IO) {
        try {
            val token = getToken() ?: return@withContext TaskResult.Error("Not authenticated")
            val response = apiService.deleteTask("Bearer $token", task.id)
            if (response.isSuccessful) {
                TaskResult.Success(Unit)
            } else {
                TaskResult.Error(extractError(response.errorBody()?.string()))
            }
        } catch (e: Exception) {
            TaskResult.Error(networkErrorMessage(e))
        }
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