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
    // 1. Obtener el total de cámaras desde la Sección 2
    const cantDomo = parseInt(document.getElementById('cant_domo')?.value) || 0;
    const cantBullet = parseInt(document.getElementById('cant_bullet')?.value) || 0;
    const cantPTZ = parseInt(document.getElementById('cant_ptz')?.value) || 0;
    const totalCamaras = cantDomo + cantBullet + cantPTZ;

    if (totalCamaras === 0) {
        alert("⚠️ Para calcular el tiempo de grabación, primero ingresa la cantidad de cámaras en la Sección 2.");
        return;
    }

    // 2. Obtener el tamaño del disco seleccionado en el formulario
    const specHDD = document.getElementById('spec_hdd')?.value; // Ej: "10 TB" o "4 TB"
    if (!specHDD) {
        alert("⚠️ Por favor, selecciona primero una capacidad de Disco Duro (ej. 10 TB).");
        return;
    }

    // Extraer solo el número del texto usando una expresión regular (ej. "10 TB" -> 10)
    const capacidadTB = parseInt(specHDD.match(/\d+/)) || 0;
    if (capacidadTB === 0) {
        alert("⚠️ Capacidad de disco no válida.");
        return;
    }

    // 3. Obtener el códec de compresión seleccionado en el panel de la calculadora
    const tipoCompresion = document.getElementById('calc_compresion').value;

    // 4. Configuración de Bitrate estándar por cámara (Kbps) a 2MP/3K @ 15 FPS
    let bitrateKbps = 1024; 
    if (tipoCompresion === 'H.264') bitrateKbps = 2048;
    if (tipoCompresion === 'H.265+') bitrateKbps = 512;

    // 5. Cálculo Matemático Inverso:
    // Convertimos los TB a Gigabytes comerciales y calculamos la tasa de consumo diario
    // Consumo diario en GB por cámara = (bitrateKbps * 1000 * 86400 segundos) / (8 bits * 1024 * 1024 * 1024)
    const gigabytesPorDisco = capacidadTB * 1000; // Almacenamiento aproximado en base decimal estándar
    const bitsPorSegundoCamara = bitrateKbps * 1000;
    const bitsTotalesPorDia = totalCamaras * bitsPorSegundoCamara * 86400;
    const gigabytesConsumidosPorDia = bitsTotalesPorDia / 8 / 1024 / 1024 / 1024;

    // Días totales de respaldo (redondeado hacia abajo para ser conservadores y asegurar el almacenamiento)
    const diasCalculados = Math.floor(gigabytesPorDisco / gigabytesConsumidosPorDia);

    // 6. Inyectar el resultado directamente en el campo de Notas del Disco Duro
    const notasHDD = document.getElementById('notes_hdd');
    if (notasHDD) {
        notasHDD.value = `${diasCalculados} días de grabación estimados (${totalCamaras} cáms con ${tipoCompresion}).`;
    }

    // Asegurar que el checkbox principal de la fila quede activo
    const chkHDD = document.getElementById('req_hdd');
    if (chkHDD) chkHDD.checked = true;

    // Ocultar panel de manera limpia tras el proceso
    document.getElementById('calculadoraPanel').style.display = 'none';

    alert(`✓ Cálculo Inverso Completo:\n\nUn almacenamiento de ${capacidadTB} TB para ${totalCamaras} cámaras con codec ${tipoCompresion} proporcionará aproximadamente ${diasCalculados} días de grabación continua.\n\nEl dato ha sido inyectado en tus notas.`);
}
    
    msg += `_Formulario Unificado Bytecomtec 2026_`;
    window.open(`https://wa.me/?text=${msg}`, '_blank');
}
