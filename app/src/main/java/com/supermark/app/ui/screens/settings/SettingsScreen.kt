package com.supermark.app.ui.screens.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Card
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.supermark.app.R
import com.supermark.app.ui.navigation.Screen
import com.supermark.app.viewmodel.AuthViewModel

@Composable
fun SettingsScreen(
    navController: NavController,
    authViewModel: AuthViewModel
) {
    val authState = authViewModel.authState.collectAsState()
    val user = (authState.value as? AuthViewModel.AuthState.Authenticated)?.user

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.settings_title)) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = null)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .padding(paddingValues)
                .padding(16.dp)
        ) {
            // User Profile Section
            item {
                Card(
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            Icons.Default.Person,
                            contentDescription = null,
                            modifier = Modifier.width(40.dp)
                        )
                        Spacer(modifier = Modifier.width(16.dp))
                        Column(
                            modifier = Modifier.weight(1f)
                        ) {
                            Text(
                                text = user?.name ?: "User",
                                style = MaterialTheme.typography.titleMedium,
                                color = MaterialTheme.colorScheme.onBackground
                            )
                            Text(
                                text = user?.email ?: "",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        Icon(Icons.Default.ArrowForward, contentDescription = null)
                    }
                }
                Spacer(modifier = Modifier.height(16.dp))
            }

            // Settings Sections
            item {
                SettingsSection(
                    title = stringResource(R.string.settings_license),
                    icon = Icons.Default.Settings,
                    onClick = { /* TODO: Show license info */ }
                )
            }

            item {
                Spacer(modifier = Modifier.height(16.dp))
            }

            item {
                Divider()
            }

            item {
                Spacer(modifier = Modifier.height(16.dp))
            }

            // Logout Button
            item {
                TextButton(
                    onClick = {
                        authViewModel.logout()
                        navController.navigate(Screen.Login.route) {
                            popUpTo(0) { inclusive = true }
                        }
                    },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(
                        Icons.Default.Logout,
                        contentDescription = null,
                        modifier = Modifier.width(24.dp),
                        tint = MaterialTheme.colorScheme.error
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        stringResource(R.string.settings_logout),
                        color = MaterialTheme.colorScheme.error
                    )
                }
            }
        }
    }
}

@Composable
private fun SettingsSection(
    title: String,
    icon: androidx.compose.material.icons.Icons,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    icon,
                    contentDescription = null,
                    modifier = Modifier.width(24.dp)
                )
                Spacer(modifier = Modifier.width(16.dp))
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onBackground
                )
            }
            Icon(Icons.Default.ArrowForward, contentDescription = null)
        }
    }
}
