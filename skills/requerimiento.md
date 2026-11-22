Actúa como un Software Architect, Senior Full Stack Developer y Senior UX/UI Designer especializado en aplicaciones SaaS Financieras similares a:



Resumen del inventario
Productos con bajo stock
Productos agotados
Productos más vendidos
Productos menos vendidos
Valor total del inventario
Compras recientes
Ventas recientes
Alertas
Actividad reciente
Indicadores (KPIs)









- Kipu
- Quipu
- Stripe Dashboard
- Linear
- Notion

Tu objetivo es diseñar completamente una aplicación web moderna para la gestión financiera empresarial.

La aplicación será desarrollada con:

Backend
- Express
- TypeScript
- PostgreSQL
- Node
- "postgres": "^3.4.8"
- multer si se necesario opcional 


Frontend
- React 18
- JavaScript
- TanStack Query
- React Hook Form
- Zod
- React Query
- Recharts
- ag-grid-react ag-grid-community para tablas en react - https://www.ag-grid.com/

Debe tener una apariencia profesional de software empresarial premium.

Debe utilizar:

- Sidebar izquierda colapsable
- Header superior
- Breadcrumbs
- Buscador global
- Tema oscuro y claro
- Responsive
- Diseño limpio tipo Stripe Dashboard
- Componentes reutilizables
- Skeletons
- Loading states
- Empty states
- Error states
- Toast notifications
- Dialogs
- Drawers
- Dropdowns
- Context Menus
- Command Palette
- Atajos de teclado

----------------------------------------------------

## CONTEXTO DEL PROYECTO

Estoy desarrollando un Sistema de Gestión Financiera Multiempresa para controlar:

- ingresos
- egresos
- flujo de caja
- cuentas
- presupuestos
- metas de ahorro
- transferencias
- reportes financieros

Cada empresa trabaja sobre su propia información (multi-tenant).

La base de datos PostgreSQL ya existe.

Entidades principales:

- Empresas
- Usuarios
- Roles
- User_Role
- Cuentas
- Categorías
- Transacciones
- Transferencias
- Presupuestos
- Etiquetas
- Metas de ahorro
- Auditoría

Características importantes del modelo:

Empresas

Cada usuario pertenece a una empresa.

Roles

Administrador

Operador / Usuario normal

Cuentas

- efectivo
- banco
- tarjeta_credito
- tarjeta_debito
- otro

Categorías

Jerárquicas (parent_id)

Tipos:

- ingreso
- egreso
- ambos

Transacciones

Tipos:

- ingreso
- egreso

Estados

- confirmado
- pendiente
- anulado

Transferencias

Entre cuentas de la misma empresa.

Presupuestos

Periodo:

- diario
- semanal
- mensual
- anual

Etiquetas

Relación muchos a muchos con transacciones.

Metas de ahorro

Con:

- monto objetivo
- monto actual
- fecha objetivo
- estado

Auditoría

Registra:

INSERT

UPDATE

DELETE

Usuario

Fecha

Tabla

Datos anteriores

Datos nuevos

----------------------------------------------------

## ROLES

Administrador

Puede:

- gestionar empresas
- usuarios
- roles
- permisos
- configuración
- auditoría
- todas las cuentas
- todas las transacciones
- reportes completos
- dashboards administrativos

Usuario normal

Puede:

- registrar ingresos
- registrar egresos
- administrar cuentas de su empresa
- administrar categorías
- administrar presupuestos
- administrar metas
- administrar etiquetas
- realizar transferencias
- consultar reportes
- exportar información

No puede:

- administrar usuarios
- administrar roles
- acceder a auditoría
- modificar configuración global

----------------------------------------------------

## OBJETIVO

Diseña completamente toda la aplicación.

No quiero únicamente las pantallas.

Quiero definir la arquitectura completa del frontend.

----------------------------------------------------

## PARA CADA PÁGINA INDICA

Nombre

Ruta

Objetivo

Roles permitidos

Breadcrumb

Cards KPI

Componentes

Formularios

Validaciones

Tablas

Columnas

Filtros

Búsqueda

Ordenamiento

Paginación

Acciones

Botones

Dropdowns

Modales

Drawers

Estados vacíos

Skeleton

Loading

Responsive

Permisos

Consultas necesarias al backend

Endpoints

Aggregations SQL necesarias

----------------------------------------------------

## PÁGINAS

Autenticación

- Login
- Registro
- Recuperar contraseña
- Cambiar contraseña

Dashboard

- Dashboard principal
- Dashboard financiero
- Dashboard flujo de caja
- Dashboard ahorro
- Dashboard presupuestos
- Dashboard cuentas
- Dashboard categorías
- Dashboard administrador
- Dashboard empresa

Operaciones

- Transacciones
- Nueva transacción
- Editar transacción
- Ver transacción

- Transferencias

Administración

- Empresas
- Usuarios
- Roles
- Permisos
- Configuración
- Auditoría

Catálogos

- Cuentas
- Categorías
- Etiquetas

Finanzas

- Presupuestos
- Metas de ahorro

Reportes

Notificaciones

Perfil

Centro de ayuda

----------------------------------------------------

## DASHBOARD PRINCIPAL

Debe responder inmediatamente estas preguntas:

¿Cuánto dinero tengo?

¿Cuánto ingresó este mes?

¿Cuánto gasté este mes?

¿Cuál es mi balance?

¿Cuánto he ahorrado?

¿Cuánto dinero tengo disponible?

¿Cuántas cuentas existen?

¿Cuántos movimientos existen?

¿Qué porcentaje aumentaron los gastos?

¿Qué presupuesto está por excederse?

¿Qué metas se cumplirán este mes?

¿Cuáles fueron las últimas transacciones?

¿Qué pagos próximos existen?

¿Qué alertas importantes existen?

----------------------------------------------------

## KPI CARDS

Saldo total

Ingresos del mes

Gastos del mes

Balance

Flujo de caja

Ahorro

Dinero disponible

Presupuesto utilizado

Presupuesto restante

Metas activas

Metas cumplidas

Cantidad de cuentas

Cantidad de transacciones

Comparación con el mes anterior

Variación anual

Promedio diario

Promedio mensual

Mayor gasto

Mayor ingreso

----------------------------------------------------

## GRÁFICOS (RECHARTS)

Para cada gráfico indica:

- Componente exacto
- Eje X
- Eje Y
- Dataset requerido
- Query SQL o Aggregation
- Filtros
- Comparativas
- Tooltip
- Leyenda
- Colores sugeridos
- Estado vacío
- Estado loading

Debe utilizar únicamente componentes de Recharts.

Gráficos mínimos:

1. Evolución de ingresos

2. Evolución de gastos

3. Ingresos vs gastos

4. Balance acumulado

5. Flujo de caja

6. Gastos por categoría

7. Gastos por subcategoría

8. Ingresos por categoría

9. Gastos por cuenta

10. Gastos por usuario

11. Presupuesto consumido

12. Presupuesto restante

13. Metas de ahorro

14. Distribución del dinero

15. Tendencia anual

16. Comparación mensual

17. Comparación anual

18. Top 10 categorías

19. Top 10 gastos

20. Últimos 12 meses

21. Gastos diarios

22. Gastos semanales

23. Gastos mensuales

24. Gastos por etiquetas

25. Ranking de cuentas

26. Ranking de usuarios

27. Salud financiera

28. Flujo entre cuentas (Sankey)

29. Calendario financiero

30. Pronóstico de gastos

31. Pronóstico de ingresos

32. Balance histórico

33. Distribución por tipo de cuenta

34. Comparación presupuesto vs gasto

35. Evolución del ahorro

36. Balance por empresa

Utiliza cuando corresponda:

- LineChart
- AreaChart
- BarChart
- PieChart
- RadialBarChart
- ComposedChart
- Treemap
- SankeyChart
- RadarChart
- ScatterChart
- FunnelChart
- Brush
- Tooltip
- Legend
- CartesianGrid
- ResponsiveContainer
- ReferenceLine

----------------------------------------------------

## REPORTES

Debe incluir:

Exportar Excel

Exportar CSV

Exportar PDF

Imprimir

Filtros avanzados

Agrupar por:

- categoría
- cuenta
- usuario
- etiqueta
- periodo

----------------------------------------------------

## FUNCIONALIDADES AVANZADAS

Alertas de presupuesto

Saldo bajo

Recordatorios

Pagos próximos

Widgets configurables

Dashboard personalizable

Favoritos

Búsqueda global

Filtros inteligentes

Metas inteligentes

Predicción de ahorro

Predicción de flujo de caja

Importación Excel

Importación CSV

Exportaciones

Notificaciones

Centro de actividad

Timeline

Logs

----------------------------------------------------

## UX/UI

Propón recomendaciones profesionales para que el sistema tenga apariencia de software empresarial premium.

Explica:

- distribución del dashboard
- jerarquía visual
- iconografía
- espaciado
- navegación
- accesibilidad
- responsive
- mejores prácticas

----------------------------------------------------

## ENTREGABLE FINAL

Genera en este orden:

1. Sitemap completo.

2. Arquitectura del frontend.

3. Árbol completo de carpetas con react-router .

4. Organización por módulos.

5. Todas las rutas.

6. Menú lateral.

7. Header.

8. Layouts.

9. Permisos por rol.

10. Componentes reutilizables.

11. Hooks personalizados.

12. Stores de Redux Toolkit.

14. Servicios API.

15. Queries de TanStack Query.

16. Formularios.

17. Tablas.

19. Todos los dashboards.

20. Todas las páginas.

21. Todos los gráficos Recharts.

22. Queries SQL/Aggregations necesarias para cada gráfico.

23. Flujo completo de navegación del usuario.

24. Recomendaciones de rendimiento.

25. Recomendaciones de seguridad.

26. Recomendaciones de escalabilidad.

27. Roadmap de implementación por fases (MVP → Versión Profesional → Versión Enterprise).