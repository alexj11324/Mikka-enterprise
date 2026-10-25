export function buildEnvironment(source, swcCache) {
  for (const name of ['DATABASE_URL','MIKKA_DATABASE_URL','WORKSPACE_DATABASE_URL','VERCEL_ENV','MIGRATE']) {
    if (source[name]) throw new Error(`Unset ${name} for isolated skeleton build`)
  }
  const env={PATH:source.PATH,HOME:source.HOME,CI:'true',NEXT_TELEMETRY_DISABLED:'1',SWC_NATIVE_BINDING_CACHE:swcCache,NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS:'1'}
  // Existing execution transport only; application/provider secrets are not
  // inherited. Proxy values are never included in composition metadata/logs.
  for (const key of ['HTTP_PROXY','HTTPS_PROXY','NO_PROXY','http_proxy','https_proxy','no_proxy','NODE_EXTRA_CA_CERTS','SSL_CERT_FILE','SSL_CERT_DIR']) {
    if (source[key]) env[key]=source[key]
  }
  return env
}
