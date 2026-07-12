/**
 * Bytecomtec System - Arquitectura de Estado Centralizado
 */
// En tu main.js, simplemente unifica todo bajo un solo objeto
const BytecomtecState = {
    datos: {}, // Aquí guardaremos los valores de los inputs
    branding: {
        empresa: "BYTECOMTEC",
        eslogan: "Ingeniería que protege el futuro",
        mision: "Incrementar capacidades tecnológicas y de seguridad...",
        marcasAliadas: ["Hikvision", "Ubiquiti", "LinkedPro", "Western Digital"],
        notaLegal: "Propuesta técnica basada en análisis de requerimientos 2026."
    }
};

// Modifica la función de sincronización para apuntar al objeto único
function sincronizarEstado() {
    const inputs = document.querySelectorAll('#masterForm input, #masterForm select');
    inputs.forEach(el => {
        if (el.id) {
            BytecomtecState.datos[el.id] = (el.type === 'checkbox') ? el.checked : el.value;
        }
    });
}
const AppState = {
    datos: {},
    branding: {
        empresa: "BYTECOMTEC",
        eslogan: "Ingeniería que protege el futuro",
        marcasAliadas: ["Hikvision", "Ubiquiti", "LinkedPro", "Western Digital"],
        mision: "Incrementar capacidades tecnológicas y de seguridad..."
    }
};

// --- Función Única de Sincronización ---
// En lugar de múltiples listeners, una función que refresca el estado
function sincronizarEstado() {
    const inputs = document.querySelectorAll('#masterForm input, #masterForm select');
    inputs.forEach(el => {
        if (el.id) {
            AppState.datos[el.id] = (el.type === 'checkbox') ? el.checked : el.value;
        }
    });
}

// --- Mejora en las Automatizaciones (Sin recursión) ---
function configurarAutomatizaciones() {
    document.addEventListener('change', (e) => {
        // Detener eventos si el cambio fue provocado por el sistema
        if (e.target.dataset.systemTrigger === "true") return;

        if (e.target.id === 'cant_fo_cable') {
            aplicarAutomatizacionFibra(e.target.value);
        }
    });
}

function aplicarAutomatizacionFibra(cantidad) {
    // Usamos esta bandera para que no se dispare de nuevo el 'change'
    const setCampo = (id, valor) => {
        const el = document.getElementById(id);
        if (el) {
            el.dataset.systemTrigger = "true"; // Marcamos que el cambio es sistémico
            el.value = valor;
            el.dispatchEvent(new Event('change'));
            el.dataset.systemTrigger = "false";
        }
    };
    // ... aquí aplicas la lógica de llenado sin generar bucles
}
// Este objeto centraliza todo. 
// Sustituirá la dependencia directa de leer el DOM constantemente.
const BytecomtecState = {
    // Información del cliente y proyecto
    datosGenerales: {
        cliente: "",
        proyecto: "",
        fecha: "",
        hora: "",
        ingeniero: ""
    },
    // El inventario técnico (tus cámaras, fibra, etc.)
    inventario: {
        tecnologia: {},
        conectividad: {},
        fibraOptica: {}
    },
    // Información de branding para el PDF profesional
    branding: {
        fraseImpacto: "Ingeniería que protege el futuro y garantiza su tranquilidad.",
        mision: "Incrementar las capacidades tecnológicas y de seguridad de nuestros clientes.",
        marcasAliadas: ["Hikvision", "Ubiquiti", "LinkedPro", "Western Digital"],
        notaLegal: "Propuesta técnica basada en análisis de requerimientos 2026."
    }
};

function ejecutarImpresionProfesional() {
    if (!validarFormularioSeguro()) return;

    // 1. Actualizamos la portada con los datos actuales
    actualizarPortada();

    // 2. Ejecutamos la lógica de limpieza de filas (lo que ya tenías)
    FormConfig.secciones.forEach(seccion => {
        // ... (tu lógica existente para ocultar filas vacías)
    });

    // 3. Abrimos la impresión
    window.print();
}

function actualizarPortada() {
    // Sincronizamos primero el estado global
    sincronizarEstado();

    // Inyectamos los datos del estado a la portada
    const displayCliente = document.getElementById('display-cliente');
    const displayProyecto = document.getElementById('display-proyecto');

    if (displayCliente) displayCliente.innerText = AppState.datos.cliente || "Nombre del Cliente";
    if (displayProyecto) displayProyecto.innerText = AppState.datos.proyecto || "Nombre del Proyecto";
    
    // Aquí puedes agregar más campos si lo deseas (Ej. Fecha)
}
