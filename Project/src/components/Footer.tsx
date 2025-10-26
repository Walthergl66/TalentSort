// components/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 text-sm">
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">TalentAI</h3>
            <p className="text-gray-600">
              Plataforma inteligente para reclutamiento y gestión de talento con IA.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-4">Producto</h4>
            <ul className="space-y-2 text-gray-600">
              <li><a href="#" className="hover:text-gray-900">Características</a></li>
              <li><a href="#" className="hover:text-gray-900">Precios</a></li>
              <li><a href="#" className="hover:text-gray-900">API</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-4">Soporte</h4>
            <ul className="space-y-2 text-gray-600">
              <li><a href="#" className="hover:text-gray-900">Documentación</a></li>
              <li><a href="#" className="hover:text-gray-900">Contacto</a></li>
              <li><a href="#" className="hover:text-gray-900">Estado</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-600">
              <li><a href="#" className="hover:text-gray-900">Privacidad</a></li>
              <li><a href="#" className="hover:text-gray-900">Términos</a></li>
              <li><a href="#" className="hover:text-gray-900">Seguridad</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-6 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} TalentAI. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}