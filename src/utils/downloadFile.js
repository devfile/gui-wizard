export function downloadYamlFile(content, filename = 'devfile.yaml') {
  // Create blob with YAML content
  const blob = new Blob([content], { type: 'text/yaml;charset=utf-8' })

  // Create temporary download link
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename

  // Trigger download
  document.body.appendChild(link)
  link.click()

  // Cleanup
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export function copyToClipboard(text) {
  return navigator.clipboard.writeText(text)
}
