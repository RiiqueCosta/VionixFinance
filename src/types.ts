export type TransactionType = 'receita' | 'fixa' | 'variavel';

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  category: string;
  date: string; // ISO string
  note?: string;
  recurring?: boolean;
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  category: string;
}

export interface CategoryMap {
  receita: string[];
  fixa: string[];
  variavel: string[];
}

export const DEFAULT_CATEGORIES: CategoryMap = {
  receita: ['Salário', 'Clientes', 'Freelance', 'Investimentos', 'Suporte TI', 'Projetos', 'Outros'],
  fixa: ['Salário', 'Aluguel', 'Internet', 'Servidores', 'Assinaturas', 'Seguros', 'Outros'],
  variavel: ['Salário', 'Cartão Nubank', 'Alimentação', 'Transporte', 'Ferramentas', 'Viagens', 'Lazer', 'Outros']
};
