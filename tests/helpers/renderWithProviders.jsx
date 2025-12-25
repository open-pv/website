import { Provider } from '@/components/ui/provider'
import { render } from '@testing-library/react'
import React, { Suspense } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { I18nextProvider } from 'react-i18next'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import i18n from './mockI18n'

/**
 * Custom render function that wraps components with all necessary providers
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Render options
 * @param {string} options.route - Initial route (default: '/')
 * @param {boolean} options.useMemoryRouter - Use MemoryRouter instead of BrowserRouter (default: true for tests)
 * @param {Object} options.i18nInstance - Custom i18n instance (default: mockI18n)
 * @returns {Object} - Render result from @testing-library/react
 */
export function renderWithProviders(ui, options = {}) {
  const {
    route = '/',
    useMemoryRouter = true,
    i18nInstance = i18n,
    ...renderOptions
  } = options

  // For non-memory router, push the route to window history
  if (!useMemoryRouter) {
    window.history.pushState({}, 'Test page', route)
  }

  const RouterComponent = useMemoryRouter ? MemoryRouter : BrowserRouter
  const routerProps = useMemoryRouter ? { initialEntries: [route] } : {}

  const Wrapper = ({ children }) => {
    return (
      <Provider>
        <I18nextProvider i18n={i18nInstance}>
          <HelmetProvider>
            <RouterComponent {...routerProps}>
              <Suspense fallback={<div>Loading...</div>}>
                {children}
              </Suspense>
            </RouterComponent>
          </HelmetProvider>
        </I18nextProvider>
      </Provider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

/**
 * Re-export everything from testing-library/react
 */
export * from '@testing-library/react'
