# EduAI MVP

Este é um MVP de um aplicativo educacional com IA conversacional, construído com React, Express e a API do Gemini.

## Funcionalidades

- **Splash Screen**: Entrada animada com Framer Motion.
- **Login**: Sistema de autenticação simulado.
- **Onboarding**: Fluxo de introdução para novos usuários.
- **Seleção de Tutor**: Sistema de personas com diferentes especialidades (Ciência, História, Escrita).
- **Chat com IA**: Conversas em tempo real utilizando o modelo Gemini 3 Flash.
- **Arquitetura Escalável**: Separação clara entre serviços, componentes e tipos.

## Tecnologias

- **Frontend**: React 19, Tailwind CSS 4, Framer Motion, Lucide React.
- **Backend**: Express (Node.js) integrado com Vite.
- **IA**: Google Gemini API (@google/genai).
- **Build Tool**: Vite.

## Como Executar

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure a chave da API do Gemini no arquivo `.env`:
   ```env
   GEMINI_API_KEY=sua_chave_aqui
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Estrutura de Pastas

- `/src/components`: Componentes UI reutilizáveis.
- `/src/services`: Lógica de integração com APIs externas (IA).
- `/src/types.ts`: Definições de tipos TypeScript.
- `/src/constants.ts`: Configurações e dados estáticos (Personas).
- `/server.ts`: Servidor Express para rotas de API e servir o frontend.

## Deploy na Vercel

Este projeto está configurado para ser detectado como um projeto Vite/React. Para deploy:
1. Conecte seu repositório GitHub à Vercel.
2. Certifique-se de que o comando de build seja `npm run build` e o diretório de saída seja `dist`.
3. Adicione a variável de ambiente `GEMINI_API_KEY`.
