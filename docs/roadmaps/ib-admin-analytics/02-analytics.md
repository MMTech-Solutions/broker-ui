# Fase 2 — Analytics

**Estado:** Completada.

El tab consume `GET v1/admin/reports/ib-analytics/analytics` con `ib_user_id`, `from`, `to` y `currency_code`. El rango se comparte con Overview; Analytics inicia en USD y permite introducir cualquier moneda ISO-3 válida.

La pantalla muestra seis KPIs, una serie combinada de rebate, CPA y lots, distribución de lots por categoría visual, tabla por país y tabla por símbolo. La serie es diaria hasta 62 días y mensual desde 63, conforme al valor `granularity` del contrato. Las reglas de pago de símbolo se etiquetan como snapshots históricos; cuando hay más de una se muestra `Múltiples`.

La degradación de Finance conserva la tabla de países y marca net deposits como indisponible. La indisponibilidad de IAM se presenta como error del tab, porque el backend no emite un slice parcial sin red autorizada.
