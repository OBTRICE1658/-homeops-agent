import { useState } from 'react'
import { RotateCcw, CheckCircle, Database, FileText } from 'lucide-react'
import type { Plan } from '@shared/schemas'
import ROIWidget from './ROIWidget'
import ExportButtons from './ExportButtons'

interface ResultsProps {
  plan: Plan
  onReset: () => void
}

export default function Results({ plan, onReset }: ResultsProps) {
  const [updatedROI, setUpdatedROI] = useState(plan.roi)

  const handleROIUpdate = (newROI: any) => {
    setUpdatedROI(newROI)
  }

  const currentPlan = { ...plan, roi: updatedROI }

  return (
    <div>
      <div className="results-header">
        <div>
          <h2 className="results-title flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Client Notion Recommendations
          </h2>
          <p>Industry: {plan.industry.charAt(0).toUpperCase() + plan.industry.slice(1)} • Team: {plan.context.team_size} people • Consulting Opportunity Identified</p>
        </div>
        <div className="results-actions">
          <button onClick={onReset} className="btn btn-secondary flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Analyze New Client
          </button>
        </div>
      </div>

      {/* Key Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{plan.fit_score.overall}/10</div>
          <div className="stat-label">Fit Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{plan.databases.length}</div>
          <div className="stat-label">Databases</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{plan.workflows.length}</div>
          <div className="stat-label">Workflows</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{updatedROI.payback_months}mo</div>
          <div className="stat-label">Payback Period</div>
        </div>
      </div>

      <div className="grid grid-2">
        {/* Databases */}
        <div className="card">
          <div className="card-header">
            <h3 className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              Recommended Service Deliverables
            </h3>
            <p>Custom databases you can build for your {plan.industry} client</p>
          </div>
          
          <div className="database-list">
            {plan.databases.map((db) => (
              <div key={db.key} className="database-item">
                <div className="database-title">{db.title}</div>
                <div className="database-description">{db.description}</div>
                <div className="database-meta">
                  <span>{db.properties.length} properties</span>
                  <span>{db.default_views.length} views</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ROI Calculator */}
        <div>
          <ROIWidget 
            plan={currentPlan}
            onROIUpdate={handleROIUpdate}
          />
        </div>
      </div>

      {/* Fit Score Details */}
      <div className="card">
        <div className="card-header">
          <h3>Fit Score Breakdown</h3>
          <p>How well Notion matches your needs</p>
        </div>
        
        <div className="grid grid-3">
          {Object.entries(plan.fit_score.rationale).map(([dimension, rationale]) => {
            const score = plan.fit_score[dimension as keyof typeof plan.fit_score]
            const numericScore = typeof score === 'number' ? score : 0
            
            return (
              <div key={dimension} className="database-item">
                <div className="database-title">
                  {dimension.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  <span style={{ float: 'right', color: '#3b82f6', fontWeight: 'bold' }}>
                    {numericScore}/10
                  </span>
                </div>
                <div className="database-description">{rationale}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Workflows */}
      <div className="card">
        <div className="card-header">
          <h3>Recommended Workflows</h3>
          <p>Optimized processes for your team</p>
        </div>
        
        <div className="grid grid-2">
          {plan.workflows.map((workflow, index) => (
            <div key={index} className="database-item">
              <div className="database-title">{workflow.name}</div>
              <div className="database-description">
                {workflow.steps.length} steps: {workflow.steps.slice(0, 3).join(' → ')}
                {workflow.steps.length > 3 && '...'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Section */}
      <div className="card">
        <div className="card-header">
          <h3 className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Client Proposal Materials
          </h3>
          <p>Download documents to present to your client</p>
        </div>
        <ExportButtons plan={currentPlan} />
      </div>
    </div>
  )
}
