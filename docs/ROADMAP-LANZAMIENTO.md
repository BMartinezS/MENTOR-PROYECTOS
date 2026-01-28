# Roadmap de Lanzamiento - App Store & Play Store

**Fecha de creación**: 2025-01-24
**Objetivo**: Lanzar la app con monetización funcional lo antes posible
**Estado**: En planificación

---

## Estado Actual del Proyecto

| Componente | Estado | Completado |
|------------|--------|------------|
| Backend API | ✅ Funcional | 95% |
| Mobile App | ✅ Funcional | 85% |
| AI Service | ✅ Funcional | 100% |
| **Pagos/Suscripciones** | ❌ No existe | 0% |
| **Store Compliance** | ❌ No existe | 0% |

---

## 🔴 FASE 1: CRÍTICO PARA LANZAMIENTO (Bloquea release)

### 1.1 Sistema de Pagos con RevenueCat

**Por qué RevenueCat**: Maneja iOS/Android suscripciones sin backend propio, compliance automático, analytics de revenue.

| # | Tarea | Descripción | Estado |
|---|-------|-------------|--------|
| 1 | Integrar RevenueCat SDK | `expo install react-native-purchases` | ⬜ |
| 2 | Configurar productos en App Store Connect | Plan Pro Mensual $12, Anual $99 | ⬜ |
| 3 | Configurar productos en Google Play Console | Mismos productos | ⬜ |
| 4 | Crear Paywall UI | Pantalla de upgrade con comparativa Free/Pro | ⬜ |
| 5 | Sincronizar tier con backend | Webhook RevenueCat → Backend actualiza `user.tier` | ⬜ |
| 6 | Restaurar compras | Botón "Restore Purchases" obligatorio para iOS | ⬜ |
| 7 | Manejar estados de suscripción | Activa, Cancelada, Expirada, Grace Period | ⬜ |

### 1.2 Compliance para Stores

| # | Tarea | Descripción | Estado |
|---|-------|-------------|--------|
| 8 | Privacy Policy | Página web con política de privacidad (requerido) | ⬜ |
| 9 | Terms of Service | Términos de servicio (requerido) | ⬜ |
| 10 | EULA | Acuerdo de licencia de usuario | ⬜ |
| 11 | Data Deletion Request | Endpoint DELETE /api/users/me (GDPR/Apple requirement) | ⬜ |
| 12 | Age Gate | Declarar +13 años (COPPA) | ⬜ |
| 13 | App Icon & Assets | Iconos para todas las resoluciones iOS/Android | ⬜ |
| 14 | Screenshots para stores | 6.7", 6.5", 5.5" iPhone + tablets | ⬜ |
| 15 | App Store Description | Descripción optimizada con keywords | ⬜ |

### 1.3 Notificaciones Push (Completar)

| # | Tarea | Descripción | Estado |
|---|-------|-------------|--------|
| 16 | Configurar Expo Project ID | EAS Build setup | ⬜ |
| 17 | Configurar APNs (iOS) | Certificados Apple Push Notification | ⬜ |
| 18 | Configurar FCM (Android) | Firebase Cloud Messaging | ⬜ |
| 19 | Rebuild apps | `eas build --platform all` | ⬜ |
| 20 | Testing en dispositivos físicos | Verificar check-ins diarios llegan | ⬜ |

### 1.4 Onboarding Flow

| # | Tarea | Descripción | Estado |
|---|-------|-------------|--------|
| 21 | Pantalla de bienvenida | Explicar valor de la app (3-4 slides) | ⬜ |
| 22 | Permiso de notificaciones | Pedirlo con contexto ("para tus check-ins diarios") | ⬜ |
| 23 | Primer proyecto guiado | Tutorial interactivo creando primer proyecto | ⬜ |
| 24 | Upsell suave | Mostrar beneficios Pro sin ser agresivo | ⬜ |

### 1.5 Build & Deploy

| # | Tarea | Descripción | Estado |
|---|-------|-------------|--------|
| 25 | Configurar EAS Build para producción | eas.json con profiles de producción | ⬜ |
| 26 | Primer build TestFlight (iOS) | Internal testing | ⬜ |
| 27 | Primer build Internal Testing (Android) | Google Play internal track | ⬜ |
| 28 | Configurar dominio para backend producción | DNS + SSL en Hetzner | ⬜ |
| 29 | Deploy backend a producción | Docker + Nginx en VPS | ⬜ |

---

## 🟡 FASE 2: IMPORTANTE PARA RETENCIÓN (Post-launch inmediato)

### 2.1 UX/UI Polish

| # | Tarea | Descripción | Estado |
|---|-------|-------------|--------|
| 30 | Loading states consistentes | Skeletons en todas las pantallas | ⬜ |
| 31 | Error handling visual | Toasts/modals para errores | ⬜ |
| 32 | Pull-to-refresh | En dashboard, checkins, tareas | ⬜ |
| 33 | Animaciones de transición | React Native Reanimated | ⬜ |
| 34 | Empty states atractivos | Ilustraciones cuando no hay datos | ⬜ |
| 35 | Dark mode | Soporte para tema oscuro | ⬜ |

### 2.2 Funcionalidades Pro Completas

| # | Tarea | Descripción | Estado |
|---|-------|-------------|--------|
| 36 | UI edición de tareas | Modal para editar título, descripción, fechas | ⬜ |
| 37 | UI reordenar fases/tareas | Drag & drop con react-native-gesture-handler | ⬜ |
| 38 | UI comparar iteraciones | Side-by-side de versiones del plan | ⬜ |
| 39 | Configuración de check-ins | Elegir hora y frecuencia (Pro) | ⬜ |
| 40 | Analytics de progreso | Gráficos de velocidad, tendencias | ⬜ |

### 2.3 Deep Linking & Analytics

| # | Tarea | Descripción | Estado |
|---|-------|-------------|--------|
| 41 | Universal Links (iOS) | `mentor://project/123` | ⬜ |
| 42 | App Links (Android) | Igual | ⬜ |
| 43 | Links desde notificaciones | Abrir check-in específico | ⬜ |
| 44 | Integrar Mixpanel/Amplitude | Analytics de comportamiento | ⬜ |
| 45 | Integrar Sentry | Crash reporting | ⬜ |

---

## 🟢 FASE 3: ADICIONALES MONETIZABLES (Crecimiento)

### 3.1 Add-ons de Pago Único

| Adicional | Precio | Descripción | Estado |
|-----------|--------|-------------|--------|
| **Template Packs** | $4.99 | Plantillas pre-hechas por industria (SaaS, E-commerce, App) | ⬜ |
| **AI Deep Analysis** | $2.99/uso | Análisis detallado de por qué un proyecto está estancado | ⬜ |
| **Export to Notion/Trello** | $1.99 | Exportar plan a otras herramientas | ⬜ |
| **Priority AI** | $0.99/uso | GPT-4 en vez de GPT-4o-mini para análisis complejos | ⬜ |

### 3.2 Gamification

| # | Tarea | Descripción | Estado |
|---|-------|-------------|--------|
| 46 | Sistema de Streaks | Racha de check-ins respondidos | ⬜ |
| 47 | Badges/Logros | Logros desbloqueables | ⬜ |
| 48 | Milestones rewards | Descuentos Pro por completar proyectos | ⬜ |

### 3.3 Tier Enterprise (Futuro)

| Feature | Descripción | Estado |
|---------|-------------|--------|
| Team Projects | Proyectos compartidos con equipo | ⬜ |
| Admin Dashboard | Ver progreso de todo el equipo | ⬜ |
| Custom AI Training | IA entrenada con contexto de la empresa | ⬜ |
| SSO Integration | Login con Google Workspace, Okta | ⬜ |
| API Access | Para integraciones custom | ⬜ |

---

## 💰 Modelo de Monetización

### Tiers de Suscripción

```
┌─────────────────────────────────────────────────────────────┐
│                         FREE                                 │
├─────────────────────────────────────────────────────────────┤
│ • 1 proyecto activo                                         │
│ • 2 check-ins/semana                                        │
│ • 1 iteración de plan con IA                                │
│ • Ver tareas (sin editar)                                   │
│ • Push notifications básicas                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    PRO ($12/mes o $99/año)                  │
├─────────────────────────────────────────────────────────────┤
│ • Proyectos ilimitados                                      │
│ • Check-ins ilimitados + frecuencia personalizable          │
│ • Iteraciones de plan ilimitadas                            │
│ • Editar tareas, fases, milestones                          │
│ • Revisiones semanales detalladas                           │
│ • Analytics de progreso                                     │
│ • Soporte prioritario                                       │
└─────────────────────────────────────────────────────────────┘
```

### Adicionales (In-App Purchases)

```
┌─────────────────────────────────────────────────────────────┐
│                      ADICIONALES                            │
├─────────────────────────────────────────────────────────────┤
│ • Template Packs: $4.99 (pago único)                        │
│ • AI Deep Analysis: $2.99/uso                               │
│ • Export to Notion: $1.99 (pago único)                      │
│ • Priority AI (GPT-4): $0.99/uso                            │
└─────────────────────────────────────────────────────────────┘
```

### Métricas Objetivo

- **Conversión Free → Pro**: 15-20%
- **Trigger principal**: Límite de 1 proyecto alcanzado
- **Trigger secundario**: Querer más check-ins
- **Retention 30 días**: >60%

---

## 📋 Checklist de Lanzamiento

### Pre-Requisitos App Store (iOS)

- [ ] Apple Developer Account ($99/año)
- [ ] App Store Connect configurado
- [ ] Certificados de distribución
- [ ] Privacy Policy URL
- [ ] App Icon 1024x1024
- [ ] Screenshots todas las resoluciones
- [ ] App Review Information (demo account)
- [ ] Age Rating completado
- [ ] In-App Purchases configurados
- [ ] APNs configurado

### Pre-Requisitos Play Store (Android)

- [ ] Google Play Developer Account ($25 one-time)
- [ ] Play Console configurado
- [ ] Signing key (upload key)
- [ ] Privacy Policy URL
- [ ] Feature graphic 1024x500
- [ ] Screenshots todas las resoluciones
- [ ] Content rating completado
- [ ] In-App Products configurados
- [ ] FCM configurado

### Pre-Requisitos Backend

- [ ] Dominio configurado (ej: api.mentorproyectos.com)
- [ ] SSL certificado (Let's Encrypt)
- [ ] PostgreSQL en producción
- [ ] Variables de entorno producción
- [ ] Backups automáticos DB
- [ ] Monitoring (uptime)
- [ ] Rate limiting configurado
- [ ] CORS para producción

---

## 🗓️ Sprints Sugeridos

### Sprint A: Pagos & Compliance (Crítico)
- Tareas: 1-15
- Foco: RevenueCat + Legal pages + Delete account

### Sprint B: Notificaciones & Onboarding
- Tareas: 16-24
- Foco: Push notifications funcionales + Onboarding flow

### Sprint C: Build & Deploy
- Tareas: 25-29
- Foco: Primer build en stores + Backend producción

### Sprint D: Polish & Launch
- Tareas: 30-35
- Foco: UX polish + Submit a review

### Sprint E: Post-Launch Features
- Tareas: 36-45
- Foco: Features Pro completas + Analytics

### Sprint F: Monetización Adicional
- Tareas: 46+
- Foco: Add-ons + Gamification

---

## Notas Técnicas

### RevenueCat Setup

```bash
# Instalar SDK
npx expo install react-native-purchases

# Configurar en app
import Purchases from 'react-native-purchases';

Purchases.configure({
  apiKey: 'REVENUECAT_API_KEY',
  appUserID: userId // Sincronizar con tu user ID
});
```

### Webhook RevenueCat → Backend

```javascript
// POST /api/webhooks/revenuecat
// Actualiza user.tier cuando cambia suscripción
app.post('/api/webhooks/revenuecat', async (req, res) => {
  const { event } = req.body;

  if (event.type === 'INITIAL_PURCHASE' || event.type === 'RENEWAL') {
    await User.update({ tier: 'pro' }, { where: { id: event.app_user_id } });
  }

  if (event.type === 'EXPIRATION' || event.type === 'CANCELLATION') {
    await User.update({ tier: 'free' }, { where: { id: event.app_user_id } });
  }

  res.sendStatus(200);
});
```

### EAS Build Config

```json
// eas.json
{
  "build": {
    "production": {
      "distribution": "store",
      "ios": {
        "resourceClass": "m1-medium"
      },
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

---

## Referencias

- [RevenueCat Expo Guide](https://docs.revenuecat.com/docs/reactnative)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy Center](https://play.google.com/about/developer-content-policy/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)

---

**Última actualización**: 2025-01-24
**Próxima revisión**: 2025-01-25
