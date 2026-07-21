import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const TARGET_LEAD_EMAIL = 'hipatia.admin@gmail.com';

export async function saveLead(leadData) {
  const payload = {
    nombre: leadData.name || '',
    empresa: leadData.company || '',
    email: leadData.email || '',
    servicio: leadData.service || '',
    mensaje: leadData.message || '',
    notificarA: TARGET_LEAD_EMAIL,
    estado: 'NUEVO_POTENCIAL_CLIENTE',
    fechaCreacion: new Date().toISOString(),
    createdAt: Date.now()
  };

  // 1. Guardar copia local de respaldo inmediatamente
  try {
    const existing = JSON.parse(localStorage.getItem('hipatia_leads_local') || '[]');
    existing.push(payload);
    localStorage.setItem('hipatia_leads_local', JSON.stringify(existing));
  } catch (e) {
    // Ignorar si localStorage está bloqueado
  }

  // 2. Enviar notificación por correo directamente a hipatia.admin@gmail.com (vía API FormSubmit)
  sendEmailNotification(payload).catch(err => console.warn("Notificación de correo diferida:", err));

  // 3. Guardar registro en Cloud Firestore con tiempo límite para no bloquear la experiencia del usuario
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Firestore timeout')), 3500);
  });

  try {
    const docRef = await Promise.race([
      addDoc(collection(db, 'leads'), payload),
      timeoutPromise
    ]);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.warn("Manejado guardado local de respaldo para lead:", error.message || error);
    return { success: true, id: 'local-' + Date.now(), isFallback: true };
  }
}

async function sendEmailNotification(lead) {
  try {
    await fetch('https://formsubmit.co/ajax/' + TARGET_LEAD_EMAIL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        _subject: `🚀 ¡Nuevo Cliente Potencial en Hipatia! (${lead.nombre})`,
        _template: 'table',
        _captcha: 'false',
        Nombre: lead.nombre,
        Empresa: lead.empresa,
        Email_Cliente: lead.email,
        Servicio_Interés: lead.servicio,
        Mensaje: lead.mensaje,
        Fecha: lead.fechaCreacion
      })
    });
  } catch (e) {
    console.warn("Error enviando email:", e);
  }
}
