# 🚀 Guía de Despliegue en Vercel

## 📋 Requisitos Previos

1. **Cuenta de Vercel** - [vercel.com](https://vercel.com)
2. **Git** instalado en tu máquina
3. **Node.js** versión 16 o superior

## 🔧 Pasos para Desplegar

### **Paso 1: Instalar Vercel CLI**
```bash
npm install -g vercel
```

### **Paso 2: Login en Vercel**
```bash
vercel login
```

### **Paso 3: Desplegar desde el directorio del proyecto**
```bash
cd server-pokemon
vercel
```

### **Paso 4: Seguir las instrucciones interactivas**
- Selecciona tu cuenta
- Confirma el nombre del proyecto
- Confirma el directorio (./)
- Confirma que es un proyecto Node.js

## ⚙️ Configuración de Variables de Entorno

### **En el Dashboard de Vercel:**

1. Ve a tu proyecto en [vercel.com/dashboard](https://vercel.com/dashboard)
2. Haz clic en "Settings" → "Environment Variables"
3. Agrega estas variables:

```
JWT_SECRET = tu-secreto-jwt-super-seguro-para-produccion
NODE_ENV = production
```

### **Importante:** 
- Cambia `JWT_SECRET` por una cadena segura y única
- Nunca uses el secreto por defecto en producción

## 🔄 Despliegues Automáticos

### **Conecta tu repositorio Git:**
1. En Vercel Dashboard, ve a "Settings" → "Git"
2. Conecta tu repositorio de GitHub/GitLab/Bitbucket
3. Cada push a `main` o `master` desplegará automáticamente

### **Despliegue manual:**
```bash
vercel --prod
```

## 📱 URLs de tu API

Después del despliegue, tendrás URLs como:
- **Producción:** `https://tu-proyecto.vercel.app`
- **Preview:** `https://tu-proyecto-git-main.vercel.app`

## 🧪 Probar tu API Desplegada

### **1. Verificar salud del servidor:**
```bash
curl https://tu-proyecto.vercel.app/api/health
```

### **2. Registrar usuario:**
```bash
curl -X POST https://tu-proyecto.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

### **3. Login:**
```bash
curl -X POST https://tu-proyecto.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

### **4. Obtener Pokémon (con token):**
```bash
curl -X GET "https://tu-proyecto.vercel.app/api/pokemon?limit=3" \
  -H "Authorization: Bearer TU_TOKEN_JWT"
```

## 🛠️ Comandos Útiles de Vercel

```bash
# Ver estado del proyecto
vercel ls

# Ver logs
vercel logs

# Abrir dashboard
vercel open

# Remover proyecto
vercel remove

# Ver variables de entorno
vercel env ls
```

## ⚠️ Consideraciones de Producción

1. **JWT_SECRET:** Usa una cadena segura y única
2. **Rate Limiting:** Considera implementar límites de velocidad
3. **CORS:** Configura los dominios permitidos
4. **Logs:** Monitorea los logs en Vercel Dashboard
5. **Performance:** Vercel tiene límites de tiempo de ejecución

## 🔍 Solución de Problemas

### **Error: "Function execution timeout"**
- Aumenta `maxDuration` en `vercel.json`
- Optimiza las llamadas a PokeAPI

### **Error: "Module not found"**
- Verifica que todas las dependencias estén en `package.json`
- Asegúrate de que no estén en `devDependencies`

### **Error: "Environment variable not found"**
- Verifica que las variables estén configuradas en Vercel Dashboard
- Asegúrate de que estén en el entorno correcto (Production/Preview)

## 📚 Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Node.js en Vercel](https://vercel.com/docs/runtimes#official-runtimes/node-js)
- [Variables de Entorno](https://vercel.com/docs/environment-variables)
