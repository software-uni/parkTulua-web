import type React from "react";

interface DatosParqueaderoCardProps {
    nombre: string;
    direccion: string;
    onNombreChange: (value: string) => void;
    onDireccionChange: (value: string) => void;
}

export const DatosParqueaderoCard : React.FC<DatosParqueaderoCardProps> = ({
    nombre,
    direccion,
    onNombreChange,
    onDireccionChange,
}) =>{
    return (
    // Contenedor principal de la tarjeta con borde, fondo blanco y padding
    <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
      
      {/* Título de la sección */}
      <h2 className="text-lg font-bold text-gray-900 mb-6">
        1 - Datos
      </h2>

      {/* Grid responsivo: 1 columna en móviles, 2 columnas en pantallas medianas/grandes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Columna Izquierda: Formulario de texto */}
        <div className="flex flex-col space-y-4">
          
          {/* Campo: Nombre del parqueadero */}
          <div className="flex flex-col">
            <label htmlFor="nombre" className="text-sm font-semibold text-gray-700 mb-1">
              Nombre del parqueadero
            </label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => onNombreChange(e.target.value)}
              placeholder="Ej. Parqueadero Central"
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            </div>

          {/* Campo: Dirección */}
          <div className="flex flex-col">
            <label htmlFor="direccion" className="text-sm font-semibold text-gray-700 mb-1">
              Dirección
            </label>
            <input
              id="direccion"
              type="text"
              value={direccion}
              onChange={(e) => onDireccionChange(e.target.value)}
              placeholder="Ej. Carrera 25 # 24-10, Tuluá"
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Columna Derecha: Mapa */}
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-700 mb-1">
            Ubicación en el mapa
          </span>
          {/* Delegamos la responsabilidad de renderizar el mapa a su propio componente */}
          
        </div>
        
      </div>
    </section>
  );
}