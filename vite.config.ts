import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'

const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf-8'),
) as { version?: string }

function normalizeBasePath(value: string | undefined): string {
  if (!value || value === '/') {
    return '/'
  }

  const trimmedValue = value.replace(/^\/+|\/+$/g, '')
  return `/${trimmedValue}/`
}

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const isUserOrOrganizationPagesSite = repositoryName?.endsWith('.github.io')
const githubPagesBasePath = process.env.GITHUB_ACTIONS && repositoryName
  ? (isUserOrOrganizationPagesSite ? '/' : repositoryName)
  : '/'
const appVersion = packageJson.version ?? '0.0.0'
const appBuild = process.env.APP_BUILD?.slice(0, 7) ?? process.env.GITHUB_SHA?.slice(0, 7) ?? 'dev'

export default defineConfig({
  base: normalizeBasePath(process.env.VITE_BASE_PATH ?? githubPagesBasePath),
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
    __APP_BUILD__: JSON.stringify(appBuild),
  },
  server: {
    hmr: true,
    watch: {
      usePolling: true,
    },
  },
})
