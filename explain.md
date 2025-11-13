# Cumplimiento de los Requerimientos OWASP y Testing

1. Aplicar controles alineados al OWASP Top 10:2025 (A01, A02, A04 y A09) en la API y en GraphQL.
2. Mantener una batería de pruebas automatizadas que validen los nuevos controles.

---

## 1. Controles OWASP Top 10:2025 añadidos

### A01:2025 – Broken Access Control
- Se implementó autorización basada en roles mediante `requireRoles` y `assertRoles`, utilizada en todas las rutas REST mutables (`src/infrastructure/web/middlewares/authorizationMiddleware.ts:1-45`, `src/infrastructure/web/routes/productRoutes.ts:1-58`).
- Las mutaciones GraphQL reutilizan el mismo guard y obtienen el usuario del contexto generado por `decodeAuthHeader`, de modo que los cambios de datos vía GraphQL quedan protegidos igual que REST (`src/infrastructure/graphql/resolvers.ts:1-40`, `src/index.ts:111-125`).
- Impacto: solo los usuarios con el rol configurado (por defecto `product_admin`) pueden crear, actualizar o eliminar productos en cualquier interfaz.

### A02:2025 – Security Misconfiguration
- Se añadió un módulo central de configuración con Zod que valida PORT, límites de cuerpo, ventanillas de rate limit, rol requerido y obliga a que `APP_ALLOWED_ORIGINS` exista en producción (`src/config.ts:1-63`).
- El servidor consume esa configuración para:  
  - CORS con allowlist y registro de orígenes bloqueados (`src/index.ts:35-58`).  
  - Helmet, body limit, y rate limiting homogéneo en `/api` y `/graphql` (`src/index.ts:32-75`).  
  - Desactivar introspección y landing page GraphQL en producción (`src/index.ts:111-125`).
- Impacto: se reducen configuraciones débiles por defecto y se fuerza a que cada entorno declare explícitamente sus parámetros críticos.

### A04:2025 – Cryptographic Failures
- `JWT_SECRET` debe tener al menos 32 caracteres y no puede ser textos débiles; la validación ocurre en el arranque vía Zod (`src/config.ts:13-19`).  
- El middleware JWT solo acepta tokens HS256 firmados con el secreto validado y reutiliza la verificación tanto en REST como en GraphQL (`src/infrastructure/web/middlewares/jwtMiddleware.ts:1-105`).
- El entorno de pruebas define un secreto largo para evitar falsos positivos y representar mejor producción (`tests/setup.ts:1-3`).
- Impacto: se minimiza el riesgo de secretos triviales y algoritmos débiles, fortaleciendo la autenticación de portadores.

### A09:2025 – Logging & Alerting Failures
- Se introdujo un logger estructurado con Pino y se añadió a los puntos sensibles: decisiones de CORS, falta de token, autorizaciones fallidas y errores globales (`src/infrastructure/logging/logger.ts:1-10`, `src/index.ts:35-155`, `src/infrastructure/web/middlewares/jwtMiddleware.ts:30-105`, `src/infrastructure/web/middlewares/authorizationMiddleware.ts:25-45`).
- Impacto: los eventos de seguridad quedan registrados con contexto (ruta, rol, origen), facilitando la generación de alertas y el monitoreo continuo.

---

## 2. Pruebas de API y GraphQL

- Repositorio en memoria para aislar las pruebas (`src/infrastructure/database/InMemoryProductRepository.ts:1-108`).
- Configuración de Vitest + SuperTest (`package.json:6-42`, `vitest.config.ts:1-10`, `tests/setup.ts:1-3`).
- Archivo principal de pruebas: `tests/products.api.spec.ts:1-225`. Casos cubiertos (9):
  1. Bloqueo sin token (401).
  2. Creación válida (201).
  3. Rechazo por rol insuficiente (403).
  4. Validación de payload malformado (400).
  5. Manejo de payload ~99 KB dentro del límite.
  6. Listado público.
  7. `PATCH` seguro.
  8. Mutación GraphQL sin auth (UNAUTHENTICATED).
  9. Mutación GraphQL con rol válido.
- Ejecución: `npm test` (Vitest) finaliza con 9 pruebas exitosas, lo cual garantiza que los nuevos controles se mantienen en la CI.

---

## 3. Variables de entorno críticas

- `JWT_SECRET` – mínimo 32 caracteres, sin frases débiles.
- `APP_ALLOWED_ORIGINS` – obligatorio en producción, coma-separado.
- `PRODUCT_WRITE_ROLE` – rol requerido para escrituras (default `product_admin`).
- `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS`, `REQUEST_BODY_LIMIT`, `PORT`, `LOG_LEVEL` – ajustan los límites operativos definidos en `src/config.ts`.

---
