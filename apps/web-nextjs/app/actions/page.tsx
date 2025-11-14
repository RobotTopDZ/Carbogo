'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import SimpleNav from '../../components/layout/SimpleNav'
import { 
  LightBulbIcon, 
  ChartBarIcon, 
  CurrencyEuroIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowTrendingDownIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  BookmarkIcon,
  BoltIcon,
  TruckIcon,
  ShoppingCartIcon,
  Cog6ToothIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface Action {
  id: string
  title: string
  description: string
  category: string
  impact_co2e: number
  cost_estimate: string
  feasibility_score: number
  roi_score: number
  priority_rank: number
  implementation_time: string
  complexity: 'low' | 'medium' | 'high'
  sector_relevance: string[]
  tags: string[]
}

interface ScenarioResult {
  total_reduction: number
  total_cost: number
  roi_timeline: number
  feasibility_score: number
  selected_actions: string[]
}

export default function ActionsPage() {
  const [actions, setActions] = useState<Action[]>([])
  const [filteredActions, setFilteredActions] = useState<Action[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedComplexity, setSelectedComplexity] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedActions, setSelectedActions] = useState<Set<string>>(new Set())
  const [scenarioResult, setScenarioResult] = useState<ScenarioResult | null>(null)
  const [showScenario, setShowScenario] = useState(false)

  const categories = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'energy', label: 'Énergie' },
    { value: 'transport', label: 'Transport' },
    { value: 'waste', label: 'Déchets' },
    { value: 'procurement', label: 'Achats' },
    { value: 'operations', label: 'Opérations' }
  ]

  const complexityLevels = [
    { value: 'all', label: 'Toutes complexités' },
    { value: 'low', label: 'Facile' },
    { value: 'medium', label: 'Modéré' },
    { value: 'high', label: 'Complexe' }
  ]

  useEffect(() => {
    fetchActions()
  }, [])

  useEffect(() => {
    filterActions()
  }, [actions, selectedCategory, selectedComplexity, searchQuery])

  const fetchActions = async () => {
    setLoading(true)
    try {
      // Fetch from API
      const response = await fetch('/api/actions')
      const data = await response.json()
      
      // Use API data or fallback to mock
      const mockActions: Action[] = data.actions || [
        {
          id: 'renewable_energy',
          title: 'Transition vers l\'énergie renouvelable',
          description: 'Installation de panneaux solaires ou souscription à un contrat d\'énergie verte pour réduire les émissions du scope 2',
          category: 'energy',
          impact_co2e: 15420,
          cost_estimate: '25 000 - 50 000 €',
          feasibility_score: 0.8,
          roi_score: 0.75,
          priority_rank: 1,
          implementation_time: '6-12 mois',
          complexity: 'medium',
          sector_relevance: ['industrie', 'services', 'commerce'],
          tags: ['scope2', 'économies', 'image']
        },
        {
          id: 'electric_vehicles',
          title: 'Électrification de la flotte',
          description: 'Remplacement progressif des véhicules thermiques par des véhicules électriques',
          category: 'transport',
          impact_co2e: 8750,
          cost_estimate: '40 000 - 80 000 €',
          feasibility_score: 0.6,
          roi_score: 0.65,
          priority_rank: 2,
          implementation_time: '12-24 mois',
          complexity: 'high',
          sector_relevance: ['transport', 'services', 'commerce'],
          tags: ['scope1', 'innovation', 'subventions']
        },
        {
          id: 'energy_efficiency',
          title: 'Amélioration de l\'efficacité énergétique',
          description: 'Isolation, éclairage LED, équipements performants pour réduire la consommation',
          category: 'energy',
          impact_co2e: 6200,
          cost_estimate: '5 000 - 15 000 €',
          feasibility_score: 0.9,
          roi_score: 0.85,
          priority_rank: 3,
          implementation_time: '3-6 mois',
          complexity: 'low',
          sector_relevance: ['industrie', 'services', 'commerce', 'construction'],
          tags: ['scope2', 'économies', 'facile']
        },
        {
          id: 'remote_work',
          title: 'Développement du télétravail',
          description: 'Politique de télétravail pour réduire les déplacements domicile-travail',
          category: 'transport',
          impact_co2e: 4300,
          cost_estimate: '2 000 - 8 000 €',
          feasibility_score: 0.95,
          roi_score: 0.9,
          priority_rank: 4,
          implementation_time: '1-3 mois',
          complexity: 'low',
          sector_relevance: ['services', 'technologie'],
          tags: ['scope3', 'productivité', 'wellbeing']
        },
        {
          id: 'local_sourcing',
          title: 'Approvisionnement local',
          description: 'Privilégier les fournisseurs locaux pour réduire le transport de marchandises',
          category: 'procurement',
          impact_co2e: 3800,
          cost_estimate: '1 000 - 5 000 €',
          feasibility_score: 0.7,
          roi_score: 0.6,
          priority_rank: 5,
          implementation_time: '3-9 mois',
          complexity: 'medium',
          sector_relevance: ['commerce', 'restauration', 'industrie'],
          tags: ['scope3', 'local', 'supply-chain']
        },
        {
          id: 'waste_reduction',
          title: 'Programme de réduction des déchets',
          description: 'Mise en place du tri sélectif, compostage, et réduction des emballages',
          category: 'waste',
          impact_co2e: 2100,
          cost_estimate: '3 000 - 10 000 €',
          feasibility_score: 0.85,
          roi_score: 0.55,
          priority_rank: 6,
          implementation_time: '2-6 mois',
          complexity: 'low',
          sector_relevance: ['services', 'commerce', 'restauration'],
          tags: ['scope3', 'circular-economy', 'engagement']
        }
      ]

      setActions(mockActions)
    } catch (error) {
      console.error('Error fetching actions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterActions = () => {
    let filtered = actions

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(action => action.category === selectedCategory)
    }

    if (selectedComplexity !== 'all') {
      filtered = filtered.filter(action => action.complexity === selectedComplexity)
    }

    if (searchQuery) {
      filtered = filtered.filter(action => 
        action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        action.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (action.tags && action.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      )
    }

    setFilteredActions(filtered)
  }

  const toggleActionSelection = (actionId: string) => {
    const newSelected = new Set(selectedActions)
    if (newSelected.has(actionId)) {
      newSelected.delete(actionId)
    } else {
      newSelected.add(actionId)
    }
    setSelectedActions(newSelected)
  }

  const runScenarioAnalysis = () => {
    const selectedActionData = actions.filter(action => selectedActions.has(action.id))
    
    const totalReduction = selectedActionData.reduce((sum, action) => sum + action.impact_co2e, 0)
    const avgFeasibility = selectedActionData.reduce((sum, action) => sum + action.feasibility_score, 0) / selectedActionData.length
    
    // Mock cost calculation
    const totalCost = selectedActionData.length * 25000 // Simplified

    const result: ScenarioResult = {
      total_reduction: totalReduction,
      total_cost: totalCost,
      roi_timeline: Math.round(totalCost / (totalReduction * 100) * 12), // Months to break even
      feasibility_score: avgFeasibility,
      selected_actions: Array.from(selectedActions)
    }

    setScenarioResult(result)
    setShowScenario(true)
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  type HeroIcon = typeof LightBulbIcon
  const categoryIconMap: Record<string, HeroIcon> = {
    energy: BoltIcon,
    transport: TruckIcon,
    waste: TrashIcon,
    procurement: ShoppingCartIcon,
    operations: Cog6ToothIcon
  }

  const getCategoryIcon = (category: string): HeroIcon => (
    categoryIconMap[category] || LightBulbIcon
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des actions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleNav />
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <LightBulbIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Centre d'Actions
                </h1>
                <p className="text-gray-600 mt-1">
                  Recommandations personnalisées pour réduire votre empreinte carbone
                </p>
              </div>
            </div>
            
            {selectedActions.size > 0 && (
              <div className="flex gap-3">
                <button
                  onClick={runScenarioAnalysis}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <PlayIcon className="w-4 h-4" />
                  Analyser le scénario ({selectedActions.size})
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une action..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            {/* Complexity Filter */}
            <select
              value={selectedComplexity}
              onChange={(e) => setSelectedComplexity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              {complexityLevels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>

            {/* Results Count */}
            <div className="flex items-center justify-center bg-gray-50 rounded-lg px-4 py-2">
              <span className="text-sm text-gray-600">
                {filteredActions.length} action{filteredActions.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {filteredActions.map((action, index) => {
            const CategoryIcon = getCategoryIcon(action.category)
            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-200 cursor-pointer ${
                  selectedActions.has(action.id) 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleActionSelection(action.id)}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                        <CategoryIcon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(action.complexity)}`}>
                            {action.complexity === 'low' ? 'Facile' : action.complexity === 'medium' ? 'Modéré' : 'Complexe'}
                          </span>
                          <span className="text-xs text-gray-500">#{action.priority_rank}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {selectedActions.has(action.id) && (
                        <CheckCircleIcon className="w-5 h-5 text-purple-600" />
                      )}
                      <BookmarkIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {action.description}
                  </p>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <ArrowTrendingDownIcon className="w-5 h-5 text-green-600 mx-auto mb-1" />
                      <div className="text-lg font-bold text-green-900">
                        {(action.impact_co2e / 1000).toFixed(1)}t
                      </div>
                      <div className="text-xs text-green-700">CO₂e économisé</div>
                    </div>
                    
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <CurrencyEuroIcon className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <div className="text-sm font-bold text-blue-900">
                        {action.cost_estimate}
                      </div>
                      <div className="text-xs text-blue-700">Investissement</div>
                    </div>
                  </div>

                  {/* ROI & Timeline */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <ChartBarIcon className="w-4 h-4" />
                      ROI: {(action.roi_score * 100).toFixed(0)}%
                    </div>
                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      {action.implementation_time}
                    </div>
                  </div>

                  {/* Tags */}
                  {action.tags && action.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {action.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Scenario Analysis Modal */}
        {showScenario && scenarioResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowScenario(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Analyse de Scénario</h2>
                  <button
                    onClick={() => setShowScenario(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-900 mb-2">
                      {(scenarioResult.total_reduction / 1000).toFixed(1)}t
                    </div>
                    <div className="text-sm text-green-700">Réduction CO₂e totale</div>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-900 mb-2">
                      {(scenarioResult.total_cost / 1000).toFixed(0)}k€
                    </div>
                    <div className="text-sm text-blue-700">Investissement total</div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-900 mb-2">
                      {scenarioResult.roi_timeline}
                    </div>
                    <div className="text-sm text-purple-700">Mois pour ROI</div>
                  </div>
                  
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-900 mb-2">
                      {(scenarioResult.feasibility_score * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-yellow-700">Faisabilité</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowScenario(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Fermer
                  </button>
                  <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Exporter le plan
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
