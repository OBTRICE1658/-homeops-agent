import { useState, useEffect } from 'react'
import { DollarSign } from 'lucide-react'
import { api } from '../api'
import type { Plan, ROI } from '@shared/schemas'

interface ROIWidgetProps {
  plan: Plan
  onROIUpdate: (roi: ROI) => void
}

export default function ROIWidget({ plan, onROIUpdate }: ROIWidgetProps) {
  const [enabledKeys, setEnabledKeys] = useState<string[]>([])
  const [customParams, setCustomParams] = useState({
    avg_hourly_rate: plan.roi.avg_hourly_rate,
    hours_saved_per_week: plan.roi.hours_saved_per_week,
    implementation_cost: plan.roi.implementation_cost
  })
  const [currentROI, setCurrentROI] = useState(plan.roi)

  const stackTools = [
    { key: 'ai_search', label: 'AI Search', price: 35 },
    { key: 'ai_writing', label: 'AI Writing', price: 20 },
    { key: 'calendar', label: 'Calendar App', price: 15 },
    { key: 'crm_basic', label: 'Basic CRM', price: 20 },
    { key: 'chatbot', label: 'Chatbot Platform', price: 20 },
    { key: 'email_app', label: 'Email Marketing', price: 30 },
    { key: 'wiki', label: 'Team Wiki', price: 10 },
    { key: 'site_builder', label: 'Website Builder', price: 20 },
    { key: 'meeting_notes', label: 'Meeting Notes', price: 18 },
    { key: 'research', label: 'Research Tools', price: 40 },
    { key: 'pm_tool', label: 'Project Management', price: 24 },
    { key: 'forms', label: 'Form Builder', price: 15 }
  ]

  const recomputeROI = async () => {
    try {
      const request = {
        team_size: plan.context.team_size,
        enabledKeys,
        ...customParams
      }

      const newROI = await api.recomputeROI(request)
      setCurrentROI(newROI)
      onROIUpdate(newROI)
    } catch (error) {
      console.error('Failed to recompute ROI:', error)
    }
  }

  const handleStackToggle = (key: string) => {
    const newEnabledKeys = enabledKeys.includes(key)
      ? enabledKeys.filter((k: string) => k !== key)
      : [...enabledKeys, key]
    
    setEnabledKeys(newEnabledKeys)
  }

  const handleParamChange = (param: string, value: number) => {
    setCustomParams((prev: any) => ({ ...prev, [param]: value }))
  }

  useEffect(() => {
    if (enabledKeys.length > 0 || 
        customParams.avg_hourly_rate !== plan.roi.avg_hourly_rate ||
        customParams.hours_saved_per_week !== plan.roi.hours_saved_per_week ||
        customParams.implementation_cost !== plan.roi.implementation_cost) {
      recomputeROI()
    }
  }, [enabledKeys, customParams])

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          Client ROI Calculator
        </h3>
        <p>Show your client the financial value of your Notion implementation</p>
      </div>

      {/* Custom Parameters */}
      <div className="grid grid-3" style={{ marginBottom: '20px' }}>
        <div className="form-group">
          <label className="form-label">Hourly Rate ($)</label>
          <input
            type="number"
            value={customParams.avg_hourly_rate}
            onChange={(e: any) => handleParamChange('avg_hourly_rate', parseFloat(e.target.value) || 0)}
            className="form-input"
            min="0"
            step="5"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Hours Saved/Week</label>
          <input
            type="number"
            value={customParams.hours_saved_per_week}
            onChange={(e: any) => handleParamChange('hours_saved_per_week', parseFloat(e.target.value) || 0)}
            className="form-input"
            min="0"
            step="0.5"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Implementation Cost ($)</label>
          <input
            type="number"
            value={customParams.implementation_cost}
            onChange={(e: any) => handleParamChange('implementation_cost', parseFloat(e.target.value) || 0)}
            className="form-input"
            min="0"
            step="1000"
          />
        </div>
      </div>

      {/* Stack Consolidation */}
      <div style={{ marginBottom: '24px' }}>
        <h4>Stack Consolidation Savings</h4>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>
          Select tools that Notion could replace for your team
        </p>
        
        <div className="stack-grid">
          {stackTools.map(tool => (
            <div key={tool.key} className="stack-item">
              <input
                type="checkbox"
                id={tool.key}
                checked={enabledKeys.includes(tool.key)}
                onChange={() => handleStackToggle(tool.key)}
                className="stack-checkbox"
              />
              <label htmlFor={tool.key} className="stack-label">
                {tool.label}
              </label>
              <span className="stack-price">${tool.price}/mo</span>
            </div>
          ))}
        </div>
      </div>

      {/* ROI Results */}
      <div className="roi-results">
        <div className="roi-results-grid">
          <div className="roi-metric">
            <div className="roi-metric-value">
              ${currentROI.monthly_stack_savings.toLocaleString()}
            </div>
            <div className="roi-metric-label">Monthly Stack Savings</div>
          </div>
          <div className="roi-metric">
            <div className="roi-metric-value">
              ${currentROI.annual_stack_savings.toLocaleString()}
            </div>
            <div className="roi-metric-label">Annual Stack Savings</div>
          </div>
          <div className="roi-metric">
            <div className="roi-metric-value">
              ${currentROI.annual_savings.toLocaleString()}
            </div>
            <div className="roi-metric-label">Total Annual Savings</div>
          </div>
          <div className="roi-metric">
            <div className="roi-metric-value">
              {currentROI.payback_months}mo
            </div>
            <div className="roi-metric-label">Payback Period</div>
          </div>
          <div className="roi-metric">
            <div className="roi-metric-value">
              {currentROI.efficiency_gain_pct}%
            </div>
            <div className="roi-metric-label">Efficiency Gain</div>
          </div>
        </div>
      </div>
    </div>
  )
}
