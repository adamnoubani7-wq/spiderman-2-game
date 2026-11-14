# OpenCreator skills (vendored)

Source: krillinai/OpenCreator@983a0bf (Apache-2.0). Only `skills/` and `runtime/krillinai` (the Go CLI
source) are vendored, not the desktop app. The skills are linked from `.claude/skills/krillinai-*`.

The skills say to build with `pnpm krillinai:build`, which needs the full repo. Build the CLI here instead:

```bash
cd .claude/opencreator/runtime/krillinai
go build -o ../../.runtime/build/krillinai/linux-x64/bin/krillinai-cli ./cmd/cli
```

Then set `KRILLINAI_CLI=$PWD/.claude/opencreator/.runtime/build/krillinai/linux-x64/bin/krillinai-cli` and
`KRILLINAI_CWD=$PWD/.claude/opencreator/runtime/krillinai`, and create `config/config.toml` from
`config/config-example.toml` (gitignored) with the providers a stage needs.
