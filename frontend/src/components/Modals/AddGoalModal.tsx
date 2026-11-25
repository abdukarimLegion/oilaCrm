import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getT } from '../../constants/translations';
import { CategoryIcon } from '../Common/CategoryIcon';
import { X } from 'lucide-react';

export const AddGoalModal: React.FC = () => {
  const { isAddGoalModalOpen, closeAddGoalModal, addGoal, language } = useApp();
  const t = getT(language);

  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState<number | ''>('');
  const [monthlyContribution, setMonthlyContribution] = useState<number | ''>('');
  const [targetDate, setTargetDate] = useState('2027-12-31');
  const [category, setCategory] = useState('Уй-жой ва харид');
  const [icon, setIcon] = useState('Car');
  const [color, setColor] = useState('#3B82F6');
  const [notes, setNotes] = useState('');

  if (!isAddGoalModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetAmount || Number(targetAmount) <= 0) return;

    addGoal({
      title_cyrl: title,
      title_latn: title,
      targetAmount: Number(targetAmount),
      monthlyContribution: Number(monthlyContribution) || Math.round(Number(targetAmount) / 12),
      targetDate: targetDate || '2027-12-31',
      category,
      icon,
      color,
      priority: 'high',
      notes,
    });

    closeAddGoalModal();
    setTitle('');
    setTargetAmount('');
    setMonthlyContribution('');
    setNotes('');
  };

  const icons = ['Car', 'Home', 'Compass', 'ShieldCheck', 'Laptop', 'PiggyBank', 'ShoppingCart'];
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#EF4444'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">
            {t.addGoal}
          </h3>
          <button
            onClick={closeAddGoalModal}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Мақсад номи
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Масалан: Янги Chevrolet Tracker 2"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full text-sm font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Керакли сумма (сўм)
              </label>
              <input
                type="number"
                min="100000"
                step="100000"
                required
                placeholder="100 000 000"
                value={targetAmount}
                onChange={e => setTargetAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full text-base font-mono tabular-nums font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ойлик ажратма (сўм)
              </label>
              <input
                type="number"
                min="50000"
                step="50000"
                required
                placeholder="5 000 000"
                value={monthlyContribution}
                onChange={e => setMonthlyContribution(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full text-base font-mono tabular-nums font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Режалаштирилган муддат (Target Date)
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Icon and Color selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Иконка
              </label>
              <div className="flex items-center gap-1.5">
                {icons.map(ic => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={`p-1.5 rounded-lg border transition-all ${
                      icon === ic
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-xs ring-1 ring-emerald-500'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <CategoryIcon name={ic} className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Ранг
              </label>
              <div className="flex items-center gap-1.5">
                {colors.map(col => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setColor(col)}
                    className={`w-6 h-6 rounded-full transition-all ${
                      color === col ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Изоҳ / Эслатма
            </label>
            <input
              type="text"
              placeholder="Масалан: Оилавий сафар ёки таъмир"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={closeAddGoalModal}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
            >
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
