import { defineConfig } from 'vite'

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

export default defineConfig({
  base: normalizeBasePath(process.env.VITE_BASE_PATH ?? githubPagesBasePath),
  server: {
    hmr: true,
    watch: {
      usePolling: true,
    },
  },
})
