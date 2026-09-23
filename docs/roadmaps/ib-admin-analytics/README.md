# IB Admin Analytics

## Propósito

Bitácora de decisiones y avance de la interfaz administrativa del reporte de analytics para una suscripción IB activa. El HTML de referencia guía la distribución de información; no define contratos, persistencia ni reglas de negocio.

**Estado global:** En ejecución. Overview, Analytics y Earnings están implementados; Referrals queda preparado como tab vacío hasta que se conecte su contrato.

## Decisiones cerradas

- La entrada administrativa vive en la lista de suscripciones IB y solo se ofrece para registros `active`.
- La ruta conserva `/ib-analytics/{beneficiaryId}`; el identificador se envía como `ib_user_id` al endpoint administrativo autorizado.
- El rango inicial es el mes calendario UTC en curso y el operador puede cambiarlo.
- Analytics solicita una moneda ISO-3; inicia en `USD`, permite elegir o escribir otra moneda válida y no la infiere de la suscripción.
- Partner · Tier no se muestra en administración: el roadmap del backend lo limita al portal del IB autenticado.
- Los archivos de la superficie administrativa anterior permanecen desconectados, sin eliminarse, mientras se consolida la nueva vista.

## Contrato actual: Overview

`GET v1/admin/reports/ib-analytics/overview?ib_user_id={id}&from=YYYY-MM-DD&to=YYYY-MM-DD`

Requiere `broker.reports.read`. La UI consume `kpis.cur/prev`, `series`, `client_funnel` y `commission_by_source`. Los grupos monetarios se presentan por moneda y precisión; una capacidad con `available: false` se presenta como indisponible, nunca como cero.

## Contrato actual: Analytics

`GET v1/admin/reports/ib-analytics/analytics?ib_user_id={id}&from=YYYY-MM-DD&to=YYYY-MM-DD&currency_code=ISO-3`

Requiere `broker.reports.read`. Consume KPIs, una serie diaria hasta 62 días y mensual a partir de 63, distribución visual por categoría, desglose por símbolo y tabla por país. Las categorías no representan reglas económicas y CPA no participa en los desgloses por categoría ni símbolo. Las reglas mostradas son snapshots históricos, no tarifas vigentes. Si Finance no está disponible, net deposits se marca como indisponible sin ocultar países.

## Fases por tab

| Fase | Tab | Estado | Registro |
| --- | --- | --- | --- |
| 1 | Overview | En implementación | Consulta el contrato disponible y muestra KPIs, serie, embudo y fuente de comisión. |
| 2 | Analytics | Completada | Consulta el contrato disponible con moneda ISO-3 y muestra KPIs, serie, categorías, países y símbolos. |
| 3 | Earnings | Completada | Consume el contrato administrativo con moneda ISO-3, estados explícitos, cursor y desglose diario autorizado. |
| 4 | Referrals | Completada | Árbol lazy paginado, ranking geo y modal de cuentas con contratos administrativos autorizados. |

1. [Fase 1 — Overview](01-overview.md)
2. [Fase 2 — Analytics](02-analytics.md)
3. [Fase 3 — Earnings](03-earnings.md)
4. [Fase 4 — Referrals](04-referrals.md)

## Cumplimientos, desalineaciones y necesidades

- **Cumplimiento:** el acceso no expone un selector manual de IB; se deriva de la suscripción activa elegida.
- **Cumplimiento:** Overview y Analytics conservan la semántica de disponibilidad del backend para red, IAM y Finance.
- **Necesidad:** conectar los contratos ya planificados de Earnings y Referrals antes de poblar sus tabs.
- **Desalineación conocida:** la superficie administrativa previa usa endpoints históricos distintos (`summary`, `rewards`, `monthly`, `ytd`). Se conserva intacta como respaldo, pero no debe evolucionar en paralelo con este reporte.
