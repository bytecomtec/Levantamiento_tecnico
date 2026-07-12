/**
 * Bytecomtec System - Arquitectura de Estado Centralizado
 */

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
