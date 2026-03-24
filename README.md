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
| **Vercel Blob**             | Armazenamento de arquivos e imagens                    |
| **Zustand**                 | Gerenciamento de estado global                         |
| **TanStack Query**          | Cache, sincronização e estado de servidor              |
| **React Hook Form**         | Gerenciamento de formulários performático              |
| **Zod**                     | Validação de schemas (frontend e backend)              |
| **react-easy-crop**         | Biblioteca para recorte e ajuste de imagens            |
| **dnd-kit**                 | Sistema de Drag and Drop para kanban e listas          |
| **Lucide React**            | Ícones                                                 |

---

## Módulos

| Módulo            | Descrição                                           | Status       |
| ----------------- | --------------------------------------------------- | ------------ |
| **Autenticação**  | Login, cadastro, OAuth Google, recuperação de senha | ✅ Concluído |
| **Dashboard**     | Visão geral do dia, stats, acesso rápido, eventos   | ✅ Concluído |
| **Devocionais**   | Registro diário, versículo, reflexão, streak        | ✅ Concluído |
| **Planejamentos** | Kanban board, metas, projetos com prioridades       | ✅ Concluído |
| **Anotações**     | Editor markdown, tags, busca, auto-save             | 🔲 Em breve  |
| **Rotinas**       | Hábitos diários, checklist por período, heatmap     | 🔲 Em breve  |
| **Pomodoro**      | Timer, fila de tarefas, estatísticas de foco        | 🔲 Em breve  |
| **Guitarra**      | Acordes, progressões, Web Audio API                 | 🔲 Em breve  |
| **UFES**          | Disciplinas, provas, grade e acompanhamento         | 🔲 Em breve  |
| **Programação**   | Estudos, projetos, recursos e progresso             | 🔲 Em breve  |
| **Animes**        | Lista de animes, status, integração AniList API     | ✅ Concluído |
| **Filmes**        | Lista de filmes, status, avaliações                 | ✅ Concluído |
| **Séries**        | Lista de séries, episódios assistidos               | ✅ Concluído |
| **Jogos**         | Lista de jogos, status, integração RAWG API         | ✅ Concluído |

---

## Layout e Interface

### Sidebar

Navegação lateral colapsável com grupos organizados por categoria:

- **Visão Geral** — Dashboard
- **Espiritual** — Devocionais
- **Produtividade** — Planejamentos, Anotações, Pomodoro, Rotinas
- **Estudos** — Guitarra, UFES, Programação
- **Entretenimento** — Animes, Filmes, Séries, Jogos
- **Rodapé** — Configurações e logout

Suporta colapso total (ícones apenas) com tooltip de navegação.

### Header

Header fixo no topo de cada página com:

- Título da página atual
- Data formatada em português
- Botão de Ações Rápidas
- Fundo com `backdrop-blur` integrado ao tema escuro

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

### Shared Component Architecture

Abstração de componentes de UI complexos (como `MediaCard`, `MediaStatsBar` e modais de detalhes) para garantir consistência visual e facilitar a manutenção em diferentes módulos (Animes, Filmes, Jogos).

### Type-Safe API Integration

A aplicação utiliza interfaces TypeScript rigorosas para mapear as respostas das APIs externas (Jikan, TMDB, RAWG). Isso garante que os dados sejam validados e tipados corretamente desde o momento em que saem do `fetch` até serem consumidos pelos componentes UI, eliminando erros de propriedade inexistente e facilitando o desenvolvimento.

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
- [x] Proteção de rotas via middleware

### Fase 2 — Shell da Aplicação ✅

- [x] Layout base com Sidebar colapsável
- [x] Header fixo com blur e data formatada
- [x] Grupos de navegação: Visão Geral, Espiritual, Produtividade, Estudos, Entretenimento
- [x] Dashboard com stats, acesso rápido, eventos e notas recentes
- [x] Scrollbar personalizada integrada ao tema

### Fase 3 — Core Modules 🔄

- [ ] Módulo de Anotações
- [ ] Módulo de Pomodoro
- [ ] Módulo de Rotinas
- [x] Módulo de Devocionais

### Fase 4 — Estudos

- [ ] Módulo UFES (disciplinas e grade)
- [ ] Módulo de Programação
- [ ] Módulo de Guitarra (Web Audio API)

### Fase 5 — Planejamento

- [x] Módulo de Planejamentos (Kanban)
- [ ] Módulo de Calendário

### Fase 6 — Entretenimento ✅

- [x] Módulo de Animes (Jikan API v4)
- [x] Módulo de Filmes e Séries (TMDB API)
- [x] Módulo de Jogos (RAWG API)
- [x] Arquitetura de componentes compartilhados para mídia

### Fase 7 — Avançado

- [ ] Testes automatizados
- [ ] PWA (Progressive Web App)
- [ ] Notificações push
- [ ] Deploy em produção

---

> Projeto pessoal em desenvolvimento contínuo.
