# Consultorio App

Sistema de gestión médica familiar para trabajadores de salud comunitaria.

## 🚀 Inicio Rápido

### Instalar Expo Go en tu teléfono
- **Android**: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **iOS**: [App Store](https://apps.apple.com/app/expo-go/id982107779)

### Ejecutar la aplicación

```bash
# 1. Instalar dependencias (ya hecho)
npm install

# 2. Iniciar servidor de desarrollo
npm start

# 3. Escanear QR con Expo Go
# - Android: Escanear directamente con Expo Go
# - iOS: Escanear con cámara, abrir con Expo Go
```

## 📱 Opciones de Ejecución

```bash
# Desarrollo web (navegador)
npm run web

# Android (requiere emulador o dispositivo)
npm run android

# iOS (requiere Mac + Xcode)
npm run ios
```

## 🎯 Estado Actual

✅ **Completado:**
- Proyecto Expo inicializado
- Interfaz básica funcionando
- Configuración TypeScript
- Estructura de carpetas

🚧 **Próximos pasos:**
- Agregar React Navigation
- Implementar pantallas principales
- Configurar almacenamiento local
- Agregar funcionalidades médicas

## 🔧 Desarrollo

### Estructura del proyecto
```
ConsultorioAppExpo/
├── App.tsx              # Componente principal
├── app.json            # Configuración Expo
├── src/                # Código fuente (por crear)
│   ├── components/     # Componentes reutilizables
│   ├── screens/        # Pantallas de la app
│   ├── services/       # Lógica de negocio
│   └── types/          # Tipos TypeScript
└── assets/             # Imágenes e iconos
```

### Comandos útiles
```bash
# Ver logs detallados
npx expo start --dev-client

# Limpiar cache
npx expo start --clear

# Construir para producción
npx expo build:android
npx expo build:ios
```

## 📋 Funcionalidades Planificadas

### Core Features
- [ ] Gestión de familias
- [ ] Registro de integrantes
- [ ] Búsqueda avanzada
- [ ] Estadísticas médicas
- [ ] Funcionamiento offline

### Características Técnicas
- [ ] Base de datos local
- [ ] Sincronización opcional
- [ ] Seguridad de datos
- [ ] Interfaz intuitiva

---

**Desarrollado para trabajadores de salud comunitaria**
*Versión 1.0.0 - Expo*
