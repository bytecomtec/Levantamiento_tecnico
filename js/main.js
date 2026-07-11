/**
 * Lógica de Operación del Formulario - Bytecomtec
 */

document.addEventListener('DOMContentLoaded', () => {
    inicializarFechaHora();
    inicializarEventosOperativos();
    configurarAutomatizaciones(); 
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

function configurarAutomatizaciones() {
    console.log("Automatizaciones cargadas");
// Diagnóstico: Pon esto al principio de la función
const inputRollos = document.getElementById('cantidad_rollos');
if (!inputRollos) {
    console.error("ERROR: No existe un elemento con id='cantidad_rollos'");
} else {
    inputRollos.addEventListener('change', () => {
        console.log("¡Evento de rollos capturado exitosamente!");
    });
}

    document.addEventListener('change', (e) => {
        // --- 1. LÓGICA DE FIBRA ÓPTICA Y AUTOMATIZACIONES ---
        if (e.target.id === 'cantidad_rollos') {
            const rollos = parseInt(e.target.value) || 0;
            
            // Tipo de fibra
            const tf = document.getElementById('tipo_fibra');
            if (tf) tf.value = 'pre-fabricado';

            // Configuración de los elementos a automatizar
            const configuracion = [
                { id: 'conv_cantidad', modelo: 'MC220L', nota: 'TP-link' },
                { id: 'caja_cantidad', modelo: 'FTB-501', nota: 'FiberHome' },
                { id: 'pigtail_cantidad', modelo: 'LP-FO-LCU-SCA-01', nota: 'LinkedPro' },
                { id: 'sfp_cantidad', modelo: 'TP-link', nota: 'TL-SM321/TL-SM321B' }
            ];

            configuracion.forEach(item => {
                const campoCant = document.getElementById(item.id);
                if (campoCant) {
                    campoCant.value = rollos * 2;
                    campoCant.dispatchEvent(new Event('change'));
                    
                    // Buscar campos de modelo y notas en el contenedor padre (row-item)
                    const cont = campoCant.closest('.row-item');
                    if (cont) {
                        // Buscamos los inputs por ID usando comodines
                        const m = cont.querySelector('input[id*="modelo"], select[id*="modelo"]');
                        const n = cont.querySelector('input[id*="notas"], textarea[id*="notas"]');
                        if (m) m.value = item.modelo;
                        if (n) n.value = item.nota;
                    }
                }
            });

            // Activar Entregables Obligatorios (Sección 8)
            const planos = document.getElementById('check_planos');
            const memoria = document.getElementById('check_memoria_tecnica');
            if (planos) planos.checked = true;
            if (memoria) memoria.checked = true;
        }

        // --- 2. LÓGICA FLEXIBLE DE CANTIDADES (Checkbox/Select) ---
        if (e.target.tagName === 'SELECT' || e.target.type === 'checkbox') {
            const cont = e.target.closest('.row-item');
            if (!cont) return;

            const campoCant = cont.querySelector('input[type="number"]');
            
            // Solo preguntar cantidad si está vacío o en 0
            if (campoCant && (campoCant.value === "" || campoCant.value === "0")) {
                let cantidad = prompt("¿Qué cantidad de piezas se utilizará?", "1");
                if (cantidad) {
                    campoCant.value = cantidad;
                    campoCant.dispatchEvent(new Event('change'));
                } else if (e.target.type === 'checkbox') {
                    e.target.checked = false;
                }
            }
            
            const chk = cont.querySelector('input[type="checkbox"]');
            if (chk) chk.checked = true;
        }
    }); 
}

// ==========================================
// FUNCIÓN DE CÁLCULO INDEPENDIENTE Y GLOBAL
// ==========================================
function calcularAlmacenamientoBytecomtec() {
    console.log("Calculadora Dinámica Bytecomtec (Soporte Multi-bahía) iniciada...");

    const notasHDD = document.getElementById('notes_hdd');
    const chkHDD = document.getElementById('req_hdd');
    const selectorHDD = document.getElementById('spec_hdd');
    const eCompresion = document.getElementById('calc_compresion');
    
    // NUEVO: Capturar la cantidad de discos duros (bahías)
    const cantHDDEl = document.getElementById('cant_hdd'); 
    const cantHDD = cantHDDEl ? (parseInt(cantHDDEl.value) || 1) : 1;

    // 1. Obtener valores de la infraestructura de almacenamiento y códec
    const specHDD = selectorHDD ? selectorHDD.value : "10 TB";
    const tipoCompresion = eCompresion ? eCompresion.value : 'H.265+';
    let capacidadPorDiscoTB = parseInt(specHDD.match(/\d+/)) || 10;

    // NUEVO: Calcular la capacidad total combinada de todas las bahías
    let capacidadTotalTB = capacidadPorDiscoTB * cantHDD;

    // 2. Diccionario de Bitrates Estándar por Megapíxel (Margen seguro a 15-20 FPS)
    const matrizBitrates = {
        "2MP":  [2048, 1536, 1024],
        "4MP":  [4096, 3072, 2048],
        "3K/5M":[5120, 3840, 2560],
        "6MP":  [6144, 4608, 3072],
        "8MP":  [8192, 6144, 4096],
        "12MP": [12288, 9216, 6144]
    };

    // 3. Determinar columna del códec en base al string
    let columnaCodec = 2; // H.265+ por defecto
    if (tipoCompresion.includes('H.264')) {
        columnaCodec = 0;
    } else if (tipoCompresion.includes('H.265') && !tipoCompresion.includes('+')) {
        columnaCodec = 1;
    }

    // 4. Capturar los elementos reales de tu HTML (Cámaras)
    const cantDomoEl = document.getElementById('cant_domo');
    const supeDomoEl = document.getElementById('supe_domo');
    const cantBulletEl = document.getElementById('cant_bullet');
    const supeBulletEl = document.getElementById('supe_bullet');

    const cantDomo = cantDomoEl ? (parseInt(cantDomoEl.value) || 0) : 0;
    const resDomo = supeDomoEl ? supeDomoEl.value : "";

    const cantBullet = cantBulletEl ? (parseInt(cantBulletEl.value) || 0) : 0;
    const resBullet = supeBulletEl ? supeBulletEl.value : "";

    // 5. Calcular el consumo de bits en caliente de forma combinada
    let bitsTotalesPorDia = 0;
    let resumenCamarasActivas = [];

    if (cantDomo > 0 && resDomo) {
        const bitrateDomo = matrizBitrates[resDomo] ? matrizBitrates[resDomo][columnaCodec] : matrizBitrates["2MP"][columnaCodec];
        bitsTotalesPorDia += cantDomo * (bitrateDomo * 1000) * 86400;
        resumenCamarasActivas.push(`${cantDomo} Domos ${resDomo}`);
    }

    if (cantBullet > 0 && resBullet) {
        const bitrateBullet = matrizBitrates[resBullet] ? matrizBitrates[resBullet][columnaCodec] : matrizBitrates["2MP"][columnaCodec];
        bitsTotalesPorDia += cantBullet * (bitrateBullet * 1000) * 86400;
        resumenCamarasActivas.push(`${cantBullet} Bullets ${resBullet}`);
    }

    // Escenario de respaldo automático si el formulario está vacío
    if (bitsTotalesPorDia === 0) {
        const bitratePorDefecto = matrizBitrates["2MP"][columnaCodec];
        bitsTotalesPorDia = 25 * (bitratePorDefecto * 1000) * 86400;
        resumenCamarasActivas.push(`25 cáms 2MP`);
    }

    // 6. Espacio neto real utilizable modificado usando la capacidad total (TB Totales * 931.32 * 0.95)
    const gigabytesUtiles = (capacidadTotalTB * 931.32) * 0.95;

    // Convertir bits diarios consumidos totales a Gigabytes Binarios
    const gigabytesConsumidosPorDia = bitsTotalesPorDia / 8 / 1024 / 1024 / 1024;

    // Calcular días netos seguros redondeando hacia abajo
    const diasCalculados = Math.floor(gigabytesUtiles / gigabytesConsumidosPorDia);

    // 7. Imprimir resultado en la interfaz
    if (notasHDD) {
        const desgloseFinal = resumenCamarasActivas.join(" + ");
        // Añadimos una pequeña nota aclaratoria si son múltiples discos para transparencia técnica
        const textoDiscos = cantHDD > 1 ? ` en ${cantHDD} discos de ${capacidadPorDiscoTB}TB` : '';
        
        notasHDD.value = `${diasCalculados} días estimados (${desgloseFinal} con ${tipoCompresion}${textoDiscos}).`;
        notasHDD.style.backgroundColor = "#def7ec"; 
        notasHDD.style.color = "#03543f";
    }

    if (chkHDD) chkHDD.checked = true;
}
