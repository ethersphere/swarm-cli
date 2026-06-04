export function publicUrl(url: string): string {
  let publicUrl: string = url

  const isLocal = ['localhost', '127.0.0.1', '::1'].includes(new URL(url).hostname)

  if (isLocal) {
    publicUrl = Object.assign(new URL(url), {
      protocol: 'https:',
      host: 'api.gateway.ethswarm.org',
      port: '',
    }).toString()
  }

  return publicUrl
}
