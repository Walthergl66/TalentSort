'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import AccessibilityProvider from '@/components/Accesibilidad/AccessibilityProvider'

export default function UploadCVPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [analysisResult, setAnalysisResult] = useState<any>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    const file = files[0]
    
    // Validar tipo de archivo
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      alert('Por favor, sube un archivo PDF o Word (.doc, .docx)')
      return
    }
    
    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 10MB permitido.')
      return
    }
    
    setSelectedFile(file)
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    handleFiles(e.dataTransfer.files)
  }, [])

  const uploadCV = async () => {
    if (!selectedFile) return

    setLoading(true)
    setUploadProgress(0)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }

      setUser(user)

      // Simular progreso de subida
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      // Crear un FormData para enviar el archivo
      const formData = new FormData()
      formData.append('cv_file', selectedFile)
      formData.append('user_id', user.id)

      // Aquí simularemos el procesamiento del CV
      // En un caso real, enviarías el archivo a tu backend para procesarlo con IA
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Simular resultado del análisis de IA
      const mockAnalysis = {
        candidate_name: 'Usuario Ejemplo',
        candidate_email: user.email,
        experience_years: Math.floor(Math.random() * 10) + 2,
        current_position: 'Desarrollador Full Stack',
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git'],
        ai_score: Math.floor(Math.random() * 30) + 70, // 70-100
        summary: 'Candidato con sólida experiencia en desarrollo web full stack.',
        strengths: ['Experiencia técnica sólida', 'Habilidades de liderazgo', 'Conocimiento actualizado'],
        areas_improvement: ['Certificaciones adicionales', 'Experiencia en cloud'],
        salary_expectation: `$${Math.floor(Math.random() * 30000) + 50000}`,
        status: 'processed'
      }

      // Guardar en la base de datos
      const { data, error } = await supabase
        .from('user_cvs')
        .insert({
          user_id: user.id,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          ...mockAnalysis
        })
        .select()
        .single()

      if (error) {
        console.error('Error saving CV:', error)
        throw error
      }

      setUploadProgress(100)
      setAnalysisResult({ ...mockAnalysis, id: data.id })
      
    } catch (error) {
      console.error('Error uploading CV:', error)
      alert('Error al subir el CV. Por favor, inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const resetUpload = () => {
    setSelectedFile(null)
    setAnalysisResult(null)
    setUploadProgress(0)
  }

  return (
    <AccessibilityProvider>
      <DashboardLayout user={user}>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Subir mi CV
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Sube tu CV para análisis automático y mejoras de perfil
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Volver
            </button>
          </div>

          {!analysisResult ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              {!selectedFile ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 mb-4"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="text-xl font-medium text-gray-900 mb-2">
                    Arrastra tu CV aquí
                  </p>
                  <p className="text-gray-500 mb-6">
                    o haz clic para seleccionar un archivo
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                    id="cv-upload"
                  />
                  <label
                    htmlFor="cv-upload"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  >
                    Seleccionar archivo
                  </label>
                  <p className="text-sm text-gray-500 mt-4">
                    Formatos soportados: PDF, DOC, DOCX (máx. 10MB)
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Archivo seleccionado */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <svg className="h-8 w-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={resetUpload}
                      className="text-red-600 hover:text-red-800"
                      disabled={loading}
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Progreso de subida */}
                  {loading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Procesando CV...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Botones de acción */}
                  <div className="flex space-x-4">
                    <button
                      onClick={uploadCV}
                      disabled={loading}
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {loading ? 'Procesando...' : 'Analizar CV'}
                    </button>
                    <button
                      onClick={resetUpload}
                      disabled={loading}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Resultados del análisis */
            <div className="space-y-6">
              {/* Resultado exitoso */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-medium text-green-900">
                      ¡CV procesado exitosamente!
                    </h3>
                    <p className="text-green-700">
                      Tu perfil ha sido actualizado con la información de tu CV
                    </p>
                  </div>
                </div>
              </div>

              {/* Puntuación IA */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Puntuación de tu CV
                  </h3>
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 mb-4">
                    <span className="text-2xl font-bold text-blue-600">
                      {analysisResult.ai_score}%
                    </span>
                  </div>
                  <p className="text-gray-600">
                    {analysisResult.ai_score >= 80 
                      ? 'Excelente CV! Tu perfil es muy competitivo'
                      : analysisResult.ai_score >= 60
                      ? 'Buen CV con oportunidades de mejora'
                      : 'Tu CV necesita algunas mejoras para destacar'
                    }
                  </p>
                </div>
              </div>

              {/* Información extraída */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Información Profesional
                  </h4>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Posición Actual</dt>
                      <dd className="text-sm text-gray-900">{analysisResult.current_position}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Años de Experiencia</dt>
                      <dd className="text-sm text-gray-900">{analysisResult.experience_years} años</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Expectativa Salarial</dt>
                      <dd className="text-sm text-gray-900">{analysisResult.salary_expectation}</dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Habilidades Detectadas
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.skills.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fortalezas y áreas de mejora */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="text-lg font-medium text-green-900 mb-4">
                    🎯 Fortalezas
                  </h4>
                  <ul className="space-y-2">
                    {analysisResult.strengths.map((strength: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="text-lg font-medium text-orange-900 mb-4">
                    📈 Áreas de Mejora
                  </h4>
                  <ul className="space-y-2">
                    {analysisResult.areas_improvement.map((area: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <svg className="h-5 w-5 text-orange-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-700">{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium"
                >
                  Ir al Dashboard
                </button>
                <button
                  onClick={resetUpload}
                  className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50"
                >
                  Subir otro CV
                </button>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </AccessibilityProvider>
  )
}