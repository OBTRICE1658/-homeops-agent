import { FileText, Download, DollarSign, Clock, TrendingUp, Zap, Users, Building2, Target, ArrowRight } from 'lucide-react'
import type { OnePager } from '@shared/reco'

interface OnePagerViewProps {
  data: OnePager
}

export default function OnePagerView({ data }: OnePagerViewProps) {
  const { client, problems_to_solutions, cancellations, roi, agent_plays, quick_plan } = data

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="results-header">
        <div>
          <h1 className="results-title">
            <FileText className="h-6 w-6" />
            Notion 3.0 Consultant One-Pager
          </h1>
          <p className="text-slate-600">Comprehensive recommendation for {client.industry} client</p>
        </div>
        <div className="results-actions">
          <div className="export-buttons">
            <button className="btn btn-primary">
              <Download className="h-4 w-4" />
              Export One-Pager (PDF)
            </button>
            <button className="btn btn-secondary">
              <FileText className="h-4 w-4" />
              Export SOW/Scorecard
            </button>
          </div>
        </div>
      </div>

      {/* Client Snapshot */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Client Snapshot
          </h2>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
            {client.industry.charAt(0).toUpperCase() + client.industry.slice(1)}
          </span>
          <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200">
            <Users className="h-4 w-4 inline mr-1" />
            {client.team_size} team members
          </span>
          {client.kpis.slice(0, 3).map((kpi, index) => (
            <span key={index} className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-medium border border-amber-200">
              <Target className="h-4 w-4 inline mr-1" />
              {kpi}
            </span>
          ))}
          {client.constraints.length > 0 && (
            <details className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-200 cursor-pointer">
              <summary>+ {client.constraints.length} constraints</summary>
              <div className="mt-2 text-xs">
                {client.constraints.map((constraint, index) => (
                  <div key={index}>• {constraint}</div>
                ))}
              </div>
            </details>
          )}
        </div>

        <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border">
          <strong>Client Summary:</strong> {client.summary}
        </div>
      </div>

      {/* Problems → Notion 3.0 Solutions */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Problems → Notion 3.0 Solutions
          </h2>
          <p className="text-slate-600">Specific challenges mapped to Notion 3.0 capabilities</p>
        </div>

        <div className="grid gap-4">
          {problems_to_solutions.map((item, index) => (
            <div key={index} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div className="mb-3">
                <h3 className="font-semibold text-slate-800 mb-1">
                  Problem: {item.problem}
                </h3>
                <h4 className="font-medium text-blue-700 mb-2">
                  Solution: {item.solution_title}
                </h4>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.features.map((feature, fIndex) => (
                    <span key={fIndex} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium border border-blue-200">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <h5 className="font-medium text-slate-700 mb-1">How it works:</h5>
                <ul className="text-sm text-slate-600 space-y-1">
                  {item.how_it_works.map((step, sIndex) => (
                    <li key={sIndex} className="flex items-start gap-2">
                      <span className="text-blue-600 font-medium">{sIndex + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded p-2">
                <span className="text-green-800 font-medium text-sm">Expected Outcome: </span>
                <span className="text-green-700 text-sm">{item.expected_outcome}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Savings */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Savings (Stack Cancellations + Time)
          </h2>
          <p className="text-slate-600">Financial impact and tool consolidation</p>
        </div>

        {/* Cancellations Table */}
        {cancellations.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-slate-800 mb-3">Tool Cancellations</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 px-3 py-2 text-left font-medium text-slate-700">Tool</th>
                    <th className="border border-slate-300 px-3 py-2 text-left font-medium text-slate-700">Cost/User/Month</th>
                    <th className="border border-slate-300 px-3 py-2 text-left font-medium text-slate-700">Replaced By</th>
                  </tr>
                </thead>
                <tbody>
                  {cancellations.map((cancellation, index) => (
                    <tr key={index} className="border-b border-slate-200">
                      <td className="border border-slate-300 px-3 py-2 font-medium">{cancellation.tool}</td>
                      <td className="border border-slate-300 px-3 py-2">${cancellation.per_user_month}</td>
                      <td className="border border-slate-300 px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {cancellation.replaced_by.map((feature, fIndex) => (
                            <span key={fIndex} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ROI Metrics */}
        <div className="roi-results">
          <div className="roi-metric">
            <div className="roi-metric-value">${roi.monthly_stack_savings.toLocaleString()}</div>
            <div className="roi-metric-label">Monthly Stack Savings</div>
          </div>
          <div className="roi-metric">
            <div className="roi-metric-value">${roi.annual_stack_savings.toLocaleString()}</div>
            <div className="roi-metric-label">Annual Stack Savings</div>
          </div>
          <div className="roi-metric">
            <div className="roi-metric-value">${(roi.annual_savings - roi.annual_stack_savings).toLocaleString()}</div>
            <div className="roi-metric-label">Annual Time Savings</div>
          </div>
          <div className="roi-metric">
            <div className="roi-metric-value">${roi.annual_savings.toLocaleString()}</div>
            <div className="roi-metric-label">Total Annual Savings</div>
          </div>
          <div className="roi-metric">
            <div className="roi-metric-value">{roi.payback_months}</div>
            <div className="roi-metric-label">Payback Months</div>
          </div>
          <div className="roi-metric">
            <div className="roi-metric-value">{roi.efficiency_gain_pct}%</div>
            <div className="roi-metric-label">Efficiency Gain</div>
          </div>
        </div>
      </div>

      {/* Agent Plays */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Agent Plays (3–5 Concrete Automations)
          </h2>
          <p className="text-slate-600">AI-powered automations to realize immediate value</p>
        </div>

        <div className="grid gap-4">
          {agent_plays.map((play, index) => (
            <div key={index} className="border border-slate-200 rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h3 className="font-semibold text-slate-800 mb-2">{play.name}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-slate-700 mb-1">Trigger</h4>
                  <p className="text-slate-600">{play.trigger}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-slate-700 mb-1">Actions</h4>
                  <ul className="text-slate-600 space-y-1">
                    {play.actions.map((action, aIndex) => (
                      <li key={aIndex} className="flex items-start gap-1">
                        <span className="text-blue-600">•</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-slate-700 mb-1">KPI Impact</h4>
                  <div className="bg-green-100 border border-green-300 rounded p-2">
                    <span className="text-green-800 font-medium text-xs">{play.kpi_impact}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Plan */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Quick Plan (Implementation Phases)
          </h2>
          <p className="text-slate-600">Week 1 Pilot → Week 2–3 Rollout → Week 4 Agents</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quick_plan.map((phase, index) => (
            <div key={index} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                {phase.phase}
              </h3>
              
              <ul className="space-y-2 text-sm text-slate-600">
                {phase.activities.map((activity, aIndex) => (
                  <li key={aIndex} className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    {activity}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
