# nvm-info

A small CLI that shows how much space each nvm-installed Node version takes, plus what global packages live under it.

## Quick start

Run it once:

```bash
npx nvm-info -y
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
v18.12.0        156 MB     corepack, npm
v20.13.1        194 MB     @openai/codex, corepack, npm
v22.16.0        260 MB     @electron/asar, autocannon, corepack, npm, pnpm,
                           typescript
v24.13.0        555 MB     @openai/codex, corepack, npm, pnpm

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
git clone https://github.com/ihorlev/nvm-info.git
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

## Contributing

PRs welcome. Keep changes focused and include context in the description.

## License

MIT — see `LICENSE`.
