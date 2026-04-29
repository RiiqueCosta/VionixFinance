import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  setPersistence,
  browserLocalPersistence,
  User
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc, 
  getDoc,
  serverTimestamp,
  Timestamp,
  getDocFromServer
} from 'firebase/firestore';
import { auth, db } from './lib/firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  // Legacy global handler - simplified as we now use a state-based one in the App component
  console.error('Firestore Error:', error);
}
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, startOfYear, endOfYear, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Transaction, TransactionType, DEFAULT_CATEGORIES, CategoryMap, FinancialGoal } from './types';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Anchor, 
  Shuffle, 
  Calendar, 
  BarChart3, 
  Target, 
  LogOut, 
  Menu, 
  Plus, 
  Minus,
  X,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Scale,
  MoreVertical,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Settings,
  PlusCircle,
  Check,
  Flag,
  Award,
  Clock,
  PieChart as PieIcon
} from 'lucide-react';
// Utils
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const fmt = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// --- Initial Data ---
const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'receita', description: 'Cliente - Suporte TI', amount: 850, category: 'Suporte TI', date: new Date().toISOString() },
  { id: '2', type: 'fixa', description: 'Servidor VPS', amount: 149.90, category: 'Servidores', date: new Date().toISOString(), recurring: true },
  { id: '3', type: 'variavel', description: 'Ferramentas Dev', amount: 320, category: 'Ferramentas', date: new Date().toISOString() },
  { id: '4', type: 'receita', description: 'Projeto Rede', amount: 1700, category: 'Projetos', date: new Date().toISOString() },
  { id: '5', type: 'receita', description: 'Investimentos', amount: 2100, category: 'Investimentos', date: new Date().toISOString() },
];

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authError, setAuthError] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  const [currentPage, setCurrentPage] = useState<'dashboard' | 'receitas' | 'fixas' | 'variaveis' | 'anual' | 'graficos' | 'metas' | 'config'>('dashboard');
  const [categories, setCategories] = useState<CategoryMap>(DEFAULT_CATEGORIES);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleFirestoreError = useCallback((error: any, operationType: OperationType, path: string | null) => {
    const errInfo = {
      error: error?.message || String(error),
      operationType,
      path,
      userId: user?.uid
    };
    console.error('Firestore Error:', JSON.stringify(errInfo));
  }, [user]);

  // Firestore Sync
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setGoals([]);
      setCategories(DEFAULT_CATEGORIES);
      return;
    }

    const tRef = collection(db, 'transactions');
    const tQuery = query(tRef, where('userId', '==', user.uid));
    const unsubscribeTransactions = onSnapshot(tQuery, (snapshot) => {
      const docs = snapshot.docs.map(d => {
        const data = d.data();
        return { 
          id: d.id, 
          ...data,
          amount: Number(data.amount) || 0
        } as Transaction;
      });
      setTransactions(docs);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'transactions'));

    const gRef = collection(db, 'goals');
    const gQuery = query(gRef, where('userId', '==', user.uid));
    const unsubscribeGoals = onSnapshot(gQuery, (snapshot) => {
      const docs = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          targetAmount: Number(data.targetAmount) || 0,
          currentAmount: Number(data.currentAmount) || 0
        } as FinancialGoal;
      });
      setGoals(docs);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'goals'));

    const sRef = doc(db, 'users', user.uid, 'settings', 'data');
    const unsubscribeSettings = onSnapshot(sRef, (snapshot) => {
      if (snapshot.exists()) {
        setCategories(snapshot.data().categories as CategoryMap);
      } else {
        // Initialize settings if they don't exist
        setDoc(sRef, { 
          categories: DEFAULT_CATEGORIES, 
          updatedAt: serverTimestamp() 
        }).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/settings/data`));
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}/settings/data`));

    return () => {
      unsubscribeTransactions();
      unsubscribeGoals();
      unsubscribeSettings();
    };
  }, [user, handleFirestoreError]);

  useEffect(() => {
    // Connection test removed as per request
  }, []);

  // Filters
  const monthlyTransactions = useMemo(() => {
    return transactions.filter(tx => isSameMonth(parseISO(tx.date), selectedMonth));
  }, [transactions, selectedMonth]);

  const summary = useMemo(() => {
    const validTransactions = monthlyTransactions.map(t => ({ ...t, amount: Number(t.amount) || 0 }));
    const receita = validTransactions.filter(t => t.type === 'receita').reduce((s, t) => s + t.amount, 0);
    const fixa = validTransactions.filter(t => t.type === 'fixa').reduce((s, t) => s + t.amount, 0);
    const variavel = validTransactions.filter(t => t.type === 'variavel').reduce((s, t) => s + t.amount, 0);
    return { 
      receita: receita || 0, 
      fixa: fixa || 0, 
      variavel: variavel || 0, 
      totalDespesa: (fixa + variavel) || 0, 
      saldo: (receita - (fixa + variavel)) || 0 
    };
  }, [monthlyTransactions]);

  const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'transactions'), {
        ...tx,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'transactions');
    }
  };

  const updateTransaction = async (tx: Transaction) => {
    if (!user) return;
    try {
      const { id, ...data } = tx;
      await updateDoc(doc(db, 'transactions', id), {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `transactions/${tx.id}`);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `transactions/${id}`);
    }
  };

  const addGoal = async (g: Omit<FinancialGoal, 'id'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'goals'), {
        ...g,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'goals');
    }
  };

  const updateGoal = async (id: string, amount: number) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'goals', id), {
        currentAmount: amount,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `goals/${id}`);
    }
  };

  const deleteGoal = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'goals', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `goals/${id}`);
    }
  };

  const updateCategories = async (newCategories: CategoryMap) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid, 'settings', 'data'), {
        categories: newCategories,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/settings/data`);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthSubmitting(true);
    try {
      // Garante persistência da sessão
      await setPersistence(auth, browserLocalPersistence);
      
      if (authMode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      let message = err.message;
      if (err.code === 'auth/invalid-credential') {
        message = authMode === 'signin' 
          ? "E-mail ou senha incorretos. Verifique seus dados ou crie uma conta." 
          : "Erro ao criar conta. Verifique os dados informados.";
      } else if (err.code === 'auth/email-already-in-use') {
        message = "Este e-mail já está em uso. Tente fazer login.";
      } else if (err.code === 'auth/weak-password') {
        message = "A senha deve ter pelo menos 6 caracteres.";
      } else if (err.code === 'auth/invalid-email') {
        message = "Formato de e-mail inválido.";
      } else if (err.code === 'auth/operation-not-allowed') {
        message = "O método de login por e-mail e senha não está ativado no Firebase Console. Por favor, ative-o em 'Authentication > Sign-in method'.";
      } else {
        message = `Erro: ${err.message} (${err.code})`;
      }
      setAuthError(message);
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentPage('dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-black text-3xl text-white shadow-2xl mb-8"
        >
          V
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight">Vionix Finance</h2>
          <p className="text-v-muted text-sm font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            Sincronizando ambiente seguro...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 md:p-6 overflow-y-auto relative custom-scrollbar">
        <main className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 relative z-10 py-8">
          <section className="v-panel p-6 md:p-10 flex flex-col justify-center bg-gradient-to-br from-primary/20 to-secondary/10">
            <div className="flex items-center gap-3 mb-6 md:mb-8">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-[15px] bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-black text-xl md:text-2xl text-white shadow-lg shadow-primary/35">V</div>
              <div>
                <strong className="block text-xl md:text-2xl tracking-tighter leading-none">Vionix</strong>
                <span className="text-secondary font-bold text-xs md:text-sm">Finance</span>
              </div>
            </div>
            <h1 className="text-2xl md:text-5xl font-extrabold tracking-tight leading-[1.1] mb-4 md:mb-6">
              Controle seu dinheiro com uma experiência premium.
            </h1>
            <p className="text-v-muted text-sm md:text-lg leading-relaxed">
              Dashboard moderno para gestão financeira, metas, despesas, receitas e relatórios detalhados.
            </p>
          </section>

          <section className="v-panel p-6 md:p-10 self-center">
            <p className="v-eyebrow mb-2">Acesso seguro</p>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">
              {authMode === 'signin' ? 'Entrar na conta' : 'Criar nova conta'}
            </h2>
            <form className="space-y-4" onSubmit={handleAuth}>
              <div className="space-y-1.5">
                <label className="text-[11px] md:text-[13px] font-black text-v-muted uppercase tracking-widest pl-1">E-mail</label>
                <input 
                  type="email" 
                  placeholder="seuemail@exemplo.com" 
                  className="w-full bg-white/5 border border-v-border rounded-[14px] p-3.5 md:p-4 text-[#E6E9F2] text-sm md:text-base outline-none focus:border-secondary transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] md:text-[13px] font-black text-v-muted uppercase tracking-widest pl-1">Senha</label>
                <input 
                  type="password" 
                  placeholder="********" 
                  className="w-full bg-white/5 border border-v-border rounded-[14px] p-3.5 md:p-4 text-[#E6E9F2] text-sm md:text-base outline-none focus:border-secondary transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              {authError && (
                <p className="text-danger text-xs font-bold bg-danger/10 p-3 rounded-lg border border-danger/20">
                  {authError}
                </p>
              )}

              <button 
                type="submit" 
                disabled={isAuthSubmitting}
                className="v-btn-primary w-full py-4 mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAuthSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  authMode === 'signin' ? 'Entrar na Conta' : 'Criar Conta'
                )}
              </button>
            </form>
            <p className="mt-8 text-center text-v-muted text-[11px] md:text-sm">
              {authMode === 'signin' ? (
                <>Ainda não tem conta? <span onClick={() => { setAuthMode('signup'); setAuthError(null); }} className="text-secondary font-extrabold cursor-pointer hover:underline">Criar agora</span></>
              ) : (
                <>Já tem uma conta? <span onClick={() => { setAuthMode('signin'); setAuthError(null); }} className="text-secondary font-extrabold cursor-pointer hover:underline">Entrar aqui</span></>
              )}
            </p>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden font-sans">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-[100] bg-dark/80 backdrop-blur-md lg:hidden" 
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-[110] w-[280px] bg-[#070B16] border-r border-v-border transition-transform duration-300 backdrop-blur-xl lg:relative lg:translate-x-0 lg:z-0",
        isSidebarOpen ? "translate-x-0 shadow-2xl shadow-black/50" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 rounded-[15px] bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-black text-xl text-white shadow-[0_10px_35px_rgba(108,75,255,0.35)]">V</div>
            <div>
              <strong className="block text-xl tracking-tighter leading-none">Vionix</strong>
              <span className="text-secondary font-bold text-xs uppercase tracking-wider">Finance</span>
            </div>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
            <NavBtn active={currentPage === 'dashboard'} onClick={() => { setCurrentPage('dashboard'); setIsSidebarOpen(false); }}>
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </NavBtn>
            <NavBtn active={currentPage === 'receitas'} onClick={() => { setCurrentPage('receitas'); setIsSidebarOpen(false); }}>
              <TrendingUp className="w-4 h-4" /> Receitas
            </NavBtn>
            <NavBtn active={currentPage === 'fixas'} onClick={() => { setCurrentPage('fixas'); setIsSidebarOpen(false); }}>
              <Anchor className="w-4 h-4" /> Despesas Fixas
            </NavBtn>
            <NavBtn active={currentPage === 'variaveis'} onClick={() => { setCurrentPage('variaveis'); setIsSidebarOpen(false); }}>
              <Shuffle className="w-4 h-4" /> Despesas Variáveis
            </NavBtn>
            <NavBtn active={currentPage === 'metas'} onClick={() => { setCurrentPage('metas'); setIsSidebarOpen(false); }}>
              <Target className="w-4 h-4" /> Metas
            </NavBtn>
            <NavBtn active={currentPage === 'anual'} onClick={() => { setCurrentPage('anual'); setIsSidebarOpen(false); }}>
              <Calendar className="w-4 h-4" /> Relatórios
            </NavBtn>
            <NavBtn active={currentPage === 'config'} onClick={() => { setCurrentPage('config'); setIsSidebarOpen(false); }}>
              <Settings className="w-4 h-4" /> Configurações
            </NavBtn>
          </nav>

          <div className="mt-8 p-5 v-panel bg-gradient-to-br from-primary/20 to-secondary/10">
            <p className="text-v-muted text-[11px] font-bold uppercase tracking-widest mb-1">Plano atual</p>
            <strong className="block text-sm mb-4 font-extrabold">Vionix Pro</strong>
            <button className="v-btn-primary w-full py-2.5 text-xs">Atualizar plano</button>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center w-full gap-3 px-4 py-3 mt-6 text-sm font-bold text-v-muted hover:text-white rounded-xl transition-colors hover:bg-white/5"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-4 py-4 md:px-6 md:py-6 border-b border-v-border gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-white bg-white/5 border border-v-border rounded-[12px] lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <p className="v-eyebrow truncate flex items-center gap-2">
                {currentPage === 'dashboard' ? 'Visão Geral' : 'Controle'}
                {user && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-v-border" />
                    <span className="text-secondary lowercase font-bold">{user.email}</span>
                  </>
                )}
              </p>
              <h1 className="text-xl md:text-2xl font-black tracking-tighter capitalize truncate">
                {currentPage === 'dashboard' ? 'Dashboard Financeiro' : 
                 currentPage === 'anual' ? 'Visão Anual' : 
                 currentPage === 'graficos' ? 'Relatórios Financeiros' : 
                 currentPage === 'metas' ? 'Metas e Objetivos' : 
                 currentPage.replace(/s$/, 's de caixa')}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex-1 sm:flex-none flex items-center bg-white/5 border border-v-border rounded-[14px] p-1 shadow-inner max-w-[180px] sm:max-w-none">
              <button 
                onClick={() => setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                className="p-1.5 sm:p-2 hover:bg-white/5 rounded-[12px] text-v-muted hover:text-white transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex-1 px-2 text-[10px] sm:text-xs font-black uppercase tracking-widest text-center whitespace-nowrap">
                {format(selectedMonth, 'MMM yyyy', { locale: ptBR })}
              </div>
              <button 
                onClick={() => setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                className="p-1.5 sm:p-2 hover:bg-white/5 rounded-[12px] text-v-muted hover:text-white transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <button 
              onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }}
              className="v-btn-primary shrink-0 px-3 py-2 sm:px-4 sm:py-2.5"
            >
              <Plus className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Nova transação</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8 pb-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                {currentPage === 'dashboard' && (
                  <DashboardView summary={summary} transactions={monthlyTransactions} allTransactions={transactions} selectedMonth={selectedMonth} goals={goals} />
                )}
                {(currentPage === 'receitas' || currentPage === 'fixas' || currentPage === 'variaveis') && (
                  <TransactionListView 
                    type={currentPage === 'variaveis' ? 'variavel' : currentPage.replace(/s$/, '') as TransactionType} 
                    transactions={monthlyTransactions} 
                    onEdit={(tx) => { setEditingTransaction(tx); setIsModalOpen(true); }}
                    onDelete={deleteTransaction}
                  />
                )}
                {currentPage === 'anual' && (
                  <AnnualView transactions={transactions} selectedYear={selectedMonth.getFullYear()} />
                )}
                {currentPage === 'metas' && (
                  <GoalsView goals={goals} onAdd={addGoal} onUpdate={updateGoal} onDelete={deleteGoal} />
                )}
                {currentPage === 'config' && (
                  <SettingsView categories={categories} onUpdate={updateCategories} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Transaction Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-dark/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-lg v-panel bg-dark-2 overflow-y-auto max-h-[90vh] custom-scrollbar"
            >
              <TransactionForm 
                onClose={() => setIsModalOpen(false)} 
                onSave={(tx) => { 
                  if (editingTransaction) updateTransaction({ ...editingTransaction, ...tx });
                  else addTransaction(tx);
                  setIsModalOpen(false);
                }}
                initialData={editingTransaction}
                categories={categories}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sub-Components ---

function NavBtn({ active, children, onClick }: { active: boolean, children: React.ReactNode, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center w-full gap-3 px-4 py-3.5 text-[15px] font-semibold transition-all rounded-[15px]",
        active 
          ? "bg-gradient-to-br from-primary/20 to-secondary/10 text-white border border-v-border shadow-lg" 
          : "text-v-muted hover:text-white hover:bg-white/5"
      )}
    >
      {children}
    </button>
  );
}

function DashboardView({ summary, transactions, allTransactions, selectedMonth, goals }: { summary: any, transactions: Transaction[], allTransactions: Transaction[], selectedMonth: Date, goals: FinancialGoal[] }) {
  const { growthData, monthlyGoalData, statsComparison } = useMemo(() => {
    // Current Period
    const currentProfit = summary.receita - summary.totalDespesa;
    
    // Previous Period
    const prevMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1);
    const prevMonthTxs = allTransactions.filter(tx => isSameMonth(parseISO(tx.date), prevMonth));
    const prevReceita = prevMonthTxs.filter(t => t.type === 'receita').reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const prevDespesa = prevMonthTxs.filter(t => t.type !== 'receita').reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const prevProfit = prevReceita - prevDespesa;

    // Growth calculation
    let growth = 0;
    if (prevProfit !== 0) {
      growth = ((currentProfit - prevProfit) / Math.abs(prevProfit)) * 100;
    } else if (currentProfit > 0) {
      growth = 100;
    }

    // Monthly Goal calculation (using first goal or default)
    const activeGoal = goals[0];
    const goalPercent = activeGoal ? Math.min(100, (activeGoal.currentAmount / activeGoal.targetAmount) * 100) : 0;
    const goalText = activeGoal ? `${fmt(activeGoal.currentAmount)} de ${fmt(activeGoal.targetAmount)}` : 'Nenhuma meta definida';

    // Stats comparisons
    const revDiff = prevReceita === 0 ? 100 : ((summary.receita - prevReceita) / prevReceita) * 100;
    const expDiff = prevDespesa === 0 ? 100 : ((summary.totalDespesa - prevDespesa) / prevDespesa) * 100;

    return {
      growthData: {
        value: growth,
        isPositive: growth >= 0
      },
      monthlyGoalData: {
        percent: goalPercent,
        text: goalText,
        title: activeGoal ? activeGoal.title : 'Meta Mensal'
      },
      statsComparison: {
        rev: revDiff,
        exp: expDiff
      }
    };
  }, [summary, allTransactions, selectedMonth, goals]);

  const chartData = useMemo(() => {
    const months = eachMonthOfInterval({
      start: startOfYear(selectedMonth),
      end: endOfYear(selectedMonth)
    });

    return months.map(m => {
      const monthTxs = allTransactions.filter(t => isSameMonth(parseISO(t.date), m));
      const r = monthTxs.filter(t => t.type === 'receita').reduce((s, t) => s + t.amount, 0);
      const d = monthTxs.filter(t => t.type !== 'receita').reduce((s, t) => s + t.amount, 0);
      return {
        name: format(m, 'MMM', { locale: ptBR }),
        receita: r,
        despesa: d,
        saldo: r - d
      };
    });
  }, [allTransactions, selectedMonth]);

  const recentTxs = useMemo(() => {
    return [...transactions].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()).slice(0, 4);
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <section className="v-panel p-6 md:p-10 min-h-[190px] flex flex-col md:flex-row items-center justify-between overflow-hidden relative group">
        <div className="relative z-10 space-y-2 text-center md:text-left mb-6 md:mb-0">
          <p className="v-eyebrow">Saldo disponível</p>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">{fmt(summary.saldo)}</h2>
          <p className="text-v-muted text-sm md:text-base max-w-md">Seu dinheiro organizado com inteligência, clareza e controle total.</p>
        </div>
        <div className="z-10 p-5 md:p-6 rounded-[22px] bg-success/10 border border-success/20 flex flex-col items-center justify-center shrink-0 min-w-[180px] md:min-w-[200px]">
          <span className={cn(
            "block font-black text-3xl md:text-4xl tracking-tighter leading-none mb-1",
            growthData.isPositive ? "text-success" : "text-danger"
          )}>
            {growthData.isPositive ? '▲' : '▼'} {Math.abs(growthData.value).toFixed(1)}%
          </span>
          <small className="text-v-muted font-bold uppercase text-[9px] md:text-[10px] tracking-widest leading-none">lucratividade mensal</small>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-[-120px] right-[-90px] w-[300px] h-[300px] bg-secondary/10 blur-[100px] rounded-full" />
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Receitas" 
          amount={summary.receita} 
          subtext={`${statsComparison.rev >= 0 ? '+' : ''}${statsComparison.rev.toFixed(1)}% que o mês anterior`} 
          variant="success" 
        />
        <StatCard 
          title="Despesas" 
          amount={summary.totalDespesa} 
          subtext={`${statsComparison.exp >= 0 ? '+' : ''}${statsComparison.exp.toFixed(1)}% vs mês passado`} 
          variant="danger" 
        />
        <StatCard 
          title={monthlyGoalData.title} 
          amount={Math.round(monthlyGoalData.percent)} 
          subtext={monthlyGoalData.text} 
          variant="secondary" 
          isPercentage 
        />
        <StatCard 
          title="Saldo Líquido" 
          amount={summary.saldo} 
          subtext="performance do período" 
          variant={summary.saldo >= 0 ? "warning" : "danger"} 
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Panel */}
        <div className="lg:col-span-2 v-panel p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <p className="v-eyebrow">Performance</p>
              <h3 className="text-xl md:text-2xl font-black tracking-tighter">Fluxo financeiro</h3>
            </div>
            <select className="w-full sm:w-auto bg-white/5 border border-v-border rounded-[12px] p-2 text-[10px] sm:text-xs font-black outline-none text-v-muted focus:text-white uppercase tracking-widest">
              <option>Últimos 12 meses</option>
              <option>Este ano</option>
            </select>
          </div>
          <div className="h-48 md:h-64 brightness-110">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="vColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00D4FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00D4FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fill: '#8A92A6', fontWeight: 800 }} 
                  dy={10}
                  interval="preserveStartEnd"
                  minTickGap={20}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#12182B', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 80px rgba(0,0,0,0.5)', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="receita" stroke="#00D4FF" strokeWidth={3} fill="url(#vColor)" animationDuration={1500} />
                <Area type="monotone" dataKey="despesa" stroke="#FF4B6E" strokeWidth={3} fillOpacity={0} animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Goals Summary (Simplified for Dashboard) */}
        <div className="v-panel p-6 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="v-eyebrow">Objetivos</p>
              <h3 className="text-2xl font-black tracking-tighter">Minhas Metas</h3>
            </div>
            <Target className="w-5 h-5 text-secondary animate-pulse" />
          </div>
          <div className="flex-1 space-y-6">
            {goals.slice(0, 3).map(goal => {
              const target = goal.targetAmount || 1;
              const progress = Math.min(100, (goal.currentAmount / target) * 100);
              return (
                <div key={goal.id} className="space-y-2 group cursor-pointer">
                  <div className="flex justify-between items-center text-xs font-bold mb-1">
                    <span className="text-white group-hover:text-secondary transition-colors truncate max-w-[140px]">{goal.title}</span>
                    <span className="text-v-muted">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-v-border/30">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" 
                    />
                  </div>
                </div>
              );
            })}
            {goals.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
                <Target className="w-12 h-12 mb-3" />
                <p className="text-[10px] font-black uppercase tracking-widest">Sem metas planejadas</p>
              </div>
            )}
            {goals.length > 3 && (
              <p className="text-[10px] font-black uppercase tracking-widest text-v-muted text-center pt-2">
                + {goals.length - 3} outras metas
              </p>
            )}
          </div>
          <div className="mt-8 pt-6 border-t border-v-border">
             <button className="v-btn-primary w-full py-3 text-xs flex items-center justify-center gap-2">
               Acessar Plano <ArrowUpRight className="w-3 h-3" />
             </button>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="v-panel p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="v-eyebrow">Movimentações</p>
              <h3 className="text-2xl font-black tracking-tighter">Últimas Atividades</h3>
            </div>
            <button className="v-btn-ghost py-1.5 px-3 text-[10px]">Ver extrato completo</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
            {recentTxs.map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 border border-v-border shadow-inner font-black text-sm transition-all group-hover:scale-110",
                    tx.type === 'receita' ? "text-success bg-success/5 border-success/20" : "text-danger bg-danger/5 border-danger/20"
                  )}>
                    {tx.type === 'receita' ? 'R' : 'D'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{tx.description}</p>
                    <p className="text-[10px] font-black text-v-muted uppercase tracking-widest">{tx.category} • {format(parseISO(tx.date), 'dd MMM', { locale: ptBR })}</p>
                  </div>
                </div>
                <p className={cn(
                  "text-sm font-mono font-bold tracking-tighter",
                  tx.type === 'receita' ? "text-success" : "text-white"
                )}>
                  {tx.type === 'receita' ? '+' : '-'}{fmt(tx.amount)}
                </p>
              </div>
            ))}
          </div>
          {recentTxs.length === 0 && (
            <div className="py-20 text-center opacity-30">
               <Shuffle className="w-12 h-12 mx-auto mb-4 text-v-muted" />
               <p className="italic text-sm font-bold uppercase tracking-widest">Nenhuma movimentação registrada</p>
            </div>
          )}
      </div>
    </div>
  );
}

function StatCard({ title, amount, subtext, variant, isPercentage }: { title: string, amount: number, subtext: string, variant: 'success' | 'danger' | 'secondary' | 'warning', isPercentage?: boolean }) {
  const colors = {
    success: "text-success font-black",
    danger: "text-danger font-black",
    secondary: "text-secondary font-black",
    warning: "text-warning font-black"
  };

  return (
    <article className="v-panel p-5 md:p-6 transition-all hover:translate-y-[-4px] cursor-default group">
      <span className="text-[11px] md:text-[13px] font-bold text-v-muted group-hover:text-white transition-colors uppercase tracking-widest leading-none">{title}</span>
      <strong className={cn("block text-2xl md:text-3xl tracking-tighter leading-none my-2 md:my-3", colors[variant])}>
        {isPercentage ? `${amount}%` : fmt(amount)}
      </strong>
      <small className="text-v-muted font-medium text-[10px] md:text-[11px] uppercase tracking-wide leading-none">{subtext}</small>
    </article>
  );
}

function TransactionListView({ type, transactions, onEdit, onDelete }: { type: TransactionType, transactions: Transaction[], onEdit: (tx: Transaction) => void, onDelete: (id: string) => void }) {
  const filtered = transactions.filter(t => t.type === type);
  const total = filtered.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
       <div className="v-panel p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="relative z-10 text-center md:text-left">
          <p className="v-eyebrow mb-1">Total {type === 'receita' ? 'de Entradas' : 'em Despesas'}</p>
          <h2 className={cn("text-4xl md:text-6xl font-black tracking-tighter leading-none", type === 'receita' ? 'text-success' : 'text-danger')}>{fmt(total)}</h2>
          <p className="text-v-muted text-[10px] md:text-sm font-bold uppercase tracking-widest mt-2">{filtered.length} transações processadas</p>
        </div>
        <div className="z-10 flex gap-2 w-full md:w-auto">
           <button className="v-btn-ghost flex-1 md:flex-none justify-center px-6"><Download className="w-4 h-4 mr-2 inline" /> Exportar</button>
        </div>
        <div className={cn("absolute right-[-100px] top-[-100px] w-[300px] h-[300px] blur-[120px] rounded-full opacity-20", type === 'receita' ? 'bg-success' : 'bg-danger')} />
      </div>

      <div className="v-panel overflow-hidden">
        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-v-border text-left">
                <th className="p-5 v-eyebrow">Descrição</th>
                <th className="p-5 v-eyebrow">Categoria</th>
                <th className="p-5 v-eyebrow">Data</th>
                <th className="p-5 v-eyebrow text-right">Valor</th>
                <th className="p-5 v-eyebrow text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(tx => (
                <tr key={tx.id} className="border-b border-v-border/30 hover:bg-white/[0.02] transition-colors group">
                  <td className="p-5 text-sm font-extrabold text-white">{tx.description}</td>
                  <td className="p-5 text-xs font-black text-v-muted uppercase tracking-widest">{tx.category}</td>
                  <td className="p-5 text-xs font-bold text-v-muted">{format(parseISO(tx.date), 'dd/MM/yyyy')}</td>
                  <td className={cn("p-5 text-sm font-mono font-black text-right tracking-tighter", type === 'receita' ? "text-success" : "text-danger")}>
                    {type === 'receita' ? '+' : '-'}{fmt(tx.amount)}
                  </td>
                  <td className="p-5">
                    <div className="flex items-center justify-center gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onEdit(tx)} className="p-2 text-v-muted hover:text-white hover:bg-white/5 rounded-xl transition-all"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => onDelete(tx.id)} className="p-2 text-v-muted hover:text-danger hover:bg-danger/5 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards */}
        <div className="md:hidden divide-y divide-v-border/50">
          {filtered.map(tx => (
            <div key={tx.id} className="p-5 space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <h4 className="text-sm font-extrabold text-white truncate">{tx.description}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-black text-v-muted uppercase tracking-widest">{tx.category}</span>
                    <span className="text-[9px] font-bold text-v-muted">| {format(parseISO(tx.date), 'dd/MM/yyyy')}</span>
                  </div>
                </div>
                <p className={cn("text-base font-mono font-black tracking-tighter shrink-0", type === 'receita' ? "text-success" : "text-danger")}>
                  {type === 'receita' ? '+' : '-'}{fmt(tx.amount)}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onEdit(tx)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 text-xs font-bold text-v-muted rounded-xl border border-v-border"><Edit2 className="w-3.5 h-3.5" /> Editar</button>
                <button onClick={() => onDelete(tx.id)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-danger/10 text-xs font-bold text-danger rounded-xl border border-danger/10"><Trash2 className="w-3.5 h-3.5" /> Excluir</button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="p-20 text-center text-v-muted italic font-bold uppercase tracking-widest text-xs opacity-40">
            Sem movimentações para exibir
          </div>
        )}
      </div>
    </div>
  );
}

function TransactionForm({ onClose, onSave, initialData, categories }: { onClose: () => void, onSave: (tx: Omit<Transaction, 'id'>) => void, initialData?: Transaction | null, categories: CategoryMap }) {
  const [formData, setFormData] = useState<Omit<Transaction, 'id'>>({
    type: initialData?.type || 'receita',
    description: initialData?.description || '',
    amount: initialData?.amount || 0,
    category: initialData?.category || categories.receita[0],
    date: initialData?.date || new Date().toISOString(),
    note: initialData?.note || '',
    recurring: initialData?.recurring || false
  });

  useEffect(() => {
    if (!initialData) {
      setFormData(prev => ({ ...prev, category: categories[formData.type][0] || 'Outros' }));
    }
  }, [formData.type, categories, initialData]);

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-6 md:p-10 space-y-6 md:space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl md:text-3xl font-black tracking-tighter">{initialData ? 'Editar Transação' : 'Nova Transação'}</h3>
        <button type="button" onClick={onClose} className="p-2 md:p-2.5 bg-white/5 border border-v-border rounded-[15px] text-v-muted hover:text-white transition-all"><X className="w-5 h-5" /></button>
      </div>

      <div className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-3 gap-1.5 md:gap-2 bg-white/5 border border-v-border p-1.5 rounded-[20px]">
          {(['receita', 'fixa', 'variavel'] as TransactionType[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: t, category: categories[t][0] || 'Outros' }))}
              className={cn(
                "py-2.5 text-[9px] md:text-[10px] font-black rounded-[15px] transition-all uppercase tracking-widest leading-none",
                formData.type === t 
                  ? "v-btn-primary shadow-none"
                  : "text-v-muted hover:text-white hover:bg-white/5"
              )}
            >
              {t === 'fixa' ? 'Fixa' : t === 'variavel' ? 'Variável' : 'Receita'}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="v-eyebrow pl-1">Descrição</label>
            <input required type="text" placeholder="Ex: Cliente X, Internet..." className="w-full bg-white/5 border border-v-border rounded-[14px] p-4 text-[#E6E9F2] outline-none focus:border-secondary transition-colors text-sm" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="v-eyebrow pl-1">Valor (R$)</label>
              <input 
                required 
                type="number" 
                step="0.01" 
                className="w-full bg-white/5 border border-v-border rounded-[14px] p-4 text-[#E6E9F2] outline-none focus:border-secondary transition-colors font-mono font-bold text-sm" 
                value={isNaN(formData.amount) ? '' : formData.amount} 
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  setFormData(p => ({ ...p, amount: isNaN(val) ? 0 : val }));
                }} 
              />
            </div>
            <div className="space-y-2">
              <label className="v-eyebrow pl-1">Data</label>
              <input required type="date" className="w-full bg-white/5 border border-v-border rounded-[14px] p-4 text-[#E6E9F2] outline-none focus:border-secondary transition-colors font-bold text-sm text-center" value={formData.date.split('T')[0]} onChange={e => setFormData(p => ({ ...p, date: new Date(e.target.value).toISOString() }))} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="v-eyebrow pl-1">Categoria</label>
            <select className="w-full bg-white/5 border border-v-border rounded-[14px] p-4 text-[#E6E9F2] outline-none focus:border-secondary transition-colors appearance-none font-bold text-sm" value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}>
              {(categories[formData.type] || []).map((c: string) => <option key={c} value={c} className="bg-dark-2">{c}</option>)}
            </select>
          </div>
        </div>

        <button type="submit" className="v-btn-primary w-full py-4 mt-2 md:mt-4 shadow-xl">
          {initialData ? 'Atualizar Transação' : 'Criar Transação'}
        </button>
      </div>
    </form>
  );
}

function AnnualView({ transactions, selectedYear }: { transactions: Transaction[], selectedYear: number }) {
  const months = eachMonthOfInterval({ start: startOfYear(new Date(selectedYear, 0, 1)), end: endOfYear(new Date(selectedYear, 0, 1)) });
  
  const data = useMemo(() => months.map(m => {
    const monthTxs = transactions.filter(t => isSameMonth(parseISO(t.date), m));
    const r = monthTxs.filter(t => t.type === 'receita').reduce((s, t) => s + t.amount, 0);
    const d = monthTxs.filter(t => t.type !== 'receita').reduce((s, t) => s + t.amount, 0);
    return { name: format(m, 'MMM', { locale: ptBR }), receita: r, despesa: d, saldo: r - d };
  }), [transactions, months]);

  return (
    <div className="space-y-4">
      {/* Table for Desktop */}
      <div className="hidden lg:block v-panel overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-v-border text-left">
                <th className="p-5 v-eyebrow sticky left-0 bg-[#12182B] z-10 border-r border-v-border">Mês</th>
                <th className="p-5 v-eyebrow text-right text-success">Receitas</th>
                <th className="p-5 v-eyebrow text-right text-danger">Despesas</th>
                <th className="p-5 v-eyebrow text-right">Saldo Líquido</th>
              </tr>
            </thead>
            <tbody>
              {data.map(d => (
                <tr key={d.name} className="border-b border-v-border/30 hover:bg-white/[0.02]">
                  <td className="p-5 font-black text-white sticky left-0 bg-[#12182B] z-10 border-r border-v-border/50 uppercase tracking-widest text-[11px]">{d.name}</td>
                  <td className="p-5 text-right font-mono text-success font-bold">{fmt(d.receita)}</td>
                  <td className="p-5 text-right font-mono text-danger font-bold">{fmt(d.despesa)}</td>
                  <td className={cn("p-5 text-right font-mono font-black tracking-tighter", d.saldo >= 0 ? "text-secondary" : "text-danger")}>{fmt(d.saldo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards for Mobile/Tablet */}
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.map(d => (
          <div key={d.name} className="v-panel p-5 space-y-3">
            <div className="flex justify-between items-center border-b border-v-border pb-2 mb-2">
              <span className="text-sm font-black text-white uppercase tracking-widest">{d.name}</span>
              <span className={cn("text-xs font-black px-2 py-1 rounded-lg", d.saldo >= 0 ? "bg-success/10 text-success" : "bg-danger/10 text-danger")}>
                {d.saldo >= 0 ? 'Lucro' : 'Prejuízo'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-v-muted uppercase tracking-widest mb-1">Receitas</p>
                <p className="text-sm font-mono font-bold text-success">{fmt(d.receita)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-v-muted uppercase tracking-widest mb-1">Despesas</p>
                <p className="text-sm font-mono font-bold text-danger">{fmt(d.despesa)}</p>
              </div>
            </div>
            <div className="pt-2 border-t border-v-border">
              <p className="text-[10px] font-bold text-v-muted uppercase tracking-widest mb-1">Resultado</p>
              <p className={cn("text-base font-mono font-black tracking-tighter", d.saldo >= 0 ? "text-secondary" : "text-danger")}>{fmt(d.saldo)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}





function SettingsView({ categories, onUpdate }: { categories: CategoryMap, onUpdate: (cats: CategoryMap) => void }) {
  const [newCat, setNewCat] = useState('');
  const [activeType, setActiveType] = useState<TransactionType>('receita');

  const addCategory = () => {
    if (!newCat.trim()) return;
    if (categories[activeType].includes(newCat.trim())) {
      setNewCat('');
      return;
    }
    
    onUpdate({
      ...categories,
      [activeType]: [...categories[activeType], newCat.trim()]
    });
    setNewCat('');
  };

  const removeCategory = (cat: string) => {
    onUpdate({
      ...categories,
      [activeType]: categories[activeType].filter(c => c !== cat)
    });
  };

  return (
    <div className="space-y-6">
      <div className="v-panel p-6 md:p-10 bg-gradient-to-br from-primary/10 to-secondary/5 relative overflow-hidden">
        <div className="relative z-10">
          <p className="v-eyebrow mb-2">Central de Cadastros</p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter leading-none mb-4">Gerencie seu sistema</h2>
          <p className="text-v-muted text-sm md:text-base max-w-xl">Adicione ou remova categorias personalizadas para organizar suas finanças do seu jeito.</p>
        </div>
        <div className="absolute right-[-20px] top-[-20px] w-48 h-48 bg-primary/10 blur-[60px] rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-2">
          {(['receita', 'fixa', 'variavel'] as TransactionType[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveType(t)}
              className={cn(
                "w-full flex items-center justify-between p-5 rounded-[20px] border transition-all font-bold text-sm uppercase tracking-widest",
                activeType === t 
                  ? "bg-white/10 border-white/20 text-white shadow-xl" 
                  : "bg-white/5 border-v-border text-v-muted hover:bg-white/[0.08]"
              )}
            >
              {t === 'receita' ? 'Receitas' : t === 'fixa' ? 'Despesas Fixas' : 'Despesas Variáveis'}
              {activeType === t && <Check className="w-4 h-4 text-secondary" />}
            </button>
          ))}
        </div>

        <div className="lg:col-span-2 v-panel p-6 md:p-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <input 
              type="text" 
              placeholder="Nome da nova categoria..." 
              className="flex-1 bg-white/5 border border-v-border rounded-[14px] p-4 text-[#E6E9F2] outline-none focus:border-secondary transition-colors text-sm"
              value={newCat}
              onChange={e => setNewCat(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCategory()}
            />
            <button 
              type="button"
              onClick={addCategory}
              className="v-btn-primary flex items-center justify-center gap-2 py-4 px-8"
            >
              <PlusCircle className="w-5 h-5" /> Adicionar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories[activeType].map(cat => (
              <div key={cat} className="group flex items-center justify-between p-4 rounded-[15px] bg-white/5 border border-v-border hover:border-white/20 transition-all hover:bg-white/[0.08]">
                <span className="text-sm font-bold text-v-muted group-hover:text-white transition-colors">{cat}</span>
                <button 
                  type="button"
                  onClick={() => removeCategory(cat)}
                  className="p-2 text-v-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {categories[activeType].length === 0 && (
              <div className="col-span-full py-10 text-center text-v-muted italic font-bold uppercase tracking-widest text-xs opacity-40">
                Nenhuma categoria cadastrada
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function GoalsView({ goals, onAdd, onUpdate, onDelete }: { goals: FinancialGoal[], onAdd: (g: Omit<FinancialGoal, 'id'>) => void, onUpdate: (id: string, amount: number) => void, onDelete: (id: string) => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<FinancialGoal>>({
    title: '',
    targetAmount: 0,
    currentAmount: 0,
    category: 'Reserva'
  });

  const addGoal = () => {
    if (!newGoal.title || !newGoal.targetAmount) return;
    onAdd({
      title: newGoal.title!,
      targetAmount: Number(newGoal.targetAmount),
      currentAmount: Number(newGoal.currentAmount) || 0,
      category: newGoal.category || 'Geral',
      deadline: newGoal.deadline
    });
    setIsAdding(false);
    setNewGoal({ title: '', targetAmount: 0, currentAmount: 0, category: 'Reserva' });
  };

  return (
    <div className="space-y-6">
      <div className="v-panel p-6 md:p-10 bg-gradient-to-br from-primary/10 to-secondary/5 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="v-eyebrow mb-2">Engajamento Financeiro</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter leading-none mb-4">Plano de Metas</h2>
            <p className="text-v-muted text-sm md:text-base max-w-xl">Transforme seus sonhos em conquistas. Defina objetivos claros e acompanhe sua evolução passo a passo.</p>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="v-btn-primary flex items-center justify-center gap-2 py-4 px-8 shrink-0"
          >
            <PlusCircle className="w-5 h-5" /> Nova Meta
          </button>
        </div>
        <div className="absolute right-[-20px] top-[-20px] w-48 h-48 bg-secondary/10 blur-[60px] rounded-full" />
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="v-panel p-6 mb-6 border-secondary/30 bg-secondary/5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="v-eyebrow pl-1">Título da Meta</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Viagem, Carro novo..." 
                    className="w-full bg-white/5 border border-v-border rounded-[14px] p-4 text-white outline-none focus:border-secondary transition-colors text-sm"
                    value={newGoal.title}
                    onChange={e => setNewGoal(p => ({ ...p, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="v-eyebrow pl-1">Valor Alvo (R$)</label>
                  <input 
                    type="number" 
                    placeholder="0,00" 
                    className="w-full bg-white/5 border border-v-border rounded-[14px] p-4 text-white outline-none focus:border-secondary transition-colors text-sm font-mono"
                    value={isNaN(newGoal.targetAmount!) ? '' : newGoal.targetAmount}
                    onChange={e => {
                      const val = parseFloat(e.target.value);
                      setNewGoal(p => ({ ...p, targetAmount: isNaN(val) ? 0 : val }));
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="v-eyebrow pl-1">Já Poupei (R$)</label>
                  <input 
                    type="number" 
                    placeholder="0,00" 
                    className="w-full bg-white/5 border border-v-border rounded-[14px] p-4 text-white outline-none focus:border-secondary transition-colors text-sm font-mono"
                    value={isNaN(newGoal.currentAmount!) ? '' : newGoal.currentAmount}
                    onChange={e => {
                      const val = parseFloat(e.target.value);
                      setNewGoal(p => ({ ...p, currentAmount: isNaN(val) ? 0 : val }));
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="v-eyebrow pl-1">Categoria</label>
                  <select 
                    className="w-full bg-white/5 border border-v-border rounded-[14px] p-4 text-white outline-none focus:border-secondary transition-colors text-sm"
                    value={newGoal.category}
                    onChange={e => setNewGoal(p => ({ ...p, category: e.target.value }))}
                  >
                    <option value="Reserva" className="bg-dark-2">Reserva</option>
                    <option value="Lazer" className="bg-dark-2">Lazer</option>
                    <option value="Educação" className="bg-dark-2">Educação</option>
                    <option value="Bens" className="bg-dark-2">Bens</option>
                    <option value="Futuro" className="bg-dark-2">Futuro</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={addGoal} className="v-btn-primary flex-1 py-3 text-sm">Criar Meta</button>
                <button onClick={() => setIsAdding(false)} className="v-panel px-6 py-3 text-sm font-bold text-v-muted hover:text-white transition-colors">Cancelar</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        {goals.map(goal => (
          <GoalItem key={goal.id} goal={goal} onUpdate={onUpdate} onDelete={onDelete} />
        ))}
        {goals.length === 0 && !isAdding && (
          <div className="col-span-full v-panel p-20 text-center flex flex-col items-center justify-center opacity-40 border-dashed border-2">
            <Target className="w-16 h-16 mb-4 text-v-muted" />
            <p className="text-v-muted italic font-bold uppercase tracking-widest text-sm">Você ainda não definiu metas financeiras.</p>
            <p className="text-v-muted text-xs mt-2">Clique em "Nova Meta" para começar a planejar seu futuro.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const GoalItem = ({ goal, onUpdate, onDelete }: any) => {
  const target = goal.targetAmount || 1; // Prevent division by zero
  const percent = Math.min(100, Math.max(0, (goal.currentAmount / target) * 100));
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="v-panel p-6 md:p-8 space-y-6 group hover:translate-y-[-4px] transition-all relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-1">
        <button 
          onClick={() => onDelete(goal.id)}
          className="p-2 text-v-muted hover:text-danger hover:bg-danger/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-[16px] bg-white/5 border border-v-border flex items-center justify-center">
          {goal.category === 'Lazer' ? <Shuffle className="w-6 h-6 text-secondary" /> : 
           goal.category === 'Educação' ? <Award className="w-6 h-6 text-primary" /> :
           goal.category === 'Bens' ? <Wallet className="w-6 h-6 text-warning" /> :
           <Flag className="w-6 h-6 text-success" />}
        </div>
        <div>
          <span className="v-eyebrow text-[10px]">{goal.category}</span>
          <h3 className="text-xl font-black tracking-tight text-white">{goal.title}</h3>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <div>
            <p className="v-eyebrow mb-1">Acumulado</p>
            <p className="text-2xl font-black font-mono tracking-tighter text-white">{fmt(goal.currentAmount)}</p>
          </div>
          <div className="text-right">
            <p className="v-eyebrow mb-1">Objetivo</p>
            <p className="text-base font-bold text-v-muted">{fmt(goal.targetAmount)}</p>
          </div>
        </div>

        <div className="w-full h-3 bg-white/5 border border-v-border rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full shadow-[0_0_15px_rgba(0,0,0,0.3)]",
              percent >= 100 ? "bg-success" : percent >= 70 ? "bg-secondary" : percent >= 30 ? "bg-primary" : "bg-warning"
            )}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
          <span className={cn(percent >= 100 ? "text-success" : "text-v-muted")}>
            {percent.toFixed(1)}% Concluído
          </span>
          {remaining > 0 ? (
            <span className="text-v-muted">Faltam {fmt(remaining)}</span>
          ) : (
            <span className="flex items-center gap-1 text-success"><Check className="w-3 h-3" /> Meta Alcançada!</span>
          )}
        </div>
      </div>

      <div className="pt-6 border-t border-v-border space-y-4">
        <div className="flex justify-between items-center">
            <label className="v-eyebrow pl-1 flex items-center gap-2">
                <Clock className="w-3 h-3" /> Evoluir Progresso
            </label>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => onUpdate(goal.id, Math.max(0, goal.currentAmount - 100))}
            className="p-3 bg-white/5 border border-v-border rounded-[12px] text-v-muted hover:text-danger hover:border-danger/30 transition-all"
            title="Remover R$ 100"
          >
            <Minus className="w-4 h-4" />
          </button>
          
          <div className="relative flex-1 group">
            <input 
              type="number" 
              className="w-full bg-white/5 border border-v-border rounded-[12px] p-3 text-white text-center font-mono font-bold text-sm outline-none focus:border-secondary transition-all"
              value={isNaN(goal.currentAmount) ? '' : goal.currentAmount}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onUpdate(goal.id, isNaN(val) ? 0 : val);
              }}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-v-muted font-black opacity-0 group-focus-within:opacity-100 transition-opacity uppercase">BRL</span>
          </div>

          <button 
            type="button"
            onClick={() => onUpdate(goal.id, Math.min(goal.targetAmount, goal.currentAmount + 100))}
            className="p-3 bg-white/5 border border-v-border rounded-[12px] text-v-muted hover:text-success hover:border-success/30 transition-all"
            title="Adicionar R$ 100"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2">
          <button 
            type="button" 
            onClick={() => onUpdate(goal.id, Math.min(goal.targetAmount, goal.currentAmount + 50))}
            className="flex-1 py-1.5 bg-white/5 border border-v-border rounded-lg text-[9px] font-black text-v-muted hover:text-white transition-all uppercase tracking-widest"
          >
            + R$ 50
          </button>
          <button 
            type="button" 
            onClick={() => onUpdate(goal.id, Math.min(goal.targetAmount, goal.currentAmount + 1000))}
            className="flex-1 py-1.5 bg-white/5 border border-v-border rounded-lg text-[9px] font-black text-v-muted hover:text-white transition-all uppercase tracking-widest"
          >
            + R$ 1k
          </button>
          <button 
            type="button" 
            onClick={() => onUpdate(goal.id, goal.targetAmount)}
            className="flex-1 py-1.5 bg-white/5 border border-v-border rounded-lg text-[9px] font-black text-v-muted hover:text-success transition-all uppercase tracking-widest"
          >
            Meta!
          </button>
        </div>
      </div>
    </motion.div>
  );
}

