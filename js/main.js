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
    
    msg += `_Formulario Unificado Bytecomtec 2026_`;
    window.open(`https://wa.me/?text=${msg}`, '_blank');
}

// ==========================================
// FUNCIÓN DE CÁLCULO INDEPENDIENTE Y GLOBAL
// ==========================================
function calcularAlmacenamientoBytecomtec() {
    console.log("Calculadora Multiresolución Bytecomtec iniciada...");

    const notasHDD = document.getElementById('notes_hdd');
    const chkHDD = document.getElementById('req_hdd');
    const selectorHDD = document.getElementById('spec_hdd');
    const eCompresion = document.getElementById('calc_compresion');

    const specHDD = selectorHDD ? selectorHDD.value : "10 TB";
    const tipoCompresion = eCompresion ? eCompresion.value : 'H.265+';
    let capacidadTB = parseInt(specHDD.match(/\d+/)) || 10;

    // 1. Matriz o Diccionario de Bitrates Estándar (Margen seguro a 15-20 FPS)
    // Estructura: [H.264, H.265 estándar, H.265+ optimizado]
    const matrizBitrates = {
        2: [2048, 1536, 1024], // 2 Megapíxeles (1080P)
        4: [4096, 3072, 2048], // 4 Megapíxeles (2K)
        5: [5120, 3840, 2560], // 5 Megapíxeles
        6: [6144, 4608, 3072], // 6 Megapíxeles
        8: [8192, 6144, 4096]  // 8 Megapíxeles (4K Ultra HD)
    };

    // 2. Determinar la columna del códec seleccionado
    let columnaCodec = 2; // Por defecto H.265+ (Posición 2 del array)
    if (tipoCompresion.includes('H.264')) {
        columnaCodec = 0;
    } else if (tipoCompresion.includes('H.265') && !tipoCompresion.includes('+')) {
        columnaCodec = 1;
    }

    // 3. Captura dinámica de los inputs de tu formulario
    // Mapeamos el Megapíxel con el ID exacto que pusiste en tu HTML
    const inventarioCamaras = [
        { mp: 2, el: document.getElementById('cant_domo') || document.getElementById('cant_2mp') },
        { mp: 4, el: document.getElementById('cant_4mp') || document.getElementById('cant_bullet_4mp') },
        { mp: 5, el: document.getElementById('cant_5mp') },
        { mp: 6, el: document.getElementById('cant_6mp') },
        { mp: 8, el: document.getElementById('cant_8mp') || document.getElementById('cant_4k') }
    ];

    // 4. Sumar el consumo de bits de todo el ecosistema instalado
    let bitsTotalesPorDia = 0;
    let resumenCamarasActivas = [];

    inventarioCamaras.forEach(camara => {
        const cantidad = camara.el ? (parseInt(camara.el.value) || 0) : 0;
        if (cantidad > 0) {
            // Obtener el bitrate correspondiente de la matriz; si no existe el MP, usa el de 2MP por respaldo
            const bitrateConfigurado = matrizBitrates[camara.mp] ? matrizBitrates[camara.mp][columnaCodec] : matrizBitrates[2][columnaCodec];
            
            // Sumar al flujo diario
            bitsTotalesPorDia += cantidad * (bitrateConfigurado * 1000) * 86400;
            resumenCamarasActivas.push(`${cantidad} de ${camara.mp}MP`);
        }
    });

    // Respaldar el cálculo clásico (25 cámaras de 2MP) si el usuario no ha escrito nada en el formulario
    if (bitsTotalesPorDia === 0) {
        const bitratePorDefecto = matrizBitrates[2][columnaCodec];
        bitsTotalesPorDia = 25 * (bitratePorDefecto * 1000) * 86400;
        resumenCamarasActivas.push(`25 de 2MP`);
    }

    // 5. Espacio neto real utilizable del disco (Conversión binaria estricta de 1024 y -5% de NVR)
    const gigabytesUtiles = (capacidadTB * 931.32) * 0.95;

    // Convertir bits diarios consumidos totales a Gigabytes Binarios
    const gigabytesConsumidosPorDia = bitsTotalesPorDia / 8 / 1024 / 1024 / 1024;

    // Calcular días netos seguros redondeando hacia abajo
    const diasCalculados = Math.floor(gigabytesUtiles / gigabytesConsumidosPorDia);

    // 6. Imprimir resultado y pintar la interfaz para Bytecomtec
    if (notasHDD) {
        const desgloseFinal = resumenCamarasActivas.join(" + ");
        notasHDD.value = `${diasCalculados} días estimados (${desgloseFinal} con ${tipoCompresion}).`;
        notasHDD.style.backgroundColor = "#def7ec"; 
        notasHDD.style.color = "#03543f";
    }

    if (chkHDD) chkHDD.checked = true;
}
