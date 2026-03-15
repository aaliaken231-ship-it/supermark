# Bonnes pratiques - SuperMark Android

## Architecture et Design Patterns

### MVVM (Model-View-ViewModel)
L'application utilise l'architecture MVVM pour la séparation des responsabilités :

- **Model** : Les entités de données (Room Entities)
- **View** : Les écrans Compose
- **ViewModel** : La logique métier et gestion d'état

### Injection de dépendances (Hilt)
```kotlin
@HiltViewModel
class MyViewModel @Inject constructor(
    private val repository: MyRepository
) : ViewModel() {
    // logique
}
```

## Gestion d'état

### Utiliser StateFlow pour l'état observable
```kotlin
private val _uiState = MutableStateFlow<UIState>(UIState.Loading)
val uiState: StateFlow<UIState> = _uiState.asStateFlow()
```

### Collecter l'état dans Compose
```kotlin
val state = viewModel.uiState.collectAsState()
```

## Coroutines et asynchrone

### Lancer une coroutine dans ViewModel
```kotlin
viewModelScope.launch {
    try {
        val data = repository.getData()
        _uiState.value = UIState.Success(data)
    } catch (e: Exception) {
        _uiState.value = UIState.Error(e.message)
    }
}
```

### Utiliser withContext pour changer de contexte
```kotlin
suspend fun getData() = withContext(Dispatchers.IO) {
    // Opération bloquante
}
```

## Base de données

### Créer une entité
```kotlin
@Entity(tableName = "my_table")
data class MyEntity(
    @PrimaryKey val id: String,
    val name: String,
    val createdAt: Long = System.currentTimeMillis()
)
```

### Créer un DAO
```kotlin
@Dao
interface MyDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(entity: MyEntity)

    @Query("SELECT * FROM my_table")
    fun getAll(): Flow<List<MyEntity>>
}
```

### Utiliser le repository
```kotlin
repository.getAllData().collect { data ->
    _uiState.value = UIState.Success(data)
}
```

## Interface utilisateur (Compose)

### Structurer les écrans
```kotlin
@Composable
fun MyScreen(navController: NavController) {
    Scaffold(
        topBar = { MyTopBar() },
        floatingActionButton = { MyFAB() }
    ) { paddingValues ->
        MyContent(modifier = Modifier.padding(paddingValues))
    }
}
```

### Préférer les états locaux pour l'UI
```kotlin
@Composable
fun MyField() {
    var value by remember { mutableStateOf("") }
    OutlinedTextField(value = value, onValueChange = { value = it })
}
```

### Émettre les événements via callbacks
```kotlin
@Composable
fun MyButton(onClick: () -> Unit) {
    Button(onClick = onClick) {
        Text("Click me")
    }
}
```

## Gestion des erreurs

### Créer des sealed classes pour les états
```kotlin
sealed class UIState {
    object Loading : UIState()
    data class Success(val data: MyData) : UIState()
    data class Error(val message: String) : UIState()
}
```

### Afficher les erreurs
```kotlin
when (state) {
    is UIState.Error -> {
        Snackbar(message = state.message)
    }
}
```

## Performance

### Éviter les recompositions inutiles
```kotlin
@Composable
fun MyScreen(viewModel: MyViewModel) {
    val items = viewModel.items.collectAsState().value
    // items.value change → recompose uniquement ce qui utilise items
}
```

### Utiliser remember pour les opérations coûteuses
```kotlin
@Composable
fun MyScreen() {
    val expensiveValue = remember { computeExpensiveValue() }
    // expensiveValue calculé une seule fois
}
```

### Pagination pour les listes longues
```kotlin
LazyColumn {
    items(items.take(20)) { item ->
        ItemRow(item)
    }
}
```

## Sécurité

### Chiffrer les données sensibles
```kotlin
val preferences = EncryptedSharedPreferences.create(
    context,
    "secret_prefs",
    MasterKey.Builder(context).build(),
    // encryption scheme
)
```

### Valider les entrées utilisateur
```kotlin
fun validateEmail(email: String): Boolean {
    return email.contains("@") && email.contains(".")
}
```

### Utiliser des transactions pour les opérations critiques
```kotlin
database.withTransaction {
    userDao.insert(user)
    licenseDao.insert(license)
}
```

## Testing

### Écrire des tests pour les ViewModels
```kotlin
@Test
fun testAddProduct() = runTest {
    viewModel.addProduct("Test Product", 10.0)
    advanceUntilIdle()
    assertEquals(1, viewModel.products.value.size)
}
```

### Utiliser des fakes pour les tests
```kotlin
class FakeRepository : MyRepository {
    override fun getData() = flow { emit(testData) }
}
```

## Logging

### Utiliser le logging approprié
```kotlin
private const val TAG = "MyFragment"

Log.d(TAG, "Debug message")
Log.e(TAG, "Error occurred", exception)
```

### Éviter le logging des données sensibles
```kotlin
// MAUVAIS
Log.d(TAG, "User password: $password")

// BON
Log.d(TAG, "User login attempt")
```

## Naming Conventions

### Classes
```kotlin
class UserViewModel    // PascalCase
class LoginActivity
class ProductRepository
```

### Fonctions et variables
```kotlin
fun getUserById(id: String)  // camelCase
var userName: String
val isLoading: Boolean
```

### Constantes
```kotlin
const val MAX_ITEMS = 100
const val API_BASE_URL = "https://api.example.com"
```

### Ressources
```kotlin
R.string.user_name
R.drawable.ic_user
R.color.primary
```

## Gestion de la mémoire

### Éviter les memory leaks
```kotlin
// MAUVAIS
val activity = context as Activity

// BON
val activity = context.asActivity()
```

### Utiliser viewModelScope
```kotlin
viewModelScope.launch {
    // Automatiquement annulé quand ViewModel est destroyed
}
```

## Documentation

### Commenter le code complexe
```kotlin
/// Calcule le hash SHA-256 de la chaîne
/// @param input La chaîne à hasher
/// @return Le hash SHA-256 en hexadécimal
fun sha256(input: String): String {
    // implémentation
}
```

### Utiliser des noms explicites
```kotlin
// MAUVAIS
fun u() { }

// BON
fun updateUserProfile() { }
```

## Contrôle de version

### Commits atomiques
```bash
git commit -m "Fix: handle null user in dashboard"
```

### Messages clairs
```
Format: <Type>: <description>

Types: Feature, Fix, Refactor, Docs, Test, Style
```

## Déploiement

### Versionning semantique
```
MAJOR.MINOR.PATCH
1.0.0 - Release initiale
1.1.0 - Nouvelle feature
1.0.1 - Bug fix
```

### BuildConfig pour les configurations
```kotlin
if (BuildConfig.DEBUG) {
    enableLogging()
}
```

---

En suivant ces bonnes pratiques, le code sera plus maintenable, performant et sécurisé.
