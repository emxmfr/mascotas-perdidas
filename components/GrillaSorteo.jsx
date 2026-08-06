'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { enlaceWhatsApp } from '@/lib/ubicacion';

export default function GrillaSorteo({ sorteo, numeros, onActualizar }) {
  const [numerosElegidos, setNumerosElegidos] = useState([]);
  const [numeroDetalle, setNumeroDetalle] = useState(null);
  const [nombre, setNombre] = useState('');
  const [contacto, setContacto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [confirmados, setConfirmados] = useState([]);
  const [tiempoRestante, setTiempoRestante] = useState('');

  const fechaLimite = new Date(sorteo.fecha_cierre);
  const hoy = new Date();
  const reservasCerradas = hoy > fechaLimite;

  const precioNumerico = parseFloat(String(sorteo.precio_numero).replace(/[^0-9.]/g, '')) || 0;
  const totalAPagar = confirmados.length > 0 
    ? precioNumerico * confirmados.length 
    : precioNumerico * numerosElegidos.length;

  useEffect(() => {
    let intervalo;
    
    if (numeroDetalle && numeroDetalle.estado === 'reservado' && numeroDetalle.actualizado_en) {
      const calcularTiempo = () => {
        const fechaReserva = new Date(numeroDetalle.actualizado_en).getTime();
        const limite = fechaReserva + (12 * 60 * 60 * 1000);
        const ahora = new Date().getTime();
        const diferencia = limite - ahora;

        if (diferencia <= 0) {
          setTiempoRestante('Expirado');
          clearInterval(intervalo);
        } else {
          const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
          const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);
          setTiempoRestante(`${horas}h ${minutos}m ${segundos}s`);
        }
      };

      calcularTiempo();
      intervalo = setInterval(calcularTiempo, 1000);
    }

    return () => clearInterval(intervalo);
  }, [numeroDetalle]);

  function manejarClickNumero(n) {
    if (n.estado !== 'disponible') {
      setNumeroDetalle(n);
    } else {
      const yaSeleccionado = numerosElegidos.find((num) => num.id === n.id);
      if (yaSeleccionado) {
        setNumerosElegidos(numerosElegidos.filter((num) => num.id !== n.id));
      } else {
        setNumerosElegidos([...numerosElegidos, n]);
      }
    }
  }

  async function reservar(e) {
    e.preventDefault();
    if (!nombre.trim() || contacto.length !== 9) {
      setError('Ingresa tu nombre y un número de celular válido de 9 dígitos.');
      return;
    }

    setEnviando(true);
    setError('');

    const idsElegidos = numerosElegidos.map((n) => n.id);

    const { data, error: errorUpdate } = await supabase
      .from('numeros_sorteo')
      .update({
        estado: 'reservado',
        nombre_comprador: nombre.trim(),
        contacto_comprador: contacto.trim(),
        actualizado_en: new Date().toISOString(),
      })
      .in('id', idsElegidos)
      .eq('estado', 'disponible')
      .select();

    setEnviando(false);

    if (errorUpdate) {
      setError('Algo falló. Intenta de nuevo.');
      return;
    }

    if (!data || data.length !== numerosElegidos.length) {
      setError('Uno o más números seleccionados acaban de ser apartados por otra persona. La lista se actualizará.');
      onActualizar();
      setNumerosElegidos([]);
      return;
    }

    setConfirmados(numerosElegidos.map((n) => n.numero));
    onActualizar();
  }

  function cerrar() {
    setNumerosElegidos([]);
    setNumeroDetalle(null);
    setNombre('');
    setContacto('');
    setError('');
    setConfirmados([]);
  }

  const mostrarModal = numerosElegidos.length > 0 || numeroDetalle !== null || confirmados.length > 0;

  const contenidoSorteo = (
    <div className="layout-sorteo-doble">
      <style dangerouslySetInnerHTML={{__html: `
        .numero-seleccionado {
          border: 3px solid #16a34a !important;
          transform: scale(1.05);
          z-index: 10;
        }
      `}} />

      <div className="sorteo-tarjeta" style={{ marginBottom: 0 }}>
        <h2 className="nombre-animal" style={{ fontSize: 22 }}>{sorteo.titulo}</h2>
        {sorteo.descripcion && <p className="sorteo-texto">{sorteo.descripcion}</p>}
        
        <div className="sorteo-meta">
          {sorteo.fecha_sorteo && (
            <span>Sorteo: {new Date(sorteo.fecha_sorteo + 'T12:00:00').toLocaleDateString('es', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
          )}
          {sorteo.precio_numero && <span>{sorteo.precio_numero}</span>}
        </div>

        <div className="leyenda-sorteo">
          <span><i className="punto-leyenda disponible" /> Disponible</span>
          <span><i className="punto-leyenda reservado" /> Reservado</span>
          <span><i className="punto-leyenda vendido" /> Vendido</span>
        </div>

        {reservasCerradas ? (
          <div className="mensaje error" style={{ marginBottom: '15px' }}>
            Las reservas en línea han cerrado. Estamos preparando el sorteo.
          </div>
        ) : (
          <p className="sorteo-texto" style={{ fontWeight: 'bold', marginTop: '15px', marginBottom: '10px' }}>
            Selecciona tus números de la suerte:
          </p>
        )}

        <div className="grilla-numeros">
          {numeros.map((n) => {
            const estaSeleccionado = numerosElegidos.find((num) => num.id === n.id);
            return (
              <button
                key={n.id}
                type="button"
                className={`numero-sorteo ${n.estado} ${estaSeleccionado ? 'numero-seleccionado' : ''}`}
                onClick={() => manejarClickNumero(n)}
                disabled={reservasCerradas && n.estado === 'disponible'}
              >
                {String(n.numero).padStart(3, '0')}
              </button>
            );
          })}
        </div>

        {mostrarModal && (
          <div className="fondo-modal" onClick={cerrar}>
            <div className="tarjeta-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
              <button className="cerrar-modal" onClick={cerrar} aria-label="Cerrar">x</button>
              
              {confirmados.length > 0 ? (
                <>
                  <h3 className="nombre-animal" style={{ fontSize: 20 }}>
                    Números apartados con éxito
                  </h3>
                  <div style={{ margin: '15px 0', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    Números: {confirmados.map(n => String(n).padStart(3, '0')).join(', ')}
                  </div>
                  <div style={{ margin: '15px 0', fontSize: '1.2rem', fontWeight: 'bold', color: '#16a34a' }}>
                    Total a transferir: S/ {totalAPagar}
                  </div>
                  <p className="ayuda-fotos">
                    Envía tu comprobante de pago por WhatsApp para confirmar tus números antes de que pasen 12 horas.
                  </p>
                  <a
                    className="boton-poster rojo"
                    style={{ width: '100%', textAlign: 'center', display: 'block' }}
                    target="_blank"
                    rel="noopener noreferrer"
                    href={enlaceWhatsApp(
                      sorteo.whatsapp,
                      `Hola! Aparté los números ${confirmados.map(n => String(n).padStart(3, '0')).join(', ')} del sorteo "${sorteo.titulo}". Mi nombre es ${nombre}. El total a pagar es S/ ${totalAPagar}. Aquí envío mi comprobante de pago.`
                    )}
                  >
                    Enviar comprobante por WhatsApp
                  </a>
                </>

              ) : numeroDetalle ? (
                <>
                  <h3 className="nombre-animal" style={{ fontSize: 20, marginBottom: '15px' }}>
                    Número {String(numeroDetalle.numero).padStart(3, '0')}
                  </h3>
                  <div className="detalle-lista">
                    <div className="detalle-fila">
                      <dt>Estado</dt>
                      <dd style={{ textTransform: 'capitalize' }}>{numeroDetalle.estado}</dd>
                    </div>
                    <div className="detalle-fila">
                      <dt>Participante</dt>
                      <dd>{numeroDetalle.nombre_comprador || 'Sin registrar'}</dd>
                    </div>
                    {numeroDetalle.estado === 'reservado' && numeroDetalle.actualizado_en && (
                      <>
                        <div className="detalle-fila">
                          <dt>Hora de reserva</dt>
                          <dd>{new Date(numeroDetalle.actualizado_en).toLocaleString('es-PE', { hour: '2-digit', minute:'2-digit', day: '2-digit', month: 'short' })}</dd>
                        </div>
                        <div className="detalle-fila">
                          <dt>Tiempo para pagar</dt>
                          <dd style={{ color: tiempoRestante === 'Expirado' ? '#d6483f' : 'inherit', fontWeight: 'bold' }}>
                            {tiempoRestante}
                          </dd>
                        </div>
                      </>
                    )}
                  </div>
                </>

              ) : (
                <>
                  <h3 className="nombre-animal" style={{ fontSize: 20 }}>
                    Apartar {numerosElegidos.length} {numerosElegidos.length === 1 ? 'número' : 'números'}
                  </h3>
                  <div style={{ margin: '15px 0', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    Números: {numerosElegidos.map(n => String(n.numero).padStart(3, '0')).join(', ')}
                  </div>
                  <div style={{ margin: '15px 0', fontSize: '1.2rem', fontWeight: 'bold', color: '#16a34a' }}>
                    Total a pagar: S/ {totalAPagar}
                  </div>
                  <p className="ayuda-fotos">
                    Esto no confirma el pago todavía. Después de apartar, te pediremos enviar tu comprobante por WhatsApp. Tienes un plazo máximo de 12 horas.
                  </p>
                  {error && <div className="mensaje error">{error}</div>}
                  <form onSubmit={reservar}>
                    <div className="campo">
                      <label>Tu nombre</label>
                      <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                    </div>
                   <div className="campo">
                      <label>Número de celular</label>
                      <input 
                        type="tel" 
                        value={contacto} 
                        onChange={(e) => setContacto(e.target.value.replace(/\D/g, '').slice(0, 9))} 
                        placeholder="Ej: 987654321"
                      />
                    </div>
                    <button className="boton-poster rojo" type="submit" disabled={enviando} style={{ width: '100%' }}>
                      {enviando ? 'Apartando...' : `Apartar por S/ ${totalAPagar}`}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="tarjeta-premios" style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', marginTop: '20px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '15px' }}>Premios del Sorteo</h3>
        
        {sorteo.detalle_premios && sorteo.detalle_premios.length > 0 ? (
          <div style={{ marginBottom: '20px' }}>
            {sorteo.detalle_premios.map((item, index) => (
              <div key={index} style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '10px', backgroundColor: '#f9fafb' }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{item.premio}</div>
                {(item.numero_ganador || item.nombre_ganador) ? (
                  <div style={{ color: '#16a34a', marginTop: '5px', fontWeight: '600' }}>
                    Ganador: N° {item.numero_ganador} - {item.nombre_ganador}
                  </div>
                ) : (
                  <div style={{ color: '#6b7280', marginTop: '5px' }}>Sorteo pendiente</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          sorteo.premios && (
            <p className="sorteo-texto" style={{ marginBottom: '15px' }}><strong>Lista de Premios:</strong> {sorteo.premios}</p>
          )
        )}

        {sorteo.fotos_premios && sorteo.fotos_premios.length > 0 ? (
          <div className="grilla-fotos-premios">
            {sorteo.fotos_premios.map((url, index) => (
              <img 
                key={index} 
                src={url} 
                alt={`Premio ${index + 1}`} 
                className="foto-premio" 
                onClick={() => window.open(url, '_blank')}
              />
            ))}
          </div>
        ) : (
          <p className="sorteo-texto">Las fotos de los premios se publicarán pronto.</p>
        )}
      </div>
    </div>
  );

  if (reservasCerradas) {
    return (
      <div style={{ marginTop: '20px', width: '100%' }}>
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#eef2ff', color: '#3730a3', borderRadius: '8px', border: '1px solid #c7d2fe', fontWeight: 'bold', textAlign: 'center' }}>
          Todavía no hay ningún sorteo disponible. Mantente atento a la página de Facebook de Huellitas Maleñas para próximas novedades.
        </div>
        <details style={{ background: '#f3f4f6', padding: '20px', borderRadius: '12px', border: '1px solid #d1d5db' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem', outline: 'none' }}>
            Ver sorteo pasado: {sorteo.titulo} (Desplegar)
          </summary>
          <div style={{ marginTop: '20px' }}>
            {contenidoSorteo}
          </div>
        </details>
      </div>
    );
  }

  return contenidoSorteo;
}
