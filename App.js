import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Switch, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Video, ResizeMode } from 'expo-av';
// =====================================================================
// COMPONENTES REUTILIZABLES / NO SE ME VA A PASAR ESTA VEZ
// =====================================================================

// Componentes de los botones. Para que se cambie el estilo.
function CustomButton({ title, onPress, variant = 'primary', isDark }) {
  const variantStyles = {
    primary: isDark ? styles.btnPrimaryDark : styles.btnPrimaryLight,
    secondary: isDark ? styles.btnSecondaryDark : styles.btnSecondaryLight,
  };

  return (
    <TouchableOpacity style={[styles.button, variantStyles[variant]]} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

// El header con el swich, para los modos.
function ThemeHeader({ isDarkMode, onToggle }) {
  const textStyle = isDarkMode ? styles.textDark : styles.textLight;
  return (
    <View style={styles.header}>
      <View style={styles.headerTextBlock}>
        <Text style={[styles.title, textStyle]}>
          Sistema: {isDarkMode ? 'Modo Sigilo' : 'Modo No sigilo'}
        </Text>
        <Text style={[styles.headerQuestion, textStyle]}>
          ¿Que prefieres, La luz o la oscuridad?
        </Text>
        <Text style={[styles.headerPrompt, textStyle]}>
          Argumenta tu respuesta
        </Text>
      </View>
      <Switch 
        value={isDarkMode} 
        onValueChange={onToggle} 
        trackColor={{ false: "#767577", true: "#00d4ff" }}
        thumbColor={isDarkMode ? "#0a0e1a" : "#f4f3f4"}
      />
    </View>
  );
}

// =====================================================================
// COMPONENTE PRINCIPAL / Tiene lo que guarda de la respuesta, para luego cargarlo.
// =====================================================================

export default function App() {
  // State Management
  const [isDarkMode, setIsDarkMode] = useState(false); 
  const [inputText, setInputText] = useState('');
  const [savedText, setSavedText] = useState('');

  // Efecto secundario al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const valorAlmacenado = await AsyncStorage.getItem('@datos_mision');
      if (valorAlmacenado !== null) setSavedText(valorAlmacenado);
    } catch (error) {
      console.error("Error en la telemetría", error);
    }
  };

  const guardarDatos = async () => {
    if (inputText.trim() === '') return; // Valida que lo guardó
    try {
      await AsyncStorage.setItem('@datos_mision', inputText);
      setSavedText(inputText);
      setInputText(''); 
    } catch (error) {
      console.error("Error asegurando los datos", error);
    }
  };

  const borrarDatos = async () => {
    try {
      await AsyncStorage.removeItem('@datos_mision');
      setSavedText('');
    } catch (error) {
      console.error("Error purgando los datos", error);
    }
  };

  // Asignación dinámica de contenedor / esto tiene hartas ayuditas.
  const containerStyle = isDarkMode ? styles.containerDark : styles.containerLight;
  const inputStyle = isDarkMode ? styles.inputDark : styles.inputLight;
  const textStyle = isDarkMode ? styles.textDark : styles.textLight;

  return (
    <View style={[styles.baseContainer, containerStyle]}>
      
      <ThemeHeader isDarkMode={isDarkMode} onToggle={setIsDarkMode} />

      <TextInput
        style={[styles.input, inputStyle]}
        placeholder="Ingrese su respuesta..."
        placeholderTextColor={isDarkMode ? '#9aa0a6' : '#666'}
        value={inputText}
        onChangeText={setInputText}
      />
      {/* --- Alterna de video a imagen / parte de la creatividad --- */}
      <View style={styles.mediaContainer}>
        {isDarkMode ? (
          <Video
            style={styles.videoPlayer}
            source={require('./assets/video-oscuro.mp4')}
            useNativeControls
            shouldPlay
            resizeMode={ResizeMode.COVER}
            isLooping={false}
          />
        ) : (
          <Image
            source={require('./assets/wat.png')}
            style={styles.centerImage}
            resizeMode="contain"
          />
        )}
      </View>
       {/* ------------------------------------------- */}
      
      <View style={styles.buttonGroup}>
        <CustomButton 
          title="Asegurar Datos" 
          onPress={guardarDatos} 
          variant="primary" 
          isDark={isDarkMode} 
        />
        <CustomButton 
          title="Purgar" 
          onPress={borrarDatos} 
          variant="secondary" 
          isDark={isDarkMode} 
        />
      </View>

      {/* Renderizado Condicional */}
      {savedText.length > 0 ? (
        <View style={[styles.resultBox, isDarkMode ? styles.resultBoxDark : styles.resultBoxLight]}>
          <Text style={[styles.subtitle, textStyle]}>Último Reporte Asegurado:</Text>
          <Text style={[styles.resultValue, textStyle]}>{savedText}</Text>
        </View>
      ) : (
        <Text style={[styles.emptyText, textStyle]}>Sin reportes en la memoria local.</Text>
      )}

    </View>
  );
}

// =====================================================================
// HOJA DE ESTILOS / Los colores y estilos para cada modo, además de los componentes reutilizables.
// =====================================================================
const styles = StyleSheet.create({
  baseContainer: { flex: 1, padding: 24, justifyContent: 'center' },
  containerDark: { backgroundColor: '#0a0e1a' },
  containerLight: { backgroundColor: '#f0f2f5' },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  headerTextBlock: { flex: 1, paddingRight: 12 },
  title: { fontSize: 18, fontWeight: 'bold' },
  headerQuestion: { marginTop: 4, fontSize: 14, opacity: 0.9 },
  headerPrompt: { marginTop: 6, fontSize: 12, fontStyle: 'italic', opacity: 0.85 },
  subtitle: { fontSize: 14, marginBottom: 8, opacity: 0.8 },
  
  input: { borderWidth: 1, padding: 16, borderRadius: 12, marginBottom: 20, fontSize: 16 },
  inputDark: { backgroundColor: '#1a1f2e', borderColor: '#00d4ff', color: '#e8eaed' },
  inputLight: { backgroundColor: '#ffffff', borderColor: '#ccc', color: '#333' },
  
  buttonGroup: { flexDirection: 'row', gap: 12, marginBottom: 30 },
  button: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  
  btnPrimaryDark: { backgroundColor: '#00d4ff' },
  btnPrimaryLight: { backgroundColor: '#0056b3' },
  btnSecondaryDark: { backgroundColor: '#ff006e' },
  btnSecondaryLight: { backgroundColor: '#dc3545' },
  
  resultBox: { padding: 20, borderRadius: 12, borderWidth: 1 },
  resultBoxDark: { backgroundColor: '#141824', borderColor: '#06ffa5' },
  resultBoxLight: { backgroundColor: '#ffffff', borderColor: '#28a745' },
  
  resultValue: { fontSize: 18, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 20, opacity: 0.5, fontStyle: 'italic' },
  
  textDark: { color: '#e8eaed' },
  textLight: { color: '#333333' },

  mediaContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },

  // --- ESTILO PARA LA IMAGEN CENTRAL / me costo que se centre ---
 // Estilo para la Imagen
  centerImage: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 30,
  },

  // Estilo para el Reproductor de Video
  videoPlayer: {
    width: 500,
    height: 220,
    alignSelf: 'center',
    borderRadius: 12,
  },
});