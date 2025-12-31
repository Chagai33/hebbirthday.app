#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Spanish translation script for es.json
Translates specific sections from English to Spanish
"""

import json
import sys

# Spanish translations dictionary (comprehensive)
spanish_translations = {
    # Auth section
    "Sign In": "Iniciar Sesión",
    "Sign Up": "Registrarse",
    "Sign Out": "Cerrar Sesión",
    "Email": "Correo Electrónico",
    "Password": "Contraseña",
    "Confirm Password": "Confirmar Contraseña",
    "Display Name": "Nombre para Mostrar",
    "Phone Number": "Número de Teléfono",
   "Verification Code": "Código de Verificación",
    "Sign in with Google": "Iniciar sesión con Google",
    "Sign up with Google": "Registrarse con Google",
    "Sign in with Email": "Iniciar sesión con Correo",
    "Sign up with Email": "Registrarse con Correo",
    "or": "o",
    "Sign in with Phone": "Iniciar sesión con Teléfono",
    
    # Birthday section
    "Birthdays": "Cumpleaños",
    "Full Name": "Nombre Completo",
    "Add Birthday": "Agregar Cumpleaños",
    "Edit Birthday": "Editar Cumpleaños",
    "First Name": "Nombre",
    "Last Name": "Apellido",
    "Birth Date": "Fecha de Nacimiento",
    "Next 10 years": "Próximos 10 años",
    "Next": "Próximo",
    "Past": "Pasado",
    "Unassigned": "Sin asignar",
    "After Sunset": "Después del Atardecer",
    "Gender": "Género",
    "Group": "Grupo",
    "Select Group": "Seleccionar Grupo",
    "No Group": "Sin Grupo",
    "Hebrew Date": "Fecha Hebrea",
    "Gregorian Date": "Fecha Gregoriana",
    
    # Groups
    "Groups": "Grupos",
    "Manage Groups": "Gestionar Grupos",
    "Add Group": "Agregar Grupo",
    "Edit Group": "Editar Grupo",
    "Delete Group": "Eliminar Grupo",
    "Group Name": "Nombre del Grupo",
    "Group Type": "Tipo de Grupo",
    "Group Color": "Color del Grupo",
    "Calendar Preference": "Preferencia de Calendario",
    "Family": "Familia",
    "Friends": "Amigos",
    "Work": "Trabajo",
    "Other": "Otro",
    "Custom": "Personalizado",
    
    # WishList
    "Wishlist": "Lista de Deseos",
    "My Wishlist": "Mi Lista de Deseos",
    "Add Item": "Agregar Artículo",
    "Edit Item": "Editar Artículo",
    "Delete Item": "Eliminar Artículo",
    "Item Name": "Nombre del Artículo",
    "Description": "Descripción",
    "Priority": "Prioridad",
    "High": "Alta",
    "Medium": "Media",
    "Low": "Baja",
    
    # Dashboard
    "Dashboard": "Panel",
    "Statistics": "Estadísticas",
    "Total Birthdays": "Total de Cumpleaños",
    
    # Settings
    "Settings": "Configuración",
    "Timezone": "Zona Horaria",
    "Danger Zone": "Zona Peligrosa",
    "Delete Account": "Eliminar Cuenta",
    
    # Footer
    "Terms of Use": "Términos de Uso",
    "Privacy Policy": "Política de Privacidad",
    "Feedback": "Comentarios",
    "All rights reserved": "Todos los derechos reservados",
    "Developed by": "Desarrollado por",
    
    # Google Calendar
    "Google Calendar": "Google Calendar",
    "Connect to Google Calendar": "Conectar a Google Calendar",
    "Connected to Google Calendar": "Conectado a Google Calendar",
    "Disconnect": "Desconectar",
    "Sync": "Sincronizar",
    "Syncing...": "Sincronizando...",
    "Synced": "Sincronizado",
    "Not Synced": "No Sincronizado",
    "Remove": "Eliminar",
    "Last Sync": "Última Sincronización",
    
    # Common actions
    "Import": "Importar",
    "Export": "Exportar",
    "Reset": "Restablecer",
    "Update": "Actualizar",
    "Refresh": "Actualizar",
    "Load": "Cargar",
    "Loading": "Cargando",
    "Loading...": "Cargando...",
    "Saving...": "Guardando...",
    "Deleting...": "Eliminando...",
    "Creating...": "Creando...",
}

def translate_value(value):
    """Recursively translate values in the JSON structure"""
    if isinstance(value, str):
        # Return translation if exact match exists, otherwise return original
        return spanish_translations.get(value, value)
    elif isinstance(value, dict):
        return {k: translate_value(v) for k, v in value.items()}
    elif isinstance(value, list):
        return [translate_value(item) for item in value]
    else:
        return value

if __name__ == "__main__":
    try:
        # Read the es.json file
        with open('src/locales/es.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Apply translations
        translated_data = translate_value(data)
        
        # Write back to es.json
        with open('src/locales/es.json', 'w', encoding='utf-8') as f:
            json.dump(translated_data, f, ensure_ascii=False, indent=2)
        
        print("✓ Spanish translations applied successfully")
        sys.exit(0)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
