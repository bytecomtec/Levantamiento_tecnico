/**
 * Lógica de Operación del Formulario de Levantamientos - Bytecomtec
 */

document.addEventListener('DOMContentLoaded', () => {
    inicializarFechaHora();
    inicializarEventosOperativos();
});

function inicializarFechaHora() {
    const ahora = new Date();
    
    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');
    const fechaInput = document.getElementById('fecha');
    if (fechaInput) fechaInput.value = `${anio}-${mes}-${dia}`;
    
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const horaInput = document.getElementById('hora');
    if (horaInput) horaInput.value = `${horas}:${minutos}`;
}

function inicializarEventosOperativos() {
    // Escucha activa reactiva para marcar automáticamente las casillas al modificar campos select/input
    document.querySelectorAll('[data-chk]').forEach(fila => {
        const idCheckbox = fila.getAttribute('data-chk');
        const checkbox = document.getElementById(idCheckbox);
        
        fila.querySelectorAll('select, input[type="number"], input[type="text"]').forEach(control => {
            control.addEventListener('change', () => {
                if (control.value !== "" && checkbox) {
                    checkbox.checked = true;
                }
            });
        });
    });

    // Mostrar/Ocultar panel de cálculo rápido
    document.getElementById('btnCalcularHDD')?.addEventListener('click', () => {
        const panel = document.getElementById('calculadoraPanel');
        if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });

    // Ejecutar el cálculo matemático automático
    document.getElementById('btnProcesarCalculo')?.addEventListener('click', calcularAlmacenamientoBytecomtec);
    
    // Enlace de Eventos de Botones Principales (Removiendo inline onclick de HTML)
    document.getElementById('btnWhatsApp')?.addEventListener('click', enviarWhatsApp);
    document.getElementById('btnExportar')?.addEventListener('click', exportarJSON);
    document.getElementById('btnImprimir')?.addEventListener('click', ejecutarImpresionClean);
    document.getElementById('importFile')?.addEventListener('change', importarJSON);
}

function obtenerVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
}

function isChecked(id) {
    const el = document.getElementById(id);
    return el && el.checked ? true : false;
}

function validarFormularioSeguro() {
    let formularioValido = true;
    let elementosOlvidados = [];

    FormConfig.secciones.forEach(seccion => {
        seccion.elementos.forEach(item => {
            const checkbox = document.getElementById(item.id);
            if (checkbox && !checkbox.checked) {
                const tieneValorSpec = item.spec && obtenerVal(item.spec) !== "";
                const tieneValorNotes = item.notes && obtenerVal(item.notes) !== "";
                
                if (tieneValorSpec || tieneValorNotes) {
                    formularioValido = false;
                    elementosOlvidados.push(item.label);
                }
            }
        });
    });

    if (!formularioValido) {
        alert("⚠️ AVISO DE PROTECCIÓN INTEGRAL:\n\nHas seleccionado especificaciones para los siguientes conceptos pero olvidaste marcar o mantuviste deseleccionado su botón de activación:\n\n• " + elementosOlvidados.join("\n• ") + "\n\nPor favor, verifica las casillas antes de continuar.");
        return false;
    }
    return true;
}

function exportarJSON() {
    if (!validarFormularioSeguro()) return;

    const formulario = document.getElementById('masterForm');
    const inputs = formulario.querySelectorAll('input, select, textarea');
    let datos = {
        _meta: {
            empresa: "Bytecomtec",
            version_esquema: "2.0",
            fecha_exportacion: new Date().toISOString()
        }
    };

    inputs.forEach(input => {
        if (input.id) {
            datos[input.id] = (input.type === 'checkbox') ? input.checked : input.value;
        }
    });

    const jsonString = JSON.stringify(datos, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    let nombreCliente = (obtenerVal('cliente') || 'levantamiento').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    let fechaHoy = obtenerVal('fecha') || new Date().toISOString().split('T')[0];

    const a = document.createElement('a');
    a.href = url;
    a.download = `levantamiento_${nombreCliente}_${fechaHoy}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importarJSON(event) {
    const archivo = event.target.files[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = function(e) {
        try {
            const datos = JSON.parse(e.target.result);
            
            // Validación de esquema básico de Bytecomtec
            if (!datos.cliente && !datos.proyecto) {
                throw new Error("Estructura JSON incompatible.");
            }

            for (const id in datos) {
                const elemento = document.getElementById
