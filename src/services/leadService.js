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

  // Guardar copia local de respaldo inmediatamente
  try {
    const existing = JSON.parse(localStorage.getItem('hipatia_leads_local') || '[]');
    existing.push(payload);
    localStorage.setItem('hipatia_leads_local', JSON.stringify(existing));
  } catch (e) {
    // Ignorar si localStorage está bloqueado
  }

  // Intentar guardar en Firestore con un tiempo límite de 3.5 segundos para evitar cuelgues
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
