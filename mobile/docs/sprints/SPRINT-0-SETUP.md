# Sprint 0: Setup y Fundamentos

**Duración**: 2-3 días  
**Objetivo**: Configurar infraestructura base del proyecto

---

## Entregables

### 1. Configuración de repositorio
- ✅ Estructura de carpetas creada
- ✅ Git inicializado
- ✅ .gitignore configurado

### 2. Backend inicial

**Setup**:
```powershell
cd backend
npm init -y
npm install express pg sequelize bcrypt jsonwebtoken dotenv cors helmet
npm install -D jest nodemon eslint prettier
```

**Archivos a crear**:

`backend/package.json` - Scripts:
```json
{
  "type": "module",
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",
    "test": "jest --coverage",
    "lint": "eslint src/"
  }
}
```

`backend/.env.example`:
```
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/mentor_proyectos
JWT_SECRET=change-this-secret
NODE_ENV=development
```

`backend/src/index.js`:
```javascript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
```

`backend/src/config/database.js`:
```javascript
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false
});

export default sequelize;
```

---

### 3. Mobile App inicial (React Native + Expo)

**Setup**:
```powershell
cd mobile
npx create-expo-app@latest . --template blank-typescript
npm install expo-router react-native-paper axios @react-native-async-storage/async-storage
```

**Configurar Expo Router**:

`mobile/app.json`:
```json
{
  "expo": {
    "name": "Mentor de Proyectos",
    "slug": "mentor-proyectos",
    "version": "1.0.0",
    "orientation": "portrait",
    "platforms": ["ios", "android"],
    "extra": {
      "apiUrl": "http://localhost:3000/api"
    },
    "plugins": [
      "expo-router"
    ]
  }
}
```

`mobile/app/_layout.tsx`:
```typescript
import { Stack } from 'expo-router';

export default function Layout() {
  return <Stack />;
}
```

`mobile/app/index.tsx`:
```typescript
import { View, Text, StyleSheet } from 'react-native';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mentor de Proyectos</Text>
      <Text style={styles.subtitle}>MVP en desarrollo...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
```

`mobile/tsconfig.json`:
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true
  }
}
```

---

### 4. AI Service inicial

**Setup**:
```powershell
cd ai-service
npm init -y
npm install express openai dotenv
npm install -D nodemon
```

`ai-service/.env.example`:
```
PORT=3001
OPENAI_API_KEY=sk-your-key-here
```

`ai-service/src/index.js`:
```javascript
import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json());

// Test endpoint
app.post('/test', async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Say 'AI Service OK'" }],
    });
    res.json({ message: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`AI Service running on port ${PORT}`);
});
```

---

### 5. Base de datos

**Setup PostgreSQL** (local):
```powershell
# Instalar PostgreSQL o usar Docker
docker run --name mentor-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15

# Crear base de datos
docker exec -it mentor-db psql -U postgres -c "CREATE DATABASE mentor_proyectos;"
```

`backend/migrations/001-initial-schema.sql`:
```sql
-- Ver DB-SCHEMA.md para schema completo
-- Ejecutar en orden: users, projects, objectives, phases, milestones, tasks, etc.
```

---

## Validación Sprint 0

### Tests:
- [ ] `npm run dev` en backend levanta servidor
- [ ] `npx expo start` en mobile muestra QR code
- [ ] Escanear QR en Expo Go app muestra pantalla inicial
- [ ] `npm run dev` en ai-service levanta servicio
- [ ] Conexión a PostgreSQL exitosa
- [ ] Health check `/health` responde OK

### Estructura final:
```
mentor-proyectos/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   └── index.js
│   ├── .env.example
│   └── package.json
├── mobile/
│   ├── app/
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   ├── app.json
│   ├── tsconfig.json
│   └── package.json
└── ai-service/
    ├── src/
    │   └── index.js
    ├── .env.example
    └── package.json
```

---

## Notas importantes Mobile

1. **Desarrollo local**: 
   - Backend debe ser accesible desde tu celular
   - Usa tu IP local en vez de localhost: `http://192.168.1.X:3000`
   - O usa túnel: `npx expo start --tunnel`

2. **Testing en dispositivo**:
   - Instala Expo Go desde Play Store/App Store
   - Escanea QR code
   - Hot reload funciona automáticamente

3. **Expo Router**:
   - File-based routing (como Next.js)
   - `app/index.tsx` = pantalla inicial
   - `app/(tabs)/` = navegación con tabs
   - `app/(auth)/` = pantallas de auth

---

## Deployment (Post-MVP)

Para desarrollo local sigue las instrucciones arriba. 

**Para deployment a producción** (después de completar todos los sprints):
- Ver `DEPLOYMENT.md` para guía completa de Hetzner VPS
- Incluye: Docker Compose, Nginx, SSL, backups, CI/CD

---

## Próximo paso
Una vez validado Sprint 0, continuar con **Sprint 1: Autenticación**