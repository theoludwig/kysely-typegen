# Contributing

Thanks a lot for your interest in contributing to **kysely-typegen**! 🎉

## Code of Conduct

**kysely-typegen** adopted the [Contributor Covenant](https://www.contributor-covenant.org/) as its Code of Conduct, and we expect project participants to adhere to it. Please read the full text so that you can understand what actions will and will not be tolerated.

## Open Development

All work on **kysely-typegen** happens directly on this repository. Both core team members and external contributors send pull requests which go through the same review process.

## Types of contributions

- Reporting a bug.
- Suggest a new feature idea.
- Correct spelling errors, improvements or additions to documentation files (README, CONTRIBUTING...).
- Improve structure/format/performance/refactor/tests of the code.

## Pull Requests

- **Please first discuss** the change you wish to make via [issue](https://github.com/theoludwig/kysely-typegen/issues) before making a change. It might avoid a waste of your time.

- Ensure your code respect linting.

- Make sure your **code passes the tests**.

If you're adding new features to **kysely-typegen**, please include tests.

## Commits

The commit message guidelines adheres to [Conventional Commits](https://www.conventionalcommits.org/) and [Semantic Versioning](https://semver.org/) for releases.

## Development Environment

```sh
# Clone the repository
git clone git@github.com:theoludwig/kysely-typegen.git

# Install dependencies
npm clean-install

# Lint
# node --run lint:typescript # already covered by oxlint
node --run lint:oxlint
node --run lint:oxfmt

# Tests
node --run test

# Build
node --run build
```
