package com.example.taskmanager

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.testTagsAsResourceId
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.taskmanager.data.TokenStore
import com.example.taskmanager.data.api.RetrofitClient
import com.example.taskmanager.data.repository.AuthRepository
import com.example.taskmanager.data.repository.TaskRepository
import com.example.taskmanager.ui.screens.ForgotPasswordScreen
import com.example.taskmanager.ui.screens.LoginScreen
import com.example.taskmanager.ui.screens.NewTaskScreen
import com.example.taskmanager.ui.screens.RegisterScreen
import com.example.taskmanager.ui.screens.TodayScreen
import com.example.taskmanager.ui.theme.TaskManagerTheme
import com.example.taskmanager.ui.viewmodel.AuthViewModel
import com.example.taskmanager.ui.viewmodel.AuthViewModelFactory
import com.example.taskmanager.ui.viewmodel.TaskViewModel
import com.example.taskmanager.ui.viewmodel.TaskViewModelFactory

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            TaskManagerTheme {
                TaskManagerApp()
            }
        }
    }
}

@OptIn(ExperimentalComposeUiApi::class)
@Composable
fun TaskManagerApp() {
    val context = androidx.compose.ui.platform.LocalContext.current
    val tokenStore = TokenStore(context)
    val authRepository = AuthRepository(RetrofitClient.apiService, tokenStore)
    val taskRepository = TaskRepository(RetrofitClient.apiService, tokenStore)

    val authViewModel: AuthViewModel = viewModel(
        factory = AuthViewModelFactory(authRepository)
    )
    val taskViewModel: TaskViewModel = viewModel(
        factory = TaskViewModelFactory(taskRepository)
    )

    val authState by authViewModel.uiState.collectAsState()
    val taskState by taskViewModel.uiState.collectAsState()
    val userName by tokenStore.userName.collectAsState(initial = null)

    val navController = rememberNavController()

    // Navigate based on auth state
    LaunchedEffect(authState.isAuthenticated) {
        if (authState.isAuthenticated) {
            navController.navigate("today") {
                popUpTo(0) { inclusive = true }
            }
        }
    }

    LaunchedEffect(authState.resetSuccess) {
        if (authState.resetSuccess) {
            authViewModel.resetState()
            navController.navigate("login") {
                popUpTo(0) { inclusive = true }
            }
        }
    }

    NavHost(
        navController = navController,
        startDestination = "login",
        modifier = Modifier.semantics { testTagsAsResourceId = true }
    ) {
        composable("login") {
            LoginScreen(
                isLoading = authState.isLoading,
                error = authState.error,
                onLogin = { email, password ->
                    authViewModel.login(email, password)
                },
                onNavigateToRegister = {
                    authViewModel.resetState()
                    navController.navigate("register")
                },
                onNavigateToForgotPassword = {
                    authViewModel.resetState()
                    navController.navigate("forgot")
                },
                onErrorDismiss = { authViewModel.clearError() }
            )
        }

        composable("register") {
            RegisterScreen(
                isLoading = authState.isLoading,
                error = authState.error,
                onRegister = { name, email, password ->
                    authViewModel.register(name, email, password)
                },
                onNavigateToLogin = {
                    authViewModel.resetState()
                    navController.popBackStack()
                },
                onErrorDismiss = { authViewModel.clearError() }
            )
        }

        composable("forgot") {
            ForgotPasswordScreen(
                isLoading = authState.isLoading,
                error = authState.error,
                codeSent = authState.forgotPasswordSent,
                devResetCode = authState.devResetCode,
                onRequestCode = { email ->
                    authViewModel.forgotPassword(email)
                },
                onResetPassword = { email, code, newPassword ->
                    authViewModel.resetPassword(email, code, newPassword)
                },
                onNavigateBack = {
                    authViewModel.resetState()
                    navController.popBackStack()
                },
                onErrorDismiss = { authViewModel.clearError() }
            )
        }

        composable("today") {
            TodayScreen(
                tasks = taskState.tasks,
                isLoading = taskState.isLoading,
                error = taskState.error,
                userName = userName,
                onToggleTask = { task -> taskViewModel.toggleTaskCompleted(task) },
                onDeleteTask = { task -> taskViewModel.deleteTask(task) },
                onAddTask = { navController.navigate("new_task") },
                onLogout = {
                    authViewModel.logout()
                    navController.navigate("login") {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }

        composable("new_task") {
            NewTaskScreen(
                onSave = { title, description, dueDate, priority, project ->
                    taskViewModel.createTask(title, description, dueDate, priority, project)
                    navController.popBackStack()
                },
                onBack = { navController.popBackStack() }
            )
        }
    }
}