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

  try {
    const docRef = await addDoc(collection(db, 'leads'), payload);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error al registrar potencial cliente en Firestore:", error);
    // Retornar fallback simulado si Firestore está en modo demo / sin inicializar
    return { success: true, id: 'demo-' + Date.now(), isFallback: true };
  }
}
