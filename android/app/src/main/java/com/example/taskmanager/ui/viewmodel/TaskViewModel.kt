package com.example.taskmanager.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.taskmanager.data.model.Task
import com.example.taskmanager.data.repository.TaskRepository
import com.example.taskmanager.data.repository.TaskResult
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class TaskUiState(
    val tasks: List<Task> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val isRefreshing: Boolean = false
)

class TaskViewModel(
    private val taskRepository: TaskRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(TaskUiState())
    val uiState: StateFlow<TaskUiState> = _uiState.asStateFlow()

    init {
        loadTasks()
    }

    /**
     * Reload the tasks. Called when the Today screen is shown so that a new
     * sign-in (after a logout) fetches the tasks of the new account instead of
     * keeping the state from the previous session.
     */
    fun refresh() {
        loadTasks()
    }

    fun loadTasks() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            when (val result = taskRepository.getTasks()) {
                is TaskResult.Success -> {
                    _uiState.value = TaskUiState(tasks = result.data)
                }
                is TaskResult.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = result.message
                    )
                }
            }
        }
    }

    fun refreshTasks() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isRefreshing = true, error = null)
            when (val result = taskRepository.getTasks()) {
                is TaskResult.Success -> {
                    _uiState.value = TaskUiState(tasks = result.data)
                }
                is TaskResult.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isRefreshing = false,
                        error = result.message
                    )
                }
            }
        }
    }

    fun createTask(
        title: String,
        description: String?,
        dueDate: String?,
        priority: String,
        project: String
    ) {
        viewModelScope.launch {
            when (val result = taskRepository.createTask(title, description, dueDate, priority, project)) {
                is TaskResult.Success -> {
                    loadTasks()
                }
                is TaskResult.Error -> {
                    _uiState.value = _uiState.value.copy(error = result.message)
                }
            }
        }
    }

    fun updateTask(
        task: Task,
        title: String,
        description: String?,
        dueDate: String?,
        priority: String,
        project: String
    ) {
        viewModelScope.launch {
            when (val result = taskRepository.updateTask(
                task, title, description, dueDate, priority, project, task.completed
            )) {
                is TaskResult.Success -> {
                    loadTasks()
                }
                is TaskResult.Error -> {
                    _uiState.value = _uiState.value.copy(error = result.message)
                }
            }
        }
    }

    fun toggleTaskCompleted(task: Task) {
        viewModelScope.launch {
            when (val result = taskRepository.toggleTaskCompleted(task)) {
                is TaskResult.Success -> {
                    loadTasks()
                }
                is TaskResult.Error -> {
                    _uiState.value = _uiState.value.copy(error = result.message)
                }
            }
        }
    }

    fun deleteTask(task: Task) {
        viewModelScope.launch {
            when (val result = taskRepository.deleteTask(task)) {
                is TaskResult.Success -> {
                    loadTasks()
                }
                is TaskResult.Error -> {
                    _uiState.value = _uiState.value.copy(error = result.message)
                }
            }
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}