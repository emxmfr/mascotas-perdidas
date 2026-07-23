'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Estadisticas() {
  const [enCasa, setEnCasa] = useState(null);
  const [reportes, setReportes] = useState(null);

  useEffect(() => {
    async function cargar() {
      const [{ count: countEnCasa }, { count: countReportes }] = await Promise.all([
        supabase.from('animales').select('*', { count: 'exact', head: true }).eq('estado', 'en_casa'),
        supabase.from('avistamientos').select('*', { count: 'exact', head: true }),
      ]);
      setEnCasa(countEnCasa ?? 0);
      setReportes(countReportes ?? 0);
    }
    cargar();
  }, []);

  if (enCasa === null || reportes === null) return null;
  if (enCasa === 0 && reportes === 0) return null;

  return (
    <div className="banner-estadistica">
      {enCasa > 0 && (
        <span>🐾 <strong>{enCasa}</strong> mascota{enCasa !== 1 ? 's han' : ' ha'} regresado a casa</span>
      )}
      {enCasa > 0 && reportes > 0 && <span> · </span>}
      {reportes > 0 && (
        <span>📣 <strong>{reportes}</strong> reporte{reportes !== 1 ? 's' : ''} de la comunidad</span>
      )}
    </div>
  );
}
