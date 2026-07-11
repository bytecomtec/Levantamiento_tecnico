/**
 * Estructura de mapeo del formulario de Levantamiento Técnico - Bytecomtec
 * Permite renderizar y exportar datos de forma automatizada por bloques semánticos.
 */
const FormConfig = {
    secciones: [
        {
            titulo: "1. GRABACIÓN Y ALMACENAMIENTO",
            elementos: [
                { id: "req_dispositivo", label: "Dispositivo", cant: "cant_dispositivo", spec: "spec_dispositivo", notes: "notes_dispositivo" },
                { id: "req_hdd", label: "Discos Duros (CCTV)", cant: "cant_hdd", spec: "spec_hdd", notes: "notes_hdd" },
                { id: "req_monitor", label: "Monitor Local", cant: "cant_monitor", spec: "spec_monitor", notes: "notes_monitor" },
                { id: "req_ext", label: "Extensor HDMI", cant: "cant_ext", spec: "spec_ext", notes: "notes_ext" },
                { id: "req_gabinete", label: "Gabinete", cant: "cant_gabinete", spec: "spec_gabinete", notes: "notes_gabinete" }
            ]
        },
        {
            titulo: "2. CARACTERÍSTICAS DE CÁMARAS",
            elementos: [
                { id: "cam_domo", label: "Cámara Domo", cant: "cant_domo", spec: "supe_domo", notes: "spec_domo" },
                { id: "cam_bullet", label: "Cámara Bullet", cant: "cant_bullet", spec: "supe_bullet", notes: "spec_bullet" },
                { id: "cam_ptz", label: "Cámara PTZ", cant: "cant_ptz", spec: "spec_ptz", notes: "notes_ptz" },
                { id: "cam_lpr", label: "Cámara LPR", cant: "cant_lpr", spec: "spec_lpr", notes: "notes_lpr" },
                { id: "cam_analitica", label: "Analíticas Avanzadas", cant: "cant_analitica", spec: "spec_analitica", notes: "notes_analitica" }
            ]
        },
        {
            titulo: "3. CONECTIVIDAD Y RED",
            elementos: [
                { id: "net_switch", label: "Switch POE", cant: "cant_switch", spec: "spec_switch", notes: "notes_switch" },
                { id: "net_cable", label: "Cable UTP/FTP", cant: "cant_cable", spec: "spec_cable", notes: "notes_cable" },
                { id: "net_transceptores", label: "Transceptores", cant: "cant_transceptores", spec: "spec_transceptores", notes: "notes_transceptores" },
                { id: "net_jacks_dc", label: "Jacks DC Power", cant: "cant_jacks_dc", spec: "spec_jacks_dc", notes: "notes_jacks_dc" },
                { id: "net_conectores", label: "Plugs RJ45", cant: "cant_conectores", spec: "spec_conectores", notes: "notes_conectores" }
            ]
        },
        {
            titulo: "4. INFRAESTRUCTURA DE FIBRA ÓPTICA",
            elementos: [
                { id: "fo_liu", label: "ODF / LIU", cant: "cant_fo_liu", spec: "spec_fo_liu", notes: "notes_fo_liu" },
                { id: "fo_conv", label: "Convertidor Medios", cant: "cant_fo_conv", spec: "spec_fo_conv", notes: "notes_fo_conv" },
                { id: "fo_cajas", label: "Cajas FO", cant: "cant_fo_cajas", spec: "spec_fo_cajas", notes: "notes_fo_cajas" },
                { id: "fo_pigtails", label: "Pig Tails", cant: "cant_fo_pigtails", spec: "spec_fo_pigtails", notes: "notes_fo_pigtails" },
                { id: "fo_cable", label: "Cable Fibra Óptica", cant: "cant_fo_cable", spec: "spec_fo_cable", notes: "notes_fo_cable" },
                { id: "fo_sfp", label: "Módulos SFP", cant: "cant_fo_sfp", spec: "spec_fo_sfp", notes: "notes_fo_sfp" },
                { id: "fo_manga", label: "Manga FO", cant: "cant_manga", spec: "spec_manga", notes: "notes_manga" }
            ]
        },
        {
            titulo: "5. MATERIALES Y CANALIZACIÓN",
            elementos: [
                { id: "mat_gewiss", label: "Tubería Gewiss", cant: "cant_mat_gewiss", spec: "spec_mat_gewiss", notes: "notes_mat_gewiss" },
                { id: "mat_pvc", label: "PVC Pesado", cant: "cant_mat_pvc", spec: "spec_mat_pvc", notes: "notes_mat_pvc" },
                { id: "mat_liq", label: "Liquid-tight", cant: "cant_mat_liq", spec: "spec_mat_liq", notes: "notes_mat_mat_liq" },
                { id: "mat_canaleta", label: "Canaleta", cant: "cant_mat_canaleta", spec: "spec_mat_canaleta", notes: "notes_mat_canaleta" },
                { id: "mat_caja", label: "Cajas Derivación/FS", cant: "cant_mat_caja", spec: "spec_mat_caja", notes: "notes_mat_caja" },
                { id: "mat_miscelaneos", label: "Misceláneos", cant: null, spec: "spec_mat_miscelaneos", notes: null }
            ]
        },
        {
            titulo: "6. RESPALDO DE ENERGÍA",
            elementos: [
                { id: "pwr_fuente", label: "Fuente Poder", cant: "cant_pwr_fuente", spec: "spec_pwr_fuente", notes: "notes_pwr_fuente" },
                { id: "pwr_ups_rack", label: "UPS Rack", cant: "cant_pwr_ups_rack", spec: "spec_pwr_ups_rack", notes: "notes_pwr_ups_rack" },
                { id: "pwr_ups_campo", label: "UPS Campo", cant: "cant_pwr_ups_campo", spec: "spec_pwr_ups_campo", notes: "notes_pwr_ups_campo" },
                { id: "pwr_pdu", label: "Barra PDU", cant: "cant_pwr_pdu", spec: "spec_pwr_pdu", notes: "notes_pwr_pdu" },
                { id: "pwr_tierra", label: "Tierra Física", cant: null, spec: "spec_pwr_tierra", notes: null }
            ]
        },
{
            titulo: "7. MANO DE OBRA Y SERVICIOS",
            elementos: [
                { id: "srv_inst", label: "Instalación Física", cant: null, spec: "spec_srv_inst", notes: null },
                { id: "srv_fusion", label: "Fusión FO", cant: null, spec: "spec_srv_fusion", notes: null },
                { id: "srv_vlan", label: "Red / VLANs", cant: null, spec: "spec_srv_vlan", notes: null },
                { id: "srv_nvr", label: "Config NVR/DVR", cant: null, spec: "spec_srv_nvr", notes: null },
                { id: "srv_remoto", label: "Acceso Remoto", cant: null, spec: "spec_srv_remoto", notes: null },
                { id: "srv_alturas", label: "Trabajos Altura", cant: null, spec: "spec_srv_alturas", notes: null }
            ]
        },
        {
            titulo: "8. ENTREGABLES Y SISTEMAS COMPLEMENTARIOS",
            elementos: [
                { id: "ent_planos", label: "Planos As-Built", cant: null, spec: "spec_ent_planos", notes: null },
                { id: "ent_memoria", label: "Memoria Técnica e IPs", cant: null, spec: "spec_ent_memoria", notes: null },
                { id: "ent_cert", label: "Certificación Fluke", cant: null, spec: "spec_ent_cert", notes: null },
                { id: "wifi", label: "WiFi Profesional", cant: null, spec: "spec_wifi", notes: null },
                { id: "audio", label: "Audio Escolar / Voceo", cant: null, spec: "spec_audio", notes: null },
                { id: "tv", label: "Pantallas TV", cant: null, spec: "spec_tv", notes: null }
            ]
        }
    ],
    adicionales: [
        // Se dejan vacíos si ya están en secciones, o se mantienen aquí si son checkboxes simples
    ]};
