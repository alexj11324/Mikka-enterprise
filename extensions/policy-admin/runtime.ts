import type { CorePolicyAdminRuntime } from './core-policy-admin';
import { policyHttp } from './http';
/** Only the management composition is extracted. authorizeModel, worker, tool,
 * MCP and lease enforcement remain in the public runtime, including enrollment. */
export function createHandlePolicy(core: CorePolicyAdminRuntime) {
  return async (request: Request) => {
    try {
      return await policyHttp({store:core.admin(),contract:core.contract,
        origin:core.origin,authenticate:request=>core.authenticate(request)})(request);
    } catch {
      return Response.json({error:'policyUnavailable'}, {status:503,
        headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
    }
  };
}
