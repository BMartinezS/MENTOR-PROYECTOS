# Configuración de Notificaciones Push

Esta guía explica cómo configurar completamente las notificaciones push para iOS y Android.

## ✅ Estado Actual

El código ya está implementado y listo:
- ✅ `notificationService.ts` - Servicio completo de notificaciones
- ✅ `NotificationContext.tsx` - Context para manejo de estado
- ✅ `app.json` - Plugins y permisos configurados
- ✅ `eas.json` - Configuración de builds
- ✅ Backend - Endpoints de notificaciones implementados

## 🚧 Configuración Pendiente

### 1. Configurar EAS Project ID

```bash
# En el directorio mobile/
cd "D:\Proyectos personales\mentor-proyectos\worktrees\mobile"

# Inicializar EAS (requiere cuenta Expo)
npx eas init

# Esto creará automáticamente el projectId en app.json
```

### 2. Configurar Push Notifications para iOS

#### a) Apple Developer Account
- Necesitas una cuenta Apple Developer ($99/año)
- Crear App ID en Apple Developer Portal
- Habilitar Push Notifications capability

#### b) Configurar APNs Key
```bash
# EAS manejará automáticamente los certificados
npx eas credentials

# Seleccionar iOS > Push Notifications > Configure
# EAS creará automáticamente el APNs key
```

#### c) Primera Build para iOS
```bash
# Build para desarrollo interno (TestFlight)
npx eas build --platform ios --profile preview
```

### 3. Configurar Push Notifications para Android

#### a) Firebase Cloud Messaging
- Crear proyecto en Firebase Console
- Habilitar Cloud Messaging API
- Descargar `google-services.json`

#### b) Configurar FCM Server Key
```bash
npx eas credentials

# Seleccionar Android > FCM Server Key
# Pegar el Server Key de Firebase Console
```

#### c) Primera Build para Android
```bash
# Build para desarrollo interno
npx eas build --platform android --profile preview
```

### 4. Testear Notificaciones

#### a) En Desarrollo
```typescript
// Desde la app móvil
import { notificationService } from './services/notificationService';

// Inicializar servicio
await notificationService.initialize();

// Enviar notificación de prueba
await notificationService.sendTestNotification();
```

#### b) Desde Backend
```bash
# Endpoint de prueba
POST /api/notifications/test
Authorization: Bearer {jwt_token}
```

## 🔧 Variables de Entorno

### Mobile (app.json)
```json
{
  "extra": {
    "apiUrl": "https://api.mentorproyectos.com/api",
    "eas": {
      "projectId": "tu-project-id-aqui"
    }
  }
}
```

### Backend (.env)
```env
# Ya configurado
EXPO_ACCESS_TOKEN=optional-for-batch-notifications
```

## 📱 Comandos Útiles

### Development Build con Push
```bash
# Build de desarrollo que incluye push notifications
npx eas build --platform ios --profile development --local
npx eas build --platform android --profile development --local
```

### Verificar Configuración
```bash
# Ver credenciales configuradas
npx eas credentials

# Ver project ID
npx expo config
```

### Debugging Push Notifications
```bash
# Logs en tiempo real
npx expo logs

# Ver tokens registrados en Expo
npx expo push:android:clear
npx expo push:ios:clear
```

## 🐛 Troubleshooting

### "No Expo project ID found"
- Ejecutar `npx eas init` en el directorio mobile
- Verificar que `app.json` tenga `extra.eas.projectId`

### "Push notifications don't work in simulator"
- Las notificaciones push solo funcionan en dispositivos físicos
- Usar TestFlight (iOS) o Internal Testing (Android)

### "APNs certificate expired"
- Ejecutar `npx eas credentials` y renovar certificados
- EAS maneja automáticamente la renovación

### "FCM Server Key invalid"
- Verificar que el Server Key de Firebase sea correcto
- Asegurarse de que Cloud Messaging API esté habilitado

## ✅ Testing Checklist

- [ ] Project ID configurado en EAS
- [ ] Certificados iOS configurados (APNs)
- [ ] FCM configurado para Android
- [ ] Build de desarrollo creada
- [ ] Notificaciones de prueba funcionando
- [ ] Deep linking desde notificaciones funcionando
- [ ] Notificaciones programadas del backend funcionando

## 🚀 Para Producción

### App Store (iOS)
- Build con profile `production`
- Upload automático a App Store Connect
- Configurar en App Store Connect > Features > Push Notifications

### Google Play (Android)
- Build con profile `production`
- Upload automático a Google Play Console
- Verificar que FCM esté habilitado

## 📋 Next Steps

1. Ejecutar `npx eas init` para obtener project ID
2. Configurar certificados con `npx eas credentials`
3. Crear primera build de desarrollo
4. Testear en dispositivo físico
5. Configurar notificaciones programadas en producción

---

**Nota**: Las notificaciones push requieren configuración externa (Apple Developer, Firebase) que no se puede automatizar completamente. Esta documentación guía a través de todos los pasos necesarios.