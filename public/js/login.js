document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('login-form');
    
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const formData = new FormData(form);
        const userData = Object.fromEntries(formData);

        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                localStorage.setItem('userEmail', userData.email);
                alert('Inicio de sesión exitoso');
                window.location.href = '/dashboard';
            } else {
                alert('Error en el inicio de sesión: ' + (data.message || 'Credenciales inválidas'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Ocurrió un error durante el inicio de sesión. Por favor, intenta de nuevo.');
        });
    });
});
