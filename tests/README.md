# OpenPV Tests

Integration tests for the OpenPV website.

## Running Tests

```bash
# Run all tests in watch mode
npm test

# Run tests once
npm run test:run
```

## File Structure

```
tests/
├── setup.js                      # Global test setup & mocks
├── helpers/
│   ├── renderWithProviders.jsx  # Custom render with providers
│   └── mockI18n.js              # i18n configuration for tests
└── routes/
    ├── Map.test.jsx             # Tests for / route
    └── Simulation.test.jsx      # Tests for /simulation route
```

## Notes

- Tests use real openpv.de APIs
- External services (geocoding, map tiles) are mocked
- MapLibre GL and Three.js are mocked (canvas-based, won't render in jsdom)
