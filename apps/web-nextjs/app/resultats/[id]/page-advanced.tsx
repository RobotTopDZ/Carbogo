'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ChartBarIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  TrophyIcon,
  CalendarIcon,
  CurrencyEuroIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  ChartPieIcon,
  FireIcon,
  BoltIcon
} from '@heroicons/react/24/outline'

interface AdvancedCalculationResult {
  calculation_id: string
  status: string
  total_co2e: number
  scope_1: number
  scope_2: number
  scope_3: number
  breakdown: Record<string, number>
  recommendations: string[]
  benchmark_position: string
  intensity_per_employee: number
  intensity_per_revenue?: number
  calculated_at: string
  
  // Advanced KPIs
  carbon_efficiency_score: number
  reduction_potential: Record<string, number>
  trajectory_2030: Record<string, number>
  sustainability_grade: string
  cost_of_carbon: number
  equivalent_metrics: Record<string, number>
  monthly_breakdown: Array<{month: number, emissions: number, factor: number}>
  peer_comparison: Record<string, number>
  certification_readiness: Record<string, boolean>
  ai_insights: Record<string, string>
}

interface AIInsights {
  diagnostic: string[]
  plan_action: Array<{action: string, impact_co2e: number, cout_estime: string, delai: string}>
  strategie_2030: {objectif: string, etapes: string[]}
  opportunites: string[]
  risques: string[]
  score_maturite: number
  prochaines_etapes: string[]
}

export default function AdvancedResultsPage() {
  const params = useParams()
  const [result, setResult] = useState<AdvancedCalculationResult | null>(null)
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingAI, setLoadingAI] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`http://localhost:8001/api/v1/calculation/${params.id}`)
        
        if (!response.ok) {
          throw new Error('Résultats non trouvés')
        }

        const data = await response.json()
        setResult(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchResults()
    }
  }, [params.id])

  const generateAIInsights = async () => {
    if (!result) return
    
    setLoadingAI(true)
    try {
      const response = await fetch(`http://localhost:8001/api/v1/ai-insights/${params.id}`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const data = await response.json()
        setAiInsights(data.ai_insights)
      }
    } catch (err) {
      console.error('Failed to generate AI insights:', err)
    } finally {
      setLoadingAI(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des résultats avancés...</p>
        </div>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  const getGradeColor = (grade: string) => {
    const colors = {
      'A+': 'text-green-700 bg-green-100 border-green-300',
      'A': 'text-green-600 bg-green-50 border-green-200',
      'B': 'text-blue-600 bg-blue-50 border-blue-200',
      'C': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'D': 'text-orange-600 bg-orange-50 border-orange-200',
      'F': 'text-red-600 bg-red-50 border-red-200'
    }
    return colors[grade as keyof typeof colors] || colors['C']
  }

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: ChartBarIcon },
    { id: 'breakdown', label: 'Analyse détaillée', icon: ChartPieIcon },
    { id: 'trajectory', label: 'Trajectoire 2030', icon: CalendarIcon },
    { id: 'benchmarks', label: 'Benchmarks', icon: TrophyIcon },
    { id: 'ai-insights', label: 'Insights IA', icon: SparklesIcon }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-blue-600 rounded-xl flex items-center justify-center">
                <ChartBarIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Analyse Carbone Avancée
                </h1>
                <p className="text-gray-600 mt-1">
                  Calculé le {new Date(result.calculated_at).toLocaleDateString('fr-FR')} • 
                  Score: {result.carbon_efficiency_score}/100 • 
                  Grade: <span className={`px-2 py-1 rounded text-sm font-medium ${getGradeColor(result.sustainability_grade)}`}>
                    {result.sustainability_grade}
                  </span>
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={generateAIInsights}
                disabled={loadingAI}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <SparklesIcon className="w-4 h-4" />
                {loadingAI ? 'Génération...' : 'Insights IA'}
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Télécharger PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <FireIcon className="w-5 h-5 text-red-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {result.total_co2e.toLocaleString('fr-FR')}
                  </span>
                </div>
                <div className="text-sm text-gray-600">kgCO₂e total</div>
                <div className="text-xs text-gray-500 mt-1">
                  {result.intensity_per_employee.toFixed(1)} kgCO₂e/employé
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrophyIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {result.carbon_efficiency_score}
                  </span>
                </div>
                <div className="text-sm text-gray-600">Score Efficacité</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${result.carbon_efficiency_score}%` }}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ArrowTrendingDownIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {Object.values(result.reduction_potential).reduce((a, b) => a + b, 0).toFixed(0)}
                  </span>
                </div>
                <div className="text-sm text-gray-600">Potentiel Réduction</div>
                <div className="text-xs text-gray-500 mt-1">kgCO₂e économisables</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <CurrencyEuroIcon className="w-5 h-5 text-yellow-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {(result.cost_of_carbon / 1000).toFixed(0)}k
                  </span>
                </div>
                <div className="text-sm text-gray-600">Coût Carbone</div>
                <div className="text-xs text-gray-500 mt-1">€ à 100€/tCO₂e</div>
              </motion.div>
            </div>

            {/* Equivalent Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <GlobeAltIcon className="w-5 h-5 text-green-600" />
                Équivalences Concrètes
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl mb-2">🌳</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {result.equivalent_metrics.trees_to_plant.toLocaleString('fr-FR')}
                  </div>
                  <div className="text-sm text-gray-600">arbres à planter</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl mb-2">🚗</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {result.equivalent_metrics.cars_off_road.toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-600">voitures en moins</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl mb-2">🏠</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {result.equivalent_metrics.homes_energy_year.toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-600">foyers/an</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl mb-2">✈️</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {result.equivalent_metrics.flights_paris_ny.toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-600">vols Paris-NY</div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* AI Insights Tab */}
        {activeTab === 'ai-insights' && (
          <div className="space-y-8">
            {aiInsights ? (
              <>
                {/* Diagnostic */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <LightBulbIcon className="w-5 h-5 text-purple-600" />
                    Diagnostic Expert IA
                  </h2>
                  
                  <div className="space-y-4">
                    {aiInsights.diagnostic.map((point, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                        <CheckCircleIcon className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                        <p className="text-purple-900">{point}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Action Plan */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Plan d'Action Prioritaire
                  </h2>
                  
                  <div className="space-y-4">
                    {aiInsights.plan_action.map((action, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{action.action}</h3>
                          <span className="text-sm text-green-600 font-medium">
                            -{action.impact_co2e.toFixed(0)} kgCO₂e
                          </span>
                        </div>
                        <div className="flex gap-4 text-sm text-gray-600">
                          <span>💰 {action.cout_estime}</span>
                          <span>⏱️ {action.delai}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            ) : (
              <div className="text-center py-12">
                <SparklesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Insights IA non générés
                </h3>
                <p className="text-gray-600 mb-6">
                  Cliquez sur "Insights IA" pour générer une analyse approfondie
                </p>
                <button 
                  onClick={generateAIInsights}
                  disabled={loadingAI}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  {loadingAI ? 'Génération en cours...' : 'Générer les Insights IA'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Other tabs content would go here */}
        {activeTab === 'breakdown' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Analyse Détaillée</h2>
            <p className="text-gray-600">Contenu de l'analyse détaillée...</p>
          </div>
        )}
      </main>
    </div>
  )
}
