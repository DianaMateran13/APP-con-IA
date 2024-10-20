import OpenAI from 'openai';

// Inicializar el cliente de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Función para enviar una pregunta al asistente virtual
async function preguntarAsistente(pregunta) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: pregunta }],
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error al comunicarse con el asistente virtual:', error);
    return 'Lo siento, ha ocurrido un error al procesar tu pregunta.';
  }
}

export { preguntarAsistente };
