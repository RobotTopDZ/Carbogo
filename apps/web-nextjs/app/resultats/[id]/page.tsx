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

interface CalculationResult {
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

export default function ResultsPage() {
  const params = useParams()
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des résultats...</p>
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

  const getBenchmarkColor = (position: string) => {
    if (position.includes('Excellent')) return 'text-green-600 bg-green-100'
    if (position.includes('Bon')) return 'text-blue-600 bg-blue-100'
    if (position.includes('Moyen')) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getBenchmarkIcon = (position: string) => {
    if (position.includes('Excellent') || position.includes('Bon')) {
      return <ArrowTrendingDownIcon className="w-4 h-4" />
    }
    return <ArrowTrendingUpIcon className="w-4 h-4" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Résultats de votre Empreinte Carbone
              </h1>
              <p className="text-gray-600 mt-1">
                Calculé le {new Date(result.calculated_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {result.total_co2e.toLocaleString('fr-FR')}
              </div>
              <div className="text-sm text-gray-600">kgCO₂e total</div>
              <div className="text-xs text-gray-500 mt-1">
                {result.intensity_per_employee.toFixed(1)} kgCO₂e/employé
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 mb-2">
                {result.scope_1.toLocaleString('fr-FR')}
              </div>
              <div className="text-sm text-gray-600">Scope 1</div>
              <div className="text-xs text-gray-500 mt-1">Émissions directes</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-2">
                {result.scope_2.toLocaleString('fr-FR')}
              </div>
              <div className="text-sm text-gray-600">Scope 2</div>
              <div className="text-xs text-gray-500 mt-1">Énergie indirecte</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {result.scope_3.toLocaleString('fr-FR')}
              </div>
              <div className="text-sm text-gray-600">Scope 3</div>
              <div className="text-xs text-gray-500 mt-1">Autres indirectes</div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Répartition détaillée
            </h2>
            
            <div className="space-y-4">
              {Object.entries(result.breakdown)
                .sort(([,a], [,b]) => b - a)
                .map(([category, emissions], index) => {
                  const percentage = (emissions / result.total_co2e) * 100
                  const categoryLabels: Record<string, string> = {
                    electricite: '⚡ Électricité',
                    gaz: '🔥 Gaz naturel',
                    carburants: '⛽ Carburants',
                    vehicules: '🚗 Véhicules',
                    vols_domestiques: '✈️ Vols domestiques',
                    vols_internationaux: '🌍 Vols internationaux',
                    achats: '🛒 Achats'
                  }
                  
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">
                          {categoryLabels[category] || category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-16 text-right">
                          {emissions.toLocaleString('fr-FR')}
                        </span>
                        <span className="text-xs text-gray-500 w-12 text-right">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </motion.div>

          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-purple-600" />
              Recommandations IA
            </h2>
            
            <div className="space-y-4">
              {result.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                  <CheckCircleIcon className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-purple-900">{recommendation}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Benchmark */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Position sectorielle
          </h2>
          
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${getBenchmarkColor(result.benchmark_position)}`}>
              {getBenchmarkIcon(result.benchmark_position)}
              <span className="font-medium">{result.benchmark_position}</span>
            </div>
            
            <div className="text-sm text-gray-600">
              Votre intensité carbone: {result.intensity_per_employee.toFixed(1)} kgCO₂e par employé
            </div>
          </div>
        </motion.div>

        {/* Advanced KPIs Section */}
        {result.carbon_efficiency_score && (
          <>
            {/* Efficiency Score & Grade */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrophyIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-3xl font-bold text-gray-900">
                    {result.carbon_efficiency_score}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">Score d'Efficacité Carbone</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${result.carbon_efficiency_score}%` }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className={`text-2xl font-bold px-3 py-1 rounded-lg border-2 ${
                    result.sustainability_grade === 'A+' ? 'text-green-700 bg-green-100 border-green-300' :
                    result.sustainability_grade === 'A' ? 'text-green-600 bg-green-50 border-green-200' :
                    result.sustainability_grade === 'B' ? 'text-blue-600 bg-blue-50 border-blue-200' :
                    result.sustainability_grade === 'C' ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
                    'text-red-600 bg-red-50 border-red-200'
                  }`}>
                    {result.sustainability_grade}
                  </span>
                </div>
                <div className="text-sm text-gray-600">Grade de Durabilité</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <CurrencyEuroIcon className="w-5 h-5 text-yellow-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {(result.cost_of_carbon / 1000).toFixed(0)}k€
                  </span>
                </div>
                <div className="text-sm text-gray-600">Coût du Carbone</div>
                <div className="text-xs text-gray-500 mt-1">à 100€/tCO₂e</div>
              </div>
            </motion.div>

            {/* Equivalent Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <GlobeAltIcon className="w-5 h-5 text-green-600" />
                Équivalences Concrètes
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-4xl mb-2">🌳</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {result.equivalent_metrics?.trees_to_plant?.toLocaleString('fr-FR') || '0'}
                  </div>
                  <div className="text-sm text-gray-600">arbres à planter</div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-4xl mb-2">🚗</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {result.equivalent_metrics?.cars_off_road?.toFixed(0) || '0'}
                  </div>
                  <div className="text-sm text-gray-600">voitures en moins</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-4xl mb-2">🏠</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {result.equivalent_metrics?.homes_energy_year?.toFixed(0) || '0'}
                  </div>
                  <div className="text-sm text-gray-600">foyers/an</div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-4xl mb-2">✈️</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {result.equivalent_metrics?.flights_paris_ny?.toFixed(0) || '0'}
                  </div>
                  <div className="text-sm text-gray-600">vols Paris-NY</div>
                </div>
              </div>
            </motion.div>

            {/* Reduction Potential */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <ArrowTrendingDownIcon className="w-5 h-5 text-blue-600" />
                Potentiel de Réduction
              </h2>
              
              <div className="space-y-4">
                {Object.entries(result.reduction_potential || {})
                  .sort(([,a], [,b]) => b - a)
                  .map(([category, potential], index) => {
                    const percentage = (potential / result.total_co2e) * 100
                    const categoryLabels: Record<string, string> = {
                      electricite: '⚡ Électricité',
                      gaz: '🔥 Gaz naturel',
                      carburants: '⛽ Carburants',
                      vehicules: '🚗 Véhicules',
                      vols_domestiques: '✈️ Vols domestiques',
                      vols_internationaux: '🌍 Vols internationaux',
                      achats: '🛒 Achats'
                    }
                    
                    return (
                      <div key={category} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-700">
                            {categoryLabels[category] || category}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-900 w-20 text-right">
                            -{potential.toFixed(0)} kg
                          </span>
                          <span className="text-xs text-gray-500 w-12 text-right">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )
                  })}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-blue-900">Réduction totale possible:</span>
                  <span className="text-xl font-bold text-blue-900">
                    -{Object.values(result.reduction_potential || {}).reduce((a, b) => a + b, 0).toFixed(0)} kgCO₂e
                  </span>
                </div>
                <div className="text-sm text-blue-700 mt-1">
                  Soit {((Object.values(result.reduction_potential || {}).reduce((a, b) => a + b, 0) / result.total_co2e) * 100).toFixed(1)}% de vos émissions actuelles
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Télécharger le rapport PDF
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Planifier un suivi
          </button>
          <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Nouveau calcul
          </button>
        </motion.div>
      </main>
    </div>
  )
}
