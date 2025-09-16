Kubernetes manifests for frontend (legacy). Move to Kustomize overlays and Argo CD:

Proposed structure:

```
infra/k8s/
├── base/
│   ├── namespace.yaml
│   └── puchi-fe/ (deployment, service)
└── overlays/
    ├── dev/ (Ingress/ApisixRoute for dev)
    └── prod/ (Ingress/ApisixRoute for prod)
```

Ingress should use `apisix` IngressClass; platform-level Traefik/NodePort are deprecated.
