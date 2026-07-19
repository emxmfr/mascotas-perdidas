'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Estadisticas() {
  const [total, setTotal] = useState(null);

  useEffect(() => {
    async function cargar() {
      const { count } = await supabase
        .from('animales')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'en_casa');
      setTotal(count ?? 0);
    }
    cargar();
  }, []);

  if (total === null || total === 0) return null;

  return (
    <div className="banner-estadistica">
      🐾 <strong>{total}</strong> mascota{total !== 1 ? 's han' : ' ha'} regresado a casa gracias a esta comunidad
    </div>
  );
}
