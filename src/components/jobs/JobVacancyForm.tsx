'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { JobVacancy } from '@/types/database'

interface JobVacancyFormProps {
  companyId: string
  vacancy?: JobVacancy | null
  onSave?: (vacancy: JobVacancy) => void
  onCancel?: () => void
}

type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'freelance'
type VacancyStatus = 'open' | 'closed' | 'draft'

interface FormData {
  title: string
  description: string
  requirements: string
  skills_required: string[]
  experience_years_min: number
  experience_years_max: number | null
  salary_min: number | null
  salary_max: number | null
  location: string
  employment_type: EmploymentType
  status: VacancyStatus
}

const INITIAL_FORM_DATA: FormData = {
  title: '',
  description: '',
  requirements: '',
  skills_required: [],
  experience_years_min: 0,
  experience_years_max: null,
  salary_min: null,
  salary_max: null,
  location: '',
  employment_type: 'full-time',
  status: 'draft',
}

const INPUT_CLASSES = "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
const LABEL_CLASSES = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"

export default function JobVacancyForm({ companyId, vacancy, onSave, onCancel }: JobVacancyFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA)
  const [skillInput, setSkillInput] = useState('')

  useEffect(() => {
    if (vacancy) {
      setFormData({
        title: vacancy.title,
        description: vacancy.description,
        requirements: vacancy.requirements,
        skills_required: vacancy.skills_required,
        experience_years_min: vacancy.experience_years_min,
        experience_years_max: vacancy.experience_years_max ?? null,
        salary_min: vacancy.salary_min ?? null,
        salary_max: vacancy.salary_max ?? null,
        location: vacancy.location,
        employment_type: vacancy.employment_type,
        status: vacancy.status,
      })
    }
  }, [vacancy])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const addSkill = () => {
    const trimmedSkill = skillInput.trim()
    if (trimmedSkill && !formData.skills_required.includes(trimmedSkill)) {
      setFormData(prev => ({
        ...prev,
        skills_required: [...prev.skills_required, trimmedSkill]
      }))
      setSkillInput('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills_required: prev.skills_required.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSkill()
    }
  }

  const saveVacancy = async (vacancyData: Partial<JobVacancy>) => {
    if (vacancy) {
      return await supabase
        .from('job_vacancies')
        .update(vacancyData)
        .eq('id', vacancy.id)
        .select()
        .single()
    }
    
    return await supabase
      .from('job_vacancies')
      .insert([vacancyData])
      .select()
      .single()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const vacancyData = {
        ...formData,
        company_id: companyId,
        applications_count: 0,
      }

      const { data, error } = await saveVacancy(vacancyData)

      if (error) throw error
      if (data && onSave) onSave(data as JobVacancy)
    } catch (error) {
      console.error('Error al guardar vacante:', error)
      alert('Error al guardar la vacante. Por favor, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
      {/* Título */}
      <FormField
        label="Título del Puesto *"
        name="title"
        type="text"
        required
        value={formData.title}
        onChange={handleChange}
        placeholder="ej. Desarrollador Full Stack Senior"
      />

      {/* Descripción */}
      <FormField
        label="Descripción *"
        name="description"
        type="textarea"
        required
        value={formData.description}
        onChange={handleChange}
        rows={4}
        placeholder="Describe el puesto y las responsabilidades..."
      />

      {/* Requisitos */}
      <div>
        <label className={LABEL_CLASSES}>
          Requisitos (La IA usará esto para analizar CVs) *
        </label>
        <textarea
          name="requirements"
          required
          value={formData.requirements}
          onChange={handleChange}
          rows={6}
          className={INPUT_CLASSES}
          placeholder="Lista los requisitos técnicos, habilidades y experiencia necesaria..."
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Sé específico: tecnologías, años de experiencia, certificaciones, etc.
        </p>
      </div>

      {/* Habilidades */}
      <SkillsInput
        skills={formData.skills_required}
        skillInput={skillInput}
        onSkillInputChange={setSkillInput}
        onAddSkill={addSkill}
        onRemoveSkill={removeSkill}
        onKeyPress={handleKeyPress}
      />

      {/* Experiencia */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Años de Experiencia Mínimos *"
          name="experience_years_min"
          type="number"
          required
          min={0}
          value={formData.experience_years_min}
          onChange={handleChange}
        />
        <FormField
          label="Años de Experiencia Máximos"
          name="experience_years_max"
          type="number"
          min={0}
          value={formData.experience_years_max || ''}
          onChange={handleChange}
        />
      </div>

      {/* Salario */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Salario Mínimo (opcional)"
          name="salary_min"
          type="number"
          min={0}
          value={formData.salary_min || ''}
          onChange={handleChange}
          placeholder="$"
        />
        <FormField
          label="Salario Máximo (opcional)"
          name="salary_max"
          type="number"
          min={0}
          value={formData.salary_max || ''}
          onChange={handleChange}
          placeholder="$"
        />
      </div>

      {/* Ubicación */}
      <FormField
        label="Ubicación *"
        name="location"
        type="text"
        required
        value={formData.location}
        onChange={handleChange}
        placeholder="ej. Remoto, Madrid, CDMX"
      />

      {/* Tipo y Estado */}
      <div className="grid grid-cols-2 gap-4">
        <FormSelect
          label="Tipo de Empleo *"
          name="employment_type"
          required
          value={formData.employment_type}
          onChange={handleChange}
          options={[
            { value: 'full-time', label: 'Tiempo Completo' },
            { value: 'part-time', label: 'Medio Tiempo' },
            { value: 'contract', label: 'Contrato' },
            { value: 'freelance', label: 'Freelance' },
          ]}
        />
        <FormSelect
          label="Estado *"
          name="status"
          required
          value={formData.status}
          onChange={handleChange}
          options={[
            { value: 'draft', label: 'Borrador' },
            { value: 'open', label: 'Abierta' },
            { value: 'closed', label: 'Cerrada' },
          ]}
        />
      </div>

      {/* Botones de acción */}
      <FormActions
        loading={loading}
        isEditing={!!vacancy}
        onCancel={onCancel}
      />
    </form>
  )
}

// Componentes auxiliares
interface FormFieldProps {
  label: string
  name: string
  type: 'text' | 'number' | 'textarea'
  required?: boolean
  value: string | number
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  placeholder?: string
  rows?: number
  min?: number
}

function FormField({ label, name, type, required, value, onChange, placeholder, rows, min }: FormFieldProps) {
  const isTextarea = type === 'textarea'
  
  return (
    <div>
      <label className={LABEL_CLASSES}>{label}</label>
      {isTextarea ? (
        <textarea
          name={name}
          required={required}
          value={value}
          onChange={onChange}
          rows={rows}
          className={INPUT_CLASSES}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          name={name}
          required={required}
          value={value}
          onChange={onChange}
          className={INPUT_CLASSES}
          placeholder={placeholder}
          min={min}
        />
      )}
    </div>
  )
}

interface FormSelectProps {
  label: string
  name: string
  required?: boolean
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: { value: string; label: string }[]
}

function FormSelect({ label, name, required, value, onChange, options }: FormSelectProps) {
  return (
    <div>
      <label className={LABEL_CLASSES}>{label}</label>
      <select
        name={name}
        required={required}
        value={value}
        onChange={onChange}
        className={INPUT_CLASSES}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

interface SkillsInputProps {
  skills: string[]
  skillInput: string
  onSkillInputChange: (value: string) => void
  onAddSkill: () => void
  onRemoveSkill: (skill: string) => void
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

function SkillsInput({ skills, skillInput, onSkillInputChange, onAddSkill, onRemoveSkill, onKeyPress }: SkillsInputProps) {
  return (
    <div>
      <label className={LABEL_CLASSES}>Habilidades Requeridas</label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={skillInput}
          onChange={(e) => onSkillInputChange(e.target.value)}
          onKeyPress={onKeyPress}
          className={`flex-1 ${INPUT_CLASSES}`}
          placeholder="ej. React, Node.js, TypeScript"
        />
        <button
          type="button"
          onClick={onAddSkill}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Agregar
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <SkillBadge key={index} skill={skill} onRemove={onRemoveSkill} />
        ))}
      </div>
    </div>
  )
}

interface SkillBadgeProps {
  skill: string
  onRemove: (skill: string) => void
}

function SkillBadge({ skill, onRemove }: SkillBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
      {skill}
      <button
        type="button"
        onClick={() => onRemove(skill)}
        className="hover:text-blue-600 dark:hover:text-blue-200 font-bold"
        aria-label={`Eliminar ${skill}`}
      >
        ×
      </button>
    </span>
  )
}

interface FormActionsProps {
  loading: boolean
  isEditing: boolean
  onCancel?: () => void
}

function FormActions({ loading, isEditing, onCancel }: FormActionsProps) {
  return (
    <div className="flex gap-3 pt-4">
      <button
        type="submit"
        disabled={loading}
        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Guardando...' : isEditing ? 'Actualizar Vacante' : 'Crear Vacante'}
      </button>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancelar
        </button>
      )}
    </div>
  )
}
