'use client';

import { useDraggable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { CSS } from '@dnd-kit/utilities';

interface DraggableCardProps {
    id: string;
    children: React.ReactNode;
    className?: string;
}

export function DraggableCard({ id, children, className }: DraggableCardProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 50 : undefined,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={cn(className, isDragging ? 'opacity-50 rotate-3 cursor-grabbing' : 'cursor-grab')}
        >
            {children}
        </div>
    );
}
