import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    description?: string
    trend?: {
        value: number
        label: string
        positive?: boolean
    }
    className?: string
    gradient?: string
}

export function StatsCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    className,
    gradient = "from-blue-500/10 to-indigo-500/10"
}: StatsCardProps) {
    return (
        <Card className={`relative overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50`} />

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {title}
                </CardTitle>
                <div className="p-2 bg-white/50 dark:bg-black/20 rounded-full backdrop-blur-sm">
                    <Icon className="h-4 w-4 text-primary" />
                </div>
            </CardHeader>

            <CardContent className="relative z-10">
                <div className="flex items-baseline space-x-2">
                    <div className="text-2xl font-bold tracking-tight">
                        {value}
                    </div>
                    {trend && (
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${trend.positive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                            {trend.positive ? '+' : ''}{trend.value}% {trend.label}
                        </span>
                    )}
                </div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
