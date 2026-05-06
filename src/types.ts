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
  metas: string[];
  cartoes: string[];
}

export const DEFAULT_CATEGORIES: CategoryMap = {
  receita: ['Salário', 'Clientes', 'Freelance', 'Investimentos', 'Suporte TI', 'Projetos', 'Outros'],
  fixa: ['Aluguel', 'Internet', 'Servidores', 'Assinaturas', 'Seguros', 'Educação', 'Outros'],
  variavel: ['Alimentação', 'Transporte', 'Ferramentas', 'Viagens', 'Lazer', 'Saúde', 'Outros'],
  metas: ['Reserva', 'Viagem', 'Carro', 'Casa', 'Investimento', 'Educação', 'Geral'],
  cartoes: ['Nubank', 'Inter', 'Itaú', 'Bradesco', 'XP', 'Outros']
};

export interface CreditCard {
  id: string;
  name: string;
  limitTotal: number;
  closingDay: number;
  dueDay: number;
  color: string;
}

export interface CreditTransaction {
  id: string;
  cardId: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  installmentsTotal: number;
  installmentNumber: number;
  groupId: string;
  invoiceId?: string;
}

export interface Invoice {
  id: string;
  cardId: string;
  month: number;
  year: number;
  status: 'aberta' | 'fechada' | 'paga';
  totalAmount: number;
}
