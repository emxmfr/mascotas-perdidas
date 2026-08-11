'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import TarjetaAnimal from '@/components/TarjetaAnimal';
import ModalAnimal from '@/components/ModalAnimal';
import { COLORES, SEXOS, ESTADOS } from '@/lib/opciones';
import Estadisticas from '@/components/Estadisticas';
import { distanciaKm, obtenerUbicacion } from '@/lib/ubicacion';

const MapaCasos = dynamic(() => import('@/components/MapaCasos'), { ssr: false });

function ContenidoHome() {
  const searchParams = useSearchParams();
  const [animales, setAnimales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [seleccionado, setSeleccionado] = useState(null);
  const [vista, setVista] = useState('lista');

  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroZona, setFiltroZona] = useState('');
  const [filtroColor, setFiltroColor] = useState('todos');
  const [filtroSexo, setFiltroSexo] = useState('todos');

  function limpiarFiltros() {
    setFiltroTipo('todos');
    setFiltroEstado('todos');
    setFiltroZona('');
    setFiltroColor('todos');
    setFiltroSexo('todos');
  }

  const [miUbicacion, setMiUbicacion] = useState(null);
  const [radioKm, setRadioKm] = useState(10);
  const [buscandoCerca, setBuscandoCerca] = useState(false);
  const [errorUbicacion, setErrorUbicacion] = useState('');

  const [buscandoFoto, setBuscandoFoto] = useState(false);
  const [resultadosFoto, setResultadosFoto] = useState(null);
  const [errorFoto, setErrorFoto] = useState('');

  async function buscarPorFoto(archivo) {
    if (!archivo) return;
    setBuscandoFoto(true);
    setErrorFoto('');
    try {
      const { generarEmbedding } = await import('@/lib/embeddings');
      const embedding = await generarEmbedding(archivo);

      const { data, error } = await supabase.rpc('match_animales', {
        query_embedding: embedding,
        match_count: 12,
      });
      if (error) throw error;

      const mapaSimilitud = new Map(data.map((r) => [r.id, r.similitud]));
      const encontrados = animales
        .filter((a) => mapaSimilitud.has(a.id))
        .map((a) => ({ ...a, _similitud: mapaSimilitud.get(a.id) }))
        .sort((a, b) => b._similitud - a._similitud);

      setResultadosFoto(encontrados);
    } catch (err) {
      console.error(err);
      setErrorFoto('No se pudo procesar la foto. Intenta con otra imagen.');
    } finally {
      setBuscandoFoto(false);
    }
  }

  function limpiarBusquedaFoto() {
    setResultadosFoto(null);
    setErrorFoto('');
  }

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

  useEffect(() => {
    const idCaso = searchParams.get('caso');
    if (idCaso && animales.length > 0) {
      const encontrado = animales.find((a) => a.id === idCaso);
      if (encontrado) setSeleccionado(encontrado);
    }
  }, [searchParams, animales]);

  const zonas = useMemo(
    () => Array.from(new Set(animales.map((a) => a.zona).filter(Boolean))).sort(),
    [animales]
  );

  async function buscarCerca() {
    setBuscandoCerca(true);
    setErrorUbicacion('');
    try {
      const coords = await obtenerUbicacion();
      setMiUbicacion(coords);
    } catch {
      setErrorUbicacion('No pudimos obtener tu ubicación. Revisa los permisos del navegador.');
    } finally {
      setBuscandoCerca(false);
    }
  }

  let filtrados = animales.filter((a) => {
    if (filtroTipo !== 'todos' && a.tipo !== filtroTipo) return false;
    if (filtroEstado !== 'todos' && a.estado !== filtroEstado) return false;
    if (filtroZona && a.zona !== filtroZona) return false;
    if (filtroColor !== 'todos') {
      const colores = a.colores?.length ? a.colores : a.color ? [a.color] : [];
      if (!colores.includes(filtroColor)) return false;
    }
    if (filtroSexo !== 'todos' && a.sexo !== filtroSexo) return false;
    return true;
  });

  if (miUbicacion) {
    filtrados = filtrados
      .filter((a) => a.latitud && a.longitud)
      .map((a) => ({ ...a, _distancia: distanciaKm(miUbicacion.lat, miUbicacion.lng, a.latitud, a.longitud) }))
      .filter((a) => a._distancia <= radioKm)
      .sort((a, b) => a._distancia - b._distancia);
  }

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
          <label>Ubicación</label>
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

        <button
          onClick={limpiarFiltros}
          type="button"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#4f772d',
            textDecoration: 'underline',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            alignSelf: 'center',
            marginTop: '15px',
            padding: '0 10px'
          }}
        >
          Borrar filtros
        </button>
      </div>

      <div className="barra-vista">
        <div className="cambio-vista">
          <button
            type="button"
            className={vista === 'lista' ? 'boton-vista activo' : 'boton-vista'}
            onClick={() => setVista('lista')}
          >
            📋 Lista
          </button>
          <button
            type="button"
            className={vista === 'mapa' ? 'boton-vista activo' : 'boton-vista'}
            onClick={() => setVista('mapa')}
          >
            🗺️ Mapa
          </button>
        </div>

        <label className="boton-poster" style={{ cursor: 'pointer', display: 'inline-block' }}>
          {buscandoFoto ? 'Analizando foto...' : '🔍 Buscar por foto'}
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            disabled={buscandoFoto}
            onChange={(e) => {
              const archivo = e.target.files?.[0];
              if (archivo) buscarPorFoto(archivo);
              e.target.value = '';
            }}
          />
        </label>

        {resultadosFoto && (
          <button type="button" className="boton-poster" onClick={limpiarBusquedaFoto}>
            ✕ Quitar búsqueda por foto
          </button>
        )}

        {!miUbicacion ? (
          <button type="button" className="boton-poster" onClick={buscarCerca} disabled={buscandoCerca}>
            {buscandoCerca ? 'Buscando...' : '📍 Ver casos cerca de mí'}
          </button>
        ) : (
          <div className="cerca-activo">
            <select value={radioKm} onChange={(e) => setRadioKm(Number(e.target.value))}>
              <option value={2}>2 km</option>
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={20}>20 km</option>
            </select>
            <button type="button" className="boton-poster" onClick={() => setMiUbicacion(null)}>
              Quitar
            </button>
          </div>
        )}
      </div>
      {errorUbicacion && <p className="ayuda-fotos">{errorUbicacion}</p>}
      {errorFoto && <p className="ayuda-fotos">{errorFoto}</p>}
      {resultadosFoto && (
        <p className="ayuda-fotos">
          Mostrando los casos visualmente más parecidos a tu foto. No es una identificación exacta —
          revisa cada caso antes de contactar.
        </p>
      )}

      {cargando && <p className="vacio">Cargando casos...</p>}
      {error && <p className="vacio">{error}</p>}
      {!cargando && !error && (resultadosFoto ?? filtrados).length === 0 && (
        <p className="vacio">
          {resultadosFoto
            ? 'No encontramos casos parecidos a esa foto todavía.'
            : 'No hay casos registrados con estos filtros todavía.'}
        </p>
      )}

      {vista === 'mapa' ? (
        <MapaCasos animales={resultadosFoto ?? filtrados} onSeleccionar={setSeleccionado} />
      ) : (
        <div className="rejilla">
          {(resultadosFoto ?? filtrados).map((animal) => (
            <TarjetaAnimal
              key={animal.id}
              animal={animal}
              distanciaKm={animal._distancia}
              similitud={animal._similitud}
              onClick={() => setSeleccionado(animal)}
            />
          ))}
        </div>
      )}

      {seleccionado && (
        <ModalAnimal animal={seleccionado} onClose={() => setSeleccionado(null)} />
      )}
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<p className="vacio">Cargando...</p>}>
      <ContenidoHome />
    </Suspense>
  );
}
