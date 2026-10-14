import { useEffect, useMemo, useState } from 'react'
import { useWizard } from '../../hooks/useWizardState'
import { generateYaml } from '../../utils/devfileGenerator'
import { copyToClipboard } from '../../utils/downloadFile'
import Button from '../common/Button'
import Card from '../common/Card'

export default function YamlPreview({ inSidebar = false }) {
  const { state } = useWizard()
  const [copied, setCopied] = useState(false)

  const yamlContent = useMemo(() => generateYaml(state.devfileData), [state.devfileData])

  useEffect(() => {
    if (!copied) return undefined
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  const handleCopy = async () => {
    try {
      await copyToClipboard(yamlContent)
      setCopied(true)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <Card className={inSidebar ? 'sticky top-4' : ''}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">YAML Preview</h3>
        <Button variant="outline" onClick={handleCopy} className="text-xs px-2 py-1">
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
        <pre className="text-xs text-gray-100 font-mono whitespace-pre-wrap" data-testid="yaml-preview">
          {yamlContent}
        </pre>
      </div>
    </Card>
  )
}
