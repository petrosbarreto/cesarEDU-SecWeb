# DevSec Web App — Exemplo de S-SDLC com CI/CD

> Exemplo básico baseado na apresentação **"Desenvolvimento Seguro e Ciclo de Vida"**

---

## Fluxo do Pipeline

```
Commit → install → build → SAST ┐
                               ├──→ test → DAST → deploy-staging → deploy-prod (manual)
                          SCA  ┘
```

### Jobs e ferramentas (GitHub Actions)

| Job | Tipo | Ferramenta | O que faz | Bloqueia? |
|-----|------|------------|-----------|-----------|
| `build` | — | `npm ci` + Node.js | Instalação reproduzível + smoke test | Sim |
| `sast` | SAST (White-box) | **Semgrep** | Analisa o source sem rodar a app (OWASP rules) | 🔴 Sim |
| `sca` | SCA (Composição) | **npm audit** + **Dependency Review** | CVEs nas dependências de terceiros | 🔴 HIGH/CRITICAL |
| `secret-scan` | Secret Scanning | **Gitleaks** | Detecta credenciais/tokens commitados | 🔴 Sim |
| `test` | Qualidade | **Jest** | Testes unitários + cobertura | 🔴 Sim |
| `dast` | DAST (Black-box) | **OWASP ZAP** | Sobe a app e simula ataques reais | 🟡 Reporta |
| `deploy-staging` | Deploy | — | Deploy automático ao mergear na `main` | — |
| `deploy-production` | Deploy | — | Requer revisor no **GitHub Environments** | 🔵 Manual |

---

## Práticas de Segurança no Código (`src/index.js`)

| Vulnerabilidade OWASP | Prática adotada |
|-----------------------|-----------------|
| **A03 — Injection** | Validação e sanitização com `express-validator` |
| **A05 — Security Misconfiguration** | Cabeçalhos HTTP seguros via `helmet` |
| **A07 — Auth Failures / Brute-force** | Rate limiting via `express-rate-limit` |
| **A09 — Logging inseguro** | Stack trace apenas no log interno, nunca na resposta |

---

## Como rodar localmente

```bash
npm install
npm start          # http://localhost:3000
npm test           # testes + cobertura
npm run audit      # verifica CVEs
```

---

## Conceitos do S-SDLC aplicados

```
Planejamento → Desenvolvimento → QA/Testes → Operação
     │               │               │             │
  Threat         Helmet +        SAST/SCA/      Monitoring
  Modeling      Validator         DAST/Jest     (próx. passo)
```

> "A segurança não pode ser um curativo aplicado no final. Ela precisa ser a fundação."
