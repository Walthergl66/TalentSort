'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { CandidateCV } from '@/types/database'

interface CVUploadProps {
  userId: string
  onUploadSuccess?: (cv: CandidateCV) => void
  onUploadError?: (error: string) => void
}

export default function CVUpload({ userId, onUploadSuccess, onUploadError }: CVUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (selectedFile: File) => {
    setError(null)

    // Validar tipo de archivo
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Solo se permiten archivos PDF o DOCX')
      return
    }

    // Validar tamaño (5MB)
    const maxSize = 5 * 1024 * 1024
    if (selectedFile.size > maxSize) {
      setError('El archivo es demasiado grande. Máximo 5MB (aproximadamente 3 páginas)')
      return
    }

    // Estimar páginas
    const estimatedPages = Math.ceil(selectedFile.size / (100 * 1024))
    if (estimatedPages > 3) {
      setError(`Tu CV parece tener más de 3 páginas (~${estimatedPages} páginas). Por favor, reduce el tamaño.`)
      return
    }

    setFile(selectedFile)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setProgress(10)
    setError(null)

    try {
      // 1. Extraer texto del CV usando la API de IA
      setExtracting(true)
      setProgress(30)

      const formData = new FormData()
      formData.append('file', file)

      const extractResponse = await fetch('/api/cv/extract', {
        method: 'POST',
        body: formData,
      })

      if (!extractResponse.ok) {
        const errorData = await extractResponse.json()
        throw new Error(errorData.error || 'Error al procesar el CV')
      }

      const { data: extractedData } = await extractResponse.json()
      setProgress(50)
      setExtracting(false)

      // 2. Subir archivo a Supabase Storage
      const fileName = `${userId}/${Date.now()}_${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cvs')
        .upload(fileName, file)

      if (uploadError) throw uploadError
      setProgress(70)

      // 3. Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('cvs')
        .getPublicUrl(fileName)

      setProgress(80)

      // 4. Guardar metadata en la base de datos
      const cvData = {
        user_id: userId,
        file_name: file.name,
        file_path: publicUrl,
        file_size: file.size,
        file_type: file.type,
        cv_text: extractedData.text,
        candidate_name: '', // Se completará en el perfil
        candidate_email: '', // Se completará en el perfil
        skills: [],
        is_active: true,
      }

      const { data: cvRecord, error: dbError } = await supabase
        .from('candidate_cvs')
        .insert([cvData])
        .select()
        .single()

      if (dbError) throw dbError

      setProgress(100)

      // Éxito
      if (onUploadSuccess) {
        onUploadSuccess(cvRecord as CandidateCV)
      }

      // Limpiar
      setTimeout(() => {
        setFile(null)
        setProgress(0)
        setUploading(false)
      }, 1000)

    } catch (error: any) {
      console.error('Error al subir CV:', error)
      const errorMessage = error.message || 'Error al subir el CV. Intenta de nuevo.'
      setError(errorMessage)
      if (onUploadError) {
        onUploadError(errorMessage)
      }
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        className={`border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
          dragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />

        {!file ? (
          <div className="text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Sube tu CV
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Arrastra y suelta tu archivo o haz clic para seleccionar
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Seleccionar archivo
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              PDF o DOCX • Máximo 5MB • 3 páginas máximo
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <svg
                  className="w-10 h-10 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              {!uploading && (
                <button
                  onClick={() => setFile(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            {uploading && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    {extracting ? 'Extrayendo texto...' : 'Subiendo...'}
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {!uploading && (
              <button
                onClick={handleUpload}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Subir CV
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
