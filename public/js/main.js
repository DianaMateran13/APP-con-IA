document.addEventListener('DOMContentLoaded', function() {
    const mensajes = [
        "¡Hoy es un gran día para estar saludable!",
        "Cada pequeño paso cuenta. ¡Sigue adelante!",
        "Tu cuerpo es tu hogar. Cuídalo bien.",
        "La salud es la verdadera riqueza."
    ];
    const mensajeElement = document.getElementById('mensaje-motivacional');
    mensajeElement.textContent = mensajes[Math.floor(Math.random() * mensajes.length)];
});
