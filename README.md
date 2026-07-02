# Domaine test task

## Getting Started

|                              | 					                                                                                               |
|------------------------------|-----------------------------------------------------------------------------------------------------|
| **Platform** 		              | Shopify 		                                                                                          |
| **Shopify Dawn** 		          | [Shopify Dawn theme](https://github.com/Shopify/dawn)  		                                           |
| **Shopify CLI 4.0+** 		      | [Shopify CLI documentation and commands](https://shopify.dev/docs/themes/tools/cli/commands)	    		 |
| **pnpm** 		                  | [pnpm](https://pnpm.io/installation)	    		                                                         |
| **Tailwind CSS v4**		        | Utility-first CSS framework	(Added the`tw` prefix to prevent style overrides with Dawn)  		         |
| **Development environment:** | [store](https://domaine-product-card-iyrg43oe.myshopify.com/)    			                                |


# Before start project you should install [pnpm](https://pnpm.io/installation)
1. pnpm Cli [commands](https://pnpm.io/cli/install)
   Basics commands:
- pnpm i - install dependency
- pnpm add <pkg> - add new pkg ( -D to devDependencies )
- pnpm run [scripts from pkg](https://pnpm.io/cli/run)
- pnpm start - run start scripts
- pnpm remove <pkg> - remove package

# How to start
1. In the root or project directory run **pnpm install**. Install dependencies with [pnpm](https://pnpm.io/cli/install)
```shell
pnpm install
```
2. Configure shopify.theme.toml file using [example.shopify.theme.toml](example.shopify.theme.toml).
   You access multiple stores using [Theme Access](https://shopify.dev/docs/themes/tools/theme-access) passwords.
```toml
[environments.dev]
    theme = "123456789012"
    store = "my-store"
    password  = "shptka_123456"
```

3. For watching changes with tailwind
```shell
pnpm run tw:dev
```
4. Also for sync changes with shopify theme run in parallel in another terminal tab
```shell
pnpm run shopify:dev:sync
```

### 3. Configure the store connection

Create a copy from `example.shopify.theme.toml` and rename in to `shopify.theme.toml` file in the project root:

```toml
[environments.development]
store = "your-store-name"
```

Replace `your-store-name` with your Shopify development store domain (e.g. `my-dev-store` for `my-dev-store.myshopify.com`).

> **Note:** This file is intentionally excluded from version control via `.gitignore` as it contains store-specific configuration.

### 4. Build for production (optional)

```bash
npm run tw:build
```

Generates a minified `tailwind.output.css` for production use.

## Tailwind CSS Configuration

Tailwind v4 is config in `assets/tailwind.input.css`:

- **Prefix:** All Tailwind utility classes should use the `tw:` prefix, for example `tw:flex` and `tw:text-center`, so they don’t clash with Dawn’s built-in CSS classes.
- **Source paths:** Tailwind should scan every `.liquid`, `.json`, and `.js` file in the project to find class names.

## Project Structure

```
├── assets/                      # Theme assets (CSS, JS, images)
│   ├── tailwind.input.css       # Tailwind source file
│   └── tailwind.output.css      # Compiled Tailwind output (auto-generated)
├── config/                      # Theme settings
├── layout/                      # Theme layouts
├── locales/                     # Translation files
├── sections/                    # Theme sections
├── snippets/                    # Reusable Liquid snippets
├── templates/                   # Page templates
├── package.json                 # Node.js dependencies & scripts
├── pnpm-lock.yaml               # Main package file, here saved lock dependency
├── .gitignore                   # Git ignore rules
├── .shopifyignore               # Files excluded from theme upload
├── example.shopify.theme.toml   # Store connection config example
└── shopify.theme.toml           # Main config file based on Shopify CLI configuration
```

### Pnpm Build Security Configuration
This project includes a dedicated configuration section to explicitly grant execution permissions for package build scripts during installation (`allowBuilds`):

```yaml
allowBuilds:
  '@parcel/watcher': true
  esbuild: true
```

#### Why is this necessary?
By default, modern versions of `pnpm` block execution scripts (`preinstall`, `install`, `postinstall`) from external npm packages for security reasons (to prevent malicious code execution).

However, packages like **`@parcel/watcher`** and **`esbuild`** require compilation of native binary files during installation to guarantee maximum execution performance. This configuration explicitly safelists these reliable tools, allowing `pnpm` to complete their setup without interruptions.

