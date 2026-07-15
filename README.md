# Photo Mosaic Creator

Aplicação Angular 20 para criar mosaicos fotográficos profissionais 100% no navegador (client-side).

## Stack

- Angular 20 (Standalone + Signals)
- Angular Material + SCSS
- html2canvas (exportação)
- SortableJS (drag and drop)
- jsPDF (exportação PDF)

## Funcionalidades implementadas

- Upload múltiplo (arquivos, pasta, drag and drop e File System Access API quando disponível)
- Reordenação com drag and drop
- Remover, duplicar, marcar favoritas e definir foto principal
- Layouts: Clássico, Timeline, Grade, Polaroid, Elegante e Moldura
- Editor visual por foto: zoom, pan, rotação, espelhamento e proporção
- Configurações visuais: espaçamento, bordas, fundo, cantos, sombra e tamanho da foto principal
- Títulos com fonte, cor, tamanho, alinhamento e posição
- Temas: Minimalista Branco/Preto, Escandinavo, Premium, Fine Art, Elegante, Instagram e Infantil
- Undo/Redo + Auto Save em Local Storage + histórico
- Atalhos de teclado (`Ctrl/Cmd+Z`, `Ctrl/Cmd+Y`, `Ctrl/Cmd+O`, `Ctrl/Cmd+E`, `F`)
- Modo tela cheia
- Exportação PNG/JPEG/PDF em resoluções predefinidas e opção de resolução original
- Botão de organização automática com balanceamento por orientação

## Desenvolvimento

```bash
npm install
npm start
```

## Testes

```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

## Build

```bash
npm run build
```
