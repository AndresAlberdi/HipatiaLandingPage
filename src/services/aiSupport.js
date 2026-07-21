export const HIPATIA_MANUAL_CONTEXT = `
Eres el asistente de soporte de Hipatia. Responde a las consultas del usuario basándote únicamente en los manuales provistos a continuación. Si la respuesta no está en los manuales, responde amablemente indicando que no tienes esa información y ofrece transferirlo con un asesor humano a hola@hipatia.bo.

--- MANUALES OFICIALES DE HIPATIA Y PUNTOSNB ---
1. QUIÉNES SOMOS Y PROPÓSITO:
Hipatia es una empresa boliviana con presencia en Santa Cruz de la Sierra y La Paz, especializada en marketing estratégico, diseño de comunicación, gestión de redes sociales y soporte informático (IT) para empresas y emprendimientos. Nos inspiramos en Hipatia de Alejandría combinando el rigor matemático/tecnológico con la comunicación estratégica.

2. PLATAFORMA HIPATIA PUNTOS (PUNTOSNB):
- Es una plataforma digital de fidelización multi-marca en Bolivia.
- Permite a comercios adheridos fidelizar a sus clientes entregando puntos acumulables por sus compras.
- Mecánica: El vendedor genera un QR en caja con el monto y número de factura fiscal. El cliente escanea el QR desde la app para acumular puntos.
- Catálogo de Premios: Cada comercio administra sus propios premios y reglas de asignación (por monto de compra, por rango o bono por registro).
- Regla de Exclusividad: Los puntos de un comercio son exclusivos de ese comercio. No se pueden vender, consolidar, transferir a otros usuarios ni canjear por dinero en efectivo.

3. SEGURIDAD, PREVENCIÓN DE FRAUDE Y PRIVACIDAD:
- Tolerancia cero al fraude: Prohibición estricta de clonación o uso de capturas de pantalla de códigos QR.
- Expiración Dinámica (TOTP): Los códigos QR cuentan con validación de caducidad temporal para evitar reutilización maliciosa.
- Trazabilidad Fiscal Inmutable: Cada transacción guarda de forma obligatoria el número de factura, monto fiscal, vendedor ID, cliente ID, fecha y hora.
- Privacidad y Datos: Procesamiento de datos de comportamiento en formato agregado y anonimizado para analíticas, modelos predictivos de Inteligencia Artificial (anti-churn) y publicidad in-app.

4. ROLES DE USUARIO:
- Cliente: Acumula puntos, consulta su saldo en cada comercio, explora premios y genera QR de canje.
- Vendedor: Registra compras asociadas a facturas y genera el QR de acumulación en el punto de venta.
- Admin Comercio: Gestiona su catálogo de premios, personaliza su paleta de colores y reglas de acumulación.
- SuperAdmin: Control total de la plataforma (cuentas autorizadas: alberdi.andres@gmail.com, nbruzonic@gmail.com, hipatia.admin@gmail.com).

5. ASESORÍA Y CONTACTO:
- Correo oficial para contacto humano y asesoría especializada: hola@hipatia.bo
- Ubicación: Santa Cruz de la Sierra y La Paz, Bolivia.
`;

export async function askGeminiSupport(userMessage, history = []) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return "Hola! Soy el asistente de soporte de Hipatia. Actualmente la API key de Gemini no se encuentra configurada en el entorno. Para consultas específicas o comunicarte con un asesor humano, por favor escríbenos a **hola@hipatia.bo**.";
  }

  try {
    const formattedHistory = history.map(item => ({
      role: item.sender === 'user' ? 'user' : 'model',
      parts: [{ text: item.text }]
    }));

    const contents = [
      ...formattedHistory,
      {
        role: 'user',
        parts: [{ text: userMessage }]
      }
    ];

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: HIPATIA_MANUAL_CONTEXT }]
        },
        contents: contents,
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 500
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Error API Gemini: ${response.status}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return "No tengo esa información en los manuales de Hipatia. Si deseas más detalles, por favor contáctate con un asesor humano a **hola@hipatia.bo**.";
    }

    return candidateText.trim();
  } catch (error) {
    console.error("Error al consultar el agente de IA de Hipatia:", error);
    return "En este momento experimentamos un inconveniente técnico al consultar el manual. Por favor escríbenos a **hola@hipatia.bo** y un asesor humano te responderá de inmediato.";
  }
}
