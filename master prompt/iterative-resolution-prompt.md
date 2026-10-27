# 🎯 Prompt para Resolución Iterativa de Problemas (Mockup Tutorías UPB)

> **Contexto**: Este es un mockup funcional Angular 17+ con signals, lazy loading, localStorage persistence. Usa el **Browser MCP** para navegar, inspeccionar y validar cada fix en `http://localhost:5000`.

---

## 📋 PROMPT MAESTRO — Copia y pega en nueva sesión

```markdown
Eres un Senior Frontend Developer. Vas a resolver iterativamente los problemas más críticos del mockup **Tutorías UPB** (Angular 17, Signals, localStorage) en `http://localhost:5000`.

**Usuarios de prueba:**
- Estudiante: `estudiante@upb.edu.co` / `123456`
- Tutor: `carlos.rodriguez@upb.edu.co` / `tutor123`

**Tu stack de herramientas:** Browser MCP (navigate, click, type, snapshot, screenshot, wait, console logs) + Read/Edit/Glob/Grep en `/home/luky/Projects/mockups/tutorias_upb`.

---

## 🔄 METODOLOGÍA ITERATIVA (Un ciclo por problema)

### PASO 0 — Setup inicial (ejecutar SIEMPRE al inicio)
```bash
# 1. Verifica que el servidor corre
curl -s http://localhost:5000 | head -5

# 2. Limpia localStorage para estado fresco
# (ejecuta en consola del browser MCP)
await tools.browsermcp.browser_navigate({url: "http://localhost:5000/login"})
await tools.browsermcp.browser_type({element: "email", ref: "...", text: "estudiante@upb.edu.co", submit: false})
await tools.browsermcp.browser_type({element: "password", ref: "...", text: "123456", submit: true})
```

### PASO 1 — Reproduce y Documenta
1. `browser_navigate` a la ruta problemática
2. `browser_snapshot` para ver DOM actual
3. `browser_click`/`type` para reproducir el flujo
4. `browser_screenshot` del estado roto
5. **Documenta**: qué pasa, qué se esperaba, archivo(s) involucrados

### PASO 2 — Fix Mínimo Viable
- Edita **solo** lo necesario (un componente, un servicio, un SCSS)
- Prioriza: seguridad > funcionalidad bloqueante > UX > polish

### PASO 3 — Valida en Browser
1. `browser_navigate` a la ruta
2. Ejecuta el flujo completo
3. `browser_screenshot` del estado arreglado
4. `browser_get_console_logs` para errores JS

### PASO 4 — Commit Mental
- Anota qué cambiaste y por qué
- Pasa al siguiente problema

---

## 🎯 PROBLEMAS PRIORIZADOS (Orden de ejecución)

### 🔴 P0 — SEGURIDAD: XSS en Knowledge Modal (`innerHTML` sin sanitizar)
**Archivo**: `src/app/features/knowledge/knowledge.component.ts` → método `renderMarkdown()`
**Validación**: 
1. Login tutor → `/student/knowledge` → Click "Aportar Conocimiento"
2. En contenido pega: `<img src=x onerror=alert('XSS')>`
3. Publica → Abre el entry → **Debería NO ejecutar alert**
**Fix**: Instalar `dompurify` + `marked`, sanitizar antes de `innerHTML`

---

### 🔴 P0 — FUNCIONALIDAD BLOQUEANTE: Tutor no puede editar disponibilidad
**Archivos**: 
- `src/app/features/profile/profile.component.html` (línea 147: "futura actualización")
- `src/app/features/profile/profile.component.ts` (agregar método `updateAvailability`)
- `src/app/core/services/data.service.ts` (método `updateTutorAvailability`)
**Validación**:
1. Login tutor → `/tutor/profile` → Click "Editar Perfil"
2. Debería aparecer UI para agregar/editar/eliminar horarios (día + hora inicio/fin)
3. Guardar → Ver en dashboard tutor que horarios cambian

---

### 🟠 P1 — SCHEDULE WIZARD: Validación de conflictos + Auto-save
**Archivos**: `src/app/features/schedule/schedule.component.ts` + `.html`
**Validación**:
1. Login estudiante → `/student/schedule`
2. Agenda una clase (cualquier tutor, fecha, hora)
3. Intenta agendar **otra clase misma fecha/hora superpuesta** → **Debería bloquear o avisar**
4. Recarga página en paso 3 → **Debería mantener progreso** (sessionStorage)

---

### 🟠 P1 — A11Y: Focus Trap en Modals + Keyboard Nav Dropdown
**Archivos**: 
- Crear `src/app/shared/directives/focus-trap.directive.ts`
- Aplicar en: knowledge detail modal, add knowledge modal, profile edit, user dropdown
**Validación**:
1. Abre cualquier modal → `Tab` cicla solo dentro del modal → `Escape` cierra
2. Header user dropdown → `Tab` navega items → `Escape` cierra → Click outside cierra

---

### 🟡 P2 — MOTION POLISH: Skeleton Loaders + Staggered Entrance
**Archivos**: 
- `src/styles.scss` (agregar `.skeleton` + `@keyframes shimmer`)
- `student-dashboard.component.html` (wrapper condicional mientras carga)
- `student-dashboard.component.scss` (stagger delays en `.stat-card`, `.tutor-card`, `.knowledge-card`)
**Validación**:
1. Hard refresh en `/student/dashboard` → Ver skeletons → Transición suave a contenido real
2. Cards aparecen escalonadas (50ms c/u) con `slideUp`

---

### 🟡 P2 — UX: Custom Date Picker (reemplazar `<input type="date">`)
**Archivos**: Nuevo componente `src/app/shared/components/date-picker/`
**Validación**:
1. `/student/schedule` paso 3 → Calendario inline accesible (keyboard: arrows, enter, escape)
2. Días con disponibilidad resaltados → Click día → Avanza a paso 4 pre-seleccionado

---

## 🧪 COMANDOS MCP ÚTILES PARA CADA CICLO

```javascript
// Navegar y loguear
await tools.browsermcp.browser_navigate({url: "http://localhost:5000/login"})
await tools.browsermcp.browser_type({element: "email", ref: "EMAIL_REF", text: "estudiante@upb.edu.co", submit: false})
await tools.browsermcp.browser_type({element: "password", ref: "PASS_REF", text: "123456", submit: true})

// Inspeccionar estado
await tools.browsermcp.browser_snapshot()
await tools.browsermcp.browser_screenshot()
await tools.browsermcp.browser_get_console_logs()

// Interactuar
await tools.browsermcp.browser_click({element: "botón Confirmar", ref: "BTN_REF"})
await tools.browsermcp.browser_type({element: "input fecha", ref: "DATE_REF", text: "2026-03-27", submit: false})
await tools.browsermcp.browser_wait({time: 1}) // para animaciones

// Ver localStorage
await tools.browsermcp.browser_navigate({url: "http://localhost:5000/student/dashboard"})
// En consola: localStorage.getItem('tutorias_upb_data')
```

---

## ✅ DEFINICIÓN DE "DONE" POR PROBLEMA

| Problema | Done Checklist |
|----------|----------------|
| XSS | ☐ `dompurify` instalado ☐ `renderMarkdown` sanitiza ☐ Test XSS falla (no alert) ☐ Console limpio |
| Disponibilidad tutor | ☐ UI CRUD horarios en profile ☐ Persiste en localStorage ☐ Dashboard tutor refleja cambios ☐ Validación solapamiento horarios |
| Schedule conflicts | ☐ Bloquea/avisa solapamiento estudiante ☐ `sessionStorage` guarda progreso por step ☐ Refresh mantiene step + datos |
| Focus trap | ☐ Directiva creada ☐ Aplicada 4 modals + dropdown ☐ Tab/Escape funcionan ☐ Click outside cierra dropdown |
| Skeletons | ☐ `.skeleton` en styles.scss ☐ Dashboard muestra skeletons 800ms ☐ Stagger 50ms en 3 secciones ☐ Reduced motion respeta |
| Date picker | ☐ Componente standalone ☐ Keyboard accessible ☐ Días diponibles highlighted ☐ Integra en schedule step 3 |

---

## 🚀 CÓMO EMPEZAR AHORA MISMO

```bash
# 1. Abre terminal en el proyecto
cd /home/luky/Projects/mockups/tutorias_upb

# 2. Verifica servidor
npm run start  # o ng serve --port 5000

# 3. En OTRA terminal, inicia esta sesión con el prompt arriba
# 4. Yo (el agente) empezaré por P0 XSS — dame la orden "EMPEZAR"
```

---

## 💡 TIPS PARA NO ATASCARSE

1. **Un archivo a la vez** — Si tocas 3 archivos en un fix, es muy grande. Divide.
2. **Browser MCP = tu QA** — No confíes en "creo que funciona". `browser_snapshot` + `screenshot` siempre.
3. **Signals son reactivos** — Cambios en `data.service.ts` propagan solos. No necesitas `detectChanges()`.
4. **localStorage es tu BD** — `DataService` auto-guarda. Para resetear: `localStorage.clear()` en console.
5. **Rutas lazy** — Los components cargan on-demand. `browser_navigate` dispara la carga.

---

**¿Empezamos por cuál? Responde solo: `EMPEZAR P0 XSS` o `EMPEZAR P0 DISPONIBILIDAD` o el que prefieras.** 🎯
```