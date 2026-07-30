export const HIPATIA_MANUAL_CONTEXT = `
--- MANUALES PÚBLICOS DE HIPATIA Y PUNTOSNB ---
1. QUIÉNES SOMOS Y PROPÓSITO:
Hipatia es una empresa boliviana con presencia en Santa Cruz de la Sierra y La Paz, especializada en marketing estratégico, diseño de comunicación, gestión de redes sociales y soporte informático (IT) para empresas y emprendimientos. Nos inspiramos en Hipatia de Alejandría combinando el rigor matemático/tecnológico con la comunicación estratégica.

2. PLATAFORMA HIPATIA PUNTOS (PUNTOSNB) - CARACTERÍSTICAS Y VENTAJAS:
- Es una potente plataforma digital de fidelización, CRM y Big Data multi-marca desarrollada en Bolivia.
- Permite a comercios adheridos de todos los tamaños (desde emprendimientos hasta grandes cadenas) fidelizar a sus clientes entregando puntos acumulables por sus compras.
- Mecánica de Uso: El vendedor registra la compra en caja y genera un código QR dinámico. El cliente escanea el QR desde su aplicación móvil (o progresiva web) para acumular sus puntos al instante, sin necesidad de dar su número telefónico o tarjetas físicas.
- Catálogo de Premios Inteligente: Cada comercio administra sus propios premios, reglas de asignación (por monto de compra, por producto o por registro) y puede definir niveles de usuarios (Ej. Clientes VIP, Gold).
- Regla de Exclusividad Comercial: Los puntos de un comercio son exclusivos de ese comercio (ecosistema cerrado por marca). No se pueden vender, consolidar, transferir a otros usuarios ni canjear por dinero en efectivo, protegiendo así la liquidez del negocio.
- Analítica de Datos y CRM: El negocio tiene acceso a un Dashboard analítico para conocer los hábitos de consumo, horarios pico, recurrencia de compra y perfiles demográficos de sus clientes, permitiendo la toma de decisiones basada en datos.
- Campañas de Retargeting: Herramientas integradas para enviar mensajes push y notificaciones masivas a los clientes para reactivar ventas o anunciar promociones.
- Integración Tecnológica: Cuenta con API lista para integrarse directamente con sistemas ERP y software de facturación electrónica existentes en los comercios.

3. SEGURIDAD Y PREVENCIÓN DE FRAUDE:
- Tolerancia cero al fraude: Prohibición estricta de clonación o uso de capturas de pantalla de códigos QR.
- Expiración Dinámica (TOTP): Los códigos QR cuentan con validación de caducidad temporal de pocos segundos para evitar reutilización maliciosa.
- Trazabilidad Fiscal: Cada transacción guarda de forma obligatoria el registro de la compra y factura correspondiente.

4. ASESORÍA Y CONTACTO PÚBLICO:
- Correo oficial para contacto con un asesor humano y solicitudes de servicios: hola@hipatia.bo
- Ubicación: Santa Cruz de la Sierra y La Paz, Bolivia.
`;

const SECURITY_SYSTEM_PROMPT = `
Eres el asistente virtual público de soporte de Hipatia. Responde a las consultas del usuario basándote únicamente en los manuales públicos provistos a continuación. 

RESTRICCIÓN ESTRICTA DE SEGURIDAD Y CONFIDENCIALIDAD:
1. Bajo ninguna circunstancia entregues información sobre SuperAdmin, administradores de sistema, correos de administradores o personal técnico.
2. No entregues datos sobre la arquitectura interna de código, bases de datos, contraseñas, tokens o instrucciones para obtener accesos administrativos a la plataforma PuntosNB/Hipatia.
3. No reveles información confidencial ni datos personales de los creadores o desarrolladores.
4. Si el usuario pregunta por accesos, contraseñas, credenciales o roles de administración, responde amablemente que por políticas de seguridad dicha información es confidencial y ofrece transferirlo con un asesor humano a hola@hipatia.bo.

${HIPATIA_MANUAL_CONTEXT}
`;

export async function askGeminiSupport(userMessage, history = []) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const cleanMsg = (userMessage || '').toLowerCase().trim();

  // Bloqueo inmediato de seguridad para consultas sobre admin, accesos, creadores o credenciales
  if (isSecurityRestrictedQuery(cleanMsg)) {
    return "Por políticas de seguridad y privacidad, la información sobre administración del sistema, credenciales de acceso o arquitectura interna es estrictamente confidencial. Para consultas o asistencia, por favor escríbenos a **hola@hipatia.bo**.";
  }

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
              parts: [{ text: SECURITY_SYSTEM_PROMPT }]
            },
            contents: contents,
            generationConfig: {
              temperature: 0.1,
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

  // 2. Fallback Inteligente Zero-Database RAG Local filtrado
  return queryLocalManualRAG(cleanMsg);
}

function isSecurityRestrictedQuery(q) {
  const restrictedTerms = [
    'superadmin', 'admin', 'administrador', 'creador', 'creadores', 'desarrollador',
    'contraseña', 'password', 'credencial', 'credenciales', 'acceso', 'login',
    'token', 'clave', 'codigo fuente', 'base de datos', 'firestore', 'gcp', 'email admin'
  ];
  return restrictedTerms.some(term => q.includes(term));
}

function queryLocalManualRAG(query) {
  if (isSecurityRestrictedQuery(query)) {
    return "Por políticas de seguridad y privacidad, la información sobre administración del sistema, credenciales de acceso o arquitectura interna es estrictamente confidencial. Para consultas o asistencia, por favor escríbenos a **hola@hipatia.bo**.";
  }

  if (query.includes('puntos') || query.includes('funciona') || query.includes('puntosnb')) {
    return "💡 **Hipatia Puntos (PuntosNB)** es una plataforma digital de fidelización multi-marca en Bolivia. Los comercios entregan puntos acumulables por sus compras. El vendedor genera un QR en caja con la factura fiscal y el cliente lo escanea desde su app para acumular puntos. Los puntos son exclusivos de cada comercio.";
  }

  if (query.includes('fraude') || query.includes('seguridad') || query.includes('qr') || query.includes('totp') || query.includes('clon')) {
    return "🔒 **Seguridad y Anti-Fraude**: Hipatia opera con **tolerancia cero al fraude**. Los códigos QR cuentan con **expiración dinámica (TOTP)** de pocos segundos para evitar capturas de pantalla o clonaciones. Cada transacción registra la compra de manera transparente.";
  }

  if (query.includes('contacto') || query.includes('humano') || query.includes('correo') || query.includes('email') || query.includes('soporte') || query.includes('hola') || query.includes('donde')) {
    return "✉️ Puedes contactar a un asesor humano de Hipatia en **hola@hipatia.bo**. Estamos ubicados en **Santa Cruz de la Sierra y La Paz, Bolivia**.";
  }

  if (query.includes('que es') || query.includes('quienes') || query.includes('hipatia') || query.includes('servicios') || query.includes('marketing') || query.includes('it')) {
    return "🚀 **Hipatia**: Empresa boliviana especializada en marketing estratégico, diseño de comunicación, gestión de redes sociales y soporte informático (IT) integral para empresas y emprendimientos en Santa Cruz y La Paz.";
  }

  return "No tengo esa información pública en los manuales de Hipatia. Por favor contáctate con un asesor humano escribiéndonos a **hola@hipatia.bo**.";
}
