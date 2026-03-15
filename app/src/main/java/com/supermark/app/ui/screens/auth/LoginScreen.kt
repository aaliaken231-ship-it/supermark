package com.supermark.app.ui.screens.auth

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
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.supermark.app.R
import com.supermark.app.ui.navigation.Screen
import com.supermark.app.viewmodel.AuthViewModel

@Composable
fun LoginScreen(
    navController: NavController,
    authViewModel: AuthViewModel
) {
    val email = remember { mutableStateOf("") }
    val password = remember { mutableStateOf("") }
    val passwordVisible = remember { mutableStateOf(false) }
    val loading = authViewModel.loading.collectAsState()
    val error = authViewModel.error.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(error.value) {
        error.value?.let {
            snackbarHostState.showSnackbar(it)
            authViewModel.clearError()
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = stringResource(R.string.login_title),
            style = MaterialTheme.typography.displaySmall,
            color = MaterialTheme.colorScheme.onBackground,
            modifier = Modifier.padding(bottom = 32.dp)
        )

        OutlinedTextField(
            value = email.value,
            onValueChange = { email.value = it },
            label = { Text(stringResource(R.string.login_email)) },
            leadingIcon = { Icon(Icons.Default.Email, contentDescription = null) },
            modifier = Modifier.fillMaxWidth(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = password.value,
            onValueChange = { password.value = it },
            label = { Text(stringResource(R.string.login_password)) },
            leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null) },
            trailingIcon = {
                IconButton(onClick = { passwordVisible.value = !passwordVisible.value }) {
                    Icon(
                        if (passwordVisible.value) Icons.Default.Visibility
                        else Icons.Default.VisibilityOff,
                        contentDescription = null
                    )
                }
            },
            modifier = Modifier.fillMaxWidth(),
            visualTransformation = if (passwordVisible.value) VisualTransformation.None
            else PasswordVisualTransformation(),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(8.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = stringResource(R.string.login_forgot_password),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.primary,
                modifier = Modifier.clickable {
                    // TODO: Implement forgot password
                }
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = {
                authViewModel.login(email.value, password.value)
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp),
            enabled = !loading.value && email.value.isNotEmpty() && password.value.isNotEmpty()
        ) {
            if (loading.value) {
                CircularProgressIndicator(
                    modifier = Modifier
                        .padding(8.dp),
                    color = MaterialTheme.colorScheme.onPrimary
                )
            } else {
                Text(stringResource(R.string.login_button))
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Center
        ) {
            Text(
                text = stringResource(R.string.login_register),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onBackground,
                modifier = Modifier.clickable {
                    navController.navigate(Screen.Register.route)
                }
            )
        }
    }

    SnackbarHost(hostState = snackbarHostState)
}
