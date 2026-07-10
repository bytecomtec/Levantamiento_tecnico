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
                const elemento = document.getElementById(id);
                if (elemento) {
                    if (elemento.type === 'checkbox') {
                        elemento.checked = datos[id];
                    } else {
                        elemento.value = datos[id];
                    }
                }
            }
            alert("✓ Respaldo cargado con éxito. El formulario ha sido restaurado.");
        } catch (error) {
            alert("Error: El archivo seleccionado no tiene un formato de levantamiento válido de Bytecomtec.");
        }
    };
    lector.readAsText(archivo);
}

function ejecutarImpresionClean() {
    if (!validarFormularioSeguro()) return;

    FormConfig.secciones.forEach(seccion => {
        seccion.elementos.forEach(item => {
            const elementoDOM = document.querySelector(`[data-chk="${item.id}"]`);
            if (elementoDOM) {
                if (!isChecked(item.id)) {
                    elementoDOM.classList.add('no-print-row');
                    elementoDOM.querySelectorAll('input, select').forEach(el => el.classList.add('is-empty'));
                } else {
                    elementoDOM.classList.remove('no-print-row');
                    elementoDOM.querySelectorAll('input, select').forEach(el => el.classList.remove('is-empty'));
                }
            }
        });
    });
    window.print();
}

function enviarWhatsApp() {
    if (!validarFormularioSeguro()) return;

    const cliente = obtenerVal('cliente');
    if(!cliente) { alert("Ingrese el nombre de la escuela o cliente."); return; }

    let msg = `*BYTECOMTEC - LEVANTAMIENTO INTEGRAL*%0A`;
    msg += `-----------------------------------%0A`;
    msg += `*Plantel:* ${cliente}%0A`;
    msg += `*Proyecto:* ${obtenerVal('proyecto') || 'CCTV'}%0A`;
    msg += `*Atendió:* ${obtenerVal('atendio')} (${obtenerVal('cargo')})%0A`;
    msg += `*Fecha/Hora:* ${obtenerVal('fecha')} a las ${obtenerVal('hora')}%0A`;
    msg += `*Internet:* Mod: ${obtenerVal('has_modem')} | Prov: ${obtenerVal('compania')} | Vel: ${obtenerVal('velocidad_internet')}%0A`;
    msg += `*Realizó:* ${obtenerVal('ingeniero')}%0A`;
    msg += `-----------------------------------%0A`;

    // Procesamiento automatizado usando el catálogo estructurado de FormConfig
    FormConfig.secciones.forEach(seccion => {
        let lineasSeccion = [];
        
        seccion.elementos.forEach(item => {
            if (isChecked(item.id)) {
                const cantidad = item.cant ? (obtenerVal(item.cant) || '1') : '';
                const especificacion = item.spec ? obtenerVal(item.spec) : '';
                const notas = item.notes ? obtenerVal(item.notes) : '';
                
                let detalle = `${item.label}`;
                if(cantidad || especificacion) {
                    detalle += ` (${cantidad ? cantidad + 'pz' : ''}${cantidad && especificacion ? ' - ' : ''}${especificacion})`;
                }
                if(notas) {
                    detalle += `: ${notas}`;
                }
                lineasSeccion.push(detalle);
            }
        });

        if (lineasSeccion.length > 0) {
            msg += `*${seccion.titulo}:*%0A• ${lineasSeccion.join('%0A• ')}%0A-----------------------------------%0A`;
        }
    });

    // Procesamiento de Adicionales
    let extras = [];
    FormConfig.adicionales.forEach(item => {
        if (isChecked(item.id)) extras.push(item.label);
    });
    
    if (extras.length > 0) {
        msg += `*8. ADICIONALES Y COMPLEMENTOS:*%0A${extras.join(", ")}%0A-----------------------------------%0A`;
    }

function calcularAlmacenamientoBytecomtec() {
    console.log("Calculadora Bytecomtec iniciada..."); // Esto aparecerá en la consola del navegador (F12)

    const notasHDD = document.getElementById('notes_hdd');
    const chkHDD = document.getElementById('req_hdd');
    const selectorHDD = document.getElementById('spec_hdd');
    const eCompresion = document.getElementById('calc_compresion');

    // Restablecer estilos visuales por seguridad
    if (notasHDD) {
        notasHDD.style.backgroundColor = "";
        notasHDD.style.color = "";
    }

    try {
        // 1. Forzar la lectura de la cantidad de cámaras (Domo)
        const inputCamas = document.getElementById('cant_domo');
        const totalCamaras = inputCamas ? (parseInt(inputCamas.value) || 0) : 0;
        
        if (totalCamaras === 0) {
            if (notasHDD) {
                notasHDD.value = "⚠️ ERROR: Ingresa la cantidad de cámaras en la Sección 2.";
                notasHDD.style.backgroundColor = "#fde8e8"; // Fondo rojo claro
                notasHDD.style.color = "#9b1c1c";
            }
            return;
        }

        // 2. Extraer el tamaño del disco duro seleccionado
        const specHDD = selectorHDD ? selectorHDD.value : "";
        if (!specHDD) {
            if (notasHDD) {
                notasHDD.value = "⚠️ ERROR: Selecciona la capacidad del disco (ej. 10 TB).";
                notasHDD.style.backgroundColor = "#fde8e8";
                notasHDD.style.color = "#9b1c1c";
            }
            return;
        }

        // Obtener los Terabytes numéricos limpios (ej: "10 TB" -> 10)
        let capacidadTB = parseInt(specHDD.match(/\d+/)) || 0;
        if (capacidadTB === 0) capacidadTB = parseInt(specHDD) || 10;

        // 3. Determinar el Bitrate según el códec seleccionado en la calculadora
        const tipoCompresion = eCompresion ? eCompresion.value : 'H.265+';
        let bitrateKbps = 512; // H.265+ optimizado
        if (tipoCompresion === 'H.264') bitrateKbps = 2048;
        if (tipoCompresion === 'H.265') bitrateKbps = 1024;

        // 4. Operación Matemática Inversa
        const gigabytesPorDisco = capacidadTB * 1000; 
        const bitsTotalesPorDia = totalCamaras * (bitrateKbps * 1000) * 86400;
        const gigabytesConsumidosPorDia = bitsTotalesPorDia / 8 / 1024 / 1024 / 1024;
        
        // Días de respaldo (redondeado de forma conservadora hacia abajo)
        const diasCalculados = Math.floor(gigabytesPorDisco / gigabytesConsumidosPorDia);

        // 5. Inyectar el resultado e indicar éxito visualmente
        if (notasHDD) {
            notasHDD.value = `${diasCalculados} días de grabación estimados (${totalCamaras} cáms con ${tipoCompresion}).`;
            notasHDD.style.backgroundColor = "#def7ec"; // Fondo verde claro de éxito
            notasHDD.style.color = "#03543f";
        }

        // Activar el check en automático
        if (chkHDD) chkHDD.checked = true;

    } catch (err) {
        console.error("Error crítico en el cálculo:", err);
        if (notasHDD) {
            notasHDD.value = "⚠️ Error de sintaxis o ID inexistente en el script.";
            notasHDD.style.backgroundColor = "#fde8e8";
        }
    }
}
    
    msg += `_Formulario Unificado Bytecomtec 2026_`;
    window.open(`https://wa.me/?text=${msg}`, '_blank');
}
