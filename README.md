# MyHub

> Seu espaço pessoal. Seus dados. Seu controle.

MyHub é um hub pessoal completo — uma aplicação web construída para centralizar planejamentos, devocionais, anotações, rotinas, pomodoro, entretenimento e muito mais em um único lugar, com design personalizado e experiência totalmente sua.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Stack Tecnológica](#stack-tecnológica)
- [Módulos](#módulos)
- [Layout e Interface](#layout-e-interface)
- [Design Patterns](#design-patterns)
- [Autenticação e Segurança](#autenticação-e-segurança)
- [Roadmap](#roadmap)
- [Estrutura do Projeto](#estrutura-do-projeto)

---

## Visão Geral

MyHub nasceu com dois objetivos:

1. **Centralização** — ter todas as ferramentas pessoais em um único lugar, acessível de qualquer dispositivo, personalizado do zero.
2. **Aprendizado** — o projeto foi construído com foco em aprender e praticar conceitos avançados de desenvolvimento: arquitetura, autenticação, segurança, design patterns e system design.

---

## Stack Tecnológica

| Tecnologia                  | Uso                                                    |
| --------------------------- | ------------------------------------------------------ |
| **Next.js 16** (App Router) | Framework principal — SSR, SSG, API Routes, Middleware |
| **TypeScript**              | Tipagem estática, interfaces, generics                 |
| **Tailwind CSS v4**         | Estilização, design system, dark/light mode            |
| **Firebase Auth**           | Autenticação — email/senha e Google OAuth              |
| **Firestore**               | Banco de dados NoSQL em tempo real                     |
| **Vercel Blob**             | Armazenamento de arquivos e imagens                    |
| **Zustand**                 | Gerenciamento de estado global                         |
| **TanStack Query**          | Cache, sincronização e estado de servidor              |
| **React Hook Form**         | Gerenciamento de formulários performático              |
| **Zod**                     | Validação de schemas (frontend e backend)              |
| **Framer Motion**           | Animações fluidas — modais, stagger, transições        |
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
| **Anotações**     | Editor markdown, tags, busca, auto-save             | ✅ Concluído |
| **Rotinas**       | Hábitos diários, checklist por período, heatmap     | ✅ Concluído |
| **Pomodoro**      | Timer, fila de tarefas, estatísticas de foco        | ✅ Concluído |
| **Animes**        | Lista de animes, status, integração Jikan API       | ✅ Concluído |
| **Filmes**        | Lista de filmes, status, avaliações (TMDB)          | ✅ Concluído |
| **Séries**        | Lista de séries, episódios assistidos (TMDB)        | ✅ Concluído |
| **Jogos**         | Lista de jogos, status, integração RAWG API         | ✅ Concluído |
| **Configurações** | Perfil, aparência, Pomodoro, sistema de avaliação   | ✅ Concluído |

---

## Layout e Interface

### Sidebar

Navegação lateral colapsável com grupos organizados por categoria:

- **Visão Geral** — Dashboard
- **Espiritual** — Devocionais
- **Produtividade** — Planejamentos, Anotações, Pomodoro, Rotinas
- **Entretenimento** — Animes, Filmes, Séries, Jogos
- **Rodapé** — Configurações e logout

Suporta colapso total (ícones apenas) com labels animados via Framer Motion e tooltip de navegação.

### Header

Header fixo no topo de cada página com:

- Título da página com animação de troca ao navegar
- Data formatada em português
- Fundo com `backdrop-blur` integrado ao tema

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
const { settings, updateSettings } = useSettings();
```

### Observer Pattern

Listeners em tempo real para reagir a mudanças de estado sem necessidade de polling, com limpeza automática ao desmontar componentes para evitar memory leaks.

### Shared Component Architecture

Abstração de componentes de UI complexos (como `MediaCard`, `MediaStatsBar`, `ColecaoCard` e modais de detalhes) para garantir consistência visual e facilitar a manutenção em diferentes módulos de entretenimento.

### Animation System

Animações gerenciadas centralmente com **Framer Motion**, seguindo uma filosofia minimalista e coerente:

- **Modais** — overlay fade + card scale/slide (150–180ms)
- **Toasts** — slide da direita com `AnimatePresence` (200ms)
- **Sidebar** — labels com slide suave ao colapsar/expandir (150ms)
- **Listas** — `staggerChildren` discreto no QuickAccess e cards de mídia (40ms entre itens)
- **Viewport** — `whileInView` com `once: true` nos cards para animar apenas na primeira visualização
- **Layout** — `motion.div layout` nos hábitos para reordenação fluida

O Framer Motion respeita automaticamente `prefers-reduced-motion`, garantindo acessibilidade sem código adicional.

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

- [x] Layout base com Sidebar colapsável e animada
- [x] Header fixo com blur, data formatada e animação de título
- [x] Grupos de navegação organizados por categoria
- [x] Dashboard com stats, acesso rápido, eventos e notas recentes
- [x] Scrollbar personalizada integrada ao tema

### Fase 3 — Módulos Core ✅

- [x] Módulo de Devocionais
- [x] Módulo de Anotações (editor markdown, auto-save, tags)
- [x] Módulo de Pomodoro (timer, fila, estatísticas)
- [x] Módulo de Rotinas (hábitos, heatmap, períodos)

### Fase 4 — Configurações ✅

- [x] Perfil do usuário (avatar, nome, upload)
- [x] Aparência (tema claro/escuro)
- [x] Configurações do Pomodoro
- [x] Sistema de avaliação personalizado para entretenimento

### Fase 5 — Planejamento ✅

- [x] Módulo de Planejamentos (Kanban com drag & drop)
- [x] Prioridades e status personalizados

### Fase 6 — Entretenimento ✅

- [x] Módulo de Animes (Jikan API v4)
- [x] Módulo de Filmes e Séries (TMDB API)
- [x] Módulo de Jogos (RAWG API)
- [x] Arquitetura de componentes compartilhados para mídia
- [x] Sistema de coleções temáticas
- [x] Validação de duplicatas por API identifier
- [x] Ordenação multi-critério com prioridade de avaliação

### Fase 7 — Polimento ✅

- [x] Animações com Framer Motion (modais, toasts, sidebar, cards)
- [x] Responsividade mobile completa
- [x] Modo claro com variáveis CSS semânticas
- [x] Sistema de toast com AnimatePresence

---

## Estrutura do Projeto

Para ajudar na compreensão das responsabilidades de cada parte do código:

- **`src/app/`**: O coração do roteamento (Next.js App Router).
  - `layout.tsx`: Estrutura global (HTML, Body, Fontes).
  - `(auth)/`: Páginas de login e registro.
  - `(hub)/`: Área logada. O `layout.tsx` here gerencia o Sidebar e o estado do Toast.
- **`src/components/`**: Peças de construção da interface.
  - `ui/`: Botões, inputs, modal e outros componentes genéricos (Design System).
  - `layout/`: Sidebar animada e Header com transição de título.
  - `shared/`: Componentes reutilizáveis entre módulos — `MediaCard`, `MediaStatsBar`, `ColecaoCard`, `RatingInput`.
  - `modules/`: Lógica visual específica de cada ferramenta.
- **`src/hooks/`**: Onde a "mágica" acontece. Encapsula toda a lógica de negócio e integração com banco de dados para que os componentes fiquem limpos.
- **`src/lib/`**: Ferramentas e configurações.
  - `firebase/`: Configurações e funções CRUD para o Firestore.
  - `api/`: Integrações com Jikan, TMDB e RAWG.
  - `validations/`: Schemas do Zod para garantir que você nunca envie dados inválidos ao banco.
- **`src/types/`**: Interfaces TypeScript que definem os contratos de dados em toda a aplicação.
- **`src/middleware.ts`**: O segurança na porta. Verifica se você está logado antes de deixar carregar qualquer página do Hub.

---

> Projeto pessoal em desenvolvimento contínuo.
