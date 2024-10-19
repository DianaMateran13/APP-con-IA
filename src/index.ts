import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import User from './models/User';
import fs from 'fs';

const app = express();
const port = 3001; // o cualquier otro puerto disponible

let mongodbUri = 'mongodb://localhost:27017/energyfit'; // URI por defecto

try {
  const compassConfigPath = path.join(__dirname, '..', 'compass-connections.json');
  const compassConfig = JSON.parse(fs.readFileSync(compassConfigPath, 'utf-8'));
  mongodbUri = compassConfig[0].uri;
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
      return res.status(400).json({ success: false, message: 'El correo electrónico ya está registrado' });
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
    const user = await User.findOne({ email, password });
    if (user) {
      console.log('Inicio de sesión exitoso para:', email);
      res.json({ success: true, message: 'Inicio de sesión exitoso', user: { nombre: user.nombre, email: user.email } });
    } else {
      console.log('Credenciales inválidas para:', email);
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
  // En una aplicación real, deberías verificar la autenticación aquí
  const email = req.query.email as string;
  try {
    const user = await User.findOne({ email });
    if (user) {
      res.json({
        nombre: user.nombre,
        edad: user.edad,
        peso: user.peso,
        estatura: user.estatura
      });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los datos del usuario' });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
