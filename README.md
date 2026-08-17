# Mis Finanzas — Frontend

App personal de finanzas para Venezuela. Maneja transacciones en 4 monedas de
referencia (VES, USD BCV, EUR BCV, USDT), guardando en cada transacción un
**snapshot de las tasas** usadas al momento de crearla, para que el histórico
no se distorsione cuando la tasa cambie después.

Stack: React + TypeScript + Vite + TailwindCSS v4 + TanStack Query + React Router + Recharts.

## Requisitos

- Node 20+
- El backend NestJS corriendo (ver endpoints esperados abajo)

## Setup

```bash
npm install
cp .env.example .env   # ajusta VITE_API_URL si tu backend no corre en localhost:3000
npm run dev
```

- `npm run build` — build de producción (corre `tsc -b` primero)
- `npm run lint` — oxlint
- `npm run preview` — sirve el build de `dist/`

## Endpoints esperados del backend

```
GET  /rates/today          -> { usdBcv, eurBcv, usdt, date, updatedAt }
POST /rates/usdt            body: { rate }
GET  /transactions          query: from, to, type, category, currencyOriginal, page, limit
POST /transactions
POST /transactions/upload   multipart (imagen + campos)
GET|PATCH|DELETE /transactions/:id
GET  /summary                query: from, to
```

Si el backend termina exponiendo shapes distintos, el único lugar que hay que
tocar son los tipos en [src/types/index.ts](src/types/index.ts) y las
funciones de fetch en [src/api/](src/api/).

## Estructura

```
src/
  api/          funciones fetch (axios) por dominio: rates, transactions, summary
  types/        interfaces compartidas con el backend
  hooks/        hooks de React Query (queries + mutations) + query keys centralizadas
  lib/          formateo de moneda, conversión a VES, helpers de fechas
  components/
    layout/     Sidebar (desktop) + BottomNav (mobile) + AppLayout
    rates/      tarjeta de tasas del día + modal de actualización manual de USDT
    dashboard/  tarjetas de resumen, gráfico de categorías, últimas transacciones
    transactions/  formulario, dropzone de imagen, tabla, filtros, fila
    reports/    selector de periodo, totales, desglose por categoría
    common/     Modal, ConfirmDialog, Skeleton, EmptyState, ErrorState
  pages/        Dashboard, NewTransaction, EditTransaction, TransactionsList, Reports
```

## Notas de diseño

- **Snapshot de tasas**: el formulario de nueva transacción muestra el
  equivalente en VES en tiempo real usando `useRates()`, pero el valor
  definitivo (`amountVES` + `ratesSnapshot`) lo calcula y persiste el
  backend al crear la transacción — el frontend nunca recalcula históricos.
- **Mobile-first**: bottom nav en mobile, sidebar en desktop (breakpoint `sm`).
- **Sin auth**: es una app de un solo usuario, no hay login ni tokens.
