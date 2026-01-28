import { Stack } from 'expo-router';

export default function ProjectLayout() {
  return (
    <Stack>
      <Stack.Screen name="new" options={{ title: 'Nuevo proyecto' }} />
      <Stack.Screen name="manual" options={{ title: 'Crear manual' }} />
      <Stack.Screen name="ai" options={{ title: 'Crear con IA' }} />
      <Stack.Screen name="[id]" options={{ title: 'Proyecto' }} />
    </Stack>
  );
}

