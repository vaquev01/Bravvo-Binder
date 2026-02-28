# DEV_CONTEXT.md — Bravvo OS

> Atualizado em: 2026-02-28

## Stack Tecnológica

| Camada     | Tecnologia                         |
|------------|------------------------------------|
| Frontend   | React 18 + Vite 5 + TypeScript (incremental) |
| Backend    | Node.js + Express 4 + TypeScript (incremental) |
| Banco      | PostgreSQL 15 (Docker) + Prisma 5  |
| IA         | OpenAI GPT-4o (via SDK)            |
| Deploy     | Railway                            |

## Estrutura de Pastas

```
/Frontend   → SPA React (Vite)
/Backend    → API Express (REST)
/Database   → Prisma schema + seeds + migrations
/Scripts    → Automações e contexto de dev
```

## Schema do Banco de Dados (Prisma)

### User
| Campo     | Tipo     | Detalhes                          |
|-----------|----------|-----------------------------------|
| id        | String   | UUID, PK                          |
| username  | String   | Unique                            |
| password  | String   | Hash bcrypt                       |
| role      | String   | 'agency' \| 'client' \| 'admin'   |
| createdAt | DateTime | Auto                              |
| updatedAt | DateTime | Auto                              |

### ClientWorkspace
| Campo     | Tipo     | Detalhes                          |
|-----------|----------|-----------------------------------|
| id        | String   | UUID, PK                          |
| clientId  | String   | Unique                            |
| agencyId  | String?  | Nullable                          |
| data      | Json     | Armazena vaults, kpis, dashboard  |
| createdAt | DateTime | Auto                              |
| updatedAt | DateTime | Auto                              |

## Histórico

- **2026-01-30**: Projeto criado. Vaults S1-S5, Command Center, Governance.
- **2026-02-22**: Integração PostgreSQL via Prisma. Deploy Railway.
- **2026-02-28**: Reestruturação para padrão 4-pastas (`Frontend/Backend/Database/Scripts`).
