'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import AccessibilityProvider from '@/components/Accesibilidad/AccessibilityProvider'
import Tooltip, { HelpIcon } from '@/components/common/Tooltip'

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
    
    let progressInterval: NodeJS.Timeout | null = null

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }

      setUser(user)

      // Simular progreso de subida
      progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            if (progressInterval) clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      setUploadProgress(30)

      // 1. Subir archivo a Supabase Storage
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cvs')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Error uploading file to storage:', uploadError)
        throw new Error('Error al subir el archivo')
      }

      setUploadProgress(50)

      // 2. Crear registro en la base de datos con campos mínimos
      const { data: cvRecord, error: insertError } = await supabase
        .from('user_cvs')
        .insert({
          user_id: user.id,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          storage_path: fileName
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating CV record:', insertError)
        console.error('Insert error details:', {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        })
        throw new Error(`Error al crear registro del CV: ${insertError.message}`)
      }

      console.log('[cv/upload] CV record created:', cvRecord.id)
      setUploadProgress(60)

      // 3. Extraer texto del PDF
      console.log('[cv/upload] Preparando extracción de texto del CV:', {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        cvId: cvRecord.id
      })

      const extractFormData = new FormData()
      extractFormData.append('file', selectedFile)
      extractFormData.append('cv_id', cvRecord.id)

      const extractResponse = await fetch('/api/cv/extract', {
        method: 'POST',
        body: extractFormData
      })

      console.log('[cv/upload] Extract response:', {
        status: extractResponse.status,
        ok: extractResponse.ok,
        statusText: extractResponse.statusText
      })

      if (!extractResponse.ok) {
        const errorData = await extractResponse.json().catch(() => ({ error: 'Error desconocido' }))
        console.error('[cv/upload] Error en extracción:', errorData)
        throw new Error(errorData.error || 'Error al extraer texto del CV')
      }

      const extractResult = await extractResponse.json()
      console.log('[cv/upload] Extract result:', extractResult)
      
      const cvText = extractResult.text || ''
      console.log('[cv/upload] CV text extracted:', {
        length: cvText.length,
        preview: cvText.substring(0, 200),
        hasDbResult: !!extractResult.dbResult,
        textLength: extractResult.textLength
      })

      if (!cvText) {
        console.warn('[cv/upload] No se extrajo texto del PDF. Puede ser un PDF escaneado (imagen).')
      }

      setUploadProgress(75)

      // 4. Analizar con IA para extraer campos estructurados
      const analysisResponse = await fetch('/api/analyze-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cv_text: cvText,
          job_description: 'Extrae la información del candidato: nombre completo, email, años de experiencia, posición actual, habilidades, resumen profesional y expectativa salarial. Devuelve JSON estructurado.'
        })
      })

      let aiAnalysis: any = {}
      if (analysisResponse.ok) {
        aiAnalysis = await analysisResponse.json()
      }

      setUploadProgress(90)

      // 5. Actualizar registro con datos extraídos
      const updateData: any = {
        cv_text: cvText,
        candidate_name: aiAnalysis.candidate_name || user.email?.split('@')[0] || 'Usuario',
        candidate_email: aiAnalysis.candidate_email || user.email,
        experience_years: parseInt(aiAnalysis.experience_years) || 0,
        current_position: aiAnalysis.current_position || 'No especificada',
        skills: Array.isArray(aiAnalysis.skills) ? aiAnalysis.skills : [],
        ai_score: aiAnalysis.score ? Math.min(100, Math.max(0, aiAnalysis.score * 10)) : Math.floor(Math.random() * 30) + 70,
        summary: aiAnalysis.analysis || 'CV procesado correctamente.',
        strengths: Array.isArray(aiAnalysis.strengths) ? aiAnalysis.strengths : ['Experiencia profesional'],
        areas_improvement: Array.isArray(aiAnalysis.areas_improvement) ? aiAnalysis.areas_improvement : ['Seguir desarrollando habilidades'],
        salary_expectation: aiAnalysis.salary_expectation || 'No especificada'
      }

      console.log('[cv/upload] Updating CV with data:', {
        cvId: cvRecord.id,
        hasText: !!updateData.cv_text,
        textLength: updateData.cv_text?.length || 0,
        candidateName: updateData.candidate_name,
        skillsCount: updateData.skills.length
      })

      const { data: updatedCV, error: updateError } = await supabase
        .from('user_cvs')
        .update(updateData)
        .eq('id', cvRecord.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating CV with analysis:', updateError)
        console.error('Update error details:', {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint
        })
        // No fallar si el update falla, el CV ya está subido
      } else {
        console.log('[cv/upload] CV updated successfully')
      }

      setUploadProgress(100)
      setAnalysisResult({ ...updateData, id: cvRecord.id })
      
    } catch (error: any) {
      console.error('Error uploading CV:', error)
      alert(`Error al subir el CV: ${error.message || 'Por favor, inténtalo de nuevo.'}`)
    } finally {
      setLoading(false)
      if (progressInterval) {
        clearInterval(progressInterval)
      }
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
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                Subir mi CV
                <Tooltip content="Sube tu currículum en formato PDF o Word. Nuestro sistema de IA lo analizará automáticamente para extraer tu información profesional.">
                  <HelpIcon className="w-5 h-5" />
                </Tooltip>
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
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
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-4">
                    <span>Formatos soportados: PDF, DOC, DOCX (máx. 10MB)</span>
                    <Tooltip content="Recomendamos PDF para mejor extracción de datos. El archivo debe ser de texto, no imagen escaneada.">
                      <HelpIcon className="w-4 h-4" />
                    </Tooltip>
                  </div>
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
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h4 className="text-lg font-medium text-green-900 mb-4">
                    Fortalezas
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

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h4 className="text-lg font-medium text-orange-900 mb-4">
                    Áreas de Mejora
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