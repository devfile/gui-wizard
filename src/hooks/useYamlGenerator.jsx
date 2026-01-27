import yaml from 'js-yaml'
import { cleanDevfileData } from '../utils/devfileGenerator'

export function useYamlGenerator() {
  const generateYaml = (devfileData) => {
    const cleaned = cleanDevfileData(devfileData)

    const yamlString = yaml.dump(cleaned, {
      indent: 2,
      lineWidth: 80,
      noRefs: true,
      sortKeys: false
    })

    return yamlString
  }

  return { generateYaml }
}
