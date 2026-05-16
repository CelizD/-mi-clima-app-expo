import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, ActivityIndicator } from 'react-native';

export default function App() {
  const [ciudad, setCiudad] = useState('');
  const [clima, setClima] = useState<any | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
const buscarClima = async () => {
    if (!ciudad.trim()) return; 
    setCargando(true); setError(null); setClima(null);

    try {
      // 1. Obtener coordenadas de la ciudad (Geocoding)
      // Usamos encodeURIComponent para ciudades con espacios como "Buenos Aires"
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(ciudad)}&count=1&language=es`);
      const geoData = await geoRes.json();
      
      if (!geoData.results) { throw new Error('Ciudad no encontrada'); }
      const { latitude, longitude, name } = geoData.results[0];

      // 2. Obtener el clima con esas coordenadas
      const climaRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`);
      const climaData = await climaRes.json();

      setClima({ nombre: name, temp: climaData.current.temperature_2m });
    } catch (err: any) {
      setError(err.message || 'Error al conectar.');
    } finally {
      setCargando(false);
    }
  };


  return (
    
<View style={styles.container}>
      <Text style={styles.titulo}>🌦️ Mi App del Clima</Text>

      <TextInput
        style={styles.input}
        placeholder="Escribe una ciudad"
        value={ciudad}
        onChangeText={setCiudad}
      />

      <Button title="Buscar Clima" onPress={buscarClima} />

      {cargando && <ActivityIndicator />}
      {error && <Text style={styles.errorText}>Error: {error}</Text>}
      
      {clima && (
        <View style={styles.climaContainer}>
          <Text style={styles.ciudadNombre}>{clima.nombre}</Text>
          <Text style={styles.temperatura}>{clima.temp}°C</Text>
        </View>
      )}
    </View>

  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  titulo: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
  climaContainer: { alignItems: 'center', marginTop: 20 },
  ciudadNombre: { fontSize: 20, fontWeight: '600' },
  temperatura: { fontSize: 48, fontWeight: 'bold', color: '#f59e0b' },
  errorText: { color: 'red', textAlign: 'center', marginTop: 10 }
});