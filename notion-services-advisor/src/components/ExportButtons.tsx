import { useState } from 'react'
import { Download, FileText, BarChart3, Settings, Loader2 } from 'lucide-react'
import { api } from '../api'
import type { Plan } from '@shared/schemas'

interface ExportButtonsProps {
  plan: Plan
}

export default function ExportButtons({ plan }: ExportButtonsProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExport = async () => {
    setLoading(true)
    setError(null)

    try {
      const exports = await api.generateExports(plan)
      
      // Download all files
      downloadFile(
        exports.sow_markdown,
        `sow-${plan.industry}-${Date.now()}.md`,
        'text/markdown'
      )
      
      downloadFile(
        exports.pilot_scorecard_markdown,
        `scorecard-${plan.industry}-${Date.now()}.md`,
        'text/markdown'
      )
      
      downloadFile(
        JSON.stringify(exports.notion_template_json, null, 2),
        `template-${plan.industry}-${Date.now()}.json`,
        'application/json'
      )

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setLoading(false)
    }
  }

  const handleIndividualExport = async (type: 'sow' | 'scorecard' | 'template') => {
    setLoading(true)
    setError(null)

    try {
      const exports = await api.generateExports(plan)
      
      switch (type) {
        case 'sow':
          downloadFile(
            exports.sow_markdown,
            `sow-${plan.industry}-${Date.now()}.md`,
            'text/markdown'
          )
          break
        case 'scorecard':
          downloadFile(
            exports.pilot_scorecard_markdown,
            `scorecard-${plan.industry}-${Date.now()}.md`,
            'text/markdown'
          )
          break
        case 'template':
          downloadFile(
            JSON.stringify(exports.notion_template_json, null, 2),
            `template-${plan.industry}-${Date.now()}.json`,
            'application/json'
          )
          break
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="error-message" style={{ marginBottom: '20px' }}>
          <p>{error}</p>
        </div>
      )}

      <div className="export-buttons">
        <button
          onClick={handleExport}
          disabled={loading}
          className="btn btn-primary flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating Documents...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download All Client Documents
            </>
          )}
        </button>

        <button
          onClick={() => handleIndividualExport('sow')}
          disabled={loading}
          className="btn btn-secondary flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          SOW Document
        </button>

        <button
          onClick={() => handleIndividualExport('scorecard')}
          disabled={loading}
          className="btn btn-secondary flex items-center gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          Pilot Scorecard
        </button>

        <button
          onClick={() => handleIndividualExport('template')}
          disabled={loading}
          className="btn btn-secondary flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Template JSON
        </button>
      </div>

      <div style={{ marginTop: '16px', fontSize: '12px', color: '#6b7280' }}>
        <p>
          <strong>SOW:</strong> Statement of Work with project scope and timeline<br />
          <strong>Scorecard:</strong> Success metrics and evaluation criteria<br />
          <strong>Template:</strong> JSON configuration for Notion setup
        </p>
      </div>
    </div>
  )
}
