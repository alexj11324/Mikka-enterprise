import { validateBusinessExtension } from './contract'
/** Enterprise composition with the pinned public policy authority facade. */
export default validateBusinessExtension({apiVersion: 1, distribution: 'enterprise', managementModules: ['policy-admin']})
