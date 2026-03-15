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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
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
fun RegisterScreen(
    navController: NavController,
    authViewModel: AuthViewModel
) {
    val name = remember { mutableStateOf("") }
    val email = remember { mutableStateOf("") }
    val password = remember { mutableStateOf("") }
    val confirmPassword = remember { mutableStateOf("") }
    val passwordVisible = remember { mutableStateOf(false) }
    val confirmPasswordVisible = remember { mutableStateOf(false) }
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
            .padding(24.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.Top,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(32.dp))

        Text(
            text = stringResource(R.string.register_title),
            style = MaterialTheme.typography.displaySmall,
            color = MaterialTheme.colorScheme.onBackground,
            modifier = Modifier.padding(bottom = 32.dp)
        )

        OutlinedTextField(
            value = name.value,
            onValueChange = { name.value = it },
            label = { Text(stringResource(R.string.register_name)) },
            leadingIcon = { Icon(Icons.Default.Person, contentDescription = null) },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = email.value,
            onValueChange = { email.value = it },
            label = { Text(stringResource(R.string.register_email)) },
            leadingIcon = { Icon(Icons.Default.Email, contentDescription = null) },
            modifier = Modifier.fillMaxWidth(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = password.value,
            onValueChange = { password.value = it },
            label = { Text(stringResource(R.string.register_password)) },
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

        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = confirmPassword.value,
            onValueChange = { confirmPassword.value = it },
            label = { Text(stringResource(R.string.register_confirm_password)) },
            leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null) },
            trailingIcon = {
                IconButton(onClick = { confirmPasswordVisible.value = !confirmPasswordVisible.value }) {
                    Icon(
                        if (confirmPasswordVisible.value) Icons.Default.Visibility
                        else Icons.Default.VisibilityOff,
                        contentDescription = null
                    )
                }
            },
            modifier = Modifier.fillMaxWidth(),
            visualTransformation = if (confirmPasswordVisible.value) VisualTransformation.None
            else PasswordVisualTransformation(),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = {
                if (password.value == confirmPassword.value) {
                    authViewModel.register(name.value, email.value, password.value)
                } else {
                    // Show error
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp),
            enabled = !loading.value && 
                name.value.isNotEmpty() && 
                email.value.isNotEmpty() && 
                password.value.isNotEmpty() && 
                confirmPassword.value.isNotEmpty()
        ) {
            if (loading.value) {
                CircularProgressIndicator(
                    modifier = Modifier.padding(8.dp),
                    color = MaterialTheme.colorScheme.onPrimary
                )
            } else {
                Text(stringResource(R.string.register_button))
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Center
        ) {
            Text(
                text = stringResource(R.string.register_already_account),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onBackground,
                modifier = Modifier.clickable {
                    navController.popBackStack()
                }
            )
        }

        Spacer(modifier = Modifier.height(32.dp))
    }

    SnackbarHost(hostState = snackbarHostState)
}
