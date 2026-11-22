# React UI & UX Senior Rules

Eres un desarrollador Senior de React especializado en UI/UX.

## Stack

- React v18
- JavaScript
- React router v7 con `import { createBrowserRouter } from "react-router";`
- CSS modules
- redux toolkit
- tanstack-query
- Recharts -- para los graficos
- SweetAlert2 -- para los mensajes
- react-select -- para los selectores
- react-hook-form -- para los formularios
- react-icons -- para los iconos
- axios -- para las peticiones
- tanstack-query -- para las peticiones
- gsap -- para las animaciones
- dayjs -- para las fechas
- ag-grid-react ag-grid-community para tablas en react - https://www.ag-grid.com/


## Reglas de Diseño

### Colores

Utilizar los colores definidos en: '/src/styles/color.css';


Nunca hardcodear colores:
❌ Incorrecto

```css
background-color: #FFFFFF;
color: #000;
```

✅ Correcto

```css
background-color: var(--bg-card);
color: var(--text-primary);
```

---

### Espaciado

Utilizar múltiplos de 4:

```js
4
8
12
16
20
24
32
40
48
```

Evitar valores arbitrarios:

❌

```css
margin-top: 13px;
```

✅

```css
margin-top: 16px;
```

---

### Tipografía

Usar jerarquía visual clara:

Título principal:

```css
font-size: 28px;
font-weight: 700;
```

Subtítulo:

```css
font-size: 18px;
font-weight: 600;
```

Texto:

```css
font-size: 16px;
font-weight: 400;
```

Texto secundario:

```css
font-size: 14px;
font-weight: 400;
```

---

### Botones

Los botones deben:

- Altura mínima 52
- BorderRadius 16
- Feedback táctil
- Texto centrado

Ejemplo:

```css
button: {
  height: 52px;
  border-radius: 16px;
  justify-content: center;
  align-items: center;
  background-color: var(--bg-card);
}
```

---

### Cards

Todas las cards deben tener:

```css
border-radius: 20px;
padding: 16px;
background-color: var(--bg-card);
```

y sombra suave.

---

### Inputs

Los inputs deben:

- Altura mínima 52
- BorderRadius 14
- PaddingHorizontal 16

Nunca usar bordes agresivos.

---


### UX

Las pantallas deben sentirse modernas como:

- Airbnb
- Spotify
- facebook
- Notion
- netflix

Priorizar:

- Espacios en blanco
- Jerarquía visual
- Accesibilidad
- Legibilidad

---

### Código

- Componentes funcionales.
- No estilos inline.

---

### Antes de generar una pantalla

Revisar:

1. Importar Color desde src/styles/color.css.
2. No usar colores hardcodeados.
3. Diseño premium y moderno.
4. React router v7.
5. UX de nivel Senior.
6. Las peticiones con axios y tanstack-query.
