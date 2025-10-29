'use client'

import { X, Shield, Lock, Eye, Database, UserCheck, Globe } from 'lucide-react'

interface PrivacyModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Shield className="w-7 h-7 text-indigo-600" />
            Política de Privacidad
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
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <p className="text-sm text-indigo-800">
              <strong>Última actualización:</strong> 29 de octubre de 2025
            </p>
            <p className="text-sm text-indigo-700 mt-2">
              Nos tomamos muy en serio su privacidad. Esta política describe cómo 
              recopilamos, usamos, compartimos y protegemos su información personal.
            </p>
          </div>

          {/* 1. Información que recopilamos */}
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              1. Información que Recopilamos
            </h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-2">
                  1.1 Información que usted proporciona directamente:
                </h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Datos de cuenta:</strong> Nombre completo, email, contraseña (encriptada)</li>
                  <li><strong>Perfil profesional:</strong> Experiencia laboral, educación, habilidades</li>
                  <li><strong>Documentos:</strong> Currículums vitae (CVs) en formato PDF/DOCX</li>
                  <li><strong>Información de contacto:</strong> Teléfono, ubicación, enlaces sociales</li>
                  <li><strong>Preferencias:</strong> Tipo de trabajo, salario esperado, disponibilidad</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-2">
                  1.2 Información recopilada automáticamente:
                </h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Datos de uso:</strong> Páginas visitadas, tiempo de sesión, clics</li>
                  <li><strong>Datos técnicos:</strong> Dirección IP, tipo de navegador, dispositivo</li>
                  <li><strong>Cookies:</strong> Identificadores de sesión, preferencias de usuario</li>
                  <li><strong>Análisis de IA:</strong> Resultados de matching, puntuaciones de compatibilidad</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 2. Cómo usamos su información */}
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-600" />
              2. Cómo Usamos su Información
            </h3>
            
            <div className="space-y-3">
              <p>Utilizamos su información personal para:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="font-semibold text-gray-700 mb-1">✅ Servicios principales</div>
                  <ul className="text-sm space-y-1">
                    <li>• Crear y gestionar su cuenta</li>
                    <li>• Procesar CVs con IA</li>
                    <li>• Matching candidato-puesto</li>
                    <li>• Enviar notificaciones relevantes</li>
                  </ul>
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="font-semibold text-gray-700 mb-1">📊 Mejora del servicio</div>
                  <ul className="text-sm space-y-1">
                    <li>• Analizar patrones de uso</li>
                    <li>• Mejorar algoritmos de IA</li>
                    <li>• Personalizar experiencia</li>
                    <li>• Detectar y prevenir fraudes</li>
                  </ul>
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="font-semibold text-gray-700 mb-1">📧 Comunicaciones</div>
                  <ul className="text-sm space-y-1">
                    <li>• Confirmaciones de registro</li>
                    <li>• Recuperación de contraseña</li>
                    <li>• Actualizaciones importantes</li>
                    <li>• Soporte al cliente</li>
                  </ul>
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="font-semibold text-gray-700 mb-1">⚖️ Cumplimiento legal</div>
                  <ul className="text-sm space-y-1">
                    <li>• Cumplir con leyes aplicables</li>
                    <li>• Responder a solicitudes legales</li>
                    <li>• Proteger derechos y seguridad</li>
                    <li>• Resolver disputas</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Compartir información */}
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-600" />
              3. Compartir su Información
            </h3>
            
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-semibold text-green-800 mb-2">
                  ✅ NO vendemos su información personal a terceros
                </p>
                <p className="text-sm text-green-700">
                  Su información solo se comparte en las siguientes circunstancias:
                </p>
              </div>

              <ul className="space-y-3">
                <li className="border-l-4 border-blue-500 pl-4">
                  <strong>Con reclutadores (con su consentimiento):</strong> Su perfil y CV 
                  pueden ser visibles para reclutadores que buscan candidatos que coincidan 
                  con sus criterios.
                </li>
                <li className="border-l-4 border-purple-500 pl-4">
                  <strong>Proveedores de servicios:</strong> Compartimos información con 
                  empresas que nos ayudan a operar (hosting, análisis, email), bajo estrictos 
                  acuerdos de confidencialidad.
                </li>
                <li className="border-l-4 border-orange-500 pl-4">
                  <strong>Requerimientos legales:</strong> Podemos divulgar información si 
                  lo requiere la ley, orden judicial o autoridad gubernamental.
                </li>
                <li className="border-l-4 border-red-500 pl-4">
                  <strong>Protección de derechos:</strong> En caso de fusión, adquisición o 
                  venta de activos, su información puede transferirse (se le notificará).
                </li>
              </ul>
            </div>
          </section>

          {/* 4. Seguridad de datos */}
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-600" />
              4. Seguridad de sus Datos
            </h3>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <p className="font-semibold">Implementamos medidas de seguridad robustas:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="font-semibold text-indigo-700 mb-1">🔐 Encriptación</div>
                  <ul className="list-disc list-inside ml-2">
                    <li>HTTPS/TLS en todas las comunicaciones</li>
                    <li>Contraseñas hasheadas con bcrypt</li>
                    <li>Datos en reposo encriptados</li>
                  </ul>
                </div>
                <div>
                  <div className="font-semibold text-indigo-700 mb-1">🛡️ Acceso controlado</div>
                  <ul className="list-disc list-inside ml-2">
                    <li>Autenticación de dos factores (2FA)</li>
                    <li>Row Level Security (RLS)</li>
                    <li>Auditoría de accesos</li>
                  </ul>
                </div>
                <div>
                  <div className="font-semibold text-indigo-700 mb-1">💾 Backups</div>
                  <ul className="list-disc list-inside ml-2">
                    <li>Respaldos automáticos diarios</li>
                    <li>Almacenamiento redundante</li>
                    <li>Plan de recuperación ante desastres</li>
                  </ul>
                </div>
                <div>
                  <div className="font-semibold text-indigo-700 mb-1">👁️ Monitoreo</div>
                  <ul className="list-disc list-inside ml-2">
                    <li>Detección de intrusiones</li>
                    <li>Alertas de seguridad</li>
                    <li>Actualizaciones regulares</li>
                  </ul>
                </div>
              </div>
              <p className="text-xs text-gray-600 italic mt-3">
                Ningún sistema es 100% seguro. Si detecta actividad sospechosa, contáctenos 
                inmediatamente.
              </p>
            </div>
          </section>

          {/* 5. Sus derechos */}
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-600" />
              5. Sus Derechos (GDPR/CCPA)
            </h3>
            
            <div className="space-y-3">
              <p className="font-semibold">Usted tiene derecho a:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white border-2 border-indigo-200 rounded-lg p-3">
                  <div className="font-semibold text-indigo-700 mb-1">📋 Acceso</div>
                  <p className="text-sm">Solicitar una copia de todos sus datos personales</p>
                </div>
                <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
                  <div className="font-semibold text-purple-700 mb-1">✏️ Rectificación</div>
                  <p className="text-sm">Corregir información inexacta o incompleta</p>
                </div>
                <div className="bg-white border-2 border-red-200 rounded-lg p-3">
                  <div className="font-semibold text-red-700 mb-1">🗑️ Eliminación</div>
                  <p className="text-sm">Solicitar la eliminación de sus datos ("derecho al olvido")</p>
                </div>
                <div className="bg-white border-2 border-orange-200 rounded-lg p-3">
                  <div className="font-semibold text-orange-700 mb-1">🚫 Oposición</div>
                  <p className="text-sm">Oponerse al procesamiento de sus datos</p>
                </div>
                <div className="bg-white border-2 border-green-200 rounded-lg p-3">
                  <div className="font-semibold text-green-700 mb-1">📦 Portabilidad</div>
                  <p className="text-sm">Recibir sus datos en formato estructurado (JSON/CSV)</p>
                </div>
                <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
                  <div className="font-semibold text-blue-700 mb-1">⏸️ Restricción</div>
                  <p className="text-sm">Limitar el procesamiento de sus datos</p>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mt-4">
                <p className="font-semibold text-yellow-800 mb-2">
                  📧 Para ejercer sus derechos:
                </p>
                <p className="text-sm text-yellow-700">
                  Envíe un email a <strong>privacy@reclutamiento-ia.com</strong> con el asunto 
                  "Solicitud de Datos" e incluya su nombre y email registrado. Responderemos 
                  en un plazo de <strong>30 días</strong>.
                </p>
              </div>
            </div>
          </section>

          {/* 6. Cookies */}
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              6. Cookies y Tecnologías Similares
            </h3>
            
            <div className="space-y-3">
              <p>Utilizamos cookies para:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Cookies esenciales:</strong> Mantener su sesión activa y segura 
                  (no se pueden desactivar)
                </li>
                <li>
                  <strong>Cookies de rendimiento:</strong> Analizar cómo usa la plataforma 
                  para mejorarla
                </li>
                <li>
                  <strong>Cookies de preferencias:</strong> Recordar su idioma, tema, 
                  configuraciones
                </li>
              </ul>
              <p className="text-sm bg-gray-50 border border-gray-200 rounded p-3">
                Puede gestionar cookies desde la configuración de su navegador. Note que 
                desactivar cookies puede afectar la funcionalidad de la plataforma.
              </p>
            </div>
          </section>

          {/* 7. Retención de datos */}
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              7. Retención de Datos
            </h3>
            
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
              <p className="mb-3">Conservamos su información personal:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Mientras su cuenta esté activa</strong> o sea necesaria para 
                  proporcionar servicios
                </li>
                <li>
                  <strong>Durante el período requerido por ley</strong> (generalmente 
                  6 años para registros fiscales)
                </li>
                <li>
                  <strong>Hasta que solicite su eliminación</strong> (con algunas 
                  excepciones legales)
                </li>
              </ul>
              <p className="text-sm text-gray-600 mt-3">
                Los datos anonimizados pueden conservarse indefinidamente para análisis 
                estadísticos.
              </p>
            </div>
          </section>

          {/* 8. Transferencias internacionales */}
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              8. Transferencias Internacionales
            </h3>
            <p>
              Sus datos pueden ser transferidos y almacenados en servidores ubicados fuera 
              de su país. Garantizamos que dichas transferencias cumplen con las leyes de 
              protección de datos aplicables mediante:
            </p>
            <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
              <li>Cláusulas contractuales estándar aprobadas por la UE</li>
              <li>Certificaciones Privacy Shield (cuando aplique)</li>
              <li>Medidas de seguridad adicionales</li>
            </ul>
          </section>

          {/* 9. Menores de edad */}
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              9. Menores de Edad
            </h3>
            <div className="bg-red-50 border border-red-300 rounded-lg p-4">
              <p className="font-semibold text-red-800 mb-2">
                ⚠️ La plataforma NO está dirigida a menores de 18 años
              </p>
              <p className="text-sm text-red-700">
                No recopilamos intencionalmente información de menores. Si descubrimos que 
                hemos recopilado datos de un menor, los eliminaremos inmediatamente. Si cree 
                que un menor ha proporcionado información, contáctenos.
              </p>
            </div>
          </section>

          {/* 10. Cambios a esta política */}
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              10. Cambios a esta Política
            </h3>
            <p>
              Podemos actualizar esta Política de Privacidad periódicamente. Los cambios 
              significativos se notificarán por email o mediante un aviso destacado en la 
              plataforma. La fecha de "Última actualización" al inicio indica cuándo se 
              revisó por última vez.
            </p>
          </section>

          {/* 11. Contacto */}
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              11. Contacto - Oficial de Protección de Datos
            </h3>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <p className="mb-3">
                Para preguntas sobre esta política o ejercer sus derechos:
              </p>
              <ul className="space-y-1">
                <li><strong>Email:</strong> privacy@reclutamiento-ia.com</li>
                <li><strong>DPO (Data Protection Officer):</strong> dpo@reclutamiento-ia.com</li>
                <li><strong>Teléfono:</strong> +1 (555) 123-4567 ext. 101</li>
                <li><strong>Dirección postal:</strong> Calle Principal 123, Ciudad, País</li>
              </ul>
            </div>
          </section>

          {/* Resumen ejecutivo */}
          <section className="border-t-2 border-gray-200 pt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              📋 Resumen Ejecutivo
            </h3>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
              <p className="font-semibold mb-2">Sus datos, sus derechos:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>✅ Recopilamos solo lo necesario para el servicio</li>
                <li>🔒 Protegemos sus datos con encriptación y seguridad avanzada</li>
                <li>🚫 NO vendemos su información a terceros</li>
                <li>👁️ Usted controla qué reclutadores ven su perfil</li>
                <li>📧 Puede solicitar, modificar o eliminar sus datos en cualquier momento</li>
                <li>🌍 Cumplimos con GDPR, CCPA y regulaciones internacionales</li>
                <li>📞 Estamos disponibles para resolver sus dudas de privacidad</li>
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
