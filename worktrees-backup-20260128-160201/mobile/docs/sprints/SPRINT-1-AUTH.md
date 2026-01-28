# Sprint 1: Autenticación

**Duración**: 2-3 días  
**Branch**: `feature/auth`

---

## Objetivo
Sistema completo de autenticación con JWT: registro, login, middleware de protección.

---

## Backend Tasks

### 1. Modelo User + Migrations
`backend/src/models/User.js`:
```javascript
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcrypt';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: { isEmail: true }
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: DataTypes.STRING,
  timezone: {
    type: DataTypes.STRING,
    defaultValue: 'America/Santiago'
  },
  tier: {
    type: DataTypes.ENUM('free', 'pro'),
    defaultValue: 'free'
  },
  preferences: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  timestamps: true,
  underscored: true
});

User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export default User;
```

### 2. Auth Service
`backend/src/services/auth-service.js`:
```javascript
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const register = async ({ email, password, name, timezone }) => {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error('Email already registered');
  }
  
  const passwordHash = await bcrypt.hash(password, 10);
  
  const user = await User.create({
    email,
    passwordHash,
    name,
    timezone
  });
  
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  return { user: user.toJSON(), token };
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  const isValid = await user.comparePassword(password);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }
  
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  return { user: user.toJSON(), token };
};
```

### 3. Auth Middleware
`backend/src/middleware/auth.js`:
```javascript
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

### 4. Auth Routes
`backend/src/routes/auth.js`:
```javascript
import express from 'express';
import * as AuthService from '../services/auth-service.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const result = await AuthService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const result = await AuthService.login(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/profile', authenticate, (req, res) => {
  res.json(req.user);
});

export default router;
```

Agregar a `src/index.js`:
```javascript
import authRoutes from './routes/auth.js';
app.use('/api/auth', authRoutes);
```

---

## Mobile Tasks (React Native + Expo)

### 1. Auth Context
`mobile/contexts/AuthContext.tsx`:
```typescript
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000/api';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadToken();
  }, []);
  
  const loadToken = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('token');
      if (savedToken) {
        setToken(savedToken);
        await fetchProfile(savedToken);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchProfile = async (authToken: string) => {
    try {
      const res = await axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setUser(res.data);
    } catch (error) {
      await logout();
    }
  };
  
  const login = async (email: string, password: string) => {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    const { token: newToken, user: newUser } = res.data;
    
    await AsyncStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  };
  
  const register = async (email: string, password: string, name: string) => {
    const res = await axios.post(`${API_URL}/auth/register`, { email, password, name });
    const { token: newToken, user: newUser } = res.data;
    
    await AsyncStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  };
  
  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 2. Login Screen
`mobile/app/(auth)/login.tsx`:
```typescript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const router = useRouter();
  
  const handleLogin = async () => {
    try {
      await login(email, password);
      router.replace('/(tabs)/dashboard');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Error al iniciar sesión');
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
        <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    marginTop: 20,
    textAlign: 'center',
    color: '#2563eb',
  },
});
```

### 3. Register Screen
`mobile/app/(auth)/register.tsx`:
Similar a Login, pero con campo adicional para `name` y llamada a `register()`.

### 4. Layout con Auth
`mobile/app/_layout.tsx`:
```typescript
import { Slot, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  
  useEffect(() => {
    if (loading) return;
    
    const inAuthGroup = segments[0] === '(auth)';
    
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)/dashboard');
    }
  }, [user, loading, segments]);
  
  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
```

### 5. API Configuration
`mobile/services/api.ts`:
```typescript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

## Criterios de aceptación
- [ ] Usuario puede registrarse con email/password desde mobile
- [ ] Usuario puede hacer login desde mobile
- [ ] JWT se genera correctamente (7 días expiración)
- [ ] Password hasheado con bcrypt
- [ ] Middleware auth protege rutas
- [ ] Mobile guarda token en AsyncStorage
- [ ] Navegación automática según estado de auth
- [ ] Tests backend pasan (80%+ coverage)
- [ ] App funciona en iOS y Android (Expo Go)

---

## Notas Mobile

**AsyncStorage vs localStorage**:
- AsyncStorage es asíncrono (requiere await)
- Persiste entre sesiones
- Funciona en iOS y Android

**Navigation Guards**:
- Expo Router maneja auth state automáticamente
- Redirect a login si no hay token
- Redirect a dashboard si ya está logueado

**Testing**:
- Probar en iOS y Android con Expo Go
- Validar que token persista al cerrar/abrir app

---

## Próximo paso
**Sprint 2: CRUD de Proyectos**