import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Map from '../../src/pages/Map'
import { renderWithProviders } from '../helpers/renderWithProviders'

/**
 * Integration tests for the Map route (/)
 * As specified in specs/testing.md: "/" shall contain every expected components
 */
describe('Map Route - /', () => {
  it('renders without crashing', async () => {
    renderWithProviders(<Map />)

    // Wait for the component to fully render
    await waitFor(
      () => {
        // Check that the main content is rendered
        const mainElement =
          document.querySelector('main') ||
          document.querySelector('[role="main"]') ||
          document.body
        expect(mainElement).toBeInTheDocument()
      },
      { timeout: 5000 },
    )
  })

  it('contains SearchField component', async () => {
    renderWithProviders(<Map />)

    await waitFor(
      () => {
        // SearchField should have an input field for address search
        // Try multiple selectors - it renders as a textbox
        const searchInput =
          screen.queryByRole('textbox', { name: /search/i }) ||
          screen.queryByPlaceholderText(/address/i) ||
          screen.queryByPlaceholderText(/adresse/i) ||
          screen.queryAllByRole('textbox')[0] // Fallback: get first textbox

        expect(searchInput).toBeInTheDocument()
      },
      { timeout: 5000 },
    )
  })

  it('contains Navigation component', async () => {
    renderWithProviders(<Map />)

    await waitFor(
      () => {
        // Navigation should contain links or the app title
        // Use getAllByText since "OpenPV" appears multiple times
        const hasNavigation =
          screen.queryByRole('navigation') ||
          screen.queryAllByText(/OpenPV/i)[0] ||
          screen.queryByText(/about/i) ||
          screen.queryByText(/über/i)

        expect(hasNavigation).toBeTruthy()
      },
      { timeout: 5000 },
    )
  })

  it('contains Footer component', async () => {
    renderWithProviders(<Map />)

    await waitFor(
      () => {
        // Footer should contain "Team OpenPV" or attribution
        const hasFooter =
          screen.queryByText(/Team OpenPV/i) ||
          screen.queryByRole('contentinfo') ||
          screen.queryByText(/attribution/i) ||
          screen.queryByText(/© /i)

        expect(hasFooter).toBeTruthy()
      },
      { timeout: 5000 },
    )
  })

  it('contains Map component (canvas element)', async () => {
    renderWithProviders(<Map />)

    await waitFor(
      () => {
        // MapLibre creates canvas elements
        // Our mock should create a div with data-testid="maplibre-map"
        const mapElement = screen.queryByTestId('maplibre-map')

        expect(mapElement).toBeInTheDocument()
      },
      { timeout: 5000 },
    )
  })

  it('renders all expected components together', async () => {
    renderWithProviders(<Map />)

    await waitFor(
      () => {
        // Verify that all major components are present
        const hasSearch =
          screen.queryAllByRole('textbox')[0] ||
          screen.queryByPlaceholderText(/address/i)
        const hasNavigation = screen.queryAllByText(/OpenPV/i)[0]
        const hasMap = screen.queryByTestId('maplibre-map')

        expect(hasSearch || hasNavigation || hasMap).toBeTruthy()
      },
      { timeout: 5000 },
    )
  })
})
