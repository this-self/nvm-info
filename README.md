# nvm-info

A CLI tool to analyze your Node.js versions installed via [nvm](https://github.com/nvm-sh/nvm). Quickly see disk usage and globally installed packages for each Node.js version.

## Features

- **Disk Usage Analysis** - See how much space each Node.js version consumes
- **Global Packages Overview** - View globally installed npm packages per version
- **Interactive Sorting** - Sort by version, size, or package count
- **Progressive Loading** - Real-time progress indicator while scanning
- **Cross-Platform** - Works on macOS and Linux

## Prerequisites

- [Node.js](https://nodejs.org/) v18.0.0 or higher
- [nvm](https://github.com/nvm-sh/nvm) installed and configured

## Installation

### Using npx (no installation required)

```bash
npx nvm-info
```

### Global Installation

```bash
npm install -g nvm-info
```

Then run:

```bash
nvm-info
```

### From Source

```bash
git clone https://github.com/yourusername/nvm-info.git
cd nvm-info
npm install
npm run build
npm link
```

## Usage

Simply run the command in your terminal:

```bash
nvm-info
```

### Example Output

```
⠹ Processing v20.13.1... (3/7)

[████████░░░░░░░░░░░░]
```

Once loaded, you'll see an interactive table:

```
Version ▲      Size(MB)  Packages
------------  ----------  --------------------------------------------------
v18.12.0             156  corepack, npm
v20.13.1             194  @openai/codex, corepack, npm
v22.16.0             260  @electron/asar, autocannon, corepack, npm, pnpm,
                          typescript
v24.13.0             555  @openai/codex, corepack, npm, pnpm

Press 1/2/3 to sort by column, q to quit
```

### Keyboard Controls

| Key | Action |
|-----|--------|
| `1` | Sort by Version |
| `2` | Sort by Size |
| `3` | Sort by Package Count |
| `q` | Quit |

Pressing the same sort key twice toggles between ascending and descending order.

## How It Works

nvm-info scans your `$NVM_DIR/versions/node` directory and for each installed Node.js version:

1. Calculates the total disk space used
2. Lists globally installed npm packages (from `lib/node_modules`)
3. Displays results in an interactive, sortable table

## Requirements

The `NVM_DIR` environment variable must be set. This is typically configured automatically when you install nvm and add it to your shell configuration:

```bash
# In your .bashrc, .zshrc, or equivalent
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in watch mode
npm run dev:watch

# Build for production
npm run build

# Format code
npm run format
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Related Projects

- [nvm](https://github.com/nvm-sh/nvm) - Node Version Manager
