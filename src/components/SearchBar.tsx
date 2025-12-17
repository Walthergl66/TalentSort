'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  suggestions?: string[]
  className?: string
  variant?: 'default' | 'compact' | 'large'
  showSuggestions?: boolean
  autoFocus?: boolean
}

export default function SearchBar({
  onSearch,
  placeholder,
  suggestions = [],
  className = '',
  variant = 'default',
  showSuggestions = true,
  autoFocus = false
}: SearchBarProps) {
  const t = useTranslations('search')
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Tamaños según variante
  const sizes = {
    compact: 'h-9 text-sm',
    default: 'h-12 text-base',
    large: 'h-14 text-lg'
  }

  useEffect(() => {
    if (query && suggestions.length > 0 && showSuggestions) {
      const filtered = suggestions.filter(s => 
        s.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredSuggestions(filtered.slice(0, 5))
      setShowDropdown(filtered.length > 0 && isFocused)
    } else {
      setShowDropdown(false)
      setFilteredSuggestions([])
    }
  }, [query, suggestions, isFocused, showSuggestions])

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (searchQuery: string) => {
    onSearch(searchQuery)
    setShowDropdown(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && filteredSuggestions[selectedIndex]) {
        const selected = filteredSuggestions[selectedIndex]
        setQuery(selected)
        handleSearch(selected)
      } else {
        handleSearch(query)
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
      inputRef.current?.blur()
    }
  }

  const handleClear = () => {
    setQuery('')
    onSearch('')
    inputRef.current?.focus()
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    handleSearch(suggestion)
  }

  return (
    <div className={`relative ${className}`}>
      <div className={`relative group ${sizes[variant]}`}>
        {/* Icono de búsqueda */}
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors`}>
          <svg 
            className={`${variant === 'compact' ? 'w-4 h-4' : variant === 'large' ? 'w-6 h-6' : 'w-5 h-5'}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholder || t('placeholder')}
          autoFocus={autoFocus}
          className={`
            w-full ${sizes[variant]} 
            pl-10 pr-10
            bg-white border border-gray-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-200
            placeholder:text-gray-400
            hover:border-gray-400
            ${isFocused ? 'shadow-lg' : 'shadow-sm'}
          `}
          aria-label={t('ariaLabel')}
          aria-describedby="search-description"
          aria-expanded={showDropdown}
          aria-controls={showDropdown ? 'search-suggestions' : undefined}
          role="searchbox"
        />

        {/* Botón de limpiar */}
        {query && (
          <button
            onClick={handleClear}
            className={`
              absolute right-3 top-1/2 -translate-y-1/2 
              text-gray-400 hover:text-gray-600 
              transition-colors p-1 rounded-full hover:bg-gray-100
            `}
            aria-label={t('clearSearch')}
            type="button"
          >
            <svg 
              className={`${variant === 'compact' ? 'w-4 h-4' : variant === 'large' ? 'w-6 h-6' : 'w-5 h-5'}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        )}

        {/* Indicador de loading (opcional, puedes activarlo con una prop si lo necesitas) */}
        {/* <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        </div> */}
      </div>

      {/* Descripción oculta para accesibilidad */}
      <span id="search-description" className="sr-only">
        {t('description')}
      </span>

      {/* Dropdown de sugerencias */}
      {showDropdown && filteredSuggestions.length > 0 && (
        <div
          ref={dropdownRef}
          id="search-suggestions"
          role="listbox"
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto"
        >
          <div className="py-2">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
              {t('suggestions')}
            </div>
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`
                  w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors
                  flex items-center gap-3 cursor-pointer
                  ${selectedIndex === index ? 'bg-blue-50' : ''}
                `}
                role="option"
                aria-selected={selectedIndex === index}
              >
                <svg 
                  className="w-4 h-4 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                  />
                </svg>
                <span className="text-gray-700">{suggestion}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Atajos de teclado (tooltip opcional) */}
      {isFocused && (
        <div className="absolute right-0 -bottom-8 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow-sm border border-gray-200">
          {t('keyboardHints')}
        </div>
      )}
    </div>
  )
}
