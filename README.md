# 🏥 Consultorio App

Sistema de gestión médica familiar para trabajadores de salud comunitaria. Permite registrar y administrar familias, integrantes, gestantes y estadísticas del consultorio, funcionando completamente **offline** sin necesidad de conexión a internet.

---

## 📱 Tecnologías

- **React Native 0.81.5** + **Expo 54** (New Architecture habilitada)
- **React 19.1.0** + **TypeScript**
- **Zustand v5** — estado global con persistencia automática
- **AsyncStorage** — almacenamiento local sin base de datos externa
- **React Navigation v7** — Stack + Bottom Tabs
- `expo-local-authentication` — autenticación biométrica
- `expo-image-picker` — foto de perfil
- `crypto-js` — hash SHA-256 para PIN
- **Jest + jest-expo** — pruebas unitarias

---

## 🚀 Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm start

# 3. Escanear el QR con Expo Go (Android/iOS)
```

### Otras opciones de ejecución

```bash
npm run android   # Android (emulador o dispositivo)
npm run ios       # iOS (requiere Mac + Xcode)
npm run web       # Navegador web

npm test          # Ejecutar tests
npm run test:watch    # Tests en modo watch
npm run test:coverage # Tests con cobertura
```

---

## 🗂️ Estructura del proyecto

```
CosultorioApp/
├── App.tsx                  # Componente raíz
├── index.ts                 # Punto de entrada
├── app.json                 # Configuración Expo
├── assets/                  # Íconos e imágenes
└── src/
    ├── components/          # Componentes reutilizables
    ├── hooks/               # Hooks personalizados
    ├── i18n/                # Internacionalización (ES / EN)
    ├── navigation/          # Navegadores (Root, Auth, App)
    ├── screens/             # 27 pantallas
    ├── services/            # Lógica de negocio y datos
    ├── stores/              # Stores Zustand
    ├── styles/              # Estilos separados por pantalla
    └── types/               # Tipos TypeScript globales
```

---

## ✅ Funcionalidades implementadas

### 🔐 Autenticación y seguridad

- Registro e inicio de sesión de médicos (multi-cuenta)
- Sesión persistente de 24 horas con validación automática
- Recuperación de contraseña offline por pregunta de seguridad
- Evaluador de fortaleza de contraseña (5 niveles: muy débil → muy fuerte)
- **PIN de 4-6 dígitos** hasheado con SHA-256, con bloqueo automático tras 3 intentos fallidos (5 minutos)
- **Autenticación biométrica** (huella digital / reconocimiento facial) vía `expo-local-authentication`
- Foto de perfil con `expo-image-picker`

### 👨‍👩‍👧‍👦 Gestión de familias

- Crear, editar y eliminar familias
- Campos: número, dirección, población, consultorio, manzana
- Vista de detalle por familia con sus integrantes
- CRUD completo de integrantes por familia:
  - Nombre, fecha de nacimiento (edad calculada automáticamente)
  - Sexo, raza, enfermedades
  - Grupo dispensarial (I, II, III, IV)

### 🔍 Búsqueda avanzada

- Búsqueda de integrantes con filtros combinables:
  - Nombre, dirección, edad (mínima/máxima), sexo, raza, enfermedad, población, consultorio, grupo dispensarial

### 📊 Estadísticas

- Resumen general: total de familias, integrantes, gestantes
- Distribución por grupo dispensarial (I–IV)
- Estadísticas del módulo PAMI

### 🤰 Módulo PAMI (Programa de Atención Materno Infantil)

- Gestión de **gestantes** con clasificación de riesgo:
  - **ARO** — Alto Riesgo Obstétrico
  - **BRO** — Bajo Riesgo Obstétrico
  - **RR** — Riesgo Relevante
- Cálculo automático de **FPP** (Fecha Probable de Parto) desde la FUM
- Cálculo automático de **edad gestacional** en semanas y días
- Validación de carnet de identidad cubano (11 dígitos)
- Seguimiento individual de cada gestante

### ⚙️ Configuración y personalización

- **Temas**: modo claro / oscuro
- **Idiomas**: Español e Inglés (sistema i18n propio)
- Configuración de PIN y biometría desde ajustes
- Perfil del médico editable (nombre, usuario, contraseña, foto, población, consultorio)

### 📋 Utilidades

- Manual de usuario integrado
- Soporte técnico
- Términos y condiciones
- Notificaciones con animación en el header (campanita con shake)

---

## 🧩 Stores Zustand

| Store | Responsabilidad |
|---|---|
| `authStore` | Sesión activa, datos del médico autenticado |
| `familiesStore` | Familias e integrantes (CRUD + persistencia) |
| `gestantesStore` | Gestantes con filtros y búsqueda |
| `searchStore` | Estado de búsqueda avanzada |
| `statsStore` | Estadísticas calculadas |
| `appStore` | Tema, idioma y configuración global |

---

## 🛠️ Servicios

| Servicio | Función |
|---|---|
| `AuthService` | Registro, login, sesión, perfil, recuperación de contraseña |
| `BiometricService` | Huella digital y reconocimiento facial |
| `PINService` | Gestión del PIN con hash y bloqueo por intentos |
| `StorageService` | Abstracción sobre AsyncStorage |
| `PAMIService` | Lógica del módulo materno infantil |
| `SeguimientoService` | Seguimiento de gestantes |
| `AgeCalculatorService` | Cálculo de edades desde `fechaNacimiento` |
| `AgeUpdateService` | Actualización automática de edades |
| `CacheService` | Caché en memoria para optimización |
| `AnalyticsService` | Métricas internas de uso |
| `AccessLogService` | Registro de accesos al sistema |
| `SoundService` | Efectos de sonido |
| `AppStateService` | Estado del ciclo de vida de la app |

---

## 🏛️ Navegación

```
RootNavigator
├── AuthNavigator  (si no hay sesión activa)
│   ├── LoginScreen
│   ├── RegisterScreen
│   └── RecuperarContrasenaScreen
└── AppNavigator   (con sesión activa)
    ├── Tab: FamiliasScreen → FamiliaDetalleScreen → Crear/Editar Familia / Integrante
    ├── Tab: BusquedaScreen
    ├── Tab: EstadisticasScreen
    ├── Tab: PAMIScreen → GestantesScreen → Crear/Editar/Seguimiento Gestante
    └── Tab: ConfiguracionScreen → Perfil, PIN, Biometría, Tema, Idioma, Manual...
```

---

## 🔒 Seguridad (notas para producción)

- Los datos residen completamente en el dispositivo (sin servidor)
- El PIN se almacena hasheado con SHA-256
- **Pendiente:** las contraseñas de médicos actualmente se guardan sin hash — se recomienda aplicar SHA-256 antes de un despliegue en producción

---

## 📋 Tests

```bash
npm test                  # Todos los tests
npm run test:coverage     # Con informe de cobertura
```

Tests ubicados en `src/__tests__/`:
- `stores/authStore.test.ts`
- `stores/familiesStore.test.ts`

---

**Desarrollado para trabajadores de salud comunitaria · Cuba**  
*Versión 1.0.0 — Expo + React Native*
