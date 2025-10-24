# Cumplimiento de los Requerimientos OWASP y Testing


1. Aplicar al menos tres controles alineados a OWASP Top 10 en la API de productos.
2. Incorporar **al menos 5 pruebas de API**.

---

## 1. Controles OWASP Top 10 añadidos

- **A01:2021 – Broken Access Control**  
  - verificación con `jsonwebtoken`.  
  - Archivo relevante: `src/infrastructure/web/middlewares/jwtMiddleware.ts:1-69`.  
  - Impacto: solo portadores de un JWT firmado con `JWT_SECRET` válido pueden acceder a los endpoints protegidos.

- **A03:2021 – Injection / A05:2021 – Security Misconfiguration**  
  - Se añadieron validaciones Zod antes de llegar a la lógica del controlador para sanitizar entradas y prevenir datos malformados o abusivos.  
  - Archivos:  
    - `src/infrastructure/web/middlewares/validationMiddleware.ts:1-45`  
    - `src/infrastructure/web/validation/productSchemas.ts:1-82`  
    - `src/infrastructure/web/routes/productRoutes.ts:1-54`  
  - Se incorporó `helmet`.  
  - sin Helmet:

        Content-Length: 45

        ETag: W/"2d-cNj29RQ25Pprcj6a6edy/V2YndQ"
        
        Date: Fri, 24 Oct 2025 10:51:59 GMT
        
        Connection: keep-alive
        
        Keep-Alive: timeout=5
  - Con Helmet:

        Cross-Origin-Resource-Policy: same-origin

        Origin-Agent-Cluster: ?1

        Referrer-Policy: no-referrer

        Strict-Transport-Security: max-age=31536000; includeSubDomains

        X-Content-Type-Options: nosniff

        X-DNS-Prefetch-Control: off

        X-Download-Options: noopen

        X-Frame-Options: SAMEORIGIN
        X-Permitted-Cross-Domain-Policies: none

        X-XSS-Protection: 0
  - Impacto:endurece encabezados HTTP, se rechazan valores inválidos (por ejemplo, IDs no numéricos, precios negativos y campos ausentes).

- **A07:2021 – Identification and Authentication Failures / Rate Limiting**  
  - Se incorporó `express-rate-limit `, además de límites de tamaño de cuerpo (`express.json`/`urlencoded`).  

  - Archivo: `src/index.ts:1-123`.  
  - Impacto:  bloquea flooding de peticiones y evita payloads excesivos que podrían derivar en DoS.


---

## 2. Pruebas de API implementadas

- Se añadió un repositorio en memoria (`src/infrastructure/database/InMemoryProductRepository.ts:1-108`) para ejecutar pruebas sin depender de Prisma.
- Configuración de Vitest + SuperTest:
  - `package.json:6-41` (script `npm run test` y dependencias).
  - `vitest.config.ts:1-10` y `tests/setup.ts:1-2`.
- Archivo de pruebas principal: `tests/products.api.spec.ts:1-130`.
  - Casos cubiertos (5 tests):
    1. Rechazar llamadas sin token (401).
    2. Crear producto válido (201).
    3. Bloquear payload malformado (400).
    4. Listar productos (200).
    5. Aplicar `PATCH` seguro (200).
- Ejecución exitosa: `npm run test`.

---


## 3. Pasos de despliegue / variables relevantes

- Asegurar que existan variables de entorno:
  - `JWT_SECRET` – clave para firmar/verificar JWT.
  - `RATE_LIMIT_MAX` y `RATE_LIMIT_WINDOW_MS` para ajustar el throttling.
  - `REQUEST_BODY_LIMIT` si se quiere cambiar el tamaño máximo del cuerpo.

---

