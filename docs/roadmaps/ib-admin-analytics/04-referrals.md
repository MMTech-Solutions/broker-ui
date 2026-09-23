# Fase 4 — Referrals

**Estado:** Completada.

La vista consume los contratos administrativos de listado/árbol, geo y cuentas con el `ib_user_id` de la suscripción activa, rango UTC y moneda ISO-3 compartidos. El árbol expande de forma lazy solamente hijos autorizados por la API y muestra estado explícito para métricas no disponibles. La identidad queda limitada a nombre, email expuesto por contrato, país, alta, nivel e hijos; no incluye First deposit. El modal de cuentas excluye balance, equity, PnL, credenciales y detalles CPA sensibles. Red, país e identidad son snapshots actuales de IAM; los importes y rewards conservan semántica histórica.

El tab existe como placeholder sin llamada API. Antes de implementarlo se documentarán red, datos personales permitidos, disponibilidad y acciones de navegación.
