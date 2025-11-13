'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { SparklesIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface SimplifiedQuestionnaireData {
  // Step 1: Company Info (Essential)
  entreprise: {
    nom: string
    secteur: string
    effectif: string
    chiffre_affaires?: number
    localisation: string
  }
  // Step 2: Energy (Key consumption only)
  energie: {
    electricite_kwh: number
    gaz_kwh: number
    carburants_litres: number
  }
  // Step 3: Transport (Simplified)
  transport: {
    vehicules_km_annuel: number
    vols_domestiques_km: number
    vols_internationaux_km: number
  }
  // Step 4: Purchases (High-level)
  achats: {
    montant_achats_annuel: number
    pourcentage_local: number
  }
}

const SECTEURS_ESSENTIELS = [
  { value: 'industrie', label: 'Industrie manufacturière' },
  { value: 'services', label: 'Services aux entreprises' },
  { value: 'commerce', label: 'Commerce de détail/gros' },
  { value: 'construction', label: 'Construction/BTP' },
  { value: 'transport', label: 'Transport et logistique' },
  { value: 'restauration', label: 'Restauration/Hôtellerie' },
  { value: 'sante', label: 'Santé et services sociaux' },
  { value: 'education', label: 'Éducation et formation' },
  { value: 'agriculture', label: 'Agriculture et agroalimentaire' },
  { value: 'technologie', label: 'Technologies et numérique' }
]

const TAILLES_ENTREPRISE = [
  { value: '1-9', label: '1-9 employés (Micro-entreprise)' },
  { value: '10-49', label: '10-49 employés (Petite entreprise)' },
  { value: '50-249', label: '50-249 employés (Moyenne entreprise)' },
  { value: '250+', label: '250+ employés (Grande entreprise)' }
]

export function AIQuestionnaireForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isAIProcessing, setIsAIProcessing] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<any>(null)
  
  const { register, handleSubmit, formState: { errors }, watch, setValue, getValues } = useForm<SimplifiedQuestionnaireData>()

  const watchedValues = watch()

  // AI Auto-completion function using Minimax API
  const autoCompleteWithAI = async () => {
    setIsAIProcessing(true)
    
    try {
      const companyInfo = getValues('entreprise')
      
      const response = await fetch('/api/ai-autocomplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: companyInfo.nom,
          sector: companyInfo.secteur,
          employees: companyInfo.effectif,
          revenue: companyInfo.chiffre_affaires,
          location: companyInfo.localisation
        })
      })

      const suggestions = await response.json()
      setAiSuggestions(suggestions)
      
      // Auto-fill suggested values
      if (suggestions.energie) {
        setValue('energie.electricite_kwh', suggestions.energie.electricite_kwh)
        setValue('energie.gaz_kwh', suggestions.energie.gaz_kwh)
        setValue('energie.carburants_litres', suggestions.energie.carburants_litres)
      }
      
      if (suggestions.transport) {
        setValue('transport.vehicules_km_annuel', suggestions.transport.vehicules_km_annuel)
        setValue('transport.vols_domestiques_km', suggestions.transport.vols_domestiques_km)
        setValue('transport.vols_internationaux_km', suggestions.transport.vols_internationaux_km)
      }
      
      if (suggestions.achats) {
        setValue('achats.montant_achats_annuel', suggestions.achats.montant_achats_annuel)
        setValue('achats.pourcentage_local', suggestions.achats.pourcentage_local)
      }
      
    } catch (error) {
      console.error('AI autocomplete error:', error)
    } finally {
      setIsAIProcessing(false)
    }
  }

  const onSubmit = async (data: SimplifiedQuestionnaireData) => {
    console.log('Questionnaire data:', data)
    
    try {
      // Send to calculation API
      const response = await fetch('http://localhost:8001/api/v1/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        throw new Error(`Calculation failed: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('Calculation result:', result)
      
      // Redirect to results page
      window.location.href = `/resultats/${result.calculation_id}`
      
    } catch (error) {
      console.error('Calculation error:', error)
      alert('Erreur lors du calcul. Veuillez réessayer.')
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Informations sur votre entreprise
              </h2>
              <p className="text-gray-600">
                Ces informations nous permettront de personnaliser le calcul selon votre secteur d'activité.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'entreprise *
                </label>
                <input
                  {...register('entreprise.nom', { required: 'Le nom est requis' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Nom de votre entreprise"
                />
                {errors.entreprise?.nom && (
                  <p className="mt-1 text-sm text-red-600">{errors.entreprise.nom.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secteur d'activité *
                </label>
                <select
                  {...register('entreprise.secteur', { required: 'Le secteur est requis' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Sélectionnez votre secteur</option>
                  {SECTEURS_ESSENTIELS.map((secteur) => (
                    <option key={secteur.value} value={secteur.value}>
                      {secteur.label}
                    </option>
                  ))}
                </select>
                {errors.entreprise?.secteur && (
                  <p className="mt-1 text-sm text-red-600">{errors.entreprise.secteur.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre d'employés *
                </label>
                <select
                  {...register('entreprise.effectif', { required: 'L\'effectif est requis' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Sélectionnez la taille</option>
                  {TAILLES_ENTREPRISE.map((taille) => (
                    <option key={taille.value} value={taille.value}>
                      {taille.label}
                    </option>
                  ))}
                </select>
                {errors.entreprise?.effectif && (
                  <p className="mt-1 text-sm text-red-600">{errors.entreprise.effectif.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chiffre d'affaires annuel (€)
                </label>
                <input
                  {...register('entreprise.chiffre_affaires', { valueAsNumber: true })}
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="ex: 1000000"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localisation principale *
                </label>
                <input
                  {...register('entreprise.localisation', { required: 'La localisation est requise' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Ville, Région, Pays"
                />
                {errors.entreprise?.localisation && (
                  <p className="mt-1 text-sm text-red-600">{errors.entreprise.localisation.message}</p>
                )}
              </div>
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Consommations énergétiques
                </h2>
                <p className="text-gray-600">
                  Renseignez vos consommations annuelles approximatives.
                </p>
              </div>
              
              {watchedValues.entreprise?.nom && watchedValues.entreprise?.secteur && (
                <button
                  type="button"
                  onClick={autoCompleteWithAI}
                  disabled={isAIProcessing}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  <SparklesIcon className="w-4 h-4" />
                  {isAIProcessing ? 'IA en cours...' : 'Compléter avec l\'IA'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Électricité (kWh/an)
                </label>
                <input
                  {...register('energie.electricite_kwh', { valueAsNumber: true, min: 0 })}
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="ex: 50000"
                />
                <p className="text-xs text-gray-500 mt-1">Facteur: 0.0571 kgCO₂e/kWh</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gaz naturel (kWh/an)
                </label>
                <input
                  {...register('energie.gaz_kwh', { valueAsNumber: true, min: 0 })}
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="ex: 30000"
                />
                <p className="text-xs text-gray-500 mt-1">Facteur: 0.227 kgCO₂e/kWh</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carburants (L/an)
                </label>
                <input
                  {...register('energie.carburants_litres', { valueAsNumber: true, min: 0 })}
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="ex: 5000"
                />
                <p className="text-xs text-gray-500 mt-1">Facteur: 2.8 kgCO₂e/L (essence)</p>
              </div>
            </div>

            {aiSuggestions && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <SparklesIcon className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-purple-900 mb-1">
                      Suggestions IA basées sur votre secteur
                    </h4>
                    <p className="text-sm text-purple-700">
                      Les valeurs ont été pré-remplies selon les moyennes de votre secteur. 
                      Vous pouvez les ajuster selon vos données réelles.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Transport et mobilité
              </h2>
              <p className="text-gray-600">
                Estimations des déplacements liés à votre activité.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Véhicules d'entreprise (km/an)
                </label>
                <input
                  {...register('transport.vehicules_km_annuel', { valueAsNumber: true, min: 0 })}
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="ex: 25000"
                />
                <p className="text-xs text-gray-500 mt-1">Facteur: 0.193 kgCO₂e/km</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vols domestiques (km/an)
                </label>
                <input
                  {...register('transport.vols_domestiques_km', { valueAsNumber: true, min: 0 })}
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="ex: 5000"
                />
                <p className="text-xs text-gray-500 mt-1">Facteur: 0.230 kgCO₂e/km</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vols internationaux (km/an)
                </label>
                <input
                  {...register('transport.vols_internationaux_km', { valueAsNumber: true, min: 0 })}
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="ex: 10000"
                />
                <p className="text-xs text-gray-500 mt-1">Facteur: 0.156 kgCO₂e/km</p>
              </div>
            </div>
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Achats et approvisionnements
              </h2>
              <p className="text-gray-600">
                Estimation globale de vos achats annuels.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant total des achats (€/an)
                </label>
                <input
                  {...register('achats.montant_achats_annuel', { valueAsNumber: true, min: 0 })}
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="ex: 500000"
                />
                <p className="text-xs text-gray-500 mt-1">Facteur moyen: 0.45 kgCO₂e/€</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pourcentage d'achats locaux (%)
                </label>
                <input
                  {...register('achats.pourcentage_local', { valueAsNumber: true, min: 0, max: 100 })}
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="ex: 30"
                />
                <p className="text-xs text-gray-500 mt-1">Réduction transport: -20% émissions</p>
              </div>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Étape {currentStep} sur 4
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((currentStep / 4) * 100)}% complété
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {renderStep()}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              Suivant
            </button>
          ) : (
            <button
              type="submit"
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              Calculer l'empreinte carbone
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
