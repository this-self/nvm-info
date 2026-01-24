# nvm-info

A small CLI that shows how much space each nvm-installed Node version takes, plus what global packages live under it.

## Quick start

Run it once:

```bash
npx -y nvm-info@latest
```

Or install globally:

```bash
npm i -g nvm-info
nvm-info
```

## Example

```
Version ▲      Size       Packages
------------  ----------  --------------------------------------------------
v18.12.0        156 MB     corepack@0.17.0, npm@8.19.2
v20.13.1        194 MB     @openai/codex@0.1.0, corepack@0.28.0, npm@10.5.2
v22.16.0        260 MB     @electron/asar@4.0.0, autocannon@8.0.0, corepack@0.32.0, npm@10.9.2, pnpm@10.23.0, typescript@5.9.3
v24.13.0        555 MB     @openai/codex@0.87.0, corepack@0.34.5, npm@11.6.2, pnpm@10.28.0

Total           1.1 GB

Press 1/2/3 to sort by column, q to quit
```

Keyboard:

| Key | Action |
|-----|--------|
| `1` | Sort by version |
| `2` | Sort by size |
| `3` | Sort by package count |
| `q` | Quit |

Press the same key again to reverse sort order.

## How it works

`nvm-info` scans your `$NVM_DIR/versions/node` directory. For each installed Node.js version it:

1. Calculates total disk usage
2. Reads global packages from `lib/node_modules`
3. Renders a sortable table in the terminal

## Requirements

- Node.js `>= 18`
- `nvm` installed and configured
- `NVM_DIR` available in your shell

Typical `NVM_DIR` setup:

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

## Install from source

```bash
git clone https://github.com/this-self/nvm-info.git
cd nvm-info
npm install
npm run build
npm link
```

## Development

```bash
npm install
npm run dev
npm run dev:watch
npm run build
npm run format
```

## Todo

See [TODO](TODO.md) for upcoming ideas and future work.

## Contributing

PRs welcome. Keep changes focused and include context in the description.

## License

MIT — see `LICENSE`.
