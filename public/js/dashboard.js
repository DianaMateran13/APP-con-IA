document.addEventListener('DOMContentLoaded', function() {
    // Obtener el email del usuario de la sesión (esto es un ejemplo, deberías implementar manejo de sesiones)
    const userEmail = localStorage.getItem('userEmail');

    if (userEmail) {
        fetch(`/user-data?email=${userEmail}`)
            .then(response => response.json())
            .then(userData => {
                const imc = calcularIMC(userData.peso, userData.estatura);
                const pesoIdeal = calcularPesoIdeal(userData.estatura).toFixed(1);
                const estadoPeso = interpretarIMC(imc);

                const userSummaryHTML = `
                    <h2>Resumen de tus datos</h2>
                    <p><strong>Nombre y Apellido:</strong> ${userData.nombre}</p>
                    <p><strong>Edad:</strong> ${userData.edad} años</p>
                    <p><strong>Peso:</strong> ${userData.peso} kg</p>
                    <p><strong>Estatura:</strong> ${userData.estatura} cm</p>
                    <p><strong>IMC:</strong> ${imc.toFixed(1)} (${estadoPeso})</p>
                    <p><strong>Peso Ideal:</strong> ${pesoIdeal} kg</p>
                `;

                document.getElementById('user-summary').innerHTML = userSummaryHTML;
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('user-summary').innerHTML = '<p>Error al cargar los datos del usuario</p>';
            });
    } else {
        document.getElementById('user-summary').innerHTML = '<p>Por favor, inicia sesión para ver tus datos</p>';
    }
});

function calcularIMC(peso, estatura) {
    return peso / Math.pow(estatura / 100, 2);
}

function interpretarIMC(imc) {
    if (imc < 18.5) return "Bajo peso";
    if (imc < 25) return "Peso normal";
    if (imc < 30) return "Sobrepeso";
    return "Obesidad";
}

function calcularPesoIdeal(estatura) {
    return 22.5 * Math.pow(estatura / 100, 2);
}
