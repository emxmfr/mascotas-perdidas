'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import TarjetaAnimal from '@/components/TarjetaAnimal';
import ModalAnimal from '@/components/ModalAnimal';
import { COLORES, SEXOS, ESTADOS } from '@/lib/opciones';
import Estadisticas from '@/components/Estadisticas';

export default function Home() {
  const [animales, setAnimales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [seleccionado, setSeleccionado] = useState(null);

  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroZona, setFiltroZona] = useState('');
  const [filtroColor, setFiltroColor] = useState('todos');
  const [filtroSexo, setFiltroSexo] = useState('todos');

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
    if (filtroColor !== 'todos' && a.color !== filtroColor) return false;
    if (filtroSexo !== 'todos' && a.sexo !== filtroSexo) return false;
    return true;
  });

  return (
    <>
      <Estadisticas />

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
            {ESTADOS.map((e) => (
              <option key={e.valor} value={e.valor}>{e.etiqueta}</option>
            ))}
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

        <div className="campo-filtro">
          <label>Color</label>
          <select value={filtroColor} onChange={(e) => setFiltroColor(e.target.value)}>
            <option value="todos">Todos</option>
            {COLORES.map((c) => (
              <option key={c.valor} value={c.valor}>{c.valor}</option>
            ))}
          </select>
        </div>

        <div className="campo-filtro">
          <label>Sexo</label>
          <select value={filtroSexo} onChange={(e) => setFiltroSexo(e.target.value)}>
            <option value="todos">Todos</option>
            {SEXOS.map((s) => (
              <option key={s} value={s}>{s}</option>
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
          <TarjetaAnimal
            key={animal.id}
            animal={animal}
            onClick={() => setSeleccionado(animal)}
          />
        ))}
      </div>

      {seleccionado && (
        <ModalAnimal
          animal={seleccionado}
          onClose={() => setSeleccionado(null)}
          onActualizado={(actualizado) => {
            setAnimales((prev) => prev.map((a) => (a.id === actualizado.id ? actualizado : a)));
            setSeleccionado(actualizado);
          }}
        />
      )}
    </>
  );
}
