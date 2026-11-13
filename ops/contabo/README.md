# Contabo deployment

This repository deploys only `pdfwox` from `/home/deploy/pdfwox`.
The workflow passes its repository name and exact commit SHA to
`/home/deploy/deploy-pdfwox.sh`. Install the matching script from this directory
on the server before enabling the workflow. Never copy another site's workflow.

The script checks repository identity, uses Node 22 in non-interactive SSH,
serializes server builds with `/home/deploy/.deployment-locks/contabo-build.lock`,
and skips superseded commits. PM2 operations target only this site's processes.

Read-only preflight:

```bash
bash /home/deploy/deploy-pdfwox.sh faisalakb/pdfwox <40-character-commit-sha> --check
```

The existing deployment builds in the live checkout. These changes prevent
workflow misrouting and overlapping builds; they do not provide atomic releases
or automatic rollback for an application build failure.
