# Desempenho+ 🚀

Sistema de Gestão de RH para acompanhar e organizar o desempenho dos funcionários de forma simples e visual.

## 📋 Funcionalidades

### Dashboard
- Total de funcionários cadastrados
- Faltas registradas no mês
- Média geral de desempenho da equipe
- Top 5 melhores desempenhos

### Funcionários
- Listagem completa de funcionários
- Adicionar, editar e excluir funcionários
- Avaliação por estrelas (1-5) nas categorias:
  - Pontualidade
  - Produtividade
  - Comportamento
- Cálculo automático da média geral

### Faltas
- Registro de faltas dos funcionários
- Informações de data, motivo e justificativa
- Marcação de falta como justificada ou não justificada
- Edição e exclusão de registros

### Relatórios de Desempenho
- Visualização por mês
- Tabela com todas as avaliações dos funcionários
- Indicadores de desempenho com cores
- Contagem de faltas por funcionário no período
- Média geral calculada automaticamente

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript
- **Roteamento**: React Router 7
- **Estilização**: Tailwind CSS 4
- **Componentes UI**: Radix UI
- **Backend**: Supabase (Edge Functions + KV Store)
- **Notificações**: Sonner
- **Ícones**: Lucide React
- **Datas**: date-fns

## 🚀 Como Usar

O sistema já está configurado e pronto para uso! Basta:

1. Começar adicionando funcionários na página "Funcionários"
2. Avaliar cada funcionário nas três categorias
3. Registrar faltas quando necessário
4. Acompanhar o desempenho no Dashboard e Relatórios

## 📊 Estrutura de Dados

### Funcionário
```typescript
{
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  ratings: {
    punctuality: number; // 0-5
    productivity: number; // 0-5
    behavior: number; // 0-5
  };
}
```

### Falta
```typescript
{
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  reason: string;
  justified: boolean;
}
```

## 🎨 Design

O sistema utiliza um design moderno e profissional com:
- Paleta de cores azul/índigo
- Layout responsivo
- Menu lateral de navegação
- Cards e tabelas organizadas
- Sistema de estrelas para avaliações
- Indicadores visuais coloridos

## 📝 Notas Importantes

- **Privacidade**: Este é um protótipo. Para produção, implemente medidas adequadas de segurança e proteção de dados pessoais.
- **Backup**: Os dados são armazenados no Supabase KV Store. Considere implementar backups regulares.
- **Autenticação**: Para produção, adicione autenticação de usuários.

## 🌐 Deploy

Para fazer deploy do seu projeto:

1. **GitHub**:
   - Crie um repositório no GitHub
   - Faça push do código
   - Configure o GitHub Pages ou outro serviço de hospedagem

2. **Netlify/Vercel**:
   - Conecte seu repositório GitHub
   - Configure o build command: `npm run build`
   - Configure o publish directory: `dist`

3. **Supabase**:
   - O backend já está configurado
   - As Edge Functions estão rodando automaticamente

## 📧 Suporte

Para dúvidas ou sugestões, consulte a documentação do Figma Make.

---

**Desempenho+** - Gestão de RH Simplificada
