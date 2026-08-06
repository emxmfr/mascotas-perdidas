'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import GrillaSorteo from '@/components/GrillaSorteo';

export default function Sorteos() {
  const [sorteos, setSorteos] = useState([]);
  const [numerosPorSorteo, setNumerosPorSorteo] = useState({});
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    setCargando(true);
    const { data: sorteosData } = await supabase
      .from('sorteos')
      .select('*')
      .eq('estado', 'activo')
      .order('creado_en', { ascending: false });

    setSorteos(sorteosData || []);

    if (sorteosData && sorteosData.length > 0) {
      const { data: numerosData } = await supabase
        .from('numeros_sorteo')
        .select('*')
        .in('sorteo_id', sorteosData.map((s) => s.id))
        .order('numero', { ascending: true });

      const agrupado = {};
      (numerosData || []).forEach((n) => {
        if (!agrupado[n.sorteo_id]) agrupado[n.sorteo_id] = [];
        agrupado[n.sorteo_id].push(n);
      });
      setNumerosPorSorteo(agrupado);
    }

    setCargando(false);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Lógica para determinar si se muestra el mensaje general
  const hoy = new Date();
  const todosCerrados = sorteos.length > 0 && sorteos.every((s) => new Date(s.fecha_cierre) < hoy);
  const noHaySorteos = sorteos.length === 0;
  const mostrarAvisoGlobal = !cargando && (noHaySorteos || todosCerrados);

  return (
    <>
      <h2 className="nombre-animal" style={{ fontSize: 26, marginBottom: 4 }}>Sorteos</h2>
      <p style={{ color: 'var(--ink-soft)', marginBottom: 20 }}>
        Los fondos de estos sorteos ayudan a Huellitas Maleñas a seguir rescatando animales.
        Elige tu número, apártalo, y confirma tu pago por WhatsApp.
      </p>

      {cargando && <p className="vacio">Cargando sorteos...</p>}

      {mostrarAvisoGlobal && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#ffffff', color: '#1f2937', borderRadius: '8px', border: '1px solid #d1d5db', fontWeight: 'bold', textAlign: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          Todavía no hay ningún sorteo disponible. Mantente atento a la página de Facebook de Huellitas Maleñas para próximas novedades.
        </div>
      )}

      {sorteos.map((sorteo) => (
        <GrillaSorteo
          key={sorteo.id}
          sorteo={sorteo}
          numeros={numerosPorSorteo[sorteo.id] || []}
          onActualizar={cargar}
        />
      ))}
    </>
  );
}
