import { useState } from 'react'
import { Building2, Users, Settings, Target, AlertCircle, Loader2 } from 'lucide-react'
import type { Industry } from '@shared/schemas'

interface IntentFormProps {
  onSubmit: (data: {
    industry: string;
    team_size: number;
    tools: string[];
    kpis: string[];
    constraints?: string[];
    summary: string;
  }) => void;
  loading: boolean;
}

const INDUSTRIES: { value: Industry; label: string }[] = [
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'saas', label: 'SaaS' },
  { value: 'legal', label: 'Legal' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'technology', label: 'Technology' },
]

export default function IntentForm({ onSubmit, loading }: IntentFormProps) {
  const [formData, setFormData] = useState({
    industry: 'saas' as Industry,
    team_size: 10,
    tools: '',
    kpis: '',
    constraints: '',
    summary: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.industry || !formData.team_size || !formData.tools || !formData.kpis || !formData.summary) {
      return
    }

    const request = {
      industry: formData.industry,
      team_size: formData.team_size,
      tools: formData.tools.split(',').map((t: string) => t.trim()).filter(Boolean),
      kpis: formData.kpis.split(',').map((k: string) => k.trim()).filter(Boolean),
      constraints: formData.constraints ? 
        formData.constraints.split(',').map((c: string) => c.trim()).filter(Boolean) : 
        [],
      summary: formData.summary
    }

    onSubmit(request)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({
      ...prev,
      [name]: name === 'team_size' ? parseInt(value) || 0 : value
    }))
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2>Tell us about your team</h2>
        <p>We'll create a personalized Notion workspace plan based on your needs</p>
      </div>

      <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="form-label flex items-center gap-2" htmlFor="industry">
              <Building2 className="h-4 w-4 text-blue-600" />
              Client's Industry *
            </label>
            <select
              id="industry"
              name="industry"
              value={formData.industry}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              {INDUSTRIES.map(industry => (
                <option key={industry.value} value={industry.value}>
                  {industry.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label flex items-center gap-2" htmlFor="team_size">
              <Users className="h-4 w-4 text-blue-600" />
              Client's Team Size *
            </label>
            <input
              id="team_size"
              name="team_size"
              type="number"
              min="1"
              max="1000"
              value={formData.team_size}
              onChange={handleInputChange}
              className="form-input"
              required
            />
            <div className="form-help">Number of people who will use the workspace</div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label flex items-center gap-2" htmlFor="tools">
            <Settings className="h-4 w-4 text-blue-600" />
            Client's Current Tools *
          </label>
          <textarea
            id="tools"
            name="tools"
            value={formData.tools}
            onChange={handleInputChange}
            className="form-textarea"
            placeholder="Slack, Google Workspace, Salesforce, Shopify, Zendesk"
            required
          />
          <div className="form-help">List your client's current tools separated by commas</div>
        </div>

        <div className="form-group">
          <label className="form-label flex items-center gap-2" htmlFor="kpis">
            <Target className="h-4 w-4 text-blue-600" />
            What objective are you trying to solve for? *
          </label>
          <textarea
            id="kpis"
            name="kpis"
            value={formData.kpis}
            onChange={handleInputChange}
            className="form-textarea"
            placeholder="Increase revenue growth, Improve customer satisfaction, Reduce time to market, Streamline support response"
            required
          />
          <div className="form-help">What specific business objectives or problems does your client need to address?</div>
        </div>

        <div className="form-group">
          <label className="form-label flex items-center gap-2" htmlFor="constraints">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            Project Constraints (Optional)
          </label>
          <textarea
            id="constraints"
            name="constraints"
            value={formData.constraints}
            onChange={handleInputChange}
            className="form-textarea"
            placeholder="Budget under $50k, Must integrate with existing CRM, GDPR compliance required"
          />
          <div className="form-help">Any limitations or requirements for this engagement?</div>
        </div>

        <div className="form-group">
          <label className="form-label flex items-center gap-2" htmlFor="summary">
            <Building2 className="h-4 w-4 text-blue-600" />
            Client Summary *
          </label>
          <textarea
            id="summary"
            name="summary"
            value={formData.summary}
            onChange={handleInputChange}
            className="form-textarea"
            placeholder="Describe the client's business, current challenges, and what success looks like for them. E.g., 'B2B SaaS startup with complex customer onboarding process, struggling with scattered support tickets and knowledge gaps.'"
            required
          />
          <div className="form-help">Brief description of your client's business context and key challenges</div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Analyzing Client Fit...
            </>
          ) : (
            'Generate Client Recommendations'
          )}
        </button>
      </form>
    </div>
  )
}
