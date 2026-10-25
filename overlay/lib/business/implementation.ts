import { validateBusinessExtension } from './contract'
/** Initial private composition. No unimplemented module is advertised. */
export default validateBusinessExtension({apiVersion: 1, distribution: 'enterprise', managementModules: []})
