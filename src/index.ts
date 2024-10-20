import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import User from './models/User';
import fs from 'fs';
import multer from 'multer';
import sharp from 'sharp';
import OpenAI from 'openai';

// Cargar variables de entorno
dotenv.config();

const app = express();
const port = 3001; // o cualquier otro puerto disponible

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
    res.status(500).json({ success: false, message: 'Error al actualizar el perfil', error: error.message });
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

app.post('/ask-assistant', async (req, res) => {
  try {
    const { question } = req.body;
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: question }],
    });

    res.json({ answer: completion.choices[0].message.content });
  } catch (error) {
    console.error('Error al comunicarse con el asistente virtual:', error);
    res.status(500).json({ error: 'Error al procesar la pregunta' });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
