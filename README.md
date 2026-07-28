# 🧓 SeniorEase

> Projeto desenvolvido como **Hackathon** (projeto final da Pós Graduação em Front-End Engineering — POSTECH/FIAP). O desafio consiste em desenvolver, para a instituição fictícia **FIAP Inclusive**, uma plataforma **Web** e **Mobile** voltada à acessibilidade digital de pessoas idosas em ambientes acadêmicos e profissionais.

---

## 📋 Tema do Hackathon: Acessibilidade para Idosos em Plataformas Digitais

Muitos usuários da terceira idade enfrentam desafios como perda gradual de memória, dificuldades de visão, redução da coordenação motora fina, menor familiaridade com padrões modernos de navegação, insegurança ao utilizar plataformas digitais e dificuldade em compreender fluxos complexos.

O **SeniorEase** nasce para resolver isso, promovendo **autonomia, confiança e inclusão digital**.

---

## ✅ Requisitos do desafio

### Características do projeto
- visual reforçado

### Painel de Personalização da Experiência
- [x] Ajuste de tamanho da fonte
- [X] Ajuste de nível de contraste
- [X] Simplificação da interface (modo básico / modo avançado)

### Organizador de Atividades Simplificado
- [x] Lista de tarefas com visual simples e direto
- [X] Histórico simples de atividades realizadas

### Perfil do Usuário + Configurações Persistentes
- [X] Tamanho de fonte escolhido
- [X] Nível de contraste
- [X] Modo de navegação (modo básico / modo avançado)

### Arquitetura
- [X] Separação clara entre módulos (tarefas e perfil)
- [X] Adaptadores e interfaces bem definidos

### Acessibilidade para Idosos (obrigatório)
- [X] Ajustes reais de legibilidade (fonte, contraste, espaçamento)
- [X] Botões e áreas clicáveis ampliadas
- [X] Redução de complexidade visual
- [X] Navegação previsível
- [X] Animações suaves

### Material para a entrega
- [X] Link do(s) repositório(s) Git do projeto (Web e Mobile)
- [X] README com tecnologias utilizadas e passo a passo para rodar localmente
- [X] Vídeo explicativo (até 15 min) demonstrando decisões e features
- [X] Link do vídeo e do projeto em arquivo `.docx` ou `.txt` na plataforma FIAP

---

## ✨ Módulos principais

### 🎛️ Painel de Personalização (tab 'Perfil')
Módulo responsável por permitir que o usuário ajuste fonte, contraste e nível de simplificação da interface. As preferências são persistidas no perfil do usuário e aplicadas globalmente na aplicação.

### 🗂️ Organizador de Atividades (tab 'Tarefas')
Módulo de tarefas com linguagem simples.

### ♿ Core de Acessibilidade (useAccessibility)
Camada compartilhada com tokens de design (tipografia, contraste) consumidos por todos os módulos, garantindo coerência visual e cognitiva entre Web e Mobile.

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

## 📂 Estrutura do projeto

```text
seniorease/
├── app/                      # Telas, rotas e navegação do Expo Router
├── assets/                   # Imagens e recursos estáticos
├── components/               # Componentes reutilizáveis da interface
├── constants/                # Constantes para cálculo de layout
├── contexts/                 # Contextos de autenticação, conta e acessibilidade
├── docs/                     # Documentação complementar
├── firebase/                 # Configuração e integração com Firebase
├── hooks/                    # Hooks utilitários e personalizados
├── lib/                      # Helpers, tipos e lógica de apoio
├── package.json              # Dependências e scripts do projeto
└── README.md                 # Documentação principal
```

---

## 📜 Scripts Disponíveis

### Web
```bash
npm run web       # Inicia e abre no navegador
npm run lint      # Executa linting
```

### Mobile (Expo)
```bash
npm run start     # Inicia o Expo (npx expo start)
npm run android   # Inicia e abre no emulador/dispositivo Android
npm run ios       # Inicia e abre no simulador/dispositivo iOS
npm run lint      # Executa linting (expo lint)
npx expo start -c # Inicia o Expo limpando o cache
```

---