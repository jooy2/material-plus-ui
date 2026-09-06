# Contributing to Material Plus

Thank you for contributing to the project. Your contributions will help us take the project to the next level.

This project adheres to the [Contributor Covenant](CODE_OF_CONDUCT.md) code of conduct, version 2.1. Your contribution implies that you have read and agree to this policy. Any behavior that undermines the quality of the project community, including this policy, will be warned or restricted by the maintainers.

## Repository layout

The repository holds one package, `material-plus-ui`, and the documentation site published to [material-plus.cdget.com](https://material-plus.cdget.com):

```
src/        # component source, built to dist/
test/       # vitest suites, run in a real browser
docs/       # VitePress documentation site (en + ko)
scripts/    # the build steps: import specifiers, minification, style sheets, bundle size
```

A component is one directory under `src/components`: the `.tsx` file and an `index.ts` that re-exports it. It is styled with utility classes on its own elements, off the design tokens in `src/styles.css`. Anything shared between components lives in `src/internal`, and the translated strings live in `src/locales`.

Nothing is set on the page or on an element the component does not own — no reset, no provider, no global rule — because the library has to coexist with whatever Material setup a project already has. A change that reaches outside that boundary needs a reason in the pull request.

## Development

Node.js 22 or later is required.

| Task                  | Command                                  |
| --------------------- | ---------------------------------------- |
| Install (also builds) | `npm install`                            |
| Build                 | `npm run build`                          |
| Test                  | `npm run test`                           |
| Type-check            | `npm run typecheck`                      |
| Lint and format       | `npm run lint:fix`, `npm run format:fix` |
| Documentation site    | `npm run docs:dev`                       |
| Bundle size           | `npm run measure`                        |

Tests run in a real browser through Playwright rather than in a DOM emulator, so a browser has to be installed: `npx playwright install chromium`. A plain `npm run test` uses Chromium alone. `VITEST_BROWSER` picks another engine, or several as a comma-separated list, out of `chromium`, `firefox` and `webkit`; CI sets it per job and runs all three on Linux, Windows and macOS.

Every documentation page exists in both `docs/en` and `docs/ko`. Add the English page, and add the Korean one as well; writing it in your own language and leaving the translation to someone else is fine, but the file has to be there.

## Issues

Issues can be created on the following page: https://github.com/jooy2/material-plus-ui/issues

Alternatively, you can reach the maintainers at https://cdget.com/contact. However, we prefer to track progress via GitHub Issues.

When creating an issue, keep the following in mind:

- Please specify the correct category selection based on the format of the issue (e.g., bug report, feature request).
- Check to see if there are duplicate issues.
- Describe in detail what is happening and what needs to be fixed. You may need additional materials such as images or video.
- Name the version of `material-plus-ui` you are on, the React version, and the browser and bundler you saw it in.
- Use appropriate keyword titles to make it easy for others to search and understand.
- Please use English in all content.

A security vulnerability is not a general issue. Report one through the process in [SECURITY.md](SECURITY.md).

## How to contribute (Pull Requests)

### Write the code you want to change

Here's the process for contributing to the project:

1. Clone the project (or rebase to the latest commit in the main branch)
2. Install the package (if the package manager exists)
3. Setting up lint or code formatter in the IDE (if your project includes a linter) and installing the relevant plugins. Some projects may use specific commands to check rules and perform formatting after module installation and before committing.
4. Write the code that needs to be fixed
5. Update the documentation (if it exists) or create a new one. If your project supports multilingual documentation, update the documentation for all languages. You can fill in the content in your own language and not translate it.
6. Add or modify tests as needed (if test code exists). You should also verify that existing tests pass.

### Write a commit message

While we don't have strict restrictions on commit messages, we recommend that you follow the recommendations below whenever possible:

- Write in English.
- Use the ` symbol to name functions, variables, or folders and files.
- Use a format like `xxx: message (fixes #1)`. The content in parentheses is optional.
- The message includes a summary of what was modified.
- It's a good idea to separate multiple modifications into their own commit messages.

It is recommended that you include a tag at the beginning of the commit message. Between the tag and the message, use `: ` between the tag and the message.

tags conform to the ["Udacity Git Commit Message Style Guide"](https://udacity.github.io/git-styleguide). However, you are welcome to use tags not listed here for additional situations.

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Changes to documentation
- `style`: Formatting, missing semicolons, etc.; no code change
- `refactor`: Refactoring production code
- `test`: Adding tests, refactoring test; no production code change
- `chore`: Updating build tasks, package manager configs, etc.; no production code change

Informal tags:

- `package`: Modifications to package settings, modules, or GitHub projects
- `typo`: Fix typos

### Create a pull request

When creating a pull request, keep the following in mind:

- Include a specific description of what the modification is, why it needs to be made, and how it works.
- Check to see if there are duplicate pull requests.
- Please use English in all content.

Typically, a project maintainer will review and test your code before merging it into the project. This process can take some time, and they may ask you for further edits or clarifications in the comments.
