import { preguntarAsistente } from './asistente-virtual.js';

document.addEventListener('DOMContentLoaded', function() {
    const objetivosForm = document.getElementById('objetivos-form');
    const rutinaActual = document.getElementById('rutina-actual');
    const registroActividadForm = document.getElementById('registro-actividad');
    const progresoActividad = document.getElementById('progreso-actividad');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-question');
    const chatMessages = document.getElementById('chat-messages');

    objetivosForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nivel = document.getElementById('nivel').value;
        const objetivo = document.getElementById('objetivo').value;
        
        const prompt = `Genera una rutina de entrenamiento personalizada para un usuario de nivel ${nivel} con el objetivo principal de ${objetivo}. 
        La rutina debe incluir:
        1. Una breve introducción explicando cómo esta rutina se adapta al nivel y objetivo del usuario.
        2. Un plan semanal detallado con ejercicios específicos para cada día.
        3. Para cada ejercicio, especifica el número de series, repeticiones y descanso entre series.
        4. Incluye recomendaciones de calentamiento y enfriamiento.
        5. Añade consejos sobre la progresión y cómo ajustar la rutina con el tiempo.
        6. Menciona precauciones de seguridad relevantes para el nivel del usuario y los ejercicios recomendados.`;

        rutinaActual.innerHTML = '<p>Generando tu rutina personalizada...</p>';

        try {
            const respuesta = await preguntarAsistente(prompt);
            rutinaActual.innerHTML = `<h3>Tu Rutina Personalizada:</h3><div>${respuesta.replace(/\n/g, '<br>')}</div>`;
        } catch (error) {
            console.error('Error al generar la rutina:', error);
            rutinaActual.innerHTML = '<p>Lo siento, hubo un error al generar tu rutina. Por favor, intenta de nuevo más tarde.</p>';
        }
    });

    registroActividadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const ejercicio = document.getElementById('ejercicio').value;
        const repeticiones = document.getElementById('repeticiones').value;
        const series = document.getElementById('series').value;
        const fecha = document.getElementById('fecha').value;

        const nuevaActividad = document.createElement('p');
        nuevaActividad.textContent = `${fecha}: ${ejercicio} - ${series} series de ${repeticiones} repeticiones`;
        progresoActividad.appendChild(nuevaActividad);

        // Aquí puedes agregar código para guardar la actividad en la base de datos

        registroActividadForm.reset();
    });

    sendButton.addEventListener('click', async () => {
        const pregunta = userInput.value.trim();
        if (pregunta) {
            chatMessages.innerHTML += `<p><strong>Tú:</strong> ${pregunta}</p>`;
            
            try {
                const respuesta = await preguntarAsistente(pregunta);
                chatMessages.innerHTML += `<p><strong>Asistente:</strong> ${respuesta}</p>`;
            } catch (error) {
                console.error('Error al obtener respuesta del asistente:', error);
                chatMessages.innerHTML += `<p><strong>Asistente:</strong> Lo siento, hubo un error al procesar tu pregunta. Por favor, intenta de nuevo.</p>`;
            }
            
            userInput.value = '';
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    });
});
