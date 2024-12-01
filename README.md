# ProyectoC-ES

# Guía para Instalar y Ejecutar el Proyecto

Este proyecto incluye dos componentes principales: un frontend y un backend. A continuación, se detallan los pasos necesarios para configurar, instalar y ejecutar ambos componentes.

---

## **1. Requisitos Previos**
Antes de comenzar, asegúrate de tener instalados los siguientes programas y herramientas:

- **Node.js** (versión 14 o superior)
- **Python 3.8 o superior**
- **pip** (administrador de paquetes de Python)
- **FastAPI** y **Uvicorn** (para el backend)
- **React** (para el frontend)
- **Git** (opcional, para gestionar repositorios)
- **Virtualenv** (recomendado para entornos Python aislados)

---

## **2. Estructura del Proyecto**
El proyecto está organizado de la siguiente manera:

- `frontend/` - Contiene el código del frontend basado en React.
- `backend/` - Contiene el código del backend basado en FastAPI.

---

## **3. Configuración del Backend**

### **3.1. Navegar al Directorio del Backend**
Accede al directorio del backend desde la terminal:
```bash
cd backend
```

### **3.3. Instalar Dependencias
Asegúrate de estar dentro del entorno virtual y ejecuta:

```bash

pip install -r requirements.txt
```
### **3.4. Ejecutar el Backend
Inicia el servidor local usando Uvicorn:

```bash
uvicorn main:app --reload
```
El servidor estará disponible en http://127.0.0.1:8000.
## **4. Configuración del Frontend
### **4.1. Navegar al Directorio del Frontend
Accede al directorio del frontend desde la terminal:

```bash

cd frontend
```
### **4.2. Instalar Dependencias
Usa npm o yarn para instalar las dependencias del proyecto:

```bash

npm install
```
# O si prefieres yarn:
```
yarn install
```
### **4.3. Configurar las Variables de Entorno
Crea un archivo .env en la raíz del proyecto y define las variables necesarias para conectar con el backend. Por ejemplo:

```env

REACT_APP_API_URL=http://127.0.0.1:8000
```
### **4.4. Ejecutar el Frontend
Inicia el servidor de desarrollo para el frontend:

```bash

npm start
```
# O si usas yarn:
```
yarn start
```
El frontend estará disponible en http://localhost:3000.
## **5. Verificar la Conexión
Asegúrate de que el backend esté corriendo en http://127.0.0.1:8000.
Accede al frontend en http://localhost:3000.
Verifica que el frontend pueda comunicarse correctamente con el backend.
## **6. Despliegue (Opcional)
Si deseas desplegar el proyecto en producción, considera los siguientes pasos:

### **6.1. Contenerización con Docker
Usa Docker para contenerizar el frontend y el backend:

Crea un Dockerfile para cada componente.
Configura un docker-compose.yml para administrar ambos servicios.
### **6.2. Servidor Web para el Frontend
Usa un servidor como Nginx o Apache para servir los archivos estáticos del frontend.

### **6.3. Servidor de Producción para el Backend
Usa un servidor como Gunicorn o Uvicorn con Workers para manejar múltiples solicitudes en el backend.

## **7. Notas Adicionales
Si necesitas personalizar las rutas o la lógica del backend, consulta la documentación de FastAPI.
Usa herramientas como Postman o Insomnia para probar la API del backend.
Si encuentras problemas durante la instalación o ejecución, revisa los logs de la consola y asegúrate de que todas las dependencias estén instaladas correctamente.
