import { Transaction } from '../services/geminiService';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Hash, PieChart as PieChartIcon, Tag } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface SummaryDashboardProps {
  transactions: Transaction[];
}

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#f43f5e', '#14b8a6'];

export default function SummaryDashboard({ transactions }: SummaryDashboardProps) {
  const totalIn = transactions.reduce((acc, t) => t.amount > 0 ? acc + t.amount : acc, 0);
  const totalOut = transactions.reduce((acc, t) => t.amount < 0 ? acc + t.amount : acc, 0);
  const net = totalIn + totalOut;
  const count = transactions.length;

  const categoryTotals = transactions.reduce((acc, t) => {
    if (t.amount < 0) {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
    }
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a);

  const chartData = sortedCategories.map(([name, value]) => ({ name, value }));

  const stats = [
    {
      label: 'Transactions',
      value: count,
      icon: Hash,
      color: 'text-slate-600',
      bg: 'bg-slate-100',
      description: 'Records identified'
    },
    {
      label: 'Total Income',
      value: `+$${totalIn.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
      description: 'Total deposits'
    },
    {
      label: 'Total Expenses',
      value: `-$${Math.abs(totalOut).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      icon: TrendingDown,
      color: 'text-rose-600',
      bg: 'bg-rose-100',
      description: 'Total spending'
    },
    {
      label: 'Net Cashflow',
      value: `${net >= 0 ? '+' : ''}$${net.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      icon: PieChartIcon,
      color: net >= 0 ? 'text-indigo-600' : 'text-rose-700',
      bg: net >= 0 ? 'bg-indigo-100' : 'bg-rose-100',
      description: 'Balance change'
    }
  ];

  return (
    <div className="space-y-6 mb-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-indigo-200 transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon size={18} />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">{stat.label}</p>
            </div>
            <h4 className={`text-2xl font-black tracking-tight font-mono ${stat.color}`}>
              {stat.value}
            </h4>
            <p className="text-[10px] text-slate-400 mt-1 uppercase font-medium">{stat.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Breakdown List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Tag size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Spending Breakdown</h3>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">By Category</p>
            </div>
          </div>

          <div className="space-y-6 flex-1">
            {sortedCategories.slice(0, 5).map(([category, amount], i) => (
              <div key={category} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-semibold text-slate-700">{category}</span>
                  <span className="text-sm font-mono font-bold text-slate-900">
                    ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(amount / Math.abs(totalOut)) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                    className="h-full bg-indigo-500 rounded-full"
                  />
                </div>
              </div>
            ))}
            {sortedCategories.length === 0 && (
              <p className="text-sm text-slate-400 italic">No expenses detected.</p>
            )}
          </div>
        </motion.div>

        {/* Pie Chart Visualization */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm min-h-[400px] flex flex-col"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
              <PieChartIcon size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Category Distribution</h3>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">Visual Insights</p>
            </div>
          </div>

          <div className="flex-1 w-full h-full min-h-[300px]">
             {chartData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={chartData}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={100}
                     paddingAngle={5}
                     dataKey="value"
                     animationBegin={500}
                     animationDuration={1500}
                   >
                     {chartData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <Tooltip 
                     formatter={(value: number) => `$${value.toLocaleString()}`}
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                   />
                   <Legend verticalAlign="bottom" height={36}/>
                 </PieChart>
               </ResponsiveContainer>
             ) : (
               <div className="flex items-center justify-center h-full text-slate-400 italic text-sm">
                 No data to visualize
               </div>
             )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
