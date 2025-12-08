'use client';

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
    const { setNodeRef, isOver } = useDroppable({
        id: id,
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex flex-col gap-3 min-w-[280px] p-3 rounded-xl h-full border transition-colors",
                isOver ? "bg-blue-50 border-blue-300 dark:bg-blue-900/20" : "bg-slate-50 border-slate-100 dark:bg-slate-900/50 dark:border-slate-800"
            )}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${colorClass.split(' ')[0]}`} />
                    <h3 className="font-semibold text-sm">{title}</h3>
                </div>
                <Badge variant="secondary" className="text-xs">{count}</Badge>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-250px)] pr-1 min-h-[100px]">
                {children}
            </div>
        </div>
    );
}
