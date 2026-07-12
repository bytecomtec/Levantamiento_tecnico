document.addEventListener('DOMContentLoaded', () => {
    const masterForm = document.getElementById('masterForm');

    // Función para recolectar todos los datos del formulario
    function obtenerDatosFormulario() {
        const datos = {
            cliente: document.getElementById('cliente').value,
            proyecto: document.getElementById('proyecto').value,
            secciones: {}
        };

        // Seleccionamos todos los contenedores de ítems
        const items = document.querySelectorAll('.row-item');
        
        items.forEach(item => {
            const idBase = item.getAttribute('data-item');
            const checkbox = item.querySelector('input[type="checkbox"]');
            
            // Solo procesamos si el checkbox está marcado
            if (checkbox && checkbox.checked) {
                datos.secciones[idBase] = {
                    cantidad: item.querySelector(`input[id^="cant_"]`)?.value || 'N/A',
                    especificacion: item.querySelector(`select[id^="spec_"], input[id^="spec_"]`)?.value || 'N/A',
                    notas: item.querySelector(`select[id^="notes_"], input[id^="notes_"]`)?.value || 'N/A'
                };
            }
        });

        return datos;
    }

    // Ejemplo: Acción para Enviar WhatsApp
    document.getElementById('btnWhatsApp').addEventListener('click', () => {
        const data = obtenerDatosFormulario();
        let mensaje = `*Propuesta: ${data.proyecto}*%0A`;
        mensaje += `*Cliente:* ${data.cliente}%0A%0A`;
        mensaje += `*Detalles:%0A*`;
        
        for (const [key, val] of Object.entries(data.secciones)) {
            mensaje += `- ${key.toUpperCase()}: ${val.especificacion} (Cant: ${val.cantidad})%0A`;
        }

        const url = `https://wa.me/?text=${mensaje}`;
        window.open(url, '_blank');
    });

    // Ejemplo: Acción para Imprimir (Generar PDF o vista de impresión)
    document.getElementById('btnImprimir').addEventListener('click', () => {
        console.log("Generando reporte...", obtenerDatosFormulario());
        window.print();
    });
});
