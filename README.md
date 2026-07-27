# 🧓 SeniorEase

> Projeto desenvolvido como **Hackathon** (projeto final da Pós Graduação em Front-End Engineering — POSTECH/FIAP). O desafio consiste em desenvolver, para a instituição fictícia **FIAP Inclusive**, uma plataforma **Web** e **Mobile** voltada à acessibilidade digital de pessoas idosas em ambientes acadêmicos e profissionais.

---

## 📋 Tema do Hackathon: Acessibilidade para Idosos em Plataformas Digitais

Muitos usuários da terceira idade enfrentam desafios como perda gradual de memória, dificuldades de visão, redução da coordenação motora fina, menor familiaridade com padrões modernos de navegação, insegurança ao utilizar plataformas digitais e dificuldade em compreender fluxos complexos.

O **SeniorEase** nasce para resolver isso, promovendo **autonomia, confiança e inclusão digital**.

---

## ✅ Requisitos do desafio

### Painel de Personalização da Experiência
- [x] Ajuste de tamanho da fonte
- [X] Ajuste de nível de contraste
- [ ] Ajuste de espaçamento entre elementos
- [X] Simplificação da interface (modo básico / modo avançado)
- [ ] Ativação de feedback visual reforçado
- [ ] Confirmação adicional antes de ações críticas

### Organizador de Atividades Simplificado
- [x] Lista de tarefas com visual simples e direto
- [ ] Etapas guiadas para execução de atividades
- [ ] Lembretes com linguagem clara
- [ ] Avisos de conclusão com feedback positivo
- [ ] Histórico simples de atividades realizadas

### Perfil do Usuário + Configurações Persistentes
- [ ] Tamanho de fonte escolhido
- [ ] Nível de contraste
- [ ] Modo de navegação (simplificado ou padrão)
- [ ] Necessidade de confirmações extras
- [ ] Preferências de lembretes e notificações

### Arquitetura
- [ ] Separação clara entre módulos (painel, tarefas, perfil, configurações)
- [ ] Comunicação entre microapps (se utilizado)
- [ ] Camada de domínio isolada (Clean Architecture)
- [ ] Casos de uso independentes de UI
- [ ] Adaptadores e interfaces bem definidos

### Acessibilidade para Idosos (obrigatório)
- [ ] Ajustes reais de legibilidade (fonte, contraste, espaçamento)
- [ ] Botões e áreas clicáveis ampliadas
- [ ] Feedback claro após cada ação
- [ ] Redução de complexidade visual
- [ ] Navegação previsível
- [ ] Fluxos guiados passo a passo
- [ ] Animações suaves e controláveis

### Material para a entrega
- [ ] Link do(s) repositório(s) Git do projeto (Web e Mobile)
- [ ] README com tecnologias utilizadas e passo a passo para rodar localmente
- [ ] Vídeo explicativo (até 15 min) demonstrando decisões e features
- [ ] Link do vídeo e do projeto em arquivo `.docx` ou `.txt` na plataforma FIAP

---

## 🧱 Arquitetura em camadas

Camadas seguindo **Clean Architecture**, compartilhadas conceitualmente entre Web e Mobile:

- **Domain** — entidades e casos de uso (regras de negócio, independentes de UI/framework)
- **Data / Infra** — implementações concretas de repositórios, integração com backend
- **Presentation** — telas, componentes e state management
- **Shared / Core** — configurações de acessibilidade, temas e utilitários comuns

---

## ✨ Módulos principais

### 🎛️ Painel de Personalização
Módulo responsável por permitir que o usuário ajuste fonte, contraste, espaçamento e nível de simplificação da interface. As preferências são persistidas no perfil do usuário e aplicadas globalmente na aplicação.

### 🗂️ Organizador de Atividades
Módulo de tarefas com fluxo guiado passo a passo, linguagem simples, lembretes e feedback positivo após conclusão de cada etapa.

### 👤 Perfil e Configurações
Módulo responsável por armazenar e sincronizar as preferências de acessibilidade e notificação do usuário entre sessões e dispositivos.

### ♿ Core de Acessibilidade
Camada compartilhada com tokens de design (tipografia, contraste, espaçamento) consumidos por todos os módulos, garantindo coerência visual e cognitiva entre Web e Mobile.

---

## 🔗 Acesso rápido (ambiente local)

### Web
| Comando | Descrição |
| :--- | :--- |
| `npm expo web` | Inicia o app web em `http://localhost:3000` |

### Mobile (Expo)
| Plataforma | Comando / URL | Descrição |
| :--- | :--- | :--- |
| **📱 Expo Go** | `npx expo start` e escanear QR code | App no dispositivo físico. Use a mesma rede Wi-Fi do PC (modo LAN); em dados móveis prefira `npx expo start --tunnel`. |
| **🌐 Web (Expo)** | `npx expo start --web` → `http://localhost:8081` | Versão web via React Native Web (opcional). |
| **🤖 Android** | `npx expo start --android` | Emulador ou dispositivo Android. |
| **🍎 iOS** | `npx expo start --ios` | Simulador ou dispositivo iOS (macOS). |

---

## 🛠 Tecnologias utilizadas

| Área | Tecnologias |
| :--- | :--- |
| **Web** | Next.js, React 19, TypeScript |
| **Mobile** | React Native 0.81, Expo SDK 54, TypeScript |
| **Arquitetura** | Clean Architecture (Domain / Data / Presentation), módulos independentes |
| **Estado** | Context API / hooks de estado por módulo |
| **Formulários e validação** | React Hook Form, Zod |
| **Acessibilidade** | Tokens de design (fonte, contraste, espaçamento), `react-native-safe-area-context`, ARIA (web) |
| **UI e feedback** | Componentes de feedback visual reforçado, animações suaves e controláveis |
| **Testes** | Jest / Testing Library |
| **CI/CD** | GitHub Actions |

---

## 🚀 Getting Started – Como executar o projeto

### Pré-requisitos
- Node.js >= 18
- npm >= 8
- [Expo Go](https://expo.dev/go) instalado no celular (para testar a versão mobile) ou emulador Android/iOS

### Web

```bash
# Clone o repositório
git clone <url-do-repositorio-web>

# Instalar dependências
npm install

# Iniciar o app
npm run dev
```

### Mobile (Expo)

```bash
# Clone o repositório
git clone <url-do-repositorio-mobile>

# Instalar dependências
npm install

# Iniciar o app
npx expo start
```

Utilize o QR code no terminal para abrir no **Expo Go** ou as teclas do CLI para abrir em **web**, **Android** ou **iOS**.

---

## 📂 Estrutura do projeto (proposta)

```text
seniorease/
├── apps/
│   ├── web/                     # Aplicação Next.js
│   └── mobile/                  # Aplicação Expo / React Native
├── packages/
│   ├── domain/                  # Entidades e casos de uso (Clean Architecture)
│   ├── data/                    # Repositórios e integração com Firebase
│   └── shared-ui/               # Tokens de acessibilidade e componentes compartilhados
├── docs/
│   └── firebase.md              # Documentação Firebase / modelo de dados
└── README.md                    # Documentação do projeto
```

> Estrutura sugerida para monorepo. Caso os times optem por repositórios separados para Web e Mobile, mantenha a mesma organização interna (domain / data / presentation) em cada um.

---

## 📜 Scripts Disponíveis

### Web
```bash
npm run dev       # Inicia o servidor de desenvolvimento
npm run build     # Build de produção
npm run lint      # Executa linting
npm run test      # Executa os testes
```

### Mobile (Expo)
```bash
npm run start     # Inicia o Expo (npx expo start)
npm run android   # Inicia e abre no emulador/dispositivo Android
npm run ios       # Inicia e abre no simulador/dispositivo iOS
npm run web       # Inicia e abre no navegador
npm run lint      # Executa linting (expo lint)
npx expo start -c # Inicia o Expo limpando o cache
```

---

## 🎥 Entrega

- Repositório(s) Git: `<link>`
- Vídeo demonstrativo (até 15 min): `<link>`