# 🗺️ Bedrock Coordinate Finder

![Minecraft Version](https://img.shields.io/badge/Minecraft-1.17%20--%201.21-emerald?style=for-the-badge&logo=minecraft)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

Uma ferramenta técnica avançada para localizar coordenadas no Minecraft Java Edition através do padrão de geração de Bedrock (Rocha Mãe).

## 🚀 Funcionalidades

- **Busca Multi-Core:** Utiliza 4 Web Workers simultâneos para processamento paralelo, garantindo velocidade máxima sem travar o navegador.
- **Precisão de 100%:** Implementa o algoritmo oficial de semente de posição e o gerador de números aleatórios do Java (LGC).
- **Suporte Moderno:** Compatível com as novas camadas do mundo (Y = -64) das versões 1.18 a 1.21.
- **Modo Nether:** Localize-se também pelo teto do Nether (Y = 127).

## 🛠️ Como usar

1. **Configure:** Escolha a versão do jogo e a dimensão (Overworld ou Nether).
2. **Desenhe:** No grid interativo, marque os blocos de Bedrock que você vê no seu jogo.
3. **Seed:** Insira a semente (seed) do seu mundo.
4. **Calcule:** Clique em "Calcular Localização" e aguarde a busca nos quadrantes do mapa.

## 💻 Tecnologias

- **Frontend:** React.js com Tailwind CSS.
- **Lógica:** JavaScript assíncrono com Web Workers para computação pesada.
- **Ícones:** Lucide-react.

---
Developed with 💜 by **Masterotaku**.
