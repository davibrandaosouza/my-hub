# MyHub

> Seu espaço pessoal. Seus dados. Seu controle.

MyHub é um hub pessoal completo — uma aplicação web construída para centralizar planejamentos, devocionais, anotações, rotinas, pomodoro, entretenimento e muito mais em um único lugar, com design personalizado e experiência totalmente sua.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Stack Tecnológica](#stack-tecnológica)
- [Módulos](#módulos)
- [Design Patterns](#design-patterns)
- [Autenticação e Segurança](#autenticação-e-segurança)
- [Roadmap](#roadmap)

---

## Visão Geral

MyHub nasceu com dois objetivos:

1. **Centralização** — ter todas as ferramentas pessoais em um único lugar, acessível de qualquer dispositivo, personalizado do zero.
2. **Aprendizado** — o projeto foi construído com foco em aprender e praticar conceitos avançados de desenvolvimento: arquitetura, autenticação, segurança, design patterns e system design.

---

## Stack Tecnológica

| Tecnologia                  | Uso                                                    |
| --------------------------- | ------------------------------------------------------ |
| **Next.js 15** (App Router) | Framework principal — SSR, SSG, API Routes, Middleware |
| **TypeScript**              | Tipagem estática, interfaces, generics                 |
| **Tailwind CSS v4**         | Estilização, design system, dark mode                  |
| **Firebase Auth**           | Autenticação — email/senha e Google OAuth              |
| **Firestore**               | Banco de dados NoSQL em tempo real                     |
| **Firebase Storage**        | Upload de arquivos e imagens                           |
| **Zustand**                 | Gerenciamento de estado global                         |
| **TanStack Query**          | Cache, sincronização e estado de servidor              |
| **React Hook Form**         | Gerenciamento de formulários performático              |
| **Zod**                     | Validação de schemas (frontend e backend)              |
| **Lucide React**            | Ícones                                                 |

---

## Módulos

| Módulo            | Descrição                                           | Status       |
| ----------------- | --------------------------------------------------- | ------------ |
| **Autenticação**  | Login, cadastro, OAuth Google, recuperação de senha | ✅ Concluído |
| **Dashboard**     | Visão geral do dia, widgets de resumo, quote diária | 🔲 Em breve  |
| **Devocionais**   | Registro diário, versículo, reflexão, streak        | 🔲 Em breve  |
| **Planejamentos** | Kanban board, metas, projetos com prioridades       | 🔲 Em breve  |
| **Anotações**     | Editor markdown, tags, busca, auto-save             | 🔲 Em breve  |
| **Calendário**    | Datas importantes, eventos recorrentes              | 🔲 Em breve  |
| **Rotinas**       | Hábitos diários, checklist por período, heatmap     | 🔲 Em breve  |
| **Pomodoro**      | Timer, fila de tarefas, estatísticas de foco        | 🔲 Em breve  |
| **Animes**        | Lista de animes, status, integração AniList API     | 🔲 Em breve  |
| **Jogos**         | Lista de jogos, status, integração IGDB API         | 🔲 Em breve  |
| **Guitarra**      | Acordes, progressões, Web Audio API                 | 🔲 Em breve  |

---

## Design Patterns

### Repository Pattern

Todo acesso ao Firebase é isolado em uma camada de repositório. Nenhum componente acessa serviços externos diretamente — tudo passa por funções intermediárias que abstraem a implementação.

### Singleton Pattern

Serviços externos são inicializados uma única vez e reutilizados em toda a aplicação, evitando instâncias duplicadas.

### Custom Hooks

Lógica complexa encapsulada em hooks reutilizáveis, mantendo os componentes limpos e focados apenas na apresentação.

```ts
const { user, loading } = useAuth();
const { sessions, startTimer, pauseTimer } = usePomodoro();
```

### Observer Pattern

Listeners em tempo real para reagir a mudanças de estado sem necessidade de polling, com limpeza automática ao desmontar componentes para evitar memory leaks.

---

## Autenticação e Segurança

### Proteção de Rotas

Um proxy intercepta todas as requisições antes de renderizar qualquer página, redirecionando usuários não autenticados automaticamente.

### Cookie HttpOnly

O token de sessão nunca fica exposto ao JavaScript. É criado exclusivamente pelo servidor, protegendo contra ataques XSS.

```
HttpOnly    → JavaScript não consegue ler o cookie
Secure      → trafega somente via HTTPS em produção
SameSite    → proteção contra CSRF
maxAge      → expiração automática da sessão
```

### Validação com Zod

Todos os dados de entrada são validados com schemas tipados antes de qualquer operação, tanto no cliente quanto no servidor.

### Segurança no Banco de Dados

Regras de segurança configuradas diretamente no banco garantem que cada usuário só acesse seus próprios dados, independente de qualquer outra camada da aplicação.

---

## Roadmap

### Fase 1 — Autenticação e Base ✅

- [x] Setup do projeto
- [x] Autenticação completa (email + Google)
- [x] Cookie HttpOnly seguro
- [x] Proteção de rotas

### Fase 2 — Core Modules 🔄

- [ ] Dashboard com widgets
- [ ] Módulo de Anotações
- [ ] Módulo de Pomodoro
- [ ] Módulo de Rotinas

### Fase 3 — Conteúdo Pessoal

- [ ] Módulo de Devocionais
- [ ] Módulo de Planejamentos (Kanban)
- [ ] Módulo de Calendário

### Fase 4 — Entretenimento

- [ ] Módulo de Animes (AniList API)
- [ ] Módulo de Jogos (IGDB API)

### Fase 5 — Avançado

- [ ] Módulo de Guitarra (Web Audio API)
- [ ] Testes automatizados
- [ ] PWA (Progressive Web App)
- [ ] Notificações push
- [ ] Deploy em produção

---

> Projeto pessoal em desenvolvimento contínuo.
