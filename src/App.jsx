import { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState(() => JSON.parse(localStorage.getItem('transactions')) || []);
  const [savings, setSavings] = useState(() => parseFloat(localStorage.getItem('savings')) || 0);
  const [targetAmount, setTargetAmount] = useState(() => parseFloat(localStorage.getItem('targetAmount')) || 1000);
  
  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('General');
  const [filter, setFilter] = useState(new Date().toISOString().slice(0, 7));
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('savings', savings.toString());
    localStorage.setItem('targetAmount', targetAmount.toString());
  }, [transactions, savings, targetAmount]);

  const addTransaction = (e) => {
    e.preventDefault();
    if (!text || !amount) return;
    setTransactions([...transactions, { id: Date.now(), text, amount: parseFloat(amount), category, date: new Date().toISOString().slice(0, 7) }]);
    setText(''); setAmount(''); setCategory('General');
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const filteredTransactions = transactions.filter(t => t.date === filter);
  const income = filteredTransactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
  const expense = filteredTransactions.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);
  const balance = income - expense;
  const progress = Math.min((savings / (targetAmount || 1)) * 100, 100);

  const categorySpending = filteredTransactions
    .filter(t => t.amount < 0)
    .reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount); return acc; }, {});

  const data = { labels: ['Income', 'Expenses'], datasets: [{ data: [income || 0, expense || 0], backgroundColor: ['#22c55e', '#ef4444'] }] };

  return (
    <SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb">
      <div className="min-h-screen w-full bg-gray-50 p-6 md:p-10">
        <div className="max-w-5xl mx-auto bg-white p-8 shadow-sm rounded-xl border border-gray-100">
          
          {loading ? (
            <div className="space-y-8">
              <Skeleton height={40} width="50%" className="mx-auto" />
              <Skeleton height={50} />
              <div className="grid grid-cols-2 gap-4"><Skeleton height={100} /><Skeleton height={100} /></div>
              <Skeleton height={200} />
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">Personal Finance Manager</h2>

              <div className="flex border-b mb-8">
                {['dashboard', 'add', 'history'].map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 capitalize text-lg font-semibold ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <input type="month" value={filter} onChange={(e) => setFilter(e.target.value)} className="w-full p-3 border rounded" />
                  <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 text-center">
                    <p className="text-sm font-medium text-yellow-700"> Savings Pot</p>
                    <p className="text-3xl font-bold text-yellow-600 my-2">${savings.toFixed(2)}</p>
                    <div className="flex justify-center gap-4">
                      <button onClick={() => setSavings(s => s + 50)} className="bg-yellow-200 px-6 py-2 rounded font-bold">+</button>
                      <button onClick={() => setSavings(s => Math.max(0, s - 50))} className="bg-yellow-200 px-6 py-2 rounded font-bold">-</button>
                    </div>
                  </div>
                  <div className="p-6 bg-white border border-gray-200 rounded-lg">
                    <div className="flex justify-between mb-2"><p className="font-semibold">Goal: ${targetAmount}</p><p className="font-bold text-blue-600">{progress.toFixed(0)}%</p></div>
                    <div className="w-full bg-gray-200 rounded-full h-4"><div className="bg-blue-600 h-4 rounded-full transition-all" style={{ width: `${progress}%` }}></div></div>
                    <input type="number" placeholder="Update Goal" onChange={(e) => setTargetAmount(parseFloat(e.target.value) || 0)} className="mt-4 w-full p-2 border rounded" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-green-50 rounded border border-green-200 text-center"><p>Income</p><p className="text-2xl font-bold text-green-600">+${income.toFixed(2)}</p></div>
                    <div className="p-6 bg-red-50 rounded border border-red-200 text-center"><p>Expenses</p><p className="text-2xl font-bold text-red-600">-${expense.toFixed(2)}</p></div>
                  </div>
                  <div className="text-center text-xl font-bold">Balance: ${balance.toFixed(2)}</div>
                  {(income > 0 || expense > 0) && <div className="w-48 h-48 mx-auto"><Doughnut data={data} /></div>}
                </div>
              )}

              {activeTab === 'add' && (
                <form onSubmit={addTransaction} className="space-y-6">
                  <input placeholder="Description" value={text} onChange={(e) => setText(e.target.value)} className="w-full p-4 border rounded" />
                  <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-4 border rounded" />
                  <select className="w-full p-4 border rounded" onChange={(e) => setCategory(e.target.value)} value={category}>
                    {['General', 'Food', 'Rent', 'Transport', 'Entertainment'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button className="w-full bg-blue-600 text-white p-4 rounded font-bold">Add Transaction</button>
                </form>
              )}

              {activeTab === 'history' && (
                <ul className="space-y-4">
                  {filteredTransactions.map(t => (
                    <li key={t.id} className="flex justify-between items-center p-4 bg-gray-50 rounded border">
                      <div><p className="font-medium text-lg">{t.text}</p><p className="text-xs text-gray-400 uppercase">{t.category}</p></div>
                      <button onClick={() => deleteTransaction(t.id)} className="text-red-500 font-bold p-2">✕</button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </SkeletonTheme>
  );
}

export default App;