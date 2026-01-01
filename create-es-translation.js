const fs = require('fs');

// Spanish translations mapping for the en.json file
const translations = {
  "app": {
    "title": "HebBirthday | Calendario Hebreo y Gregoriano",
    "taglinePart1": "Nunca pierdas una fecha -",
    "taglineHebrew": "Hebrea",
    "taglineOr": "o",
    "taglineGregorian": "Gregoriana"
  },
  "guest": {
    "portalTitle": "Portal de Lista de Deseos",
    "welcome": "Bienvenido Invitado",
    "welcomeSubtitle": "Identifícate para ver y editar tu lista de deseos",
    "portalInfo": "Este portal es para registros de cumpleaños existentes. ¿No puedes iniciar sesión? Pide a tus amigos o familiares que agreguen tu cumpleaños a la aplicación.",
    "portalInfoShort": "Este portal es para registros de cumpleaños existentes...",
    "readMore": "Leer más",
    "readLess": "Mostrar menos",
    "findWishlist": "Encuentra Tu Lista de Deseos",
    "searchSubtitle": "Busca tu nombre para comenzar",
    "searchPlaceholder": "Comienza a escribir tu nombre...",
    "verifyTitle": "Verificar Identidad",
    "verifySubtitle": "Para editar la lista de deseos de {{name}}, verifica tu fecha de nacimiento.",
    "notYou": "¿No eres tú? Cambiar persona",
    "gregorianDate": "Fecha Gregoriana",
    "hebrewDate": "Fecha Hebrea",
    "day": "Día",
    "month": "Mes",
    "year": "Año",
    "verifyButton": "Verificar y Acceder a Lista de Deseos",
    "accessButton": "Entrar a Mi Lista de Deseos",
    "incompleteDate": "Por favor ingresa una fecha de nacimiento completa",
    "loginError": "Error de inicio de sesión. Verifica tu nombre y fecha de nacimiento.",
    "missingFields": "Por favor ingresa tu nombre y apellido",
    "myWishlist": "Mi Lista de Deseos",
    "exit": "Salir",
    "addNewItem": "Agregar Nuevo Artículo",
    "editItem": "Editar Artículo",
    "save": "Guardar",
    "cancel": "Cancelar",
    "emptyWishlist": "Tu lista de deseos está vacía. ¡Agrega algo!",
    "deleteConfirm": "¿Estás seguro de que quieres eliminar este artículo?",
    "sessionExpired": "Error al agregar artículo. La sesión puede haber expirado.",
    "updateError": "Error al actualizar artículo.",
    "deleteError": "Error al eliminar artículo.",
    "firstName": "Nombre",
    "lastName": "Apellido",
    "verificationMethod": "Método de Verificación",
    "selectProfile": "Seleccionar Lista",
    "multipleProfilesFound": "Encontramos múltiples registros que coinciden con tus detalles. Selecciona qué lista deseas ver:",
    "back": "Atrás",
    "managingWishlistFor": "Gestionando lista para:",
    "backToSearch": "Volver a Búsqueda",
    "accessDenied": "El acceso al portal de invitados ha sido deshabilitado por el administrador.",
    "viewList": "Ver Lista",
    "listOwnedBy": "Cuenta de {{name}}",
    "rateLimitError": "Demasiados intentos. Por favor espera.",
    "maxItemsError": "No se pueden agregar más de {{count}} artículos",
    "maxItemsLimitReached": "Límite máximo de artículos alcanzado ({{count}})",
    "groups": "Grupos"
  },
  "guestAccess": {
    "welcomeToGroup": "Bienvenido al Grupo {{name}}",
    "portalInfo": "Agrega nuevos cumpleaños y ve la lista existente",
    "addBirthday": "Agregar Nuevo Cumpleaños",
    "existingBirthdays": "Cumpleaños Existentes en el Grupo",
    "searchPlaceholder": "Buscar nombre...",
    "noBirthdaysFound": "No se encontraron cumpleaños en este grupo",
    "noSearchResults": "No se encontraron resultados",
    "addSuccess": "¡Cumpleaños agregado exitosamente!",
    "addError": "Error al agregar cumpleaños",
    "invalidLink": "Enlace inválido o expirado",
    "groupNotEnabled": "El acceso de invitados no está habilitado para este grupo",
    "linkExpired": "Enlace Inválido",
    "accessRestricted": "Acceso Restringido",
    "accessDisabledExplain": "El administrador del grupo ha deshabilitado el acceso de invitados",
    "tooManyAttempts": "Demasiados intentos",
    "contactAdmin": "Por favor contacta al administrador del grupo para obtener un nuevo enlace",
    "errorFetching": "Error al cargar datos",
    "rateLimitError": "Demasiados intentos. Por favor intenta más tarde.",
    "networkError": "Error de red. Por favor verifica tu conexión.",
    "fillRequired": "Por favor completa todos los campos requeridos",
    "duplicateConfirm": "Se encontró un registro similar: {{name}}. ¿Agregar de todos modos?",
    "guestAdded": "Agregado por invitado",
    "botDetected": "Actividad sospechosa detectada. Por favor intenta de nuevo.",
    "limitReached": "Has alcanzado el límite de adiciones para este enlace. Por favor contacta al administrador del grupo.",
    "tokenExpired": "Este enlace ha expirado (72 horas). Por favor contacta al administrador del grupo para obtener un nuevo enlace.",
    "verifyHebrewDate": "Por favor verifica que la fecha hebrea sea correcta. Si no, cambia 'Nacido después del atardecer' a continuación.",
    "verifyGregorianDate": "Verifica que la fecha gregoriana correspondiente sea correcta"
  },
  "common": {
    "save": "Guardar",
    "cancel": "Cancelar",
    "delete": "Eliminar",
    "edit": "Editar",
    "add": "Agregar",
    "search": "Buscar",
    "filter": "Filtrar",
    "filters": "Filtros",
    "close": "Cerrar",
    "confirm": "Confirmar",
    "loading": "Cargando...",
    "error": "Error",
    "success": "Éxito",
    "copyToWhatsapp": "Copiar",
    "copyToWhatsappList": "Copiar lista de cumpleaños a WhatsApp",
    "copied": "¡Copiado!",
    "yes": "Sí",
    "no": "No",
    "male": "Masculino",
    "female": "Femenino",
    "other": "Otro",
    "actions": "Acciones",
    "selected": "seleccionado",
    "clear": "Limpiar",
    "confirmDelete": "¿Estás seguro?",
    "noResults": "No se encontraron resultados",
    "sortByName": "Ordenar por Nombre",
    "sortByDate": "Ordenar por Fecha",
    "select": "Seleccionar",
    "creating": "Creando...",
    "create": "Crear",
    "developedBy": "Desarrollado por",
    "back": "Atrás",
    "version": "Versión",
    "this": "este",
    "events": "eventos",
    "switchLanguage": "Cambiar a Hebreo",
    "switchToEnglish": "English",
    "switchToHebrew": "עברית",
    "linkedInProfile": "Perfil de LinkedIn",
    "day": "Día",
    "month": "Mes",
    "year": "Año",
    "menu": "Menú",
    "note": "Nota",
    "moreInfo": "Más Información",
    "birthDate": "Fecha de Nacimiento",
    "created": "Creado",
    "markAsRead": "Marcar todo como leído",
    "new": "Nuevo",
    "history": "Historial",
    "deleteSelected": "Eliminar Seleccionados",
    "markSelectedAsRead": "Marcar Seleccionados como Leídos",
    "selectAll": "Seleccionar Todo",
    "deselectAll": "Deseleccionar Todo",
    "linkCopied": "¡Enlace copiado!",
    "advancedOptions": "Opciones Avanzadas (calendario, notas)",
    "lessOptions": "Menos Opciones",
    "quickGuide": "Guía Rápida",
    "fullGuide": "Guía Completa del Usuario"
  }
};

// Read the original English file
const enContent = JSON.parse(fs.readFileSync('src/locales/en.json', 'utf8'));

// Create es.json based on en.json structure with translations
const esContent = JSON.parse(JSON.stringify(enContent));

// Helper function to recursively translate
function applyTranslations(target, source, path = '') {
  for (const key in source) {
    if (typeof source[key] === 'object' && source[key] !== null) {
      applyTranslations(target[key], source[key], path ? `${path}.${key}` : key);
    } else {
      target[key] = source[key];
    }
  }
}

applyTranslations(esContent, translations);

// Write to es.json
fs.writeFileSync('src/locales/es.json', JSON.stringify(esContent, null, 2), 'utf8');
console.log('✓ Spanish translation file created successfully at src/locales/es.json');
