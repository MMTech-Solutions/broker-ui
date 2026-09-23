# Fase 1 — Overview

**Estado:** Implementada inicialmente.

## Decisiones

- El rango se expresa y transmite como fechas calendario UTC; la carga inicial es el mes UTC vigente.
- El endpoint de administración es la única fuente de esta fase y recibe el IB desde el segmento de ruta derivado de la suscripción activa.
- La información monetaria nunca se suma ni compara entre monedas: cada grupo conserva código y precisión.
- `available: false` representa indisponibilidad de fuente, no un valor numérico cero.

## Cumplimiento

- Se renderizan KPIs del período y el objeto `prev` cuando el backend lo entrega.
- Se renderizan actividad diaria, embudo de cliente y comisión por fuente con el contrato actual.
- Se muestran estados de carga y error, y el operador puede aplicar un rango válido.

## Necesidades posteriores

- Evaluar una visualización de serie más rica cuando el uso operativo confirme el grano y las monedas que deben compararse.
- Mantener esta ficha actualizada ante cualquier cambio de contrato del endpoint.
