# Solar Energy Admin Dashboard Design System

## Versão 2.0 --- White & Dark Theme

Design system para dashboard administrativo de monitoramento de energia
solar, inspirado em plataformas SaaS modernas.

------------------------------------------------------------------------

# 1. Visão Geral

O Solar Energy Admin Dashboard é uma interface web para:

-   Monitoramento de usinas solares
-   Gestão de clientes
-   Controle de sensores IoT
-   Análise de geração energética
-   Alertas operacionais
-   Relatórios administrativos

O sistema possui dois temas:

-   White Theme: interface clara para operação diária
-   Dark Theme: interface escura para operadores e ambientes de controle

------------------------------------------------------------------------

# 2. Design Tokens Globais

## Tipografia

  Token       Valor   Uso
  ----------- ------- --------------------
  text-xs     12px    labels, gráficos
  text-sm     14px    descrições
  text-base   16px    conteúdo
  text-lg     18px    subtítulos
  text-xl     20px    títulos de seção
  text-2xl    24px    métricas
  text-3xl    30px    títulos principais

Pesos:

-   normal: 400
-   medium: 500
-   semibold: 600
-   bold: 700

Fonte recomendada:

Inter / SF Pro / Roboto

------------------------------------------------------------------------

# 3. White Theme

## Cores

  Token             HEX       Uso
  ----------------- --------- -------------------------
  surface-page      #F5F4F0   fundo principal
  surface-section   #EFEFEB   áreas secundárias
  surface-card      #FFFFFF   cards
  text-primary      #1A1A1A   títulos
  text-secondary    #4A4A4A   textos auxiliares
  text-muted        #9E9E9E   informações secundárias
  action-primary    #F5A623   ações principais
  action-hover      #E8961A   hover
  success           #22C55E   online
  warning           #F59E0B   atenção
  error             #EF4444   falhas

------------------------------------------------------------------------

# 4. Dark Theme

## Cores

  Token              HEX       Uso
  ------------------ --------- ------------------------
  surface-page       #111111   fundo principal
  surface-section    #181818   seções
  surface-card       #1E1E1E   cards
  surface-elevated   #242424   modais
  text-primary       #FFFFFF   títulos
  text-secondary     #D1D1D1   textos
  text-muted         #8A8A8A   informações auxiliares
  action-primary     #F5A623   destaque solar
  action-hover       #FFB84D   hover
  success            #22C55E   online
  warning            #F59E0B   alerta
  error              #EF4444   erro

------------------------------------------------------------------------

# 5. Layout Dashboard

## Estrutura

    Sidebar
     |
     Header
     |
     KPI Cards
     |
     Analytics + Alerts
     |
     Clients Table

------------------------------------------------------------------------

# 6. Sidebar

## White

Background:

surface-card

Borda:

border-default

## Dark

Background:

#181818

Itens:

Estado normal:

text-muted

Estado ativo:

background action-primary

texto:

#1A1A1A

------------------------------------------------------------------------

# 7. Cards KPI

Exemplos:

-   Sistemas ativos
-   Energia gerada
-   Economia acumulada
-   Clientes conectados

Configuração:

    radius-lg
    padding: 24px
    shadow-card

Valor:

    font-bold
    text-2xl

------------------------------------------------------------------------

# 8. Gráficos

## Área

White:

surface-card

Dark:

surface-card dark

Linha principal:

action-primary

Área preenchida:

White: #FFF8E1

Dark: rgba(245,166,35,0.15)

------------------------------------------------------------------------

# 9. Status

## Online

    color: #22C55E
    background: rgba(34,197,94,0.15)

## Atenção

    color: #F59E0B
    background: rgba(245,158,11,0.15)

## Falha

    color: #EF4444
    background: rgba(239,68,68,0.15)

------------------------------------------------------------------------

# 10. Componentes

## Botão Primary

    background: action-primary
    color: #1A1A1A
    radius: 24px
    padding: 16px 32px
    font-weight:600

Hover:

    background action-hover

------------------------------------------------------------------------

## Botão Dark CTA

    background:#1A1A1A
    color:#FFFFFF
    radius:999px

No Dark Theme:

    background:#FFFFFF
    color:#1A1A1A

------------------------------------------------------------------------

# 11. Tabela Administrativa

Colunas:

-   Cliente
-   Sistema
-   Dispositivo
-   Status
-   Última comunicação
-   Geração

Cards:

    background surface-card
    radius-xl
    shadow-card

------------------------------------------------------------------------

# 12. Regras

1.  Nunca utilizar cores fora dos tokens.
2.  Âmbar é exclusivo para destaque e ações.
3.  Cards sempre possuem elevação.
4.  Estados devem possuir feedback visual.
5.  Dark mode mantém contraste elevado.
6.  Dashboard deve priorizar leitura rápida.

------------------------------------------------------------------------

Solar Energy Admin Dashboard Design System v2.0
