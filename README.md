# MyInvestor Challenge Frontend

Aplicación SPA de gestión de fondos de inversión y cartera construida con React 19, TypeScript y Vite.

## Requisitos

La prueba ha sido desarrollada en este entorno y no se ha probado que funcione con versiones anteriores.

- **Node.js** >= 24.14.0
- **npm** >= 11.9.0

## Instalación

```bash
npm install
```

## Scripts

| Comando                   | Descripción                                           |
| ------------------------- | ----------------------------------------------------- |
| `npm run dev`             | Arranca el servidor de desarrollo Vite (MSW + seed)   |
| `npm run build`           | Comprobación de tipos + build de producción            |
| `npm run preview`         | Sirve el build de producción localmente                |
| `npm run lint`            | Ejecuta ESLint                                        |
| `npm test`                | Ejecuta los tests unitarios en modo watch (Vitest)    |
| `npx vitest run`          | Ejecuta los tests unitarios una sola vez               |
| `npm run test:e2e`        | Tests E2E con Playwright (headless)                   |
| `npm run test:e2e:ui`     | Tests E2E con la UI de Playwright                     |
| `npm run test:e2e:headed` | Tests E2E con navegador visible                       |

Para comprobar solo los tipos sin generar el build:

```bash
npx tsc --project tsconfig.app.json --noEmit
```

## Estructura del proyecto

```
src/
├── fund/                              # Contexto acotado: Fondos
│   ├── domain/                        # Esquemas Zod, constantes, interfaces de puerto
│   │   ├── fund.constants.ts          #   FUND_CATEGORIES, FUND_SORT_OPTIONS y tipos derivados
│   │   ├── fund.schema.ts             #   Esquemas e inferencia de tipos (Fund, FundsQuery, FundsResponse…)
│   │   └── fund.port.ts               #   Interfaz del puerto FundRepository
│   ├── infrastructure/
│   │   └── fund.http-repository.ts    #   Implementación HTTP del repositorio
│   ├── application/
│   │   ├── useFunds.ts                #   Hook TanStack Query + fundsQueryOptions
│   │   ├── useFunds.test.ts
│   │   ├── useFund.ts                 #   Hook para obtener un fondo individual
│   │   └── fund.sort-utils.ts         #   toApiSort(): SortingState → FundSortOption
│   └── presentation/
│       ├── hooks/
│       │   └── useFundDetail.tsx       #   Hook para la vista de detalle del fondo
│       ├── components/
│       │   ├── FundsTable.tsx          #   Tabla TanStack con columna y header sticky
│       │   ├── FundDetailDialog.tsx    #   Diálogo con los detalles del fondo
│       │   └── FundDetailDialog.test.tsx
│       ├── utils/
│       │   └── fund.formatters.ts     #   formatPercent, formatCurrency, formatAmount
│       ├── FundsList.tsx              #   Contenedor: loading / error / tabla
│       └── FundsList.test.tsx
│
├── portfolio/                         # Contexto acotado: Cartera (incluye acciones sobre fondos)
│   ├── domain/
│   │   ├── portfolio.schema.ts        #   PortfolioItem, PortfolioPosition, PortfolioEntry
│   │   ├── portfolio.port.ts          #   Interfaz del puerto PortfolioRepository
│   │   ├── buy-fund.schema.ts         #   BuyFormSchema (Zod): validación de compra
│   │   ├── sell-fund.schema.ts        #   SellFormSchema (Zod): validación de venta
│   │   ├── transfer-fund.schema.ts    #   TransferFormSchema (Zod): validación de traspaso
│   │   └── order.schema.ts            #   Esquemas de órdenes (compra, venta, traspaso)
│   ├── infrastructure/
│   │   ├── portfolio.http-repository.ts  # getPortfolio() (enriquece con /funds/:id) + buyFund()
│   │   └── order.idb-repository.ts    #   Repositorio IndexedDB para órdenes
│   ├── application/
│   │   ├── useBuyFund.ts              #   Mutación TanStack Query de compra
│   │   ├── useSellFund.ts             #   Mutación TanStack Query de venta
│   │   ├── useTransferFund.ts         #   Mutación TanStack Query de traspaso
│   │   ├── usePortfolio.ts            #   Hook TanStack Query; queryKey: ["portfolio"]
│   │   ├── useOrders.ts               #   Hook para listar órdenes desde IndexedDB
│   │   ├── useRecordOrder.ts          #   Hook para registrar órdenes en IndexedDB
│   │   └── fund-actions.utils.ts      #   calculateQuantity, calculateSaleProceeds
│   └── presentation/
│       ├── components/
│       │   ├── PortfolioList.tsx       #   Contenedor: loading / error / vacío / lista agrupada
│       │   ├── PortfolioList.test.tsx
│       │   ├── PortfolioGroup.tsx      #   Collapsible por categoría (shadcn)
│       │   ├── PortfolioItemRow.tsx    #   Fila: nombre, valor, beneficio, acciones
│       │   ├── PortfolioSummary.tsx    #   Resumen de cartera con gráfico
│       │   ├── BuyFundDialog.tsx       #   Diálogo de compra (Dialog + Form + mutación)
│       │   ├── BuyFundDialog.test.tsx
│       │   ├── BuyFundForm.tsx         #   Formulario RHF + Zod, input de divisa, preview
│       │   ├── SellFundDialog.tsx      #   Diálogo de venta
│       │   ├── SellFundDialog.test.tsx
│       │   ├── SellFundForm.tsx        #   Formulario de venta
│       │   ├── TransferFundDialog.tsx  #   Diálogo de traspaso
│       │   ├── TransferFundDialog.test.tsx
│       │   ├── TransferFundForm.tsx    #   Formulario de traspaso
│       │   ├── OrdersList.tsx          #   Lista de órdenes realizadas
│       │   ├── OrdersList.test.tsx
│       │   └── OrderRow.tsx            #   Fila de una orden
│       ├── utils/
│       │   ├── portfolio.formatters.ts #   formatBenefit(), re-exporta toEur
│       │   └── order.formatters.ts     #   Formateadores para órdenes
│       ├── PortfolioPage.tsx           #   Página de cartera (contenedor principal)
│       └── PortfolioPage.test.tsx
│
├── components/                        # Componentes UI reutilizables (agnósticos de dominio)
│   ├── ui/                            #   Componentes shadcn/ui (button, table, card, skeleton,
│   │                                  #   label, pagination, collapsible, input, dropdown-menu,
│   │                                  #   select, sonner, switch, chart, badge, tabs)
│   ├── Dialog.tsx                     #   Wrapper sobre <dialog> nativo
│   ├── SwipeableRow.tsx               #   Swipe-to-reveal para móvil (motion)
│   ├── SortIcon.tsx                   #   Icono de dirección de ordenación
│   ├── TablePagination.tsx            #   Paginación con selector de tamaño de página
│   ├── DevTools.tsx                   #   Panel de DevTools (simular errores, invalidar caché)
│   ├── ThemeToggle.tsx                #   Toggle claro / oscuro (next-themes)
│   ├── LanguageToggle.tsx             #   Toggle de idioma (ES / EN)
│   ├── AppNav.tsx                     #   Navegación principal de la aplicación
│   └── LinkButton.tsx                 #   Botón estilizado como enlace
│
├── shared/                            # Reutilizables entre contextos
│   ├── domain/
│   │   └── currency.ts                #   CURRENCIES, Currency, EUR_USD_RATE, CurrencySchema
│   ├── application/
│   │   ├── usePagination.ts           #   Estado genérico de paginación
│   │   ├── currency.utils.ts          #   toEur(amount, currency)
│   │   └── useMediaQuery.ts           #   Hook reactivo para media queries
│   └── presentation/
│       └── CurrencyAmountInput.tsx    #   Input de EUR con formato por locale
│
├── i18n/                              # Internacionalización
│   ├── index.ts                       #   Configuración i18next + LanguageDetector
│   ├── types.d.ts                     #   Tipado seguro para t()
│   └── locales/
│       ├── es.json                    #   Español (idioma por defecto)
│       └── en.json                    #   Inglés
│
├── mocks/                             # Mock del servidor (MSW)
│   ├── data.ts                        #   Colecciones @msw/data + seedDatabase()
│   ├── handlers.ts                    #   Handlers de los endpoints de la API
│   ├── browser.ts                     #   Worker MSW (desarrollo)
│   ├── server.ts                      #   Servidor MSW (tests)
│   └── dev-tools.ts                   #   ERROR_ENDPOINTS para el panel de DevTools
│
├── test/                              # Utilidades de test
│   ├── setup.ts                       #   Setup global: seed + MSW server
│   └── test-utils.tsx                 #   render() custom con QueryClient + MemoryRouter
│
├── lib/utils.ts                       # cn() — merge de clases Tailwind
├── index.css                          # Estilos globales (importa Tailwind)
├── vite-env.d.ts                      # Tipos de entorno Vite
├── main.tsx                           # Entrada: QueryClientProvider → MSW → seed → render
└── App.tsx                            # Componente raíz con rutas
```

### Alias de rutas

`@/*` se resuelve a `src/*` (configurado en `tsconfig.app.json` y `vite.config.ts`).

## Stack tecnológico

| Categoría              | Tecnología                                                    |
| ---------------------- | ------------------------------------------------------------- |
| Bundler                | Vite 7                                                        |
| Lenguaje               | TypeScript 5.8 (strict)                                       |
| UI                     | React 19                                                      |
| Routing                | React Router 7 (modo declarativo)                             |
| Estilos                | Tailwind CSS v4 (mobile first)                                |
| Componentes UI         | shadcn/ui (copy-paste, componentes propios en `components/ui`) |
| Data fetching          | TanStack Query                                                |
| Tablas                 | TanStack Table (headless)                                     |
| Formularios            | React Hook Form + Zod                                         |
| Internacionalización   | react-i18next + i18next-browser-languagedetector              |
| Animaciones / Gestos   | motion (swipe-to-reveal)                                      |
| Gráficos               | Recharts                                                      |
| Temas                  | next-themes                                                   |
| Tests unitarios        | Vitest + React Testing Library                                |
| Tests E2E              | Playwright                                                    |
| Mock de servidor       | MSW + @msw/data + Faker                                       |
| Linting / Formateo     | ESLint + Prettier                                             |

## Decisiones

### Stack inicial

- **Vite** como bundler: simple, estable y rápido. Es una de las opciones por defecto al crear una aplicación React y no requiere la complejidad añadida de un framework como Next.js, que no se justifica para el alcance de este proyecto. Se usa la versión 7 en lugar de la 8 (recién publicada) para evitar incompatibilidades con Tailwind CSS v4.
- **TypeScript** como lenguaje: ecosistema maduro y experiencia de desarrollo mejorada gracias al tipado estático. Aunque ralentiza ligeramente el prototipado, compensa a medio plazo al prevenir errores en tiempo de compilación.
- **React Router** en modo declarativo: ligero y suficiente para un proyecto de este tamaño. Aporta routing sin overhead adicional y permite migrar al modo framework si en el futuro se necesitase más funcionalidad.
- **Vitest** para tests unitarios: API prácticamente idéntica a Jest, con una experiencia de desarrollo más moderna y con integración nativa con Vite, lo que elimina la fricción de mantener configuraciones separadas para bundler y test runner.
- **shadcn/ui** como librería de componentes: componentes accesibles, sencillos y altamente personalizables. Al copiarse directamente en el proyecto, se tiene control total sobre el código sin depender de actualizaciones de una librería externa.
- **Tailwind CSS** para estilos: acelera el prototipado con sus clases de utilidad, es altamente personalizable y sigue una filosofía mobile first con buena documentación.
- **React Testing Library**: los tests reproducen la interacción real del usuario con el navegador, lo que los hace resistentes a refactors internos y permite validar la accesibilidad de la aplicación de forma natural.
- **MSW** para mocks de servidor: intercepta las peticiones `fetch` mediante service workers, de modo que las llamadas aparecen en el tab Network de las devtools del navegador, facilitando el debugging. Se complementa con `@msw/data` y Faker para generar datos deterministas.
- **ESLint**: se mantiene el que incluye la plantilla de Vite. Para una prueba técnica no tiene sentido asumir la fricción de migrar a alternativas más recientes.
- **TanStack Query** para data fetching: podría ser excesivo para el tamaño de la prueba, pero añade poco overhead y deja el proyecto preparado para evolucionar (cacheo, invalidación, reintentos). SWR ofrece un bundle más pequeño con características similares, pero el tamaño del bundle no es determinante aquí y TanStack Query es la herramienta que se usa en MyInvestor.
- **TanStack Table**: librería headless que se encarga exclusivamente de la lógica de datos (ordenación, paginación, filtrado) sin imponer UI, lo que da libertad total sobre el markup. Usar una librería dedicada evita los problemas recurrentes de las tablas custom.
- **Playwright** para tests E2E: rendimiento superior a Cypress en mi experiencia, con una API moderna y un uso muy similar.
- **react-i18next** para internacionalización: solución consolidada con detección automática del idioma del navegador.
- **React Hook Form + Zod** para formularios: API ligera, buen rendimiento (minimiza re-renders) y validación declarativa con esquemas Zod.

> **Nota sobre git**: no se sigue un flujo de ramas (feature branches, GitFlow…) por simplicidad, dado el contexto de la prueba. Esto implica que algunos commits introducen funcionalidad parcial que se completa en commits posteriores.

### Arquitectura

- **Hexagonal + Domain Driven Design**: cada bounded context (fondos, cartera) encapsula sus propias capas hexagonales (`domain/`, `infrastructure/`, `application/`, `presentation/`). Para localizar cualquier recurso basta con identificar el dominio al que pertenece y buscar en la capa correspondiente. Esta estructura asume una aplicación autocontenida; en un monorepo con múltiples aplicaciones consumiendo los mismos dominios, convendría elevar `domain/` e `infrastructure/` a un nivel compartido y mantener solo `application/` y `presentation/` dentro de cada módulo.
- **Acciones sobre fondos en el dominio de portfolio**: aunque la API REST expone el recurso bajo `/funds`, las operaciones de compra, venta y traspaso mutan la cartera del usuario. Por coherencia con el dominio de negocio, estas acciones viven en `portfolio/`, no en `fund/`.
- **DevTools custom**: panel integrado en desarrollo que permite invalidar cachés de TanStack Query y simular errores HTTP en cualquier endpoint de MSW, sin necesidad de modificar código.
- **Componentes compartidos**: los componentes genéricos y agnósticos de dominio (Dialog, SwipeableRow, AppNav…) viven en `src/components/`. Los componentes reutilizables con conocimiento de dominio (como `CurrencyAmountInput`, que depende de formateadores de divisa) se ubican en `src/shared/`, respetando la convención de capas de la arquitectura hexagonal.
- **Órdenes en IndexedDB**: la API no proporciona un endpoint para órdenes, por lo que se persisten en el cliente. Se eligió IndexedDB sobre `localStorage` porque, aunque para el alcance actual podría bastar con `localStorage`, IndexedDB permite escalar a funcionalidades como filtrado, búsqueda o paginación de órdenes sin cambiar de tecnología de almacenamiento.


### Fondos

- **Colocación de componentes**: `FundsTable.tsx` contiene un componente auxiliar de celda además del componente principal. Al ser pequeño y estar directamente relacionado, se mantiene en el mismo archivo; si creciese o necesitase reutilizarse, se extraería fácilmente.
- **Conversión de divisa**: se asume que el usuario siempre opera en euros. Los fondos denominados en dólares se convierten automáticamente a EUR para la compra.

### Cartera

- **Beneficio (Year to Date)**: al no disponer de datos históricos del valor liquidativo, se utiliza el YTD del fondo como indicador visual de rentabilidad. Con un histórico real se podrían calcular beneficios reales y añadir gráficas de evolución.
- **Divisa de visualización**: al igual que en la compra, se asume que la cartera se visualiza siempre en euros.

## Funcionalidades implementadas

### App

Aplicación con dos rutas /funds y /portfolio:

- **Menú de navegación**: pequeño elemento que contiene enlaces a las dos rutas de la aplicación.
- **Diseño responsivo**: las páginas adaptan el contenido al tamaño de la pantalla, el menú de navegación se encuentra a la izquierda de la página pero pasa a estar abajo de la pantalla en mobile para que su acceso seá más cómodo para la posición de la mano.
- **Internacionalización**: soporte completo para español e inglés.
- **Toggle de idioma**: cambio de idioma pulsando en un botón tipo toggle que muestra el idioma mostrado en la interfaz sin recargar la página.
- **Temas oscuro y claro**: modo claro y oscuro.
- **Selector de tema**: switch que permite cambiar de tema sin recargar la página.
- **DevTools**: panel para manipular MSW en tiempo real (invalidar cachés, simular errores).


### Página de fondos

Página principal, siguiendo la guía de los requisitos de la prueba:

- **Tabla de fondos**: Listado de los fondos en formato tabla con información detallada.
- **Paginación**: La tabla dispone de paginación dinámica donde el usuario puede seleccionar el tamaño de página que quiere tener.
- **Ordenación**: Todas las columnas que disponen de ordenación en el API pueden ser ordenadas, con un icono que muestra la ordenación seleccionada en cada momento.
- **Header sticky**: las cabeceras de la tabla permanecen visibles al hacer scroll vertical, manteniendo siempre el contexto de cada columna.
- **Columna de nombre sticky**: al hacer scroll horizontal, la primera columna (nombre del fondo) queda fija para identificar siempre a qué fondo corresponde cada fila.
- **Detalle del fondo**: el nombre del fondo en la tabla actúa como enlace que abre un diálogo con información detallada.
- **Acciones sobre fondo**: desplegable de acciones en la tabla con las acciones de comprar fondo y ver detalles del fondo.

### Detalles de la cartera

Página de la cartera del usuario donde se muestran las posiciones que posee el usuario:

- **Resumen de cartera**: Datos del valor total de la cartera y un grafico de la composición de la cartera.
- **Listado de posiciones**: listado de fondos agrupados por categoría.
- **Orden alfabético**: los fondos de cada categoria están ordenados alfabéticamente dentro de la categoría.
- **Grupos colapsables**: se pueden colapsar los grupos de las categorías de forma que la pantalla solo muestre los que el usuario quiera revisar.
- **Información detallada de las posiciones**: cada fondo tiene el número de participaciones que el usuario posee, así como el valor total y el beneficio o pérdida (se asume el YTD puesto que el API no aporta esta información).
- **Acciones sobre las posiciones**: acciones de comprar, vender, traspasar y ver detalle.
- **Acciones con swipe en movil**: en movil la pantalla ofrece las acciones haciendo un gesto de barrido hacia la izquierda.

### Histórico de ordenes

Página donde queda el histórico de las órdenes que se realizan sobre los fondos, se almacenan en el cliente puesto que la API no proporciona endpoints para esta funcionalidad:

- **Información detallada**:
  - Tipo de orden.
  - Fondo sobre el que se realiza.
  - Número de participaciones.
  - Fecha.
  - Fondo de destino en caso de traspaso.
  - Valor de la participación en la fecha de la orden.
  - Valor total de la operación en compras y ventas.
  
### Acción de comprar

Posibilidad de comprar fondos, se abre una modal con un formulario para la compra de participaciones de un fondo:

- **Información de la operación**: el formulario muestra el nombre del fondo y el valor de la participación.
- **Validación de valores**: no se pueden realizar compras superioes a 10.000€ ni se pueden realizar compras con valores negativos.
- **Autoformateo en el input**: al realizar el blur el input formatea la cantidad con un formato "10.55€". Se ha asumido la compra en divisa, aunque la interpretación podría ser que el usuario introduce el número de participaciones y el input formatea a divisa.
- **Tipo de cambio**: el formulario asume la compra en € y muestra el tipo de cambio para los fondos que están en dolares.
- **Número de participaciones**: al introducir una cantidad el formulario muestra aproximadamente cuantas participaciones se comprarán.

### Acción de vender

Posibilidad de vender participaciones de fondos que se poseen:

- **Información de la operación**: el formulario muestra el nombre del fondo y el valor de la participación.
- **Participaciones en posesión**: el formulario muestra el número de participaciones que se poseen en ese momento.
- **Validación de valores**: no se pueden introducir número negativos ni se pueden realizar ventas por mayor número de participaciones que se poseen.
- **Valor de la venta**: el formulario muestra el valor aproximado de la venta cuando el usuario introduce un número.
- **Tipo de cambio**: el formulario asume la venta en € y muestra el tipo de cambio para los fondos que están en dolares.

### Acción de traspasar

Posibilidad de traspasar participaciones de un fondo a otro:

- **Validación de valores**: No se pueden traspasar más participaciones de las que se poseen, no se pueden hacer traspasos negativos, no se pueden realizar traspasos al mismo fondo de origen y solo se puede traspasar a fondos que ya se poseen.

> **Nota sobre la funcionalidad**: puesto que el api solo recibe la cantidad del traspaso y simplemente reduce la cantidad en uno y aumenta en otro no he implementado funcionalidad que muestre los valores de la operación como podrían ser el número de participaciones que se obtendrán del fondo destino.

## Mejoras

### UX / Interacción

- **Swipe en la tabla de fondos**: investigar cómo aplicar el gesto de swipe también en la tabla de fondos (no solo en la cartera), teniendo en cuenta que la tabla ya tiene scroll horizontal, lo que puede generar conflictos con el gesto.
- **Detección de dispositivo táctil**: actualmente el swipe se activa según el tamaño de pantalla, pero esto no distingue correctamente entre desktop con pantalla pequeña y dispositivos táctiles. Habría que usar detección de capacidad táctil para cubrir también tablets.
- **Detalle del fondo como desplegable**: mostrar los detalles directamente bajo la fila del fondo (acordeón) en lugar de en un diálogo, para mantener el contexto de la lista.
- **Reintento de acciones fallidas**: cuando una operación de compra, venta o traspaso falla, conservar los datos del formulario para ofrecer al usuario la opción de reintentar directamente desde la notificación de error.
- **Selector de divisa**: permitir al usuario elegir la divisa de visualización de los datos en lugar de asumir siempre EUR.
- **Formulario de compra dual**: añadir la opción de introducir el número de participaciones además del importe en euros, para que el usuario elija el modo de entrada.
- **Mejora visual de errores**: diseñar estados de error más informativos y visualmente integrados.
- **Rutas en los tabs de la cartera**: en la página de la cartera se ha implementado un sistema con dos tabs, uno para las posiciones de la cartera y otro para el histórico de órdenes, pero estas no tienen ruta propia de navegación.

### Arquitectura / Código

- **Estructura de dominios**: conforme la aplicación ha crecido los dominios tienden a mezclarse. Podría tener más sentido elevar `domain/` e `infrastructure/` a primer nivel y mantener solo `application/` y `presentation/` separados por páginas.
- **Gestión de diálogos**: centralizar la apertura y cierre de diálogos mediante un Context dedicado, en lugar de gestionar el estado individualmente en cada componente padre.
- **Renderizado progresivo de la cartera**: actualmente se esperan todas las llamadas de enriquecimiento (`/funds/:id`) antes de pintar la cartera. Cada posición podría renderizarse de forma independiente conforme su información esté disponible.
- **Extracción de componentes comunes**: consolidar patrones repetidos entre páginas (estados de error, acciones, layouts) en componentes reutilizables.
- **Precisión de coma flotante**: la compra y venta en divisa (en lugar de por número de participaciones) introduce errores de precisión con aritmética de punto flotante de JavaScript. Habría que revisar y aplicar redondeo controlado o una librería de precisión decimal.
- **Mejora del tipado**: revisar los tipos de TypeScript en profundidad; es un área en la que tengo margen de mejora.

### Testing

- **Tests E2E**: ampliar la cobertura de Playwright; por limitaciones de tiempo se sacrificaron varias ideas iniciales.
- **Polyfills y utilidades comunes**: extraer los polyfills de jsdom y las utilidades compartidas de los tests a módulos centralizados.
- **Consistencia en asserts**: revisar la semántica de los tests para unificar el estilo de las aserciones.
- **Tests de mutación**: evaluar Stryker una vez completadas las funcionalidades principales.

### Tooling / Infraestructura

- **CI en GitHub**: configurar un pipeline básico con GitHub Actions (lint, tests, build).
- **Storybook**: añadir un catálogo de componentes para desarrollar y revisar en aislamiento.
- **DevTools auto-discovery**: mejorar el panel de DevTools para que detecte los endpoints de MSW automáticamente en lugar de registrarlos a mano.
- **Tema visual**: refinar el tema actual para mejorar el contraste en elementos como el menú de acciones (ellipsis).
- **Documentación de decisiones**: mantener un registro más consistente de las decisiones de diseño tomadas durante el desarrollo.
