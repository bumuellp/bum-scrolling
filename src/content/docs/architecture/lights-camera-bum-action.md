---
title: Actions Suite (lights-camera-bum-action)
description: Reusable GitHub Actions and workflows for automated CI/CD and release pipelines.
---

[**`lights-camera-bum-action`**](https://github.com/bumuellp/lights-camera-bum-action) is a modular suite of 9 composite GitHub Actions and reusable workflows designed for container builds, automated SemVer calculation, package retention, and deployment automation.

---

## 🎬 Action Matrix

| Action                                                                                                                      | Purpose                                                                              | Primary Inputs                               |
| :-------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------- | :------------------------------------------- |
| **[`pre-commit`](https://github.com/bumuellp/lights-camera-bum-action/tree/main/pre-commit)**                               | Runs containerized pre-commit linters and tests via `ghcr.io/bumuellp/lint-tools`.   | `extra-args`                                 |
| **[`build-ghcr-image`](https://github.com/bumuellp/lights-camera-bum-action/tree/main/build-ghcr-image)**                   | Buildx builder with GHA caching and dynamic SemVer hierarchy expansion.              | `image-name`, `context`, `dockerfile`, `sha` |
| **[`bump-version`](https://github.com/bumuellp/lights-camera-bum-action/tree/main/bump-version)**                           | Automated SemVer release calculator based on Conventional Commits.                   | `force-bump`                                 |
| **[`cleanup-ghcr-packages`](https://github.com/bumuellp/lights-camera-bum-action/tree/main/cleanup-ghcr-packages)**         | Automated GHCR image retention policy preserving releases and pruning stale SHAs.    | `package-names`, `keep-sha-count`            |
| **[`plan-image-builds`](https://github.com/bumuellp/lights-camera-bum-action/tree/main/plan-image-builds)**                 | Smart build matrix planner with git diffs and UI dispatch checkboxes.                | `images`, `target`                           |
| **[`free-disk-space`](https://github.com/bumuellp/lights-camera-bum-action/tree/main/free-disk-space)**                     | Frees 20GB+ disk space on Ubuntu runners by safely removing unused SDKs.             | —                                            |
| **[`cleanup-docker`](https://github.com/bumuellp/lights-camera-bum-action/tree/main/cleanup-docker)**                       | Post-test teardown displaying compose logs on failure and stopping containers.       | —                                            |
| **[`run-authorized-ssh-script`](https://github.com/bumuellp/lights-camera-bum-action/tree/main/run-authorized-ssh-script)** | Execute deployment scripts on remote hosts over SSH with piped environment payloads. | `ssh-user`, `ssh-host`, `remote-command`     |
| **[`sync-rsync-path`](https://github.com/bumuellp/lights-camera-bum-action/tree/main/sync-rsync-path)**                     | Synchronize local files and artifacts to remote hosts over SSH using `rsync`.        | `local-path`, `remote-directory`             |

---

## 🧪 Testing Pyramid Implementation

1. **Unit Testing (`pytest`)**: 40 unit tests in `tests/` validating argument building, subprocess execution, whitespace handling, and failure modes.
2. **Integration Testing (`act`)**: `.github/workflows/integration-tests.yml` exercises every composite action with positive and negative test cases, runnable locally with `act` or in CI on PRs.
