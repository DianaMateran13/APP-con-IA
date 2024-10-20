// Función para enviar una pregunta al asistente virtual
async function preguntarAsistente(pregunta) {
  try {
    const response = await fetch('/ask-assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        question: pregunta,
        context: 'entrenamiento'
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.answer;
  } catch (error) {
    console.error('Error al comunicarse con el asistente virtual:', error);
    throw error;
  }
}

export { preguntarAsistente };
