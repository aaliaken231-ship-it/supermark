package com.supermark.app.ui.screens.license

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.supermark.app.R
import com.supermark.app.viewmodel.AuthViewModel
import com.supermark.app.viewmodel.LicenseViewModel
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun LicenseScreen(
    navController: NavController,
    authViewModel: AuthViewModel,
    licenseViewModel: LicenseViewModel
) {
    val authState = authViewModel.authState.collectAsState()
    val licenseState = licenseViewModel.licenseState.collectAsState()
    val daysRemaining = licenseViewModel.daysRemaining.collectAsState()
    val isValid = licenseViewModel.isLicenseValid.collectAsState()

    val userId = (authState.value as? AuthViewModel.AuthState.Authenticated)?.user?.id

    LaunchedEffect(userId) {
        if (userId != null) {
            licenseViewModel.loadLicenseForUser(userId)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.settings_license)) },
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
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                when (val state = licenseState.value) {
                    is LicenseViewModel.LicenseState.Loading -> {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(32.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            CircularProgressIndicator()
                        }
                    }

                    is LicenseViewModel.LicenseState.Success -> {
                        val license = state.license
                        val progress = daysRemaining.value / 30f

                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(
                                containerColor = if (isValid.value) {
                                    MaterialTheme.colorScheme.secondaryContainer
                                } else {
                                    MaterialTheme.colorScheme.errorContainer
                                }
                            )
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(20.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Icon(
                                    if (isValid.value) Icons.Default.CheckCircle else Icons.Default.Error,
                                    contentDescription = null,
                                    modifier = Modifier.size(48.dp),
                                    tint = if (isValid.value) {
                                        MaterialTheme.colorScheme.onSecondaryContainer
                                    } else {
                                        MaterialTheme.colorScheme.onErrorContainer
                                    }
                                )

                                Spacer(modifier = Modifier.height(12.dp))

                                Text(
                                    text = if (isValid.value) "Licence Active" else "Licence Expirée",
                                    style = MaterialTheme.typography.titleLarge,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isValid.value) {
                                        MaterialTheme.colorScheme.onSecondaryContainer
                                    } else {
                                        MaterialTheme.colorScheme.onErrorContainer
                                    }
                                )

                                Spacer(modifier = Modifier.height(8.dp))

                                Text(
                                    text = license.plan.uppercase(),
                                    style = MaterialTheme.typography.labelLarge,
                                    color = if (isValid.value) {
                                        MaterialTheme.colorScheme.onSecondaryContainer.copy(0.7f)
                                    } else {
                                        MaterialTheme.colorScheme.onErrorContainer.copy(0.7f)
                                    }
                                )

                                Spacer(modifier = Modifier.height(16.dp))

                                // Progress bar
                                Column(modifier = Modifier.fillMaxWidth()) {
                                    Text(
                                        text = "${daysRemaining.value} jours restants",
                                        style = MaterialTheme.typography.bodySmall,
                                        modifier = Modifier.fillMaxWidth(),
                                        textAlign = TextAlign.Center,
                                        color = if (isValid.value) {
                                            MaterialTheme.colorScheme.onSecondaryContainer
                                        } else {
                                            MaterialTheme.colorScheme.onErrorContainer
                                        }
                                    )
                                    Spacer(modifier = Modifier.height(8.dp))
                                    LinearProgressIndicator(
                                        progress = progress.coerceIn(0f, 1f),
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .height(8.dp),
                                        trackColor = if (isValid.value) {
                                            MaterialTheme.colorScheme.secondary.copy(0.3f)
                                        } else {
                                            MaterialTheme.colorScheme.error.copy(0.3f)
                                        }
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // License Details
                        Card(modifier = Modifier.fillMaxWidth()) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(
                                    text = "Détails de la Licence",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold
                                )

                                Spacer(modifier = Modifier.height(12.dp))
                                Divider()
                                Spacer(modifier = Modifier.height(12.dp))

                                LicenseDetailRow("ID Licence", license.id)
                                Spacer(modifier = Modifier.height(8.dp))

                                LicenseDetailRow(
                                    "Clé Licence",
                                    license.key.chunked(4).joinToString("-")
                                )
                                Spacer(modifier = Modifier.height(8.dp))

                                LicenseDetailRow("Plan", license.plan.uppercase())
                                Spacer(modifier = Modifier.height(8.dp))

                                LicenseDetailRow("Statut", license.status)
                                Spacer(modifier = Modifier.height(8.dp))

                                LicenseDetailRow(
                                    "Utilisateurs Max",
                                    license.maxUsers.toString()
                                )
                                Spacer(modifier = Modifier.height(8.dp))

                                LicenseDetailRow(
                                    "Produits Max",
                                    license.maxProducts.toString()
                                )
                                Spacer(modifier = Modifier.height(8.dp))

                                LicenseDetailRow(
                                    "Ventes/Mois Max",
                                    license.maxSalesPerMonth.toString()
                                )
                                Spacer(modifier = Modifier.height(8.dp))

                                LicenseDetailRow(
                                    "Date Expiration",
                                    SimpleDateFormat(
                                        "dd/MM/yyyy",
                                        Locale.getDefault()
                                    ).format(Date(license.expiresAt))
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Action Buttons
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            OutlinedButton(
                                onClick = {
                                    licenseViewModel.extendLicense(license.id, 30)
                                },
                                modifier = Modifier
                                    .weight(1f)
                                    .height(48.dp)
                            ) {
                                Icon(
                                    Icons.Default.Refresh,
                                    contentDescription = null,
                                    modifier = Modifier
                                        .size(18.dp)
                                        .padding(end = 8.dp)
                                )
                                Text("Renouveler")
                            }

                            Button(
                                onClick = {
                                    // TODO: Implement download license functionality
                                },
                                modifier = Modifier
                                    .weight(1f)
                                    .height(48.dp)
                            ) {
                                Icon(
                                    Icons.Default.Download,
                                    contentDescription = null,
                                    modifier = Modifier
                                        .size(18.dp)
                                        .padding(end = 8.dp)
                                )
                                Text("Télécharger")
                            }
                        }
                    }

                    is LicenseViewModel.LicenseState.NoLicense -> {
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(8.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = MaterialTheme.colorScheme.tertiaryContainer
                            )
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(20.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Icon(
                                    Icons.Default.Info,
                                    contentDescription = null,
                                    modifier = Modifier.size(48.dp),
                                    tint = MaterialTheme.colorScheme.onTertiaryContainer
                                )

                                Spacer(modifier = Modifier.height(12.dp))

                                Text(
                                    text = "Aucune Licence Active",
                                    style = MaterialTheme.typography.titleLarge,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onTertiaryContainer
                                )

                                Spacer(modifier = Modifier.height(8.dp))

                                Text(
                                    text = "Activez une licence pour accéder à tous les services",
                                    style = MaterialTheme.typography.bodyMedium,
                                    textAlign = TextAlign.Center,
                                    color = MaterialTheme.colorScheme.onTertiaryContainer.copy(0.8f)
                                )

                                Spacer(modifier = Modifier.height(20.dp))

                                Button(
                                    onClick = {
                                        if (userId != null) {
                                            licenseViewModel.createTrialLicense(userId, 30)
                                        }
                                    },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(48.dp)
                                ) {
                                    Text("Créer Licence d'Essai 30j")
                                }
                            }
                        }
                    }

                    is LicenseViewModel.LicenseState.Error -> {
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(8.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = MaterialTheme.colorScheme.errorContainer
                            )
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(20.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Icon(
                                    Icons.Default.Error,
                                    contentDescription = null,
                                    modifier = Modifier.size(48.dp),
                                    tint = MaterialTheme.colorScheme.onErrorContainer
                                )

                                Spacer(modifier = Modifier.height(12.dp))

                                Text(
                                    text = "Erreur",
                                    style = MaterialTheme.typography.titleLarge,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onErrorContainer
                                )

                                Spacer(modifier = Modifier.height(8.dp))

                                Text(
                                    text = (state as LicenseViewModel.LicenseState.Error).message,
                                    style = MaterialTheme.typography.bodyMedium,
                                    textAlign = TextAlign.Center,
                                    color = MaterialTheme.colorScheme.onErrorContainer.copy(0.8f)
                                )

                                Spacer(modifier = Modifier.height(20.dp))

                                Button(
                                    onClick = {
                                        if (userId != null) {
                                            licenseViewModel.loadLicenseForUser(userId)
                                        }
                                    },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(48.dp)
                                ) {
                                    Text("Réessayer")
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun LicenseDetailRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.SemiBold,
            color = MaterialTheme.colorScheme.onBackground
        )
    }
}
