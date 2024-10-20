import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import User from './models/User.js';
import fs from 'fs';
import multer from 'multer';
import sharp from 'sharp';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

let mongodbUri = 'mongodb://localhost:27017/energyfit'; // URI por defecto

try {
  const compassConfigPath = path.join(__dirname, '..', 'compass-connections.json');
  const compassConfig = JSON.parse(fs.readFileSync(compassConfigPath, 'utf-8'));
  if (compassConfig.connections && compassConfig.connections.length > 0) {
    mongodbUri = compassConfig.connections[0].connectionOptions.connectionString;
  }
} catch (error) {
  console.error('Error al leer el archivo de configuración:', error);
  console.log('Usando URI de conexión por defecto');
}

mongoose.connect(mongodbUri)
  .then(() => console.log('Conexión exitosa a MongoDB'))
  .catch(err => {
    console.error('Error de conexión a MongoDB:', err);
    process.exit(1);
  });

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
  console.log('Solicitud recibida en la ruta raíz');
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Agregar esta nueva ruta para la página de registro
app.get('/registro', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/registro.html'));
});

// Agregar esta nueva ruta POST para manejar el registro
app.post('/registro', async (req, res) => {
  try {
    console.log('Datos de registro recibidos:', req.body);
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      console.log('Intento de registro duplicado:', req.body.email);
      return res.status(400).json({ 
        success: false, 
        message: 'Este correo electrónico ya está registrado. Por favor, inicia sesión o utiliza otro correo electrónico.' 
      });
    }

    const newUser = new User(req.body);
    await newUser.save();
    console.log('Usuario registrado con éxito:', newUser);
    res.json({ success: true, message: 'Usuario registrado con éxito' });
  } catch (error: unknown) {
    console.error('Error al registrar el usuario:', error);
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: 'Error al registrar el usuario', error: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Error desconocido al registrar el usuario' });
    }
  }
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Agregar esta nueva ruta POST para manejar el inicio de sesión
app.post('/login', async (req, res) => {
  try {
    console.log('Datos de inicio de sesión recibidos:', req.body);
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    console.log('Usuario encontrado:', user);
    if (user) {
      console.log('Contraseña ingresada:', password);
      console.log('Contraseña almacenada:', user.password);
      console.log('¿Contraseñas coinciden?', user.password === password);
      if (user.password === password) {
        console.log('Inicio de sesión exitoso para:', email);
        res.json({ success: true, message: 'Inicio de sesión exitoso', user: { nombre: user.nombre, email: user.email } });
      } else {
        console.log('Contraseña incorrecta para:', email);
        res.status(400).json({ success: false, message: 'Credenciales inválidas' });
      }
    } else {
      console.log('Usuario no encontrado:', email);
      res.status(400).json({ success: false, message: 'Credenciales inválidas' });
    }
  } catch (error: unknown) {
    console.error('Error al iniciar sesión:', error);
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: 'Error al iniciar sesión', error: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Error desconocido al iniciar sesión' });
    }
  }
});

// Agregar esta nueva ruta para el dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

app.get('/user-data', async (req, res) => {
  const email = req.query.email as string;
  try {
    const user = await User.findOne({ email });
    if (user) {
      res.json({
        nombre: user.nombre,
        edad: user.edad,
        peso: user.peso,
        estatura: user.estatura,
        email: user.email,
        telefono: user.telefono,
        pais: user.pais,
        photoUrl: user.photoUrl
      });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener los datos del usuario:', error);
    res.status(500).json({ message: 'Error al obtener los datos del usuario' });
  }
});

// Ruta temporal para verificar usuario
app.get('/check-user/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (user) {
      res.json({ exists: true, user: { email: user.email, password: user.password } });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar usuario' });
  }
});

app.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      user.password = newPassword;
      await user.save();
      res.json({ success: true, message: 'Contraseña restablecida con éxito' });
    } else {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al restablecer la contraseña' });
  }
});

// Asegúrate de que la carpeta uploads exista y tenga los permisos correctos
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// En sistemas Unix, establece los permisos a 755 (rwxr-xr-x)
if (process.platform !== 'win32') {
    fs.chmodSync(uploadsDir, '755');
}

// Configuración de multer para subir fotos
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get('/perfil', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/perfil.html'));
});

app.post('/update-profile', async (req, res) => {
  try {
    const { email, ...updateData } = req.body;
    console.log('Actualizando perfil para:', email);
    console.log('Datos de actualización:', updateData);

    // Asegúrate de que la contraseña no esté vacía antes de actualizarla
    if (updateData.password === '') {
      delete updateData.password;
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log('Usuario no encontrado:', email);
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Actualizar los campos del usuario
    Object.assign(user, updateData);
    await user.save();

    console.log('Perfil actualizado con éxito:', user);
    res.json({ success: true, message: 'Perfil actualizado con éxito' });
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: 'Error al actualizar el perfil', error: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Error desconocido al actualizar el perfil' });
    }
  }
});

app.post('/upload-photo', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se subió ninguna foto' });
    }
    
    // Redimensionar la imagen
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 200, height: 200, fit: 'cover' })
      .toBuffer();

    const filename = Date.now() + '.jpg';
    const photoUrl = `/uploads/${filename}`;
    
    // Guardar la imagen redimensionada
    fs.writeFileSync(path.join(uploadsDir, filename), buffer);

    const email = req.body.email;
    const user = await User.findOneAndUpdate({ email }, { photoUrl }, { new: true });
    if (user) {
      res.json({ success: true, photoUrl, message: 'Foto subida con éxito' });
    } else {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error al subir la foto:', error);
    res.status(500).json({ success: false, message: 'Error al subir la foto' });
  }
});

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
console.log('GROQ API URL:', GROQ_API_URL);

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

app.post('/ask-assistant', async (req, res) => {
  try {
    const { question, context } = req.body;

    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY no está configurada');
    }

    let systemMessage = "Eres un asistente virtual útil y amigable.";
    if (context === 'entrenamiento') {
      systemMessage = "Eres un entrenador personal virtual especializado en crear planes de entrenamiento y responder preguntas sobre fitness y ejercicio.";
    }

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: question }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json() as GroqResponse;
    res.json({ answer: data.choices[0].message.content });

  } catch (error) {
    console.error('Error al comunicarse con el asistente virtual:', error);
    if (error instanceof Error) {
      res.status(500).json({ error: 'Error al procesar la pregunta', message: error.message });
    } else {
      res.status(500).json({ error: 'Error desconocido al procesar la pregunta' });
    }
  }
});

app.get('/entrenamiento', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/entrenamiento.html'));
});

async function testGroqApiConnection() {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "Hello, are you working?" }
        ]
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Groq API test successful. Response:', data);
    } else {
      console.error('Groq API test failed. Status:', response.status, 'StatusText:', response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
    }
  } catch (error) {
    console.error('Error testing Groq API connection:', error);
  }
}

// Llama a esta función cuando inicies tu servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
  console.log('GROQ_API_KEY:', GROQ_API_KEY ? 'Configurada' : 'No configurada');
  testGroqApiConnection();
});
