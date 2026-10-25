import type { CorePolicyAdminRuntime } from '@/lib/business/core-policy-admin';
import { createHandlePolicy } from './runtime';
/** The composition host binds its core runtime; no process-global registration
 * or fallback store. Binding is intentionally required before a Next route exists. */
export function createPolicyRoutes(core: CorePolicyAdminRuntime) {
  const handlePolicy=createHandlePolicy(core);
  return {dynamic:'force-dynamic' as const,GET:handlePolicy,POST:handlePolicy};
}
