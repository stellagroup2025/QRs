import { Flame, TrendingUp, DollarSign } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';

interface SalesGamificationProps {
    streak: number;
    monthlySales: number;
    monthlyGoal: number;
}

export function SalesGamification({ streak, monthlySales, monthlyGoal }: SalesGamificationProps) {
    const progress = Math.min((monthlySales / monthlyGoal) * 100, 100);

    return (
        <div className="flex items-center gap-6 bg-slate-900 text-white px-4 py-2 rounded-full shadow-lg border border-slate-700">
            {/* Streak Counter */}
            <div className="flex items-center gap-2">
                <div className={`relative ${streak > 0 ? 'text-orange-500' : 'text-slate-500'}`}>
                    <Flame className={`h-5 w-5 ${streak > 1 ? 'animate-pulse' : ''}`} fill={streak > 0 ? "currentColor" : "none"} />
                    {streak > 2 && (
                        <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 bg-red-600 text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold"
                        >
                            x{streak}
                        </motion.div>
                    )}
                </div>
                <span className="text-sm font-bold">
                    {streak > 0 ? "ON FIRE!" : "Streak"}
                </span>
            </div>

            {/* Separator */}
            <div className="h-4 w-px bg-slate-700"></div>

            {/* Commission / Goal Progress */}
            <div className="flex flex-col w-32">
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Meta Mensual</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-slate-800 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-cyan-400" />
            </div>

            {/* Sales Count */}
            <div className="flex items-center gap-1 text-green-400 font-mono text-sm">
                <DollarSign className="h-3 w-3" />
                <span>{monthlySales.toLocaleString()}</span>
            </div>
        </div>
    );
}
