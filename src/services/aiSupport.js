import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../config/firebase.js';

/* ======================================================
   AGENTE CONVERSACIONAL IA - HIPATIA (RAG + CLOUD FUNCTIONS ONCALL)
   ====================================================== */

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

export async function askGeminiSupport(userMessage, history = []) {
  const cleanMsg = (userMessage || '').toLowerCase().trim();

  // Bloqueo de seguridad inmediato en el cliente
  if (isSecurityRestrictedQuery(cleanMsg)) {
    return "Por políticas de seguridad y privacidad, la información sobre administración del sistema, credenciales de acceso o arquitectura interna es estrictamente confidencial. Para consultas o asistencia, por favor escríbenos a **hola@hipatia.bo**.";
  }

  // 1. Consulta a través de Firebase Functions onCall con App Check
  try {
    const functions = getFunctions(app);
    const asistente = httpsCallable(functions, 'asistente');
    const result = await asistente({ userMessage, history });

    if (result.data && result.data.response) {
      return result.data.response;
    }
  } catch (err) {
    console.error("Error llamando a asistente onCall:", err);
  }

  // 2. Fallback Inteligente Zero-Database RAG Local filtrado
  return queryLocalManualRAG(cleanMsg);
}

export function isSecurityRestrictedQuery(q) {
  const normalized = (q || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const restrictedTerms = [
    'superadmin', 'admin', 'administrador', 'creador', 'creadores', 'desarrollador',
    'contrasena', 'password', 'credencial', 'credenciales', 'acceso', 'login',
    'token', 'clave', 'codigo fuente', 'base de datos', 'firestore', 'gcp',
    'email admin', 'prompt injection', 'bypass', 'secret'
  ];
  return restrictedTerms.some(term => normalized.includes(term));
}

export function queryLocalManualRAG(query) {
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
