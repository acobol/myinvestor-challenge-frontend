# MyInvestor Challenge Frontend

## Decisiones

Stack inicial:
 - Vite como bundler: simple, estable, rápido y una de las opciones por defecto al crear una app react, decido no ir por un framework como Next debido a que no es un proyecto de gran envergadura que compense la complejidad añadida del framework. Aunque acaba de salir la versión 8 elijo usar la 7 para no encontrar incompatibilidades como la de la ultíma versión de tailwind.
 - Typescript como lenguaje: Ecosistema maduro, experiencia de desarrollo mejorada sobre javascript debido a su tipado, desarrollo algo más lento para prototipos que se compensa en el largo plazo con los errores que nos evita.
 - React router en modo declarativo: ligero y sencillo, aporta la capa de routing sin más puesto que no necesitamos más para un proyecto pequeño como este, lo que hace sencillo cambiarlo o pasar al modo framework si se necesita más funcionalidad.
 - Vitest para los test: remplazo casi exacto de la api de Jest con una experiencia de desarrollo algo más moderna y que se integra directamente con el bundler elegido lo que reduce la frición en el proyecto y la necesidad de tener varias configuraciones.
 - Shadcn como librería de componentes:  Son componentes sencillos pero potentes, altamente personalizables, con la accesibilidad de serie y aporta un control total sobre los componentes puesto que se añade el código al proyecto admitiendo modificaciones sin necesidad de pasar por el control de una librería externa.
 - Tailwind para estilos: aporta velocidad a la hora de prototipar con todas sus clases de utilidades, altamente personalizable, buena documentación y soporte y con filosofía mobile first.
 - React-testing-library: Permite hacer que los tests se comporten igual que lo haría un usuario interactuando con el naveegador, lo que hace que los test sean robustos frente a cambios en las estructuras del código y a la par son más reales y permite hacer testing de la accesibilidad de la aplicación.

 Por evaluar:
 - Evaluar oxlint y Biome y ver que tan fácil puede ser un reemplazo de eslint y que tan estable es el ecosistema.
 - Que librería para peticiones usar: tanstack-query o swr.
 - Será necesario storybook?
 - Mocks de servidor: muy útil para desarrollar sin necesidad de tener el backend levantado y para los tests. MSW, Mirage, JSON-server?
 - Test E2E: Cypress o Playwrigth
 - Que usar para el swipe?
 - Para los formularios, será necesario una librería como React Hook form o son suficientemente sencillos como para que typescript + useFormStatus sea suficiente, usamos Zod para comprobar esquemas o typescript ya será suficiente?
 - Gestion de la tabla, parece que no necesitaré virtualizar, pero tal vez es interesante poder tener modo de tabla infinita, parece que myinvestor tiene tabla infinita con carga con scroll.
 - Hacer test de mutación? Tal vez una vez finalizado todo lo principal.
