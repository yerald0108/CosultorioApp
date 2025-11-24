# 🚀 Consultorio App - Instrucciones de Uso

## ✅ Estado Actual

**¡La aplicación está lista para funcionar!**

### Lo que ya está implementado:
- ✅ Proyecto Expo con TypeScript
- ✅ Estructura de carpetas organizada
- ✅ Pantalla de inicio funcional
- ✅ Servicio de almacenamiento local (AsyncStorage)
- ✅ Tipos TypeScript definidos
- ✅ Componente FamiliaCard básico

## 📱 Cómo Ejecutar la Aplicación

### 1. Actualizar dependencias
```bash
npm install
```

### 2. Iniciar servidor de desarrollo
```bash
npm start
```

### 3. Probar en dispositivo
- **Instala Expo Go** en tu teléfono
- **Escanea el QR** que aparece en la terminal
- **¡La app se abrirá en tu teléfono!**

### 4. Otras opciones
```bash
npm run web      # Abrir en navegador
npm run android  # Android (requiere emulador)
npm run ios      # iOS (requiere Mac)
```

## 🛠️ Próximos Pasos de Desarrollo

### Fase 1: Navegación (Siguiente)
```bash
# Instalar React Navigation
npx expo install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npx expo install react-native-screens react-native-safe-area-context
```

### Fase 2: Pantallas Principales
- Crear pantalla de lista de familias
- Crear formularios de registro
- Implementar pantalla de búsqueda
- Agregar pantalla de estadísticas

### Fase 3: Funcionalidades Avanzadas
- Sistema de búsqueda con filtros
- Exportación de datos
- Mejoras de UI/UX

## 📁 Estructura del Proyecto

```
ConsultorioAppExpo/
├── App.tsx                 # Componente principal ✅
├── src/
│   ├── components/         # Componentes reutilizables ✅
│   │   └── FamiliaCard.tsx # Tarjeta de familia ✅
│   ├── screens/            # Pantallas de la app ✅
│   │   └── HomeScreen.tsx  # Pantalla de inicio ✅
│   ├── services/           # Lógica de negocio ✅
│   │   └── StorageService.ts # Almacenamiento local ✅
│   ├── types/              # Tipos TypeScript ✅
│   │   └── index.ts        # Interfaces principales ✅
│   └── navigation/         # Navegación (por crear)
└── package.json            # Dependencias ✅
```

## 🎯 Funcionalidades Disponibles

### StorageService (Listo para usar)
```typescript
import { StorageService } from './src/services/StorageService';

// Crear familia
await StorageService.crearFamilia({
  numero: "001",
  poblacion: "Villa Nueva",
  consultorio: "Centro de Salud A"
});

// Obtener todas las familias
const familias = await StorageService.obtenerFamilias();

// Crear integrante
await StorageService.crearIntegrante({
  familiaId: "123",
  nombre: "Juan Pérez",
  edad: 35,
  sexo: "Masculino",
  raza: "Mestizo",
  enfermedades: ["Diabetes", "Hipertensión"]
});
```

## 🔄 Flujo de Desarrollo Recomendado

1. **Probar la app actual** - Asegúrate de que funciona
2. **Agregar navegación** - Instalar React Navigation
3. **Crear pantallas** - Una por una, probando cada una
4. **Conectar con StorageService** - Usar los métodos ya creados
5. **Mejorar UI** - Agregar iconos, colores, animaciones

## 🆘 Solución de Problemas

### Error de dependencias
```bash
npm install
npx expo install --fix
```

### Puerto ocupado
```bash
# El servidor usará automáticamente otro puerto
# O mata el proceso en puerto 8081
```

### Problemas de cache
```bash
npx expo start --clear
```

## 📞 Próxima Sesión

**Para continuar el desarrollo:**
1. Confirma que la app funciona en tu teléfono
2. Instala React Navigation
3. Crearemos las pantallas principales
4. Conectaremos todo con el StorageService

**¡Tu aplicación médica está funcionando! 🎉**
