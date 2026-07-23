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

  return (
    <>
      <h2 className="nombre-animal" style={{ fontSize: 26, marginBottom: 4 }}>Sorteos</h2>
      <p style={{ color: 'var(--ink-soft)', marginBottom: 20 }}>
        Los fondos de estos sorteos ayudan a Huellitas Maleñas a seguir rescatando animales.
        Elige tu número, apártalo, y confirma tu pago por WhatsApp.
      </p>

      {cargando && <p className="vacio">Cargando sorteos...</p>}

      {!cargando && sorteos.length === 0 && (
        <p className="vacio">No hay sorteos activos en este momento. ¡Vuelve pronto!</p>
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
