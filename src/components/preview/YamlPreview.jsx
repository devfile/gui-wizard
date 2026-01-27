import { useState, useEffect } from 'react'
import { useWizard } from '../../hooks/useWizardState'
import { useYamlGenerator } from '../../hooks/useYamlGenerator'
import { copyToClipboard } from '../../utils/downloadFile'
import Button from '../common/Button'
import Card from '../common/Card'

export default function YamlPreview({ inSidebar = false }) {
  const { state } = useWizard()
  const { generateYaml } = useYamlGenerator()
  const [yamlContent, setYamlContent] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      const yaml = generateYaml(state.devfileData)
      setYamlContent(yaml)
    }, 500)

    return () => clearTimeout(timer)
  }, [state.devfileData, generateYaml])

  const handleCopy = async () => {
    try {
      await copyToClipboard(yamlContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <Card className={inSidebar ? 'sticky top-4' : ''}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">YAML Preview</h3>
        <Button
          variant="outline"
          onClick={handleCopy}
          className="text-xs px-2 py-1"
        >
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
        <pre className="text-xs text-gray-100 font-mono whitespace-pre-wrap">
          {yamlContent}
        </pre>
      </div>
    </Card>
  )
}
