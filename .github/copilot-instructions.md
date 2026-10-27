# Scripture Trails coding instructions

Read and follow [AGENTS.md](../../AGENTS.md) before editing the site or opening a pull request.

Every public-facing release, including a single styling or wording fix, must increment the current version using `npm run release -- patch|minor|major ...`, update both public and development changelogs, align the footer and browser asset versions, and pass `npm run build`.

The pull-request check compares all changes against the destination branch. Do not bypass the release or skip tests. Multiple related commits can belong to one versioned release. Documentation-only changes with no public-site impact do not require a website version bump.
