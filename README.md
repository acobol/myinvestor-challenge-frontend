# MyInvestor Challenge Frontend

## Decisiones

### Stack inicial:

- Vite como bundler: simple, estable, rápido y una de las opciones por defecto al crear una app react, decido no ir por un framework como Next debido a que no es un proyecto de gran envergadura que compense la complejidad añadida del framework. Aunque acaba de salir la versión 8 elijo usar la 7 para no encontrar incompatibilidades como la de la ultíma versión de tailwind.
- Typescript como lenguaje: Ecosistema maduro, experiencia de desarrollo mejorada sobre javascript debido a su tipado, desarrollo algo más lento para prototipos que se compensa en el largo plazo con los errores que nos evita.
- React router en modo declarativo: ligero y sencillo, aporta la capa de routing sin más puesto que no necesitamos más para un proyecto pequeño como este, lo que hace sencillo cambiarlo o pasar al modo framework si se necesita más funcionalidad.
- Vitest para los test: remplazo casi exacto de la api de Jest con una experiencia de desarrollo algo más moderna y que se integra directamente con el bundler elegido lo que reduce la frición en el proyecto y la necesidad de tener varias configuraciones.
- Shadcn como librería de componentes: Son componentes sencillos pero potentes, altamente personalizables, con la accesibilidad de serie y aporta un control total sobre los componentes puesto que se añade el código al proyecto admitiendo modificaciones sin necesidad de pasar por el control de una librería externa.
- Tailwind para estilos: aporta velocidad a la hora de prototipar con todas sus clases de utilidades, altamente personalizable, buena documentación y soporte y con filosofía mobile first.
- React-testing-library: Permite hacer que los tests se comporten igual que lo haría un usuario interactuando con el naveegador, lo que hace que los test sean robustos frente a cambios en las estructuras del código y a la par son más reales y permite hacer testing de la accesibilidad de la aplicación.
- Mocks de servidor: MSW, ligero, sencillo de usar y al usar los service worker para interceptar los fetch las llamadas aparecen en el tab de network de las devtools, lo que facilita el debugging. Añadimos msw/data y Faker para crear los datos mock.
- Decido usar ESLint en lugar de las alternativas analizadas puesto que no veo sentido para una prueba las fricciones que puede suponer nuevas tecnologías, sobre todo teniendo en cuenta que el boilerplate que añade la plantilla de aplicación de vite ya lo integra.
- Para peticiones tanstack-query: tal vez es demasiado para un proyecto pequeño como esta prueba y con un fetch sin nada podríamos avanzar sin problemas, pero no añade mucho overhead y aporta comodidad y ya estaría preparado el proyecto para evolucionar. SWR ofrece características muy similares en un bundle más pequeño, pero para la prueba el tamaño del bundle no es determinante y si mal no recuerdo en myinvestor ya usaban tanstack-query por lo que es un buen entrenamiento.
- Para la tabla tanstack-table: filosofía headless, lo que nos permite implementarla en el framework que queramos puesto que solo se ocupa de la gestión de los datos, una librería para la gestión de la tabla me parece importante puesto que ya he lidiado con problemas a la hora de trabajar con tablas custom.
- Test E2E: Playwright, herramienta algo más moderna que Cypress, con mejor rendimiento en mi experiencia y el uso es muy similar y aunque no tengo tanta experiencia como con Cypress no espero muchos bloqueos.
- React-i18next: internacionalización de los textos

Por evaluar:

- Que usar para el swipe? Por consistencia tal vez el swipe en mobile también se puede añadir en la tabla de fondos y no solo en la de cartera como dice la prueba
- Para los formularios, será necesario una librería como React Hook form o son suficientemente sencillos como para que typescript + useFormStatus sea suficiente, usamos Zod para comprobar esquemas o typescript ya será suficiente?
- Hacer test de mutación? Tal vez una vez finalizado todo lo principal.
- Añadir CI
- Si se añade CI un hook pre commit para asegurarse de que los mensajes de commit cumplen estaría bien. No prioritario

### Arquitectura

- Las acciones sobre los fondos se encuentran en el dominio del portfolio, la razón de esto es que aunque el recurso del api REST es /funds lo que se modifica es el portfolio, por lo que considero que es un lugar con más sentido en nuestra aplicación.
- Arquitectura Hexagonal + Domain Driven Design: cada feature está separada y tiene su extrauctura de arquitectura hexagonal, de esta forma siempre que se quiere acceder a algo el orden de resolución es simple, buscar el dominio del que se necesita un recurso y luego buscar por el tipo de recurso según la arquitectura hexagonal.
- Añadidas unas devtools que permiten manipular el comportamiento de MSW en el navegadorr, de forma que podemos invalidar caches, y simular errores sin cambiar código. Mejoras posibles: poder configurar el tipo de errores que devolver, que los endpoints se lean de los archivos de forma que todo sea automático o que se pueda hacer común y no requiera añadirlos a mano uno a uno.
- Los componentes atómicos o más generalistas agnósticos de dominio viven en la carpeta src/components, los componentes con conocimiento de dominio como puede ser el Input con el formateo de la divisa viven en la carpeta /src/shared, siguiendo la convención de nombres de la arquitectura hexagonal propuesta.

### Features

#### Fondos

- La tabla con header sticky, siempre tenenemos acceso al significado de cada columna
- La columna con el nombre también es sticky en el scroll horizontal, para saber siempre a que fondo corresponden los datos.
- En FundsTable.tsx hay dos componentes en lugar de solo uno, puesto que el componente de celda es auxiliar y el archivo es pequeño puede estar contenido ahí, si el archivo creciese o existiese la necesidad de reusar el componente se puede extraer fácilmente.
