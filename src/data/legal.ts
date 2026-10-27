/*
 * MINUTAS PARA REVISÃO JURÍDICA. Não são parecer jurídico nem texto definitivo.
 * Campos entre colchetes são pendências que bloqueiam a publicação.
 */
export const companyPending = {
  legalName: '[Razão social: pendente]',
  cnpj: '[CNPJ: pendente]',
  address: '[Endereço completo: pendente]',
  dpo: '[Encarregado de dados: pendente]',
}

export type LegalDoc = {
  id: 'privacidade' | 'termos' | 'creditos'
  title: string
  updated: string
  sections: { heading: string; body: string[] }[]
}

export const privacyPolicy: LegalDoc = {
  id: 'privacidade',
  title: 'Política de Privacidade (minuta)',
  updated: 'Minuta de 27/10/2026, pendente de revisão jurídica',
  sections: [
    {
      heading: 'Quem trata os dados',
      body: [
        `${companyPending.legalName}, ${companyPending.cnpj}, ${companyPending.address}. Marca demonstrativa: Atelier Vértice.`,
        `Contato do encarregado: ${companyPending.dpo}.`,
      ],
    },
    {
      heading: 'Quais dados e para quê',
      body: [
        'Formulário de briefing: nome, e-mail, telefone (opcional), tipologia, situação do terreno, área estimada (opcional), formato preferido da conversa e mensagem.',
        'Finalidade: responder ao seu pedido de conversa e preparar uma proposta de projeto.',
        'Base legal provável: procedimentos preliminares relacionados a contrato, a pedido do titular. A confirmar com o advogado.',
      ],
    },
    {
      heading: 'Compartilhamento',
      body: [
        'Os dados não são vendidos nem usados para publicidade. Nesta versão demonstrativa o envio é simulado no navegador e nenhum dado sai do seu dispositivo.',
        'Quando houver envio real, listar aqui o provedor de e-mail ou hospedagem que receberá os dados.',
      ],
    },
    {
      heading: 'Retenção',
      body: ['Prazo de guarda a definir com o advogado. Sugestão para avaliação: até 12 meses sem contratação.'],
    },
    {
      heading: 'Seus direitos',
      body: [
        'Confirmação, acesso, correção, anonimização, eliminação, portabilidade e informação sobre compartilhamento, conforme a Lei 13.709/2018 (LGPD). Pedidos pelo e-mail contato@ateliervertice.example.',
      ],
    },
    {
      heading: 'Cookies e rastreadores',
      body: [
        'Esta página não usa cookies próprios, analytics, pixels de anúncio nem conteúdo incorporado de terceiros. As fontes são hospedadas no próprio site. Por isso não há banner de consentimento; confirmar com o advogado e com o guia de cookies da ANPD.',
      ],
    },
  ],
}

export const termsOfUse: LegalDoc = {
  id: 'termos',
  title: 'Termos de Uso (minuta)',
  updated: 'Minuta de 27/10/2026, pendente de revisão jurídica',
  sections: [
    {
      heading: 'Natureza do site',
      body: [
        'Site institucional demonstrativo. Obras, números, prêmios, nomes de sócios e registros CAU exibidos são fictícios e servem para apresentar o layout.',
      ],
    },
    {
      heading: 'Conteúdo e imagens',
      body: [
        'Imagens geradas para o projeto e fotografias de bancos de imagem com licença própria (ver Créditos). Os retratos de sócios são fotografias ilustrativas de banco de imagem e não representam pessoas da equipe.',
      ],
    },
    {
      heading: 'Sem proposta vinculante',
      body: ['Prazos e faixas de área indicados são referências gerais e não constituem proposta comercial.'],
    },
  ],
}
