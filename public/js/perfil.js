import { preguntarAsistente } from './asistente-virtual.js';

document.addEventListener('DOMContentLoaded', function() {
    const userEmail = localStorage.getItem('userEmail');
    const form = document.getElementById('profile-form');
    const photoUpload = document.getElementById('photo-upload');
    const uploadButton = document.getElementById('upload-photo');
    const userPhoto = document.getElementById('user-photo');

    if (userEmail) {
        fetch(`/user-data?email=${userEmail}`)
            .then(response => response.json())
            .then(userData => {
                form.nombre.value = userData.nombre;
                form.edad.value = userData.edad;
                form.peso.value = userData.peso;
                form.estatura.value = userData.estatura;
                form.email.value = userData.email;
                form.telefono.value = userData.telefono;
                form.pais.value = userData.pais;
                if (userData.photoUrl) {
                    userPhoto.src = userData.photoUrl;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al cargar los datos del usuario');
            });
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(form);
        const userData = Object.fromEntries(formData);

        // Si la contraseña está vacía, no la enviamos
        if (userData.password === '') {
            delete userData.password;
        }

        fetch('/update-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Perfil actualizado con éxito');
            } else {
                alert('Error al actualizar el perfil: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Ocurrió un error al actualizar el perfil');
        });
    });

    uploadButton.addEventListener('click', function() {
        const file = photoUpload.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('photo', file);
            formData.append('email', userEmail);

            fetch('/upload-photo', {
                method: 'POST',
                body: formData,
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    userPhoto.src = data.photoUrl;
                    alert('Foto subida con éxito');
                } else {
                    alert('Error al subir la foto: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Ocurrió un error al subir la foto');
            });
        } else {
            alert('Por favor, selecciona una foto primero');
        }
    });

    // Funcionalidad para generar rutina
    const generarRutinaBtn = document.getElementById('generar-rutina');
    const rutinaActual = document.getElementById('rutina-actual');

    generarRutinaBtn.addEventListener('click', async () => {
        const respuesta = await preguntarAsistente('Genera una rutina de entrenamiento personalizada para mí');
        rutinaActual.innerHTML = `<h4>Tu Rutina Personalizada:</h4><p>${respuesta}</p>`;
    });

    // Funcionalidad para registrar actividad
    const registroActividadForm = document.getElementById('registro-actividad');
    const progresoActividad = document.getElementById('progreso-actividad');

    registroActividadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const ejercicio = document.getElementById('ejercicio').value;
        const repeticiones = document.getElementById('repeticiones').value;
        const series = document.getElementById('series').value;

        const nuevaActividad = document.createElement('p');
        nuevaActividad.textContent = `${ejercicio}: ${series} series de ${repeticiones} repeticiones`;
        progresoActividad.appendChild(nuevaActividad);

        // Limpiar el formulario
        registroActividadForm.reset();
    });

    // Manejar la interacción con el asistente virtual
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-question');
    const chatMessages = document.getElementById('chat-messages');

    sendButton.addEventListener('click', async () => {
        const pregunta = userInput.value.trim();
        if (pregunta) {
            // Mostrar la pregunta del usuario
            chatMessages.innerHTML += `<p><strong>Tú:</strong> ${pregunta}</p>`;
            
            // Obtener respuesta del asistente
            const respuesta = await preguntarAsistente(pregunta);
            
            // Mostrar la respuesta del asistente
            chatMessages.innerHTML += `<p><strong>Asistente:</strong> ${respuesta}</p>`;
            
            // Limpiar el campo de entrada
            userInput.value = '';
        }
    });
});
