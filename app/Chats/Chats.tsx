import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Keyboard,
  FlatList,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';

interface Mensaje {
  id: string;
  usuario: {
    nombre: string;
    email: string;
    rol: string;
  };
  mensaje: string;
  timestamp: string;
  tipo: 'usuario' | 'soporte';
  leido: boolean;
}

interface UsuarioConectado {
  id: string;
  nombre: string;
  email: string;
  rol: string;
}

export default function ChatScreen() {
  const navigation = useNavigation();
  const [socket, setSocket] = useState<any>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [usuariosConectados, setUsuariosConectados] = useState<UsuarioConectado[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [usuarioEscribiendo, setUsuarioEscribiendo] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const flatListRef = useRef<FlatList | null>(null);
  
  // Información del usuario actual
  const [usuarioActual, setUsuarioActual] = useState({
    nombre: 'Guido',
    email: 'guidoagarcia1512@gmail.com',
    rol: 'usuario'
  });

  useEffect(() => {
    conectarSocket();
    
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const conectarSocket = async () => {
    try {
      // Conectar al servidor (cambia la IP por la de tu servidor)
      const newSocket = io('http://192.168.1.103:3000', {
        transports: ['websocket'],
      });

      newSocket.on('connect', () => {
        console.log('Conectado al chat');
        setIsConnected(true);
        
        // Enviar información del usuario
        newSocket.emit('usuario-conectado', usuarioActual);
      });

      newSocket.on('historial-mensajes', (historial: Mensaje[]) => {
        setMensajes(historial);
        setCargando(false);
        scrollToBottom();
      });

      newSocket.on('mensaje-recibido', (mensaje: Mensaje) => {
        setMensajes(prev => [...prev, mensaje]);
        scrollToBottom();
        
        // Si el mensaje es de soporte, marcar como leído
        if (mensaje.tipo === 'soporte') {
          newSocket.emit('marcar-leidos');
        }
      });

      newSocket.on('usuarios-actualizados', (usuarios: UsuarioConectado[]) => {
        setUsuariosConectados(usuarios);
      });

      newSocket.on('usuario-escribiendo', (data: { id: string; nombre: string }) => {
        setUsuarioEscribiendo(data.nombre);
        setTimeout(() => {
          setUsuarioEscribiendo(null);
        }, 3000);
      });

      newSocket.on('usuario-dejo-escribir', () => {
        setUsuarioEscribiendo(null);
      });

      newSocket.on('mensajes-leidos', () => {
        setMensajes(prev => prev.map(m => ({ ...m, leido: true })));
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        Alert.alert('Desconectado', 'Se perdió la conexión con el chat. Reconectando...');
        setTimeout(conectarSocket, 3000);
      });

      setSocket(newSocket);
    } catch (error) {
      console.log('Error conectando al chat:', error);
      setCargando(false);
      Alert.alert('Error', 'No se pudo conectar al chat');
    }
  };

  

  const enviarMensaje = () => {
    if (!nuevoMensaje.trim()) return;
    if (!isConnected) {
      Alert.alert('Error', 'No hay conexión con el chat');
      return;
    }

    socket.emit('nuevo-mensaje', {
      usuario: usuarioActual,
      mensaje: nuevoMensaje.trim(),
      tipo: 'usuario'
    });

    setNuevoMensaje('');
    Keyboard.dismiss();
  };

  const handleTyping = (text: string) => {
    setNuevoMensaje(text);
    
    if (!isTyping && text.length > 0) {
      setIsTyping(true);
      socket.emit('escribiendo', { nombre: usuarioActual.nombre });
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        socket.emit('dejo-de-escribir', { nombre: usuarioActual.nombre });
      }
    }, 1500);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatearFecha = (timestamp: string) => {
    const fecha = new Date(timestamp);
    const ahora = new Date();
    const diffHoras = Math.abs(ahora.getTime() - fecha.getTime()) / 36e5;
    
    if (diffHoras < 24) {
      return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else {
      return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  const renderMensaje = ({ item }: { item: Mensaje }) => {
    const esMio = item.usuario.email === usuarioActual.email;
    const esSoporte = item.tipo === 'soporte';
    
    return (
      <View style={[
        styles.mensajeContainer,
        esMio ? styles.mensajeMio : styles.mensajeOtro,
        esSoporte && styles.mensajeSoporte
      ]}>
        <View style={styles.mensajeHeader}>
          <Text style={styles.mensajeNombre}>{item.usuario.nombre}</Text>
          <Text style={styles.mensajeHora}>{formatearFecha(item.timestamp)}</Text>
        </View>
        <Text style={styles.mensajeTexto}>{item.mensaje}</Text>
        {esMio && item.leido && (
          <Text style={styles.mensajeLeido}>✓✓ Leído</Text>
        )}
      </View>
    );
  };


  const renderUsuarioConectado = ({ item }: { item: UsuarioConectado }) => (
    <View style={styles.usuarioConectadoItem}>
      <View style={styles.usuarioConectadoDot} />
      <Text style={styles.usuarioConectadoNombre}>{item.nombre}</Text>
      {item.rol === 'soporte' && (
        <View style={styles.soporteBadge}>
          <Text style={styles.soporteBadgeText}>Soporte</Text>
        </View>
      )}
    </View>
  );

  if (cargando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2b6777" />
        <Text style={styles.loadingText}>Conectando al chat...</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Chat de Soporte</Text>
          {isConnected && (
            <View style={styles.statusContainer}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Conectado</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.infoButton}>
          <Text style={styles.infoButtonText}>ℹ️</Text>
        </TouchableOpacity>
      </View>

      {/* Usuarios conectados */}
      {usuariosConectados.length > 0 && (
        <View style={styles.usuariosConectadosContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <FlatList
              data={usuariosConectados}
              renderItem={renderUsuarioConectado}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.usuariosList}
            />
          </ScrollView>
        </View>
      )}

      {/* Indicador de escribiendo */}
      {usuarioEscribiendo && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>{usuarioEscribiendo} está escribiendo...</Text>
        </View>
      )}

      {/* Mensajes */}
     <FlatList
  ref={flatListRef}
  data={mensajes}
  renderItem={renderMensaje}
  keyExtractor={item => item.id}
  contentContainerStyle={styles.mensajesList}
  onContentSizeChange={() => scrollToBottom()}
/>

      {/* Input area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={nuevoMensaje}
            onChangeText={handleTyping}
            placeholder="Escribe tu mensaje..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !nuevoMensaje.trim() && styles.sendButtonDisabled]}
            onPress={enviarMensaje}
            disabled={!nuevoMensaje.trim()}
          >
            <Text style={styles.sendButtonText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2b6777',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backArrow: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerInfo: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4caf50',
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    color: '#e0e0e0',
  },
  infoButton: {
    padding: 8,
  },
  infoButtonText: {
    fontSize: 24,
  },
  usuariosConectadosContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  usuariosList: {
    paddingHorizontal: 16,
  },
  usuarioConectadoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
  },
  usuarioConectadoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4caf50',
    marginRight: 8,
  },
  usuarioConectadoNombre: {
    fontSize: 14,
    color: '#333',
    marginRight: 8,
  },
  soporteBadge: {
    backgroundColor: '#2b6777',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  soporteBadgeText: {
    fontSize: 10,
    color: '#fff',
  },
  typingIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#e8f5e9',
  },
  typingText: {
    fontSize: 12,
    color: '#2b6777',
    fontStyle: 'italic',
  },
  mensajesList: {
    padding: 16,
    paddingBottom: 20,
  },
  mensajeContainer: {
    maxWidth: '80%',
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  mensajeMio: {
    alignSelf: 'flex-end',
    backgroundColor: '#2b6777',
  },
  mensajeOtro: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
  },
  mensajeSoporte: {
    backgroundColor: '#fff3e0',
    borderLeftWidth: 3,
    borderLeftColor: '#ff9800',
  },
  mensajeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  mensajeNombre: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  mensajeHora: {
    fontSize: 10,
    color: '#999',
  },
  mensajeTexto: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  mensajeLeido: {
    fontSize: 10,
    color: '#4caf50',
    textAlign: 'right',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 10,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2b6777',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    fontSize: 20,
    color: '#fff',
  },
});