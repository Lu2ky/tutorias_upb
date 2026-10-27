import { Injectable, signal, computed, effect } from '@angular/core';
import {
  AppData,
  User,
  Tutor,
  ScheduledClass,
  KnowledgeEntry,
  Career,
  Subject,
  ClassMessage,
} from '../models';

const STORAGE_KEY = 'tutorias_upb_data';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  // Initial mock data
  private readonly initialData: AppData = {
    users: [
      {
        id: 'user-1',
        email: 'estudiante@upb.edu.co',
        password: '123456',
        name: 'Juan Pérez',
        career: 'Ingeniería de Sistemas',
        semester: 5,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juana',
        createdAt: new Date('2024-01-15').toISOString(),
        role: 'student',
      },
      {
        id: 'user-2',
        email: 'maria.garcia@upb.edu.co',
        password: '123456',
        name: 'María García',
        career: 'Ingeniería Industrial',
        semester: 3,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juan',
        createdAt: new Date('2024-02-20').toISOString(),
        role: 'student',
      },
      // Tutor users for login
      {
        id: 'tutor-user-1',
        email: 'carlos.rodriguez@upb.edu.co',
        password: 'tutor123',
        name: 'Dr. Carlos Rodríguez',
        career: 'Ingeniería de Sistemas',
        semester: 0,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
        createdAt: new Date('2023-01-10').toISOString(),
        role: 'tutor',
        tutorId: 'tutor-1',
      },
      {
        id: 'tutor-user-2',
        email: 'ana.martinez@upb.edu.co',
        password: 'tutor123',
        name: 'Dra. Ana Martínez',
        career: 'Ingeniería Industrial',
        semester: 0,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juan',
        createdAt: new Date('2023-02-15').toISOString(),
        role: 'tutor',
        tutorId: 'tutor-2',
      },
      {
        id: 'tutor-user-3',
        email: 'luis.fernandez@upb.edu.co',
        password: 'tutor123',
        name: 'Ing. Luis Fernández',
        career: 'Ingeniería de Sistemas',
        semester: 0,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eduard',
        createdAt: new Date('2023-03-01').toISOString(),
        role: 'tutor',
        tutorId: 'tutor-3',
      },
      {
        id: 'tutor-user-4',
        email: 'patricia.lopez@upb.edu.co',
        password: 'tutor123',
        name: 'Dra. Patricia López',
        career: 'Ingeniería Industrial',
        semester: 0,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Patricia',
        createdAt: new Date('2023-01-20').toISOString(),
        role: 'tutor',
        tutorId: 'tutor-4',
      },
    ],
    tutors: [
      {
        id: 'tutor-1',
        name: 'Dr. Carlos Rodríguez',
        email: 'carlos.rodriguez@upb.edu.co',
        career: 'Ingeniería de Sistemas',
        subjects: [
          'Estructuras de Datos',
          'Algoritmos',
          'Programación Orientada a Objetos',
          'Bases de Datos',
        ],
        rating: 4.9,
        reviewCount: 127,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
        bio: 'Profesor con 15 años de experiencia en desarrollo de software y docencia universitaria. Especialista en algoritmos y estructuras de datos.',
        hourlyRate: 45000,
        availability: [
          { dayOfWeek: 1, startTime: '14:00', endTime: '18:00' },
          { dayOfWeek: 2, startTime: '10:00', endTime: '14:00' },
          { dayOfWeek: 4, startTime: '14:00', endTime: '18:00' },
          { dayOfWeek: 5, startTime: '08:00', endTime: '12:00' },
        ],
      },
      {
        id: 'tutor-2',
        name: 'Dra. Ana Martínez',
        email: 'ana.martinez@upb.edu.co',
        career: 'Ingeniería Industrial',
        subjects: [
          'Investigación de Operaciones',
          'Estadística Aplicada',
          'Simulación',
          'Optimización',
        ],
        rating: 4.8,
        reviewCount: 98,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
        bio: 'Experta en optimización y simulación. Doctora en Ingeniería Industrial con publicaciones en revistas internacionales.',
        hourlyRate: 50000,
        availability: [
          { dayOfWeek: 1, startTime: '08:00', endTime: '12:00' },
          { dayOfWeek: 3, startTime: '14:00', endTime: '18:00' },
          { dayOfWeek: 4, startTime: '08:00', endTime: '12:00' },
          { dayOfWeek: 6, startTime: '09:00', endTime: '13:00' },
        ],
      },
      {
        id: 'tutor-3',
        name: 'Ing. Luis Fernández',
        email: 'luis.fernandez@upb.edu.co',
        career: 'Ingeniería de Sistemas',
        subjects: ['Desarrollo Web', 'React', 'Node.js', 'TypeScript', 'Bases de Datos NoSQL'],
        rating: 4.7,
        reviewCount: 156,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luis',
        bio: 'Full Stack Developer y mentor tech. Ha trabajado en startups y empresas Fortune 500. Apasionado por la enseñanza práctica.',
        hourlyRate: 40000,
        availability: [
          { dayOfWeek: 2, startTime: '14:00', endTime: '20:00' },
          { dayOfWeek: 3, startTime: '14:00', endTime: '20:00' },
          { dayOfWeek: 5, startTime: '14:00', endTime: '20:00' },
          { dayOfWeek: 6, startTime: '10:00', endTime: '16:00' },
        ],
      },
      {
        id: 'tutor-4',
        name: 'Dra. Patricia López',
        email: 'patricia.lopez@upb.edu.co',
        career: 'Ingeniería Industrial',
        subjects: ['Gestión de Proyectos', 'Calidad Total', 'Lean Manufacturing', 'Six Sigma'],
        rating: 4.9,
        reviewCount: 87,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Patricia',
        bio: 'Certificada PMP y Black Belt Six Sigma. 20 años liderando proyectos de mejora continua en manufactura y servicios.',
        hourlyRate: 55000,
        availability: [
          { dayOfWeek: 1, startTime: '16:00', endTime: '20:00' },
          { dayOfWeek: 3, startTime: '16:00', endTime: '20:00' },
          { dayOfWeek: 5, startTime: '08:00', endTime: '12:00' },
        ],
      },
    ],
    scheduledClasses: [
      {
        id: 'class-1',
        studentId: 'user-1',
        tutorId: 'tutor-1',
        subject: 'Estructuras de Datos',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        startTime: '14:00',
        endTime: '16:00',
        status: 'confirmed',
        notes: 'Repaso de árboles binarios y balanceo',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'class-2',
        studentId: 'user-1',
        tutorId: 'tutor-3',
        subject: 'React',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        startTime: '15:00',
        endTime: '17:00',
        status: 'pending',
        notes: 'Hooks avanzados y Context API',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'class-3',
        studentId: 'user-2',
        tutorId: 'tutor-2',
        subject: 'Investigación de Operaciones',
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '12:00',
        status: 'confirmed',
        notes: 'Método Simplex - ejercicios prácticos',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'class-4',
        studentId: 'user-1',
        tutorId: 'tutor-1',
        subject: 'Algoritmos',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        startTime: '16:00',
        endTime: '18:00',
        status: 'completed',
        notes: 'Divide y vencerás, programación dinámica',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'class-5',
        studentId: 'user-2',
        tutorId: 'tutor-4',
        subject: 'Gestión de Proyectos',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '11:00',
        status: 'pending',
        notes: 'Metodologías ágiles vs cascada',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    classMessages: [
      {
        id: 'msg-1',
        classId: 'class-1',
        senderId: 'tutor-user-1',
        senderRole: 'tutor',
        message:
          'Hola Juan, confirmo la clase para el día acordado. Por favor repasa el material de árboles AVL antes de la sesión.',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'msg-2',
        classId: 'class-1',
        senderId: 'user-1',
        senderRole: 'student',
        message: 'Perfecto profesor, tendré todo listo. ¡Gracias!',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
      },
    ],
    knowledgeBase: [
      {
        id: 'kb-1',
        career: 'Ingeniería de Sistemas',
        subject: 'Estructuras de Datos',
        topic: 'Árboles Binarios de Búsqueda',
        content: `## Árboles Binarios de Búsqueda (BST)

Un **Árbol Binario de Búsqueda** es una estructura de datos jerárquica donde cada nodo tiene como máximo dos hijos, y cumple la propiedad de orden:

- Todos los valores en el subárbol izquierdo son **menores** que el valor del nodo
- Todos los valores en el subárbol derecho son **mayores** que el valor del nodo

### Operaciones Principales

#### Inserción
\`\`\`typescript
function insert(node: Node | null, value: number): Node {
  if (!node) return new Node(value);
  
  if (value < node.value) {
    node.left = insert(node.left, value);
  } else if (value > node.value) {
    node.right = insert(node.right, value);
  }
  
  return node;
}
\`\`\`

#### Búsqueda
\`\`\`typescript
function search(node: Node | null, value: number): boolean {
  if (!node) return false;
  if (node.value === value) return true;
  
  return value < node.value
    ? search(node.left, value)
    : search(node.right, value);
}
\`\`\`

### Complejidad Temporal

| Operación | Promedio | Peor Caso |
|-----------|----------|-----------|
| Búsqueda  | O(log n) | O(n)      |
| Inserción | O(log n) | O(n)      |
| Eliminación | O(log n) | O(n)     |

> **Nota**: El peor caso ocurre cuando el árbol se desbalancea (se vuelve una lista enlazada). Para evitar esto, se usan árboles auto-balanceados como **AVL** o **Rojo-Negro**.

### Recorridos

- **In-order**: Izquierda → Nodo → Derecha (produce orden ascendente)
- **Pre-order**: Nodo → Izquierda → Derecha
- **Post-order**: Izquierda → Derecha → Nodo`,
        tags: ['estructuras-de-datos', 'arboles', 'bst', 'algoritmos'],
        authorId: 'tutor-1',
        authorName: 'Dr. Carlos Rodríguez',
        createdAt: new Date('2024-01-20').toISOString(),
        updatedAt: new Date('2024-01-20').toISOString(),
        likes: 42,
        views: 1250,
      },
      {
        id: 'kb-2',
        career: 'Ingeniería de Sistemas',
        subject: 'Programación Orientada a Objetos',
        topic: 'Patrones de Diseño: Factory Method',
        content: `## Factory Method Pattern

El **Factory Method** es un patrón creacional que proporciona una interfaz para crear objetos en una superclase, permitiendo que las subclases alteren el tipo de objetos que se crearán.

### Problema que Resuelve

Imagina que tienes una aplicación de logística que inicialmente solo maneja transporte por **camión**. El código está acoplado a la clase \`Truck\`. Ahora necesitas agregar soporte para **barcos**.

Sin Factory Method, tendrías que modificar todo el código que crea objetos \`Truck\`.

### Estructura

1. **Product** (interfaz común): \`Transport\`
2. **Concrete Products**: \`Truck\`, \`Ship\`
3. **Creator** (abstracto): \`Logistics\` con método \`factoryMethod()\`
4. **Concrete Creators**: \`RoadLogistics\`, \`SeaLogistics\`

### Implementación TypeScript

\`\`\`typescript
// Product interface
interface Transport {
  deliver(): void;
}

// Concrete Products
class Truck implements Transport {
  deliver() {
    console.log('Entregando por tierra en camión 🚛');
  }
}

class Ship implements Transport {
  deliver() {
    console.log('Entregando por mar en barco 🚢');
  }
}

// Creator abstracto
abstract class Logistics {
  // Factory Method
  abstract createTransport(): Transport;

  // Operación que usa el factory method
  planDelivery() {
    const transport = this.createTransport();
    transport.deliver();
  }
}

// Concrete Creators
class RoadLogistics extends Logistics {
  createTransport(): Transport {
    return new Truck();
  }
}

class SeaLogistics extends Logistics {
  createTransport(): Transport {
    return new Ship();
  }
}

// Uso
const logistics: Logistics = new RoadLogistics();
logistics.planDelivery(); // "Entregando por tierra en camión 🚛"
\`\`\`

### Cuándo Usarlo

- Cuando no sabes de antemano qué tipos de objetos necesitarás crear
- Cuando quieres delegar la creación a subclases
- Cuando el sistema debe ser independiente de cómo se crean sus objetos`,
        tags: ['poo', 'patrones-diseno', 'factory-method', 'typescript'],
        authorId: 'tutor-1',
        authorName: 'Dr. Carlos Rodríguez',
        createdAt: new Date('2024-02-10').toISOString(),
        updatedAt: new Date('2024-02-10').toISOString(),
        likes: 38,
        views: 980,
      },
      {
        id: 'kb-3',
        career: 'Ingeniería Industrial',
        subject: 'Investigación de Operaciones',
        topic: 'Método Simplex - Programación Lineal',
        content: `## Método Simplex

El **Método Simplex** es un algoritmo para resolver problemas de **programación lineal** en forma estándar.

### Forma Estándar

Maximizar: \`Z = c₁x₁ + c₂x₂ + ... + cₙxₙ\`

Sujeto a:
\`\`\`
a₁₁x₁ + a₁₂x₂ + ... + a₁ₙxₙ ≤ b₁
a₂₁x₁ + a₂₂x₂ + ... + a₂ₙxₙ ≤ b₂
...
aₘ₁x₁ + aₘ₂x₂ + ... + aₘₙxₙ ≤ bₘ
x₁, x₂, ..., xₙ ≥ 0
\`\`\`

### Pasos del Algoritmo

1. **Convertir a forma estándar**: Agregar variables de holgura
2. **Tabla inicial**: Construir la tabla simplex
3. **Variable entrante**: Columna con coeficiente más negativo en fila Z
4. **Variable saliente**: Mínimo ratio \`bᵢ / aᵢⱼ\` (donde \`aᵢⱼ > 0\`)
5. **Pivotear**: Hacer 1 el pivote y 0 el resto de la columna
6. **Repetir** hasta que no hay coeficientes negativos en fila Z

### Ejemplo

**Maximizar**: \`Z = 3x₁ + 2x₂\`

**Sujeto a**:
\`\`\`
x₁ + x₂ ≤ 4
2x₁ + x₂ ≤ 5
x₁, x₂ ≥ 0
\`\`\`

**Con variables de holgura (s₁, s₂)**:
\`\`\`
x₁ + x₂ + s₁ = 4
2x₁ + x₂ + s₂ = 5
\`\`\`

**Solución óptima**: \`x₁ = 2, x₂ = 2, Z = 10\`

### Casos Especiales

- **Solución Múltiple**: Coeficiente 0 en variable no básica en fila Z óptima
- **No Acotada**: Todos los coeficientes de columna entrante ≤ 0
- **Infactible**: Variable artificial en base con valor > 0 en fase I`,
        tags: ['investigacion-operaciones', 'simplex', 'programacion-lineal', 'optimizacion'],
        authorId: 'tutor-2',
        authorName: 'Dra. Ana Martínez',
        createdAt: new Date('2024-02-15').toISOString(),
        updatedAt: new Date('2024-02-15').toISOString(),
        likes: 56,
        views: 2100,
      },
      {
        id: 'kb-4',
        career: 'Ingeniería de Sistemas',
        subject: 'Bases de Datos',
        topic: 'Normalización - 3FN y BCNF',
        content: `## Normalización de Bases de Datos

La **normalización** es el proceso de organizar datos para reducir redundancia y evitar anomalías de actualización.

### Formas Normales Principales

#### 1FN (Primera Forma Normal)
- Valores atómicos en cada columna
- Sin grupos repetidos
- Cada fila es única

#### 2FN (Segunda Forma Normal)
- Cumple 1FN
- **Sin dependencias parciales**: Atributos no clave dependen de **toda** la clave primaria

#### 3FN (Tercera Forma Normal)
- Cumple 2FN
- **Sin dependencias transitivas**: Atributo no clave no depende de otro atributo no clave

#### BCNF (Boyce-Codd Normal Form)
- Versión más estricta de 3FN
- Para toda dependencia funcional \`X → Y\`, \`X\` es superclave

### Ejemplo Práctico

**Tabla NO normalizada**:
| Estudiante | Curso | Profesor | Depto_Profesor | Nota |
|------------|-------|----------|----------------|------|
| Juan       | BD    | Dr. Ruiz | Sistemas       | 4.5  |
| Juan       | POO   | Dr. Pérez| Sistemas       | 4.8  |
| María      | BD    | Dr. Ruiz | Sistemas       | 4.2  |

**Problemas**: Redundancia (Dr. Ruiz aparece 2 veces), Anomalía de actualización (si cambia depto de Dr. Ruiz, actualizar múltiples filas)

**En 3FN**:

*Estudiante_Curso*
| Estudiante | Curso | Nota |
|------------|-------|------|
| Juan       | BD    | 4.5  |
| Juan       | POO   | 4.8  |
| María      | BD    | 4.2  |

*Curso_Profesor*
| Curso | Profesor |
|-------|----------|
| BD    | Dr. Ruiz |
| POO   | Dr. Pérez |

*Profesor_Depto*
| Profesor | Depto |
|----------|-------|
| Dr. Ruiz | Sistemas |
| Dr. Pérez | Sistemas |

### Anomalías que Evita

| Anomalía | Descripción |
|----------|-------------|
| **Inserción** | No se puede agregar un profesor sin asignarle curso |
| **Actualización** | Cambiar depto de profesor requiere múltiples updates |
| **Eliminación** | Borrar último curso de un profesor pierde info del profesor |`,
        tags: ['bases-de-datos', 'normalizacion', '3fn', 'bcnf', 'sql'],
        authorId: 'tutor-1',
        authorName: 'Dr. Carlos Rodríguez',
        createdAt: new Date('2024-03-01').toISOString(),
        updatedAt: new Date('2024-03-01').toISOString(),
        likes: 67,
        views: 3200,
      },
      {
        id: 'kb-5',
        career: 'Ingeniería Industrial',
        subject: 'Estadística Aplicada',
        topic: 'Prueba de Hipótesis - t-Student',
        content: `## Prueba t de Student

La **prueba t** se usa para comparar medias cuando la **desviación estándar poblacional es desconocida** y el tamaño de muestra es pequeño (\`n < 30\`).

### Tipos de Prueba t

#### 1. Una muestra (One-sample t-test)
Compara la media muestral \`x̄\` con un valor poblacional conocido \`μ₀\`

\`\`\`
H₀: μ = μ₀
H₁: μ ≠ μ₀ (bilateral) / μ > μ₀ (unilateral derecha) / μ < μ₀ (unilateral izquierda)

t = (x̄ - μ₀) / (s / √n)
gl = n - 1
\`\`\`

#### 2. Dos muestras independientes (Independent t-test)
Compara medias de dos grupos independientes

\`\`\`
H₀: μ₁ = μ₂
H₁: μ₁ ≠ μ₂

t = (x̄₁ - x̄₂) / √(s₁²/n₁ + s₂²/n₂)
gl ≈ (s₁²/n₁ + s₂²/n₂)² / ((s₁²/n₁)²/(n₁-1) + (s₂²/n₂)²/(n₂-1))  // Welch-Satterthwaite
\`\`\`

#### 3. Muestras pareadas (Paired t-test)
Mismas unidades medidas dos veces (antes/después)

\`\`\`
dᵢ = xᵢ₁ - xᵢ₂  (diferencias)
H₀: μ_d = 0
H₁: μ_d ≠ 0

t = d̄ / (s_d / √n)
gl = n - 1
\`\`\`

### Supuestos

1. **Normalidad**: Datos ~ N(μ, σ²) o n ≥ 30 (TCL)
2. **Independencia**: Observaciones independientes
3. **Homocedasticidad** (2 muestras): Varianzas iguales (verificar con Levene)

### Ejemplo Práctico

**¿Mejora un nuevo método de estudio las calificaciones?**

- 10 estudiantes: nota antes y después
- \`d̄ = 3.2\`, \`s_d = 1.8\`, \`n = 10\`
- \`t = 3.2 / (1.8/√10) = 5.62\`
- \`gl = 9\`, \`t_crítico(0.05, 9) = 2.262\`
- **Rechazamos H₀**: Hay evidencia significativa de mejora (p < 0.001)

### En Python

\`\`\`python
from scipy import stats

# Una muestra
stats.ttest_1samp(data, popmean=70)

# Dos muestras independientes
stats.ttest_ind(group1, group2, equal_var=False)  // Welch

# Pareadas
stats.ttest_rel(before, after)
\`\`\``,
        tags: ['estadistica', 't-student', 'prueba-hipotesis', 'inferencia'],
        authorId: 'tutor-2',
        authorName: 'Dra. Ana Martínez',
        createdAt: new Date('2024-03-10').toISOString(),
        updatedAt: new Date('2024-03-10').toISOString(),
        likes: 44,
        views: 1850,
      },
    ],
    careers: [
      {
        id: 'career-1',
        name: 'Ingeniería de Sistemas',
        code: 'IS',
        subjects: [
          { id: 'sub-1', name: 'Estructuras de Datos', code: 'IS-301', careerId: 'career-1' },
          { id: 'sub-2', name: 'Algoritmos', code: 'IS-302', careerId: 'career-1' },
          {
            id: 'sub-3',
            name: 'Programación Orientada a Objetos',
            code: 'IS-303',
            careerId: 'career-1',
          },
          { id: 'sub-4', name: 'Bases de Datos', code: 'IS-304', careerId: 'career-1' },
          { id: 'sub-5', name: 'Desarrollo Web', code: 'IS-401', careerId: 'career-1' },
          { id: 'sub-6', name: 'Arquitectura de Software', code: 'IS-402', careerId: 'career-1' },
          { id: 'sub-7', name: 'Redes de Computadores', code: 'IS-305', careerId: 'career-1' },
          { id: 'sub-8', name: 'Sistemas Operativos', code: 'IS-306', careerId: 'career-1' },
        ],
      },
      {
        id: 'career-2',
        name: 'Ingeniería Industrial',
        code: 'II',
        subjects: [
          {
            id: 'sub-9',
            name: 'Investigación de Operaciones',
            code: 'II-301',
            careerId: 'career-2',
          },
          { id: 'sub-10', name: 'Estadística Aplicada', code: 'II-302', careerId: 'career-2' },
          { id: 'sub-11', name: 'Simulación', code: 'II-303', careerId: 'career-2' },
          { id: 'sub-12', name: 'Optimización', code: 'II-304', careerId: 'career-2' },
          { id: 'sub-13', name: 'Gestión de Proyectos', code: 'II-401', careerId: 'career-2' },
          { id: 'sub-14', name: 'Calidad Total', code: 'II-402', careerId: 'career-2' },
          { id: 'sub-15', name: 'Lean Manufacturing', code: 'II-403', careerId: 'career-2' },
          { id: 'sub-16', name: 'Six Sigma', code: 'II-404', careerId: 'career-2' },
        ],
      },
      {
        id: 'career-3',
        name: 'Ingeniería Electrónica',
        code: 'IE',
        subjects: [
          { id: 'sub-17', name: 'Circuitos Eléctricos', code: 'IE-201', careerId: 'career-3' },
          { id: 'sub-18', name: 'Electrónica Analógica', code: 'IE-301', careerId: 'career-3' },
          { id: 'sub-19', name: 'Electrónica Digital', code: 'IE-302', careerId: 'career-3' },
          { id: 'sub-20', name: 'Señales y Sistemas', code: 'IE-303', careerId: 'career-3' },
          { id: 'sub-21', name: 'Control Automático', code: 'IE-401', careerId: 'career-3' },
          { id: 'sub-22', name: 'Comunicaciones', code: 'IE-402', careerId: 'career-3' },
          { id: 'sub-23', name: 'Microcontroladores', code: 'IE-304', careerId: 'career-3' },
          { id: 'sub-24', name: 'Instrumentación', code: 'IE-403', careerId: 'career-3' },
        ],
      },
    ],
    currentUser: null,
  };

  // Signals for reactive state
  private dataSignal = signal<AppData>(this.loadFromStorage());
  private loadingSignal = signal<boolean>(false);

  // Computed selectors
  readonly users = computed(() => this.dataSignal().users);
  readonly tutors = computed(() => this.dataSignal().tutors);
  readonly scheduledClasses = computed(() => this.dataSignal().scheduledClasses);
  readonly classMessages = computed(() => this.dataSignal().classMessages);
  readonly knowledgeBase = computed(() => this.dataSignal().knowledgeBase);
  readonly careers = computed(() => this.dataSignal().careers);
  readonly currentUser = computed(() => this.dataSignal().currentUser);
  readonly isAuthenticated = computed(() => !!this.dataSignal().currentUser);
  readonly loading = this.loadingSignal.asReadonly();

  // Role-specific computed
  readonly isStudent = computed(() => this.currentUser()?.role === 'student');
  readonly isTutor = computed(() => this.currentUser()?.role === 'tutor');
  readonly currentTutorId = computed(() => this.currentUser()?.tutorId || null);

  // Career-specific computed
  readonly tutorsByCareer = computed(() => {
    const user = this.currentUser();
    if (!user) return [];
    return this.tutors().filter((t) => t.career === user.career);
  });

  readonly knowledgeByCareer = computed(() => {
    const user = this.currentUser();
    if (!user) return [];
    return this.knowledgeBase().filter((k) => k.career === user.career);
  });

  readonly subjectsByCareer = computed(() => {
    const user = this.currentUser();
    if (!user) return [];
    const career = this.careers().find((c) => c.name === user.career);
    return career?.subjects || [];
  });

  // Student classes
  readonly userClasses = computed(() => {
    const user = this.currentUser();
    if (!user || user.role !== 'student') return [];
    return this.scheduledClasses()
      .filter((c) => c.studentId === user.id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  readonly upcomingClasses = computed(() => {
    const now = new Date();
    return this.userClasses().filter(
      (c) => new Date(c.date) >= now && (c.status === 'confirmed' || c.status === 'pending'),
    );
  });

  readonly pastClasses = computed(() => {
    const now = new Date();
    return this.userClasses().filter(
      (c) => new Date(c.date) < now || c.status === 'completed' || c.status === 'cancelled',
    );
  });

  // Tutor classes
  readonly tutorClasses = computed(() => {
    const tutorId = this.currentTutorId();
    if (!tutorId) return [];
    return this.scheduledClasses()
      .filter((c) => c.tutorId === tutorId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  readonly tutorUpcomingClasses = computed(() => {
    const now = new Date();
    return this.tutorClasses().filter(
      (c) => new Date(c.date) >= now && (c.status === 'confirmed' || c.status === 'pending'),
    );
  });

  readonly tutorPastClasses = computed(() => {
    const now = new Date();
    return this.tutorClasses().filter(
      (c) => new Date(c.date) < now || c.status === 'completed' || c.status === 'cancelled',
    );
  });

  readonly tutorPendingClasses = computed(() => {
    return this.tutorClasses().filter((c) => c.status === 'pending');
  });

  // Tutor earnings computation
  readonly tutorProjectedEarnings = computed(() => {
    const tutorId = this.currentTutorId();
    if (!tutorId) return 0;

    const tutor = this.getTutorProfile(tutorId);
    if (!tutor) return 0;

    const confirmedUpcomingClasses = this.tutorUpcomingClasses().filter(
      (c) => c.status === 'confirmed',
    );

    // Sum hours for each confirmed upcoming class
    let totalHours = 0;
    for (const cls of confirmedUpcomingClasses) {
      const start = cls.startTime.split(':').map(Number);
      const end = cls.endTime.split(':').map(Number);
      const startMinutes = start[0] * 60 + start[1];
      const endMinutes = end[0] * 60 + end[1];
      totalHours += (endMinutes - startMinutes) / 60;
    }

    return totalHours * tutor.hourlyRate;
  });

  // Messages for a specific class
  getClassMessages(classId: string): ClassMessage[] {
    return this.classMessages()
      .filter((m) => m.classId === classId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  constructor() {
    // Auto-save to localStorage on changes
    effect(() => {
      const data = this.dataSignal();
      this.saveToStorage(data);
    });
  }

  // LocalStorage storage methods (more capacity than cookies)
  private saveToStorage(data: AppData): void {
    try {
      const json = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEY, json);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private loadFromStorage(): AppData {
    // Try localStorage first
    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        // Validate that the parsed data has the expected structure
        if (parsed.users && parsed.tutors && parsed.careers && parsed.currentUser !== undefined) {
          return parsed;
        }
      } catch {
        // Fall through to initial data
      }
    }
    return this.initialData;
  }

  // Public API
  refreshFromStorage(): void {
    this.dataSignal.set(this.loadFromStorage());
  }

  // Auth methods
  login(email: string, password: string): User | null {
    const user = this.users().find((u) => u.email === email && u.password === password);
    if (user) {
      this.dataSignal.update((data) => ({ ...data, currentUser: user }));
      return user;
    }
    return null;
  }

  register(userData: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.dataSignal.update((data) => ({
      ...data,
      users: [...data.users, newUser],
      currentUser: newUser,
    }));
    return newUser;
  }

  logout(): void {
    this.dataSignal.update((data) => ({ ...data, currentUser: null }));
  }

  updateProfile(updates: Partial<User>): void {
    const user = this.currentUser();
    if (!user) return;

    const updatedUser = { ...user, ...updates };
    this.dataSignal.update((data) => ({
      ...data,
      users: data.users.map((u) => (u.id === user.id ? updatedUser : u)),
      currentUser: updatedUser,
    }));
  }

  // Tutor methods
  getTutorById(id: string): Tutor | undefined {
    return this.tutors().find((t) => t.id === id);
  }

  getTutorsBySubject(subject: string): Tutor[] {
    return this.tutors().filter((t) => t.subjects.includes(subject));
  }

  getTutorProfile(tutorId: string): Tutor | undefined {
    return this.tutors().find((t) => t.id === tutorId);
  }

  // Class scheduling methods
  scheduleClass(
    classData: Omit<ScheduledClass, 'id' | 'createdAt' | 'updatedAt' | 'status'>,
  ): ScheduledClass {
    const now = new Date().toISOString();
    const newClass: ScheduledClass = {
      ...classData,
      id: `class-${Date.now()}`,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    this.dataSignal.update((data) => ({
      ...data,
      scheduledClasses: [...data.scheduledClasses, newClass],
    }));
    return newClass;
  }

  updateClassStatus(classId: string, status: ScheduledClass['status']): void {
    this.dataSignal.update((data) => ({
      ...data,
      scheduledClasses: data.scheduledClasses.map((c) =>
        c.id === classId ? { ...c, status, updatedAt: new Date().toISOString() } : c,
      ),
    }));
  }

  // Cancel class with reason (for both student and tutor)
  cancelClass(classId: string, reason: string, cancelledBy: 'student' | 'tutor'): void {
    this.dataSignal.update((data) => ({
      ...data,
      scheduledClasses: data.scheduledClasses.map((c) =>
        c.id === classId
          ? {
              ...c,
              status: 'cancelled' as const,
              cancellationReason: reason,
              cancelledBy,
              cancelledAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : c,
      ),
    }));
  }

  // Reschedule class (tutor only)
  rescheduleClass(
    classId: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string,
    reason: string,
  ): ScheduledClass {
    const originalClass = this.scheduledClasses().find((c) => c.id === classId);
    if (!originalClass) throw new Error('Clase no encontrada');

    const now = new Date().toISOString();

    // Mark original as rescheduled
    this.dataSignal.update((data) => ({
      ...data,
      scheduledClasses: data.scheduledClasses.map((c) =>
        c.id === classId
          ? {
              ...c,
              status: 'rescheduled' as const,
              rescheduledTo: `${newDate} ${newStartTime}-${newEndTime}`,
              updatedAt: now,
            }
          : c,
      ),
    }));

    // Create new class
    const newClass: ScheduledClass = {
      id: `class-${Date.now()}`,
      studentId: originalClass.studentId,
      tutorId: originalClass.tutorId,
      subject: originalClass.subject,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      status: 'pending',
      notes: `Reagendada desde ${originalClass.date} ${originalClass.startTime}-${originalClass.endTime}. Razón: ${reason}`,
      rescheduledFrom: classId,
      createdAt: now,
      updatedAt: now,
    };

    this.dataSignal.update((data) => ({
      ...data,
      scheduledClasses: [...data.scheduledClasses, newClass],
    }));

    return newClass;
  }

  // Confirm class (tutor only)
  confirmClass(classId: string): void {
    this.updateClassStatus(classId, 'confirmed');
  }

  // Complete class (tutor only)
  completeClass(classId: string): void {
    this.updateClassStatus(classId, 'completed');
  }

  // Class messages
  sendClassMessage(classId: string, message: string): ClassMessage {
    const user = this.currentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const newMessage: ClassMessage = {
      id: `msg-${Date.now()}`,
      classId,
      senderId: user.id,
      senderRole: user.role,
      message,
      createdAt: new Date().toISOString(),
    };

    this.dataSignal.update((data) => ({
      ...data,
      classMessages: [...data.classMessages, newMessage],
    }));

    return newMessage;
  }

  // Knowledge base methods
  addKnowledgeEntry(
    entry: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'views'>,
  ): KnowledgeEntry {
    const newEntry: KnowledgeEntry = {
      ...entry,
      id: `kb-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: 0,
      views: 0,
    };
    this.dataSignal.update((data) => ({
      ...data,
      knowledgeBase: [...data.knowledgeBase, newEntry],
    }));
    return newEntry;
  }

  updateKnowledgeEntry(id: string, updates: Partial<KnowledgeEntry>): void {
    this.dataSignal.update((data) => ({
      ...data,
      knowledgeBase: data.knowledgeBase.map((k) =>
        k.id === id ? { ...k, ...updates, updatedAt: new Date().toISOString() } : k,
      ),
    }));
  }

  likeKnowledgeEntry(id: string): void {
    this.dataSignal.update((data) => ({
      ...data,
      knowledgeBase: data.knowledgeBase.map((k) =>
        k.id === id ? { ...k, likes: k.likes + 1 } : k,
      ),
    }));
  }

  incrementViews(id: string): void {
    this.dataSignal.update((data) => ({
      ...data,
      knowledgeBase: data.knowledgeBase.map((k) =>
        k.id === id ? { ...k, views: k.views + 1 } : k,
      ),
    }));
  }

  // Career/Subject helpers
  getCareerByName(name: string): Career | undefined {
    return this.careers().find((c) => c.name === name);
  }

  getSubjectsByCareer(careerName: string): Subject[] {
    const career = this.getCareerByName(careerName);
    return career?.subjects || [];
  }

  // Tutor profile methods
  updateTutorAvailability(
    tutorId: string,
    availability: { dayOfWeek: number; startTime: string; endTime: string }[],
  ): void {
    this.dataSignal.update((data) => ({
      ...data,
      tutors: data.tutors.map((t) =>
        t.id === tutorId ? { ...t, availability, updatedAt: new Date().toISOString() } : t,
      ),
    }));
  }

  updateTutorProfile(tutorId: string, updates: Partial<Tutor>): void {
    this.dataSignal.update((data) => ({
      ...data,
      tutors: data.tutors.map((t) =>
        t.id === tutorId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t,
      ),
    }));
  }
}
