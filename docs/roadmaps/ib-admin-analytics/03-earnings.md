# Fase 3 — Earnings

**Estado:** Completada.

## Contrato consumido

- `GET v1/admin/reports/ib-analytics/earnings?ib_user_id={id}&from=YYYY-MM-DD&to=YYYY-MM-DD&currency_code=ISO-3&grain=daily`.
- `GET v1/admin/reports/ib-analytics/earnings/daily/{dailyRowId}/trades` para el desglose de una fila diaria. El identificador es opaco y el backend vuelve a validar el IB objetivo, moneda y filtros.

Ambos requieren `broker.reports.read`; el `ib_user_id` sigue derivándose de la suscripción activa seleccionada, sin selector manual en la vista.

## Comportamiento implementado

- Reutiliza el rango UTC y la moneda ISO-3 compartidos con Analytics. La moneda es obligatoria: no se agregan ni convierten importes de monedas diferentes.
- Expone cards de pagado histórico, pendiente de pago, pagado YTD y CPA en calificación. `pending_to_pay` agrupa únicamente `pending` y `processing`; CPA en calificación no se presenta como comisión obtenida.
- Muestra los cinco estados persistidos sin renombrarlos como otros estados de dominio: Pendiente, Procesando, Pagado, Fallido y Cancelado.
- Ofrece filtros por estado, tipo y búsqueda, cursor pagination y tabla diaria. El desglose accesible se solicita sólo para filas diarias mediante el contrato autorizado.
- Cada evento conserva fecha UTC, importes y reglas/snapshots remitidos por el backend; valores que no aplican para PnL o CPA se muestran como tales, no como cero.
- Las filas de volumen muestran el referido resuelto desde IAM actual y el `order_id` del trade; cuando no existe `order_id`, la UI identifica explícitamente el UUID de posición como referencia trazable.
- La UI permite alternar entre resumen diario y por trade. En el resumen diario, la columna Trades presenta un badge con el número de operaciones agrupadas o `Sin trades` para PnL/CPA y conserva la acción `Ver rewards` para abrir el desglose autorizado.
