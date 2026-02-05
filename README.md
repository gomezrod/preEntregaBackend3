# AdoptMe - Backend Integration (Pre-entrega 1)

Este repositorio contiene la **primera pre-entrega** del curso de Backend III. El proyecto se basa en la arquitectura de servidor para un sistema de adopción de mascotas (**AdoptMe**), al cual se le ha integrado un módulo de **Mocking** para la generación de data de prueba, cumpliendo con los requisitos especificados en `./consignas.txt`.

## 📋 Descripción del Proyecto

El objetivo de esta entrega es extender la funcionalidad del servidor base "AdoptMe" implementando un mecanismo de mocking. Esto permite poblar la base de datos con usuarios y mascotas ficticias para facilitar el desarrollo y las pruebas de los endpoints sin depender de datos reales o inserciones manuales.

### Funcionalidades Principales
- **Sistema Base**: Gestión de usuarios y mascotas (AdoptMe).
- **Módulo de Mocks**: Nueva ruta para generación automática de datos.

## 🚀 Requisitos Previos

Asegúrate de tener instalado lo siguiente en tu entorno local:
- [Node.js](https://nodejs.org/) (v16 o superior recomendado)
- [MongoDB](https://www.mongodb.com/) (Instancia local o Atlas)

## 🛠️ Instalación

1. **Clonar el repositorio**:
```bash
git clone [https://github.com/gomezrod/preEntregaBackend3.git](https://github.com/gomezrod/preEntregaBackend3.git)
cd preEntregaBackend3

```

2. **Instalar dependencias**:
```bash
npm install

```


3. **Configuración de Variables de Entorno**:
- Crea un archivo `.env` en la raíz del proyecto basándote en el ejemplo (si existe) o define las siguientes variables:
```env
PORT=8080
MONGO_URL=<tu_string_de_conexion_a_mongo>

```



## ▶️ Ejecución

Para levantar el servidor en modo desarrollo (con nodemon):

```bash
npm run dev

```

Para levantar el servidor en modo producción:

```bash
npm start

```

## 📍 Endpoints Nuevos

Para esta pre-entrega se ha habilitado el siguiente endpoint de acuerdo a la consigna:

### 🔹 Mocks

**Ruta:** `/api/mocks`

Este endpoint permite generar y persistir datos ficticios en la base de datos.

* **Método**: `GET` (o `POST`, según implementación final).
* **Descripción**: Genera un conjunto de usuarios y mascotas utilizando la librería `@faker-js/faker` (o similar) y los inserta en la base de datos de MongoDB.
* **Uso**:
Navega o haz una petición a:
```
http://localhost:8080/api/mocks

```


*Nota: Puedes verificar la creación de los datos revisando las colecciones `users` y `pets` en tu base de datos.*

## 📂 Estructura del Proyecto

El proyecto sigue la estructura base de AdoptMe con las siguientes adiciones clave:

```
├── src
│   ├── app.js           # Entry point
│   ├── controllers      # Controladores (mocks.controller.js agregado)
│   ├── routes           # Rutas (mocks.router.js agregado)
│   ├── services         # Lógica de negocio
│   ├── utils            # Utilidades (mocking logic)
│   └── ...
├── consignas.txt        # Requisitos de la entrega
└── package.json

```

## ✒️ Autor

* **Usuario GitHub**: [gomezrod](https://www.google.com/search?q=https://github.com/gomezrod)
* **Curso**: Backend III - Coderhouse

### Recomendaciones adicionales:
1.  **Verifica el método HTTP**: Si en tu código la ruta `/api/mocks` espera parámetros (por ejemplo, `?users=50&pets=100`) o si es un `POST`, ajusta la sección de "Endpoints Nuevos" ligeramente.
2.  **Scripts**: Revisa tu `package.json` para asegurarte de que `npm run dev` y `npm start` son los comandos correctos; si usas otros, actualiza la sección de ejecución.
