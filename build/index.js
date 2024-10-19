"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const express_session_1 = __importDefault(require("express-session"));
const app = (0, express_1.default)();
// Configuración de la sesión
app.use((0, express_session_1.default)({
    secret: 'tu_secreto_aqui',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Cambia a true si usas HTTPS
}));
// Middleware para parsear el cuerpo de las solicitudes
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Configurar Express para servir archivos estáticos desde la carpeta 'public'
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// Ruta para la página de inicio
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../public/index.html'));
});
// Ruta para la página de registro
app.get('/registro', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../public/registro.html'));
});
// Ruta para procesar el registro
app.post('/registro', (req, res) => {
    // Aquí deberías implementar la lógica para guardar los datos del usuario en la base de datos
    console.log('Datos de registro recibidos:', req.body);
    // Simular la creación de un ID de usuario
    const userId = Math.floor(Math.random() * 1000000);
    // Establecer la sesión del usuario
    if (req.session) {
        req.session.userId = userId;
    }
    res.json({ success: true, message: 'Registro exitoso' });
});
// Ruta para cerrar sesión
app.get('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error al cerrar sesión:', err);
            }
            res.redirect('/');
        });
    }
    else {
        res.redirect('/');
    }
});
// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
