import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface DroppableColumnProps {
    id: string;
    title: string;
    count: number;
    colorClass: string;
    children: React.ReactNode;
}

export function DroppableColumn({ id, title, count, colorClass, children }: DroppableColumnProps) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div ref={setNodeRef} className={cn(
            "flex-shrink-0 w-80 flex flex-col h-full rounded-xl transition-colors duration-300",
            isOver ? "bg-slate-100/50 dark:bg-slate-800/50 ring-2 ring-indigo-400/30" : "bg-transparent"
        )}>
            {/* Header */}
            <div className="flex items-center justify-between p-3 mb-2 rounded-t-xl backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200 tracking-tight">{title}</h3>
                    <Badge variant="secondary" className="px-1.5 py-0 h-5 text-[10px] font-mono bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 shadow-sm border-0">
                        {count}
                    </Badge>
                </div>
                {/* Visual line color indicator */}
                <div className={cn("h-1.5 w-1.5 rounded-full", colorClass.replace('bg-', 'bg-').replace('text-', '').split(' ')[0])} />
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-3 scrollbar-hide">
                {children}
            </div>
        </div>
    );
}
