export const colors = {
  // ===== Marca =====
  primario: '#6D5BD0',          // Botones principales, selección, pin elegido
  primarioOscuro: '#5848B8',    // Texto sobre fondos morados claros, botones secundarios
  primarioClaro: '#EEEBFB',     // Fondos de botones secundarios, chips, miniaturas
  acento: '#1F9BB0',            // Enlaces, franja del carro, 'P' del parqueadero
  acentoClaro: '#E0F3F6',       // Fondos de avisos informativos

  // ===== Estados =====
  disponible: '#2FA67C',        // Punto de cupo disponible
  disponibleFondo: '#E4F5EE',   // Etiqueta '12 cupos'
  disponibleTexto: '#1F7A5C',   // Texto de cupos y pagos confirmados
  poca: '#F59E0B',              // Ofertas, descuentos, calificación
  pocaFondo: '#FEF3C7',         // Fondo de ofertas
  pocaTexto: '#92400E',         // Texto de ofertas
  lleno: '#DC2626',             // Errores, cancelar, luz roja
  llenoFondo: '#FEE2E2',        // Fondo de errores
  llenoTexto: '#991B1B',        // Texto de errores

  // ===== Neutros =====
  neutro900: '#1E1B3A',         // Títulos y texto principal
  neutro600: '#6B7088',         // Texto secundario
  neutro300: '#D9D5EE',         // Líneas y elementos inactivos
  neutro100: '#F1EFFA',         // Fondos suaves
  neutro0: '#FFFFFF',           // Tarjetas y botones
  fondoApp: '#F7F6FD',          // Fondo de las pantallas
  bordeSuave: '#E3E0F3',        // Bordes de tarjetas y campos

  // ===== Ilustraciones y extras =====
  ilustracionMoradoOscuro: '#2F2475',
  ilustracionEdificio: '#4A3CAE',
  ilustracionPuerta: '#241C63',
  mapaFondo: '#EBE9F6',
  mapaManzana: '#DCD8F0',
  gris400: '#9CA3AF',
  gris600: '#4B5563',
  gris700: '#374151',
  adminOscuro1: '#14122B',
  adminOscuro2: '#1A1736',
  adminOscuro3: '#2A2750',
  grisLila: '#A3A1B8',
  grisLilaClaro: '#F0EFF6',
  piel: '#F2C7A5',
} as const;

export const spacing = {
  e4: '4px',
  e8: '8px',
  e12: '12px',
  e16: '16px',
  e24: '24px',
  e32: '32px',
  e48: '48px',
} as const;

export const radii = {
  r8: '8px',
  r12: '12px',
  r16: '16px',
  pill: '999px',
} as const;