# CONTRIBUTING.md

Thank you for contributing. Please follow these guidelines.

## Branch strategy
- `main` — production-ready code only.
- `develop` — main development branch; merge here before release.
- `dev/#issue-name` — feature branches (include issue number). Example: `dev/123-add-login`.
- `fix/#issue-name` — bugfix branches. Example: `fix/456-fix-button`.
- Always create new branches from `develop`.

## Commit messages
Follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specs.

Format:
```
<type>(optional scope): <description>
```
Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.

Examples:
```
feat(auth): add JWT authentication 
fix(api): correct endpoint typo
chore(ci): update workflow
```



## Pull requests
- Target branch: `develop`.
- Each PR must be reviewed and approved by at least **two** other developers.
- Keep PRs focused (one feature/fix per PR).
- Reference the related issue(s) number in the title/description (e.g., `Fix #123`).
- Rebase or merge `develop` into your branch before requesting review.

## Before submitting
1. Run tests and linting (if present).
2. Update documentation if needed.
3. Follow branch and commit conventions.
4. Request reviews from at least two team members.

## Useful plugins (optional)
Those are plugins for the JetBrains IDEs (IntelliJ IDEA, WebStorm, PyCharm, etc.) 
that can help you follow the contributing guidelines or improve your workflow:
- [Atom Material Icons](https://plugins.jetbrains.com/plugin/10044-atom-material-icons) - for better file and folder icons.
- [StringManipulation](https://plugins.jetbrains.com/plugin/2162-stringmanipulation) - for advanced string manipulation.
- [.ignore](https://plugins.jetbrains.com/plugin/7495--ignore) - for managing .gitignore and other ignore files.
- [.env files](https://plugins.jetbrains.com/plugin/9525--env-files) - for better handling of .env files.
- [AWS Toolkit](https://plugins.jetbrains.com/plugin/11349-aws-toolkit) - for working with AWS services.
- [SonarQube for IDE](https://plugins.jetbrains.com/plugin/7973-sonarqube-for-ide) - for code quality analysis (recommended).

These plugins are optional but can enhance your development experience.

Needs completion for VS Code plugins. 
