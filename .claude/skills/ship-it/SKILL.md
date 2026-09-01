---
name: ship-it
description: Trigger when the user says "ship it", "commit and pr", "deploy this", or runs "/ship-it".
---

# Ship it: commit, push, and open a PR

Takes the working tree from "changes on disk" to "PR open against `main`".
Merging that PR is what deploys the site, so this skill is the front door to
production.

When triggered, follow this exact workflow:

1. **Pre-flight check**: Run `git status --porcelain`. If the output is
   completely empty, tell the user there are no changes to commit and stop.
2. **Branch management**: Run `git branch --show-current`.
   - If the output is `main`, create a feature branch. Name it from what
     actually changed, in this repo's vocabulary: `feat/story-search`,
     `fix/pagination-dates`, `content/breakfast-on-the-ceiling`,
     `chore/bump-astro`. Run `git checkout -b <branch-name>`.
   - If the output is not `main`, stay on the current branch.
3. **Stage changes**: Run `git add .` to stage every modified, deleted, and
   untracked file, then run `git diff --staged` and read it.
4. **Build gate**: Run `pnpm build`. A merge to `main` deploys straight to
   Cloudflare, so a broken build must never reach a PR. If the build fails,
   report the error and stop with the changes staged but uncommitted.
   Skip this step when the diff touches only Markdown outside
   `src/content/` (a README, say) — nothing there can break the build.
   Note that `pnpm exec astro check` currently reports one pre-existing error
   in `src/components/Header.astro`, so do not gate on it.
5. **Generate commit message**: From the staged diff, write a message in this
   exact format:

   type(scope): short subject

   - bullet of what changed
   - bullet of why

6. **Commit**: Run `git commit -m "<generated message>"`.
7. **Push**: Run `git push -u origin HEAD`.
8. **Create or update the pull request**: Run `gh pr view`.
   - If it succeeds, a PR already exists and the push updated it. Print a
     brief success message with the PR URL.
   - If it fails, run `gh pr create --base main --title "<type(scope): short
     subject>" --body "<the body bullets>"` and append this line to the body:

     > **Note:** Merging this PR triggers `.github/workflows/deploy.yml`,
     > which builds the site and deploys it to Cloudflare Workers.

## Commit message rules

- **Types**: one of `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `test`.
  Bare `ci:` is also in use for workflow changes.
- **Scope**: match the scopes this repo already uses, visible in `git log`:
  `content` (a new or edited story in `src/content/posts/`), `ui`, `blog`,
  `pages`, `seo`, `theme`, `analytics`, `deps`. Add a new scope only when
  nothing existing fits.
- **Subject**: under 60 characters, imperative mood ("add story search", not
  "added story search").
- **Body bullets**: mandatory when the change spans multiple files or carries
  non-obvious logic.
- **NEVER** include a `Co-Authored-By` trailer.

## Notes for this repo

- The default and deploy branch is `main`. There is no staging branch, so an
  open PR is the only place to review a change before it goes live.
- A post with `draft: true` in its frontmatter is hidden in production but
  visible in `pnpm dev`, so shipping an unfinished story is safe. Say so in the
  PR body when the diff adds one.
- `gh` is authenticated as `rajoyish` against
  `github.com/rajoyish/theyetiways.com`.
