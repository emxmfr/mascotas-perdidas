'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import TarjetaAnimal from '@/components/TarjetaAnimal';

export default function Home() {
  const [animales, setAnimales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroZona, setFiltroZona] = useState('');

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      const { data, error } = await supabase
        .from('animales')
        .select('*')
        .order('creado_en', { ascending: false });

      if (error) setError('No se pudieron cargar los casos. Intenta de nuevo más tarde.');
      else setAnimales(data);
      setCargando(false);
    }
    cargar();
  }, []);

  const zonas = useMemo(
    () => Array.from(new Set(animales.map((a) => a.zona).filter(Boolean))).sort(),
    [animales]
  );

  const filtrados = animales.filter((a) => {
    if (filtroTipo !== 'todos' && a.tipo !== filtroTipo) return false;
    if (filtroEstado !== 'todos' && a.estado !== filtroEstado) return false;
    if (filtroZona && a.zona !== filtroZona) return false;
    return true;
  });

  return (
    <>
      <div className="panel-filtros">
        <div className="campo-filtro">
          <label>Tipo de animal</label>
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
            <option value="todos">Todos</option>
            <option value="perro">Perro</option>
            <option value="gato">Gato</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        <div className="campo-filtro">
          <label>Estado</label>
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="todos">Todos</option>
            <option value="perdido">Perdido</option>
            <option value="encontrado">Encontrado</option>
          </select>
        </div>

        <div className="campo-filtro">
          <label>Zona</label>
          <select value={filtroZona} onChange={(e) => setFiltroZona(e.target.value)}>
            <option value="">Todas</option>
            {zonas.map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </div>
      </div>

      {cargando && <p className="vacio">Cargando casos...</p>}
      {error && <p className="vacio">{error}</p>}
      {!cargando && !error && filtrados.length === 0 && (
        <p className="vacio">No hay casos registrados con estos filtros todavía.</p>
      )}

      <div className="rejilla">
        {filtrados.map((animal) => (
          <TarjetaAnimal key={animal.id} animal={animal} />
        ))}
      </div>
    </>
  );
}
