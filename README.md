# Greybody Games

Static portfolio site for [Greybody Games](https://greybodygames.com).

## Development

Install dependencies and start the Vite development server:

```sh
npm ci
npm run dev
```

## Verification

Run the same checks used by continuous integration:

```sh
npm run format:check
npm run build
```

## Deployment

Pull requests are verified by [`.github/workflows/ci.yml`](.github/workflows/ci.yml). Pushes to `main` are built and deployed to GitHub Pages by [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml).

The `greybodygames.com` custom domain is configured in the repository's GitHub Pages settings. A committed `CNAME` file is not required for the custom workflow deployment.
