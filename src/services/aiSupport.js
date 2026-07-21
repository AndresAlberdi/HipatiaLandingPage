export const HIPATIA_MANUAL_CONTEXT = `
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
  const cleanMsg = (userMessage || '').toLowerCase().trim();

  // 1. Intentar llamar a Gemini API si existe API Key
  if (apiKey) {
    const modelsToTry = ['gemini-2.0-flash', 'gemini-2.5-flash-lite', 'gemini-1.5-flash-latest'];
    
    for (const model of modelsToTry) {
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

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: `Eres el asistente de soporte de Hipatia. Responde a las consultas del usuario basándote únicamente en los manuales provistos a continuación. Si la respuesta no está en los manuales, responde amablemente indicando que no tienes esa información y ofrece transferirlo con un asesor humano a hola@hipatia.bo.\n\n${HIPATIA_MANUAL_CONTEXT}` }]
            },
            contents: contents,
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 400
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            return candidateText.trim();
          }
        }
      } catch (err) {
        // Continuar al siguiente modelo o fallback RAG local
      }
    }
  }

  // 2. Fallback Inteligente Zero-Database RAG Local basado en el Manual Oficial
  return queryLocalManualRAG(cleanMsg);
}

function queryLocalManualRAG(query) {
  if (query.includes('puntos') || query.includes('funciona') || query.includes('puntosnb')) {
    return "💡 **Hipatia Puntos (PuntosNB)** es una plataforma digital de fidelización multi-marca en Bolivia. Los comercios entregan puntos acumulables por compras. El vendedor genera un QR en caja con la factura fiscal y el cliente lo escanea desde su app. Los puntos son exclusivos de cada comercio y no se pueden canjear por dinero.";
  }

  if (query.includes('fraude') || query.includes('seguridad') || query.includes('qr') || query.includes('totp') || query.includes('clon')) {
    return "🔒 **Seguridad y Anti-Fraude**: Hipatia opera con **tolerancia cero al fraude**. Los códigos QR integran **expiración dinámica (TOTP)** de pocos segundos para evitar capturas de pantalla o clonación. Cada transacción guarda obligatoriamente el número de factura, monto fiscal, vendedor y cliente.";
  }

  if (query.includes('rol') || query.includes('roles') || query.includes('usuario') || query.includes('admin') || query.includes('vendedor')) {
    return "👥 **Roles de Usuario en Hipatia**: \n- **Cliente**: Acumula puntos, consulta saldos y canjea premios.\n- **Vendedor**: Registra ventas con factura y genera QR en caja.\n- **Admin Comercio**: Configura premios y reglas de puntos.\n- **SuperAdmin**: Control global (alberdi.andres@gmail.com, nbruzonic@gmail.com, hipatia.admin@gmail.com).";
  }

  if (query.includes('contacto') || query.includes('humano') || query.includes('correo') || query.includes('email') || query.includes('soporte') || query.includes('hola') || query.includes('donde')) {
    return "✉️ Puedes contactar a un asesor humano de Hipatia en **hola@hipatia.bo**. Estamos ubicados en **Santa Cruz de la Sierra y La Paz, Bolivia**.";
  }

  if (query.includes('que es') || query.includes('quienes') || query.includes('hipatia') || query.includes('servicios') || query.includes('marketing') || query.includes('it')) {
    return "🚀 **Hipatia**: Empresa boliviana especializada en marketing estratégico, diseño de comunicación, gestión de redes sociales y soporte informático (IT) integral para empresas y emprendimientos en Santa Cruz y La Paz.";
  }

  return "No tengo esa información específica en los manuales de Hipatia. Por favor contáctate con un asesor humano escribiéndonos a **hola@hipatia.bo**.";
}
