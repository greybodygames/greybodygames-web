# GreyBody Games

Static portfolio site for [GreyBody Games](https://greybodygames.com).

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

The pipeline runs CI on pull requests, eligible pushes to `main`, and manual runs. [CI/CD Pipeline](.github/workflows/pipeline.yaml)

When website delivery inputs change, the pipeline publishes `ghcr.io/greybodygames/greybodygames-web:build-<full-source-sha>` after CI on pushes to `main` and manual runs from `main`. GitOps updates `staticSites.image.tag` in `greybodygames/envs/hetzner-fsn1-dc4-prod/web/values.yaml` on `SayakMukhopadhyay/k8s-landscape-charts` `main`.

- Image publishing uses the repository's `GITHUB_TOKEN` with `packages: write`.
- Repository variable `GITOPS_APP_CLIENT_ID` and secret `GITOPS_APP_PRIVATE_KEY` use the GitHub App installation with contents write access to `SayakMukhopadhyay/k8s-landscape-charts`.
- GitHub Environment `website` uses `URL=https://greybodygames.com` and `GITOPS_ENVIRONMENT=hetzner-fsn1-dc4-prod/web`.

The GHCR package needs Public visibility for the cluster to pull it anonymously. The cluster serves the site at `/` on port `8080` and probes `/healthz`.
