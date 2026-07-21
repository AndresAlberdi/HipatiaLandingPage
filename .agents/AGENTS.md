# Reglas del Proyecto Hipatia Landing Page (`hipatia-landing-page`)

## Flujo de Despliegue Directo a Producción (Sin Área de Pruebas)

1. **Desarrollo y Validación Local**:
   - Todo cambio o nueva característica se desarrolla y verifica localmente.
   - Ejecutar pruebas unitarias locales con `vitest` (`npm run test`).
   - Ejecutar escaneo de vulnerabilidades con `Snyk` (`npx snyk test`) y `npm audit`.

2. **Publicación y GitHub (Directo a Producción)**:
   - Este proyecto opera **sin área de pruebas**. Se despliega directamente en el proyecto Firebase `hipatia-landing-page` (Hosting con SSL).
   - Se realiza el commit y push a la rama `main` en GitHub etiquetado con `(en producción)`.
   - Se confirma que GitHub / Dependabot no reporten alertas.

3. **Garantía Always Free**:
   - Preservar la compatibilidad con el plan Always Free / Spark de Firebase (Firebase Hosting Free Tier, Cloud Firestore Free Tier, Gemini 1.5 Flash Free Tier).
   - Notificaciones de potenciales clientes dirigidas a `hipatia.admin@gmail.com`.
