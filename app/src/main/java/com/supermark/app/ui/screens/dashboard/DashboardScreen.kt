package com.supermark.app.ui.screens.dashboard

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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AttachMoney
import androidx.compose.material.icons.filled.Inventory
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.Receipt
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Card
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.supermark.app.R
import com.supermark.app.ui.navigation.Screen
import com.supermark.app.viewmodel.ProductViewModel
import com.supermark.app.viewmodel.SaleViewModel
import com.supermark.app.viewmodel.CustomerViewModel
import com.supermark.app.viewmodel.TransactionViewModel

@Composable
fun DashboardScreen(
    navController: NavController,
    productViewModel: ProductViewModel = hiltViewModel(),
    saleViewModel: SaleViewModel = hiltViewModel(),
    customerViewModel: CustomerViewModel = hiltViewModel(),
    transactionViewModel: TransactionViewModel = hiltViewModel()
) {
    val productCount = productViewModel.productCount.collectAsState()
    val saleCount = saleViewModel.saleCount.collectAsState()
    val totalSales = saleViewModel.totalSales.collectAsState()
    val customerCount = customerViewModel.customerCount.collectAsState()
    val balance = transactionViewModel.balance.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.dashboard_title)) },
                actions = {
                    IconButton(onClick = { navController.navigate(Screen.Settings.route) }) {
                        Icon(Icons.Default.Settings, contentDescription = null)
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
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Stats Row 1
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    DashboardStatCard(
                        title = "Ventes",
                        value = String.format("%.2f", totalSales.value),
                        icon = Icons.Default.AttachMoney,
                        modifier = Modifier.weight(1f),
                        onClick = { navController.navigate(Screen.Sales.route) }
                    )
                    DashboardStatCard(
                        title = "Balance",
                        value = String.format("%.2f", balance.value),
                        icon = Icons.Default.AttachMoney,
                        modifier = Modifier.weight(1f),
                        onClick = { /* TODO: Show transactions */ }
                    )
                }
            }

            // Stats Row 2
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    DashboardStatCard(
                        title = "Produits",
                        value = productCount.value.toString(),
                        icon = Icons.Default.Inventory,
                        modifier = Modifier.weight(1f),
                        onClick = { navController.navigate(Screen.Products.route) }
                    )
                    DashboardStatCard(
                        title = "Clients",
                        value = customerCount.value.toString(),
                        icon = Icons.Default.People,
                        modifier = Modifier.weight(1f),
                        onClick = { navController.navigate(Screen.Customers.route) }
                    )
                }
            }

            // Menu Items
            item {
                Spacer(modifier = Modifier.height(16.dp))
            }

            item {
                MenuCard(
                    icon = Icons.Default.Receipt,
                    title = "Gestion des ventes",
                    onClick = { navController.navigate(Screen.Sales.route) }
                )
            }

            item {
                MenuCard(
                    icon = Icons.Default.Inventory,
                    title = "Gestion des produits",
                    onClick = { navController.navigate(Screen.Products.route) }
                )
            }

            item {
                MenuCard(
                    icon = Icons.Default.People,
                    title = "Gestion des clients",
                    onClick = { navController.navigate(Screen.Customers.route) }
                )
            }
        }
    }
}

@Composable
fun DashboardStatCard(
    title: String,
    value: String,
    icon: androidx.compose.material.icons.Icons,
    modifier: Modifier = Modifier,
    onClick: () -> Unit = {}
) {
    Card(
        modifier = modifier
            .clickable { onClick() }
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                icon,
                contentDescription = null,
                modifier = Modifier.size(32.dp),
                tint = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.headlineSmall,
                color = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = title,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun MenuCard(
    icon: androidx.compose.material.icons.Icons,
    title: String,
    onClick: () -> Unit = {}
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
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                icon,
                contentDescription = null,
                modifier = Modifier.size(32.dp),
                tint = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.padding(16.dp))
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onBackground
            )
        }
    }
}
