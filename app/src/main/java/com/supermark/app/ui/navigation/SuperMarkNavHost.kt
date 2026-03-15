package com.supermark.app.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.supermark.app.ui.screens.auth.LoginScreen
import com.supermark.app.ui.screens.auth.RegisterScreen
import com.supermark.app.ui.screens.dashboard.DashboardScreen
import com.supermark.app.ui.screens.products.ProductsScreen
import com.supermark.app.ui.screens.sales.SalesScreen
import com.supermark.app.ui.screens.customers.CustomersScreen
import com.supermark.app.ui.screens.settings.SettingsScreen
import com.supermark.app.viewmodel.AuthViewModel

@Composable
fun SuperMarkNavHost() {
    val navController = rememberNavController()
    val authViewModel: AuthViewModel = hiltViewModel()
    val authState = authViewModel.authState.collectAsState()

    LaunchedEffect(authState.value) {
        when (authState.value) {
            is AuthViewModel.AuthState.Authenticated -> {
                navController.navigate(Screen.Dashboard.route) {
                    popUpTo(Screen.Login.route) { inclusive = true }
                }
            }
            is AuthViewModel.AuthState.Unauthenticated -> {
                navController.navigate(Screen.Login.route) {
                    popUpTo(0) { inclusive = true }
                }
            }
            else -> {}
        }
    }

    NavHost(
        navController = navController,
        startDestination = Screen.Login.route
    ) {
        composable(Screen.Login.route) {
            LoginScreen(
                navController = navController,
                authViewModel = authViewModel
            )
        }

        composable(Screen.Register.route) {
            RegisterScreen(
                navController = navController,
                authViewModel = authViewModel
            )
        }

        composable(Screen.Dashboard.route) {
            DashboardScreen(
                navController = navController
            )
        }

        composable(Screen.Products.route) {
            ProductsScreen(
                navController = navController
            )
        }

        composable(Screen.Sales.route) {
            SalesScreen(
                navController = navController
            )
        }

        composable(Screen.Customers.route) {
            CustomersScreen(
                navController = navController
            )
        }

        composable(Screen.Settings.route) {
            SettingsScreen(
                navController = navController,
                authViewModel = authViewModel
            )
        }
    }
}

sealed class Screen(val route: String) {
    object Login : Screen("login")
    object Register : Screen("register")
    object Dashboard : Screen("dashboard")
    object Products : Screen("products")
    object Sales : Screen("sales")
    object Customers : Screen("customers")
    object Settings : Screen("settings")
}
