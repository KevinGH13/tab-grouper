# Tab Grouper

Extensión de Chrome que agrupa tus pestañas automáticamente según reglas personalizadas de URL y título.

![Chrome MV3](https://img.shields.io/badge/Manifest-V3-4285f4?style=flat-square&logo=googlechrome&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## ¿Para qué sirve?

Si trabajas con muchas pestañas abiertas al mismo tiempo (AWS, Azure, GitHub, Jira, etc.), Tab Grouper las organiza automáticamente en grupos de colores sin que tengas que hacer nada.

Cada vez que abres o navegas a una pestaña, la extensión evalúa su URL y título contra tus reglas. Si hay coincidencia, la agrega al grupo correspondiente. Si el grupo no existe aún, lo crea.

---

## Características

- **Agrupación automática en tiempo real** — actúa al cargar cada pestaña
- **Reglas personalizables** — por URL, por título, o ambas
- **Patrones con comodines** — usa `*` como wildcard (`*aws.amazon.com*`)
- **Sin comodín** → búsqueda parcial automática (`Pull Request` coincide con cualquier título que lo contenga)
- **9 colores disponibles** — los mismos que usa Chrome nativamente
- **Activar/desactivar reglas** individualmente sin borrarlas
- **Agrupación manual** — botón para forzar la agrupación de todas las pestañas abiertas
- **Toggle global** — pausa toda la agrupación automática con un clic

---

## Reglas incluidas por defecto

| Nombre | Color | Condiciones |
|---|---|---|
| AWS | 🟠 Naranja | URL contiene `aws.amazon.com` o `amazonaws.com` |
| Azure | 🔵 Azul | URL contiene `portal.azure.com` o `azure.microsoft.com` |
| Pull Requests | 🟣 Morado | URL contiene `/pull/` · Título contiene `Pull Request` |

Puedes editarlas, desactivarlas o eliminarlas desde la página de opciones.

---

## Instalación (modo desarrollador)

1. Descarga o clona este repositorio
   ```bash
   git clone https://github.com/kevingh13/tab-grouper.git
   ```
2. Abre Chrome y ve a `chrome://extensions`
3. Activa **"Modo desarrollador"** (esquina superior derecha)
4. Haz click en **"Cargar descomprimida"**
5. Selecciona la carpeta del proyecto

La extensión aparecerá en la barra de herramientas de Chrome.

---

## Uso

### Popup (icono en la barra)
- Activa o pausa la agrupación automática con el toggle
- Fuerza la agrupación de todas las pestañas abiertas con el botón
- Ve qué grupos están activos en la ventana actual

### Página de opciones (ícono ⚙️)
- Crea, edita y elimina reglas
- Activa/desactiva reglas individualmente
- Define condiciones de tipo `URL` o `Título`

### Sintaxis de patrones

| Patrón | Comportamiento |
|---|---|
| `*aws.amazon.com*` | Wildcard: la URL debe contener `aws.amazon.com` en cualquier posición |
| `portal.azure.com` | Substring: coincidencia parcial, sin importar mayúsculas |
| `*/pull/*` | Wildcard: cualquier URL con `/pull/` en la ruta |
| `Pull Request` | Substring: cualquier título que contenga ese texto |

---

## Estructura del proyecto

```
tab-grouper/
├── manifest.json          # Configuración de la extensión (MV3)
├── background.js          # Service worker: escucha tabs y aplica reglas
├── lib/
│   ├── storage.js         # Lectura y escritura de reglas en chrome.storage.sync
│   └── rules-engine.js    # Lógica de evaluación de condiciones
├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
└── options/
    ├── options.html
    ├── options.js
    └── options.css
```

---

## Permisos requeridos

| Permiso | Motivo |
|---|---|
| `tabs` | Leer URL y título de las pestañas, y moverlas a grupos |
| `tabGroups` | Crear, consultar y actualizar grupos de pestañas |
| `storage` | Guardar las reglas del usuario con `chrome.storage.sync` |

No se recopila ni se envía ningún dato externo.

---

## Compatibilidad

Requiere **Chrome 89+** (versión en que se introdujo la API `tabGroups`).

---

## Licencia

MIT
