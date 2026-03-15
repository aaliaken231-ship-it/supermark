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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Divider
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
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
    val clipboardManager = LocalClipboardManager.current
    
    val showDownloadDialog = remember { mutableStateOf(false) }
    val showRenewDialog = remember { mutableStateOf(false) }
    val showTrialDialog = remember { mutableStateOf(false) }
    val copyNotification = remember { mutableStateOf(false) }

    val userId = (authState.value as? AuthViewModel.AuthState.Authenticated)?.user?.id

    LaunchedEffect(userId) {
        if (userId != null) {
            licenseViewModel.loadLicenseForUser(userId)
        }
    }

    // Download Dialog
    if (showDownloadDialog.value) {
        AlertDialog(
            onDismissRequest = { showDownloadDialog.value = false },
            title = { Text("Télécharger la Licence") },
            text = {
                Column {
                    Text(
                        "Pour télécharger votre licence, veuillez contacter notre équipe support.",
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        "Email: support@supermark.com",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.primary,
                        fontFamily = FontFamily.Monospace
                    )
                }
            },
            confirmButton = {
                TextButton(onClick = { showDownloadDialog.value = false }) {
                    Text("Fermer")
                }
            }
        )
    }

    // Renew Dialog
    if (showRenewDialog.value) {
        AlertDialog(
            onDismissRequest = { showRenewDialog.value = false },
            title = { Text("Renouveler la Licence") },
            text = {
                Text(
                    "Voulez-vous renouveler votre licence pour 30 jours supplémentaires?",
                    style = MaterialTheme.typography.bodyMedium
                )
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        (licenseState.value as? LicenseViewModel.LicenseState.Success)?.license?.let {
                            licenseViewModel.extendLicense(it.id, 30)
                        }
                        showRenewDialog.value = false
                    }
                ) {
                    Text("Renouveler")
                }
            },
            dismissButton = {
                TextButton(onClick = { showRenewDialog.value = false }) {
                    Text("Annuler")
                }
            }
        )
    }

    // Trial Dialog
    if (showTrialDialog.value) {
        AlertDialog(
            onDismissRequest = { showTrialDialog.value = false },
            title = { Text("Créer une Licence d'Essai") },
            text = {
                Text(
                    "Vous allez créer une licence d'essai gratuite de 30 jours. Cette licence vous donnera accès à toutes les fonctionnalités de SuperMark.",
                    style = MaterialTheme.typography.bodyMedium
                )
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        if (userId != null) {
                            licenseViewModel.createTrialLicense(userId, 30)
                        }
                        showTrialDialog.value = false
                    }
                ) {
                    Text("Créer")
                }
            },
            dismissButton = {
                TextButton(onClick = { showTrialDialog.value = false }) {
                    Text("Annuler")
                }
            }
        )
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
                        val maxDays = if (license.plan == "trial") 30 else 365
                        val progress = (daysRemaining.value / maxDays.toFloat()).coerceIn(0f, 1f)
                        val planColor = when (license.plan.lowercase()) {
                            "trial" -> MaterialTheme.colorScheme.tertiary
                            "professional" -> MaterialTheme.colorScheme.secondary
                            "enterprise" -> MaterialTheme.colorScheme.primary
                            else -> MaterialTheme.colorScheme.secondary
                        }

                        // Status Card
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(
                                containerColor = if (isValid.value) {
                                    planColor.copy(alpha = 0.1f)
                                } else {
                                    MaterialTheme.colorScheme.errorContainer
                                }
                            ),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(24.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Icon(
                                    if (isValid.value) Icons.Default.CheckCircle else Icons.Default.Error,
                                    contentDescription = null,
                                    modifier = Modifier.size(56.dp),
                                    tint = if (isValid.value) planColor else MaterialTheme.colorScheme.error
                                )

                                Spacer(modifier = Modifier.height(16.dp))

                                Text(
                                    text = if (isValid.value) "Licence Active" else "Licence Expirée",
                                    style = MaterialTheme.typography.headlineSmall,
                                    fontWeight = FontWeight.Bold
                                )

                                Spacer(modifier = Modifier.height(8.dp))

                                Text(
                                    text = license.plan.uppercase(),
                                    style = MaterialTheme.typography.labelLarge,
                                    color = planColor,
                                    fontWeight = FontWeight.SemiBold
                                )

                                Spacer(modifier = Modifier.height(20.dp))

                                // Progress Section
                                Column(modifier = Modifier.fillMaxWidth()) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = "Validité",
                                            style = MaterialTheme.typography.labelMedium,
                                            color = MaterialTheme.colorScheme.onBackground.copy(0.7f)
                                        )
                                        Text(
                                            text = "${daysRemaining.value} / ${maxDays} jours",
                                            style = MaterialTheme.typography.labelMedium,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                    Spacer(modifier = Modifier.height(8.dp))
                                    LinearProgressIndicator(
                                        progress = progress,
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .height(10.dp),
                                        color = planColor,
                                        trackColor = MaterialTheme.colorScheme.surfaceVariant
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(20.dp))

                        // License Details Card
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Column(modifier = Modifier.padding(20.dp)) {
                                Text(
                                    text = "Détails de la Licence",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold
                                )

                                Spacer(modifier = Modifier.height(16.dp))
                                HorizontalDivider()
                                Spacer(modifier = Modifier.height(16.dp))

                                // License ID with Copy Button
                                LicenseDetailRowWithCopy(
                                    label = "ID Licence",
                                    value = license.id,
                                    onCopy = {
                                        clipboardManager.setText(AnnotatedString(license.id))
                                        copyNotification.value = true
                                    }
                                )

                                Spacer(modifier = Modifier.height(12.dp))

                                // License Key with Copy Button
                                LicenseDetailRowWithCopy(
                                    label = "Clé Licence",
                                    value = license.key.chunked(4).joinToString("-"),
                                    onCopy = {
                                        clipboardManager.setText(AnnotatedString(license.key))
                                        copyNotification.value = true
                                    }
                                )

                                Spacer(modifier = Modifier.height(12.dp))
                                HorizontalDivider()
                                Spacer(modifier = Modifier.height(12.dp))

                                // Plan and Status
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = "Plan",
                                            style = MaterialTheme.typography.labelSmall,
                                            color = MaterialTheme.colorScheme.onBackground.copy(0.6f)
                                        )
                                        Text(
                                            text = license.plan.uppercase(),
                                            style = MaterialTheme.typography.bodyMedium,
                                            fontWeight = FontWeight.SemiBold
                                        )
                                    }
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = "Statut",
                                            style = MaterialTheme.typography.labelSmall,
                                            color = MaterialTheme.colorScheme.onBackground.copy(0.6f)
                                        )
                                        Text(
                                            text = license.status.capitalize(),
                                            style = MaterialTheme.typography.bodyMedium,
                                            fontWeight = FontWeight.SemiBold,
                                            color = if (license.status == "active") {
                                                MaterialTheme.colorScheme.secondary
                                            } else {
                                                MaterialTheme.colorScheme.error
                                            }
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.height(16.dp))
                                HorizontalDivider()
                                Spacer(modifier = Modifier.height(16.dp))

                                // Limits
                                Text(
                                    text = "Limites du Plan",
                                    style = MaterialTheme.typography.labelMedium,
                                    fontWeight = FontWeight.SemiBold
                                )

                                Spacer(modifier = Modifier.height(8.dp))

                                LicenseDetailRow("Utilisateurs Max", license.maxUsers.toString())
                                Spacer(modifier = Modifier.height(6.dp))

                                LicenseDetailRow("Produits Max", license.maxProducts.toString())
                                Spacer(modifier = Modifier.height(6.dp))

                                LicenseDetailRow(
                                    "Ventes/Mois Max",
                                    license.maxSalesPerMonth.toString()
                                )

                                Spacer(modifier = Modifier.height(16.dp))
                                HorizontalDivider()
                                Spacer(modifier = Modifier.height(16.dp))

                                // Dates
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = "Date Création",
                                            style = MaterialTheme.typography.labelSmall,
                                            color = MaterialTheme.colorScheme.onBackground.copy(0.6f)
                                        )
                                        Text(
                                            text = SimpleDateFormat(
                                                "dd/MM/yyyy",
                                                Locale.getDefault()
                                            ).format(Date(license.createdAt)),
                                            style = MaterialTheme.typography.bodySmall
                                        )
                                    }
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = "Date Expiration",
                                            style = MaterialTheme.typography.labelSmall,
                                            color = MaterialTheme.colorScheme.onBackground.copy(0.6f)
                                        )
                                        Text(
                                            text = SimpleDateFormat(
                                                "dd/MM/yyyy",
                                                Locale.getDefault()
                                            ).format(Date(license.expiresAt)),
                                            style = MaterialTheme.typography.bodySmall,
                                            fontWeight = FontWeight.SemiBold
                                        )
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(20.dp))

                        // Action Buttons
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 16.dp),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            OutlinedButton(
                                onClick = { showRenewDialog.value = true },
                                modifier = Modifier
                                    .weight(1f)
                                    .height(50.dp),
                                shape = RoundedCornerShape(8.dp)
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
                                onClick = { showDownloadDialog.value = true },
                                modifier = Modifier
                                    .weight(1f)
                                    .height(50.dp),
                                shape = RoundedCornerShape(8.dp)
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
                            ),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(24.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Icon(
                                    Icons.Default.Info,
                                    contentDescription = null,
                                    modifier = Modifier.size(56.dp),
                                    tint = MaterialTheme.colorScheme.onTertiaryContainer
                                )

                                Spacer(modifier = Modifier.height(16.dp))

                                Text(
                                    text = "Aucune Licence Active",
                                    style = MaterialTheme.typography.headlineSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onTertiaryContainer
                                )

                                Spacer(modifier = Modifier.height(12.dp))

                                Text(
                                    text = "Activez une licence d'essai gratuite pour accéder à tous les services pendant 30 jours",
                                    style = MaterialTheme.typography.bodyMedium,
                                    textAlign = TextAlign.Center,
                                    color = MaterialTheme.colorScheme.onTertiaryContainer.copy(0.85f)
                                )

                                Spacer(modifier = Modifier.height(24.dp))

                                Button(
                                    onClick = { showTrialDialog.value = true },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(50.dp),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Icon(
                                        Icons.Default.CheckCircle,
                                        contentDescription = null,
                                        modifier = Modifier
                                            .size(18.dp)
                                            .padding(end = 8.dp)
                                    )
                                    Text("Créer Licence d'Essai 30j")
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(20.dp))

                        // Info Card
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = MaterialTheme.colorScheme.surface
                            )
                        ) {
                            Column(modifier = Modifier.padding(20.dp)) {
                                Text(
                                    text = "Plans Disponibles",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold
                                )

                                Spacer(modifier = Modifier.height(16.dp))

                                PlanInfoItem(
                                    name = "Essai",
                                    duration = "30 jours",
                                    maxUsers = "5",
                                    maxProducts = "500",
                                    maxSales = "10,000"
                                )

                                Spacer(modifier = Modifier.height(12.dp))
                                HorizontalDivider()
                                Spacer(modifier = Modifier.height(12.dp))

                                PlanInfoItem(
                                    name = "Professionnel",
                                    duration = "1 an",
                                    maxUsers = "10",
                                    maxProducts = "5,000",
                                    maxSales = "100,000"
                                )

                                Spacer(modifier = Modifier.height(12.dp))
                                HorizontalDivider()
                                Spacer(modifier = Modifier.height(12.dp))

                                PlanInfoItem(
                                    name = "Entreprise",
                                    duration = "1 an",
                                    maxUsers = "Illimité",
                                    maxProducts = "Illimité",
                                    maxSales = "Illimité"
                                )
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
                            ),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(24.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Icon(
                                    Icons.Default.Error,
                                    contentDescription = null,
                                    modifier = Modifier.size(56.dp),
                                    tint = MaterialTheme.colorScheme.error
                                )

                                Spacer(modifier = Modifier.height(16.dp))

                                Text(
                                    text = "Erreur",
                                    style = MaterialTheme.typography.headlineSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onErrorContainer
                                )

                                Spacer(modifier = Modifier.height(8.dp))

                                Text(
                                    text = (state as LicenseViewModel.LicenseState.Error).message,
                                    style = MaterialTheme.typography.bodyMedium,
                                    textAlign = TextAlign.Center,
                                    color = MaterialTheme.colorScheme.onErrorContainer.copy(0.85f)
                                )

                                Spacer(modifier = Modifier.height(24.dp))

                                Button(
                                    onClick = {
                                        if (userId != null) {
                                            licenseViewModel.loadLicenseForUser(userId)
                                        }
                                    },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(50.dp),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Icon(
                                        Icons.Default.Refresh,
                                        contentDescription = null,
                                        modifier = Modifier
                                            .size(18.dp)
                                            .padding(end = 8.dp)
                                    )
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

@Composable
private fun LicenseDetailRowWithCopy(
    label: String,
    value: String,
    onCopy: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = label,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onBackground.copy(0.6f)
            )
            SelectionContainer {
                Text(
                    text = value,
                    style = MaterialTheme.typography.bodySmall,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }
        }
        IconButton(onClick = onCopy, modifier = Modifier.size(40.dp)) {
            Icon(
                Icons.Default.ContentCopy,
                contentDescription = "Copier",
                modifier = Modifier.size(18.dp),
                tint = MaterialTheme.colorScheme.primary
            )
        }
    }
}

@Composable
private fun PlanInfoItem(
    name: String,
    duration: String,
    maxUsers: String,
    maxProducts: String,
    maxSales: String
) {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = name,
                    style = MaterialTheme.typography.labelLarge,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = duration,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onBackground.copy(0.6f)
                )
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = "• Max utilisateurs: $maxUsers",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onBackground.copy(0.7f)
        )
        Text(
            text = "• Max produits: $maxProducts",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onBackground.copy(0.7f)
        )
        Text(
            text = "• Max ventes/mois: $maxSales",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onBackground.copy(0.7f)
        )
    }
}
