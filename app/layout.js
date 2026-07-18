import './globals.css';

export const metadata = {
  title: 'Mascotas Perdidas',
  description: 'Tablón comunitario para registrar y buscar mascotas perdidas',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <header className="franja">
          <h1 className="titulo-poster">Mascotas Perdidas</h1>
          <p className="subtitulo-poster">Tablón comunitario · reporta y busca en tu zona</p>
          <nav className="nav-poster">
            <a className="boton-poster" href="/">Ver casos</a>
            <a className="boton-poster rojo" href="/registrar">Registrar animal</a>
          </nav>
        </header>
        <main className="contenedor">{children}</main>
      </body>
    </html>
  );
}
