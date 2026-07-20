# Local Kubernetes (kind) + ArgoCD Deployment

Deploys The Songroom Sessions (Postgres + Django backend + Next.js
frontend) to a local `kind` cluster, managed by ArgoCD via an
ApplicationSet — one Application per app under `deployment/apps/*`.

## Prerequisites

- Docker
- [kind](https://kind.sigs.k8s.io/) `>= 0.20`
- `kubectl`
- (optional but handy) [`argocd` CLI](https://argo-cd.readthedocs.io/en/stable/cli_installation/)

Check versions:

```bash
docker --version
kind version
kubectl version --client
argocd version --client   # optional
```

## 1. Push this repo to GitHub

ArgoCD syncs from a git repository URL — it can't read a local-only repo.
From the repo root:

```bash
git remote add origin https://github.com/<your-username>/<your-repo>.git
git add -A
git commit -m "Add local kind + ArgoCD deployment"
git push -u origin main
```

Then edit **`deployment/argocd/applicationset.yaml`** and replace both
`repoURL` placeholders (`https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO.git`)
with your actual repo URL. Commit and push that change too — ArgoCD reads
this file from git, not from your local disk.

## 2. Create the kind cluster

```bash
kind create cluster --config deployment/kind-config.yaml
```

This creates a single-node cluster named `songroom` with host ports 80/443
mapped in, so ingress-nginx can bind them directly.

## 3. Install ingress-nginx

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s
```

## 4. Build the app images and load them into kind

kind can't pull images from Docker Hub for these (they're not published),
so build locally and load them straight into the cluster's node:

```bash
docker build -t songroom-backend:local ./backend
docker build -t songroom-frontend:local ./frontend

kind load docker-image songroom-backend:local --name songroom
kind load docker-image songroom-frontend:local --name songroom
```

> Re-run these two `kind load` commands any time you rebuild an image or
> recreate the cluster — kind nodes don't persist images across
> `kind delete cluster`.

## 5. Install ArgoCD

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

kubectl wait --namespace argocd \
  --for=condition=available deployment/argocd-server \
  --timeout=180s
```

Get the initial admin password:

```bash
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath='{.data.password}' | base64 -d; echo
```

Port-forward the UI (leave this running in its own terminal):

```bash
kubectl -n argocd port-forward svc/argocd-server 8080:443
```

Open https://localhost:8080 and log in as `admin` with the password above
(browser will warn about the self-signed cert — that's expected locally).

Optional CLI login instead of the UI:

```bash
argocd login localhost:8080 --username admin --password <password-from-above> --insecure
```

## 6. Apply the ApplicationSet

Make sure you've pushed the edited `repoURL` from step 1, then:

```bash
kubectl apply -f deployment/argocd/applicationset.yaml
```

This creates three ArgoCD Applications — `songroom-postgres`,
`songroom-backend`, `songroom-frontend` — each auto-syncing from its
folder under `deployment/apps/`.

## 7. Watch it sync

```bash
kubectl -n argocd get applications
# or, with the CLI:
argocd app list
argocd app get songroom-backend
```

Wait until all three show `Synced` / `Healthy`. First sync can take a
minute or two while Postgres starts, the backend's `wait-for-postgres`
init container finishes, and migrations run.

If something's stuck, check pods directly:

```bash
kubectl -n songroom get pods
kubectl -n songroom logs deployment/backend
kubectl -n songroom logs deployment/frontend
```

## 8. Point your hosts file at the cluster

Add these lines to `/etc/hosts` (needs `sudo`):

```
127.0.0.1 songroom.local
127.0.0.1 api.songroom.local
```

## 9. Visit the app

- Frontend: http://songroom.local
- Backend admin: http://api.songroom.local/admin/
- Backend API: http://api.songroom.local/api/events/

Create a superuser to log into the admin and start creating
venues/events:

```bash
kubectl -n songroom exec -it deployment/backend -- python manage.py createsuperuser
```

The backend ships with Stripe/Resend keys blank (see
`deployment/apps/backend/secret.yaml`), so checkout auto-completes orders
and emails are skipped-and-logged — the same dev-fallback behavior as the
`docker-compose.yml` setup. Fill in real keys there (and re-sync) to test
live payments/emails.

## Making changes

This is GitOps: edit manifests under `deployment/apps/`, commit, push.
ArgoCD's `automated` sync policy (with `selfHeal`) picks up the change
within its poll interval, or force it immediately:

```bash
argocd app sync songroom-backend
```

To ship a new image build: rebuild, `kind load docker-image` again, then
restart the deployment (kind-loaded images don't get a new tag, so
Kubernetes won't notice on its own):

```bash
docker build -t songroom-backend:local ./backend
kind load docker-image songroom-backend:local --name songroom
kubectl -n songroom rollout restart deployment/backend
```

## Teardown

```bash
kubectl -n argocd port-forward ... # Ctrl-C if still running
kind delete cluster --name songroom
```

That deletes the entire cluster, including the Postgres data volume.
