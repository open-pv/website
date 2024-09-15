# Release Procedure

## Version Numbers

This software follows the [Semantic Versioning (SemVer)](https://semver.org/).<br>
It always has the format `MAJOR.MINOR.PATCH`, e.g. `1.5.0`.

## GitHub Release

### 1. 📝 Check correctness of test.openpv.de

- Navigate to test.openpv.de
- Check that this is the website you want to deploy
- Check that it has no bugs

### 2. 🐙 Create a `GitHub Release`

- Named `v0.12.1`
- Possibly add a Title to the Release Notes Headline
- Summarize key changes in the description
  - Use the `generate release notes` button provided by GitHub
- Make sure that new contributors are mentioned
- Choose the correct git `tag`
- Choose the `main` branch
- Publish release

### 3. Deployment

- Start the manual deployment process based on the `build` branch
