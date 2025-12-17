'use client'

import { X } from 'lucide-react'

interface TermsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-800">
            📜 Términos y Condiciones
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido */}
        <div className="px-6 py-6 space-y-6 text-gray-700">
          {/* Última actualización */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Última actualización:</strong> 29 de octubre de 2025
            </p>
          </div>

          {/* 1. Aceptación de términos */}
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              1. Aceptación de Términos
            </h3>
            <p className="mb-2">
              Al acceder y utilizar el Sistema de Reclutamiento Inteligente con IA 
              (en adelante, "la Plataforma"), usted acepta estar legalmente vinculado 
              por estos Términos y Condiciones. Si no está de acuerdo con alguna parte 
              de estos términos, no debe utilizar nuestros servicios.
            </p>
            <p className="text-sm italic text-gray-600">
              El uso continuado de la Plataforma constituye la aceptación de cualquier 
              modificación a estos términos.
            </p>
          </section>

          {/* 2. Descripción del servicio */}
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              2. Descripción del Servicio
            </h3>
            <p className="mb-3">
              La Plataforma proporciona servicios de reclutamiento inteligente que incluyen:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Análisis automatizado de currículums mediante inteligencia artificial</li>
              <li>Matching entre candidatos y posiciones laborales</li>
              <li>Gestión de perfiles de candidatos y reclutadores</li>
              <li>Almacenamiento seguro de información profesional</li>
              <li>Herramientas de análisis y reportes</li>
            </ul>
          </section>

          {/* 3. Registro y cuenta de usuario */}
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              3. Registro y Cuenta de Usuario
            </h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">3.1 Requisitos</h4>
                <p>
                  Para utilizar la Plataforma, debe crear una cuenta proporcionando 
                  información precisa, completa y actualizada. Usted es responsable de:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Mantener la confidencialidad de su contraseña</li>
                  <li>Todas las actividades que ocurran bajo su cuenta</li>
                  <li>Notificar inmediatamente cualquier uso no autorizado</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">3.2 Elegibilidad</h4>
                <p>
                  Debe ser mayor de 18 años y tener capacidad legal para celebrar 
                  contratos vinculantes.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Uso aceptable */}
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              4. Uso Aceptable
            </h3>
            <p className="mb-3">Usted se compromete a NO:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Proporcionar información falsa, inexacta o engañosa</li>
              <li>Utilizar la Plataforma para fines ilegales o no autorizados</li>
              <li>Intentar acceder a cuentas de otros usuarios</li>
              <li>Transmitir virus, malware o código malicioso</li>
              <li>Realizar ingeniería inversa de la Plataforma</li>
              <li>Acosar, amenazar o difamar a otros usuarios</li>
              <li>Recopilar datos de otros usuarios sin consentimiento</li>
            </ul>
          </section>

          {/* 5. Propiedad intelectual */}
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              5. Propiedad Intelectual
            </h3>
            <p className="mb-2">
              Todo el contenido de la Plataforma, incluyendo textos, gráficos, logotipos, 
              iconos, imágenes, clips de audio, descargas digitales y software, es propiedad 
              de la empresa o de sus proveedores de contenido y está protegido por las leyes 
              de propiedad intelectual.
            </p>
            <p className="text-sm bg-yellow-50 border border-yellow-200 rounded p-3 mt-3">
              <strong>Nota:</strong> Usted conserva todos los derechos sobre el contenido que 
              sube (CVs, información personal), pero nos otorga una licencia para procesarlo 
              según nuestra Política de Privacidad.
            </p>
          </section>

          {/* 6. Contenido del usuario */}
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              6. Contenido del Usuario
            </h3>
            <div className="space-y-3">
              <p>
                Al subir contenido a la Plataforma (CVs, perfiles, documentos), usted:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Declara que tiene derecho a compartir dicho contenido</li>
                <li>Otorga una licencia no exclusiva para procesar, analizar y almacenar su contenido</li>
                <li>Es responsable de la veracidad y legalidad de la información proporcionada</li>
                <li>Puede solicitar la eliminación de su contenido en cualquier momento</li>
              </ul>
            </div>
          </section>

          {/* 7. Privacidad y protección de datos */}
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              7. Privacidad y Protección de Datos
            </h3>
            <p>
              El uso de sus datos personales está regido por nuestra{' '}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  // Esto abrirá el modal de privacidad
                  window.dispatchEvent(new CustomEvent('openPrivacyModal'))
                }}
                className="text-blue-600 hover:text-blue-700 underline font-medium"
              >
                Política de Privacidad
              </button>
              . Al usar la Plataforma, usted consiente el procesamiento de sus datos 
              según lo descrito en dicha política.
            </p>
          </section>

          {/* 8. Terminación */}
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              8. Terminación de Cuenta
            </h3>
            <div className="space-y-2">
              <p>
                <strong>Por su parte:</strong> Puede cerrar su cuenta en cualquier momento 
                desde la configuración de su perfil.
              </p>
              <p>
                <strong>Por nuestra parte:</strong> Nos reservamos el derecho de suspender 
                o terminar su cuenta si:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Viola estos Términos y Condiciones</li>
                <li>Proporciona información falsa o engañosa</li>
                <li>Realiza actividades fraudulentas o ilegales</li>
                <li>No ha utilizado la cuenta por más de 24 meses</li>
              </ul>
            </div>
          </section>

          {/* 9. Limitación de responsabilidad */}
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              9. Limitación de Responsabilidad
            </h3>
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 space-y-2">
              <p className="font-semibold">
                La Plataforma se proporciona "TAL CUAL" y "SEGÚN DISPONIBILIDAD".
              </p>
              <p>
                No garantizamos que:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>El servicio será ininterrumpido o libre de errores</li>
                <li>Los resultados del matching serán 100% precisos</li>
                <li>Los defectos serán corregidos inmediatamente</li>
              </ul>
              <p className="text-sm mt-3">
                En ningún caso seremos responsables por daños indirectos, incidentales, 
                especiales o consecuentes.
              </p>
            </div>
          </section>

          {/* 10. Modificaciones */}
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              10. Modificaciones a los Términos
            </h3>
            <p>
              Nos reservamos el derecho de modificar estos términos en cualquier momento. 
              Las modificaciones entrarán en vigor inmediatamente después de su publicación. 
              Su uso continuado de la Plataforma después de dichas modificaciones constituye 
              su aceptación de los nuevos términos.
            </p>
          </section>

          {/* 11. Ley aplicable */}
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              11. Ley Aplicable y Jurisdicción
            </h3>
            <p>
              Estos términos se regirán e interpretarán de acuerdo con las leyes del país 
              donde opera la empresa, sin dar efecto a ningún principio de conflictos de leyes.
            </p>
          </section>

          {/* 12. Contacto */}
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              12. Contacto
            </h3>
            <p className="mb-2">
              Si tiene preguntas sobre estos Términos y Condiciones, puede contactarnos:
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <ul className="space-y-1">
                <li><strong>Email:</strong> legal@reclutamiento-ia.com</li>
                <li><strong>Teléfono:</strong> +1 (555) 123-4567</li>
                <li><strong>Dirección:</strong> Calle Principal 123, Ciudad, País</li>
              </ul>
            </div>
          </section>

          {/* Resumen ejecutivo */}
          <section className="border-t-2 border-gray-200 pt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              📋 Resumen Ejecutivo
            </h3>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <p className="font-semibold mb-2">En resumen:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Use la plataforma de manera responsable y legal</li>
                <li>Proporcione información veraz y actualizada</li>
                <li>Proteja su contraseña y credenciales</li>
                <li>Respete los derechos de otros usuarios</li>
                <li>Lea nuestra Política de Privacidad para entender el uso de sus datos</li>
                <li>Puede cerrar su cuenta en cualquier momento</li>
              </ul>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}
