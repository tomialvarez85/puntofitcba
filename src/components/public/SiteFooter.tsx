export default function SiteFooter() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 text-zinc-400">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Contacto</h3>
          <ul className="mt-3 space-y-1 text-sm">
            <li>WhatsApp: +54 9 351 000-0000</li>
            <li>Email: hola@puntofitcba.com</li>
            <li>Córdoba, Argentina</li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Seguinos</h3>
          <ul className="mt-3 space-y-1 text-sm">
            <li>
              <a href="#" className="transition hover:text-white">
                Instagram
              </a>
            </li>
            <li>
              <a href="#" className="transition hover:text-white">
                Facebook
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Horarios</h3>
          <ul className="mt-3 space-y-1 text-sm">
            <li>Lunes a viernes: 9 a 19 hs</li>
            <li>Sábados: 9 a 13 hs</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-zinc-900 py-4 text-center text-xs text-zinc-600">
        © {new Date().getFullYear()} Punto Fit CBA. Todos los derechos reservados.
      </div>
    </footer>
  );
}
