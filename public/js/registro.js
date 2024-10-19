document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registro-form');
    
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        if (validarFormulario()) {
            const formData = new FormData(form);
            const userData = Object.fromEntries(formData);

            fetch('/registro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('¡Bienvenido!!! Ya estás registrado en Energy Fit, puedes iniciar sesión.');
                    window.location.href = '/login';
                } else {
                    alert('Error en el registro: ' + (data.message || 'Ocurrió un error desconocido'));
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Ocurrió un error durante el registro. Por favor, intenta de nuevo.');
            });
        }
    });
});

function validarFormulario() {
    const nombre = document.getElementById('nombre').value.trim();
    const edad = document.getElementById('edad').value;
    const peso = document.getElementById('peso').value;
    const estatura = document.getElementById('estatura').value;
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const telefono = document.getElementById('telefono').value.trim();
    const pais = document.getElementById('pais').value.trim();

    if (nombre === '' || edad === '' || peso === '' || estatura === '' || email === '' || password === '' || telefono === '' || pais === '') {
        alert('Por favor, completa todos los campos.');
        return false;
    }

    if (edad < 18 || edad > 120) {
        alert('La edad debe estar entre 18 y 120 años.');
        return false;
    }

    if (peso < 30 || peso > 300) {
        alert('El peso debe estar entre 30 y 300 kg.');
        return false;
    }

    if (estatura < 100 || estatura > 250) {
        alert('La estatura debe estar entre 100 y 250 cm.');
        return false;
    }

    if (!validarEmail(email)) {
        alert('Por favor, introduce un correo electrónico válido.');
        return false;
    }

    if (!validarContrasena(password)) {
        alert('La contraseña debe ser exactamente 5 números.');
        return false;
    }

    return true;
}

function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validarContrasena(contrasena) {
    // Verifica que la contraseña sea exactamente 5 números
    const regex = /^[0-9]{5}$/;
    return regex.test(contrasena);
}
