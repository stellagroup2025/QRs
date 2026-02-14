'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle, TrendingUp, Users, Zap, BarChart3, LineChart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'

export default function PartnersPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            {/* Navigation (Simplified for B2B) */}
            <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/partners" className="flex items-center gap-2">
                        <img src="/LogoQronnect.png" alt="Qronnect" className="h-8 w-auto" />
                        <span className="font-bold text-lg tracking-tight">Partners</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="#calculator" className="text-sm font-medium text-slate-600 hover:text-slate-900">Calculadora</Link>
                        <Link href="#solution" className="text-sm font-medium text-slate-600 hover:text-slate-900">Por qué Qronnect</Link>
                        <Button asChild variant="default" size="sm" className="bg-slate-900 text-white hover:bg-slate-800">
                            <Link href="https://calendly.com/omarsomoza93/30min" target="_blank">Agendar Estrategia</Link>
                        </Button>
                    </div>
                </div>
            </nav>

            <main>
                {/* Hero Section */}
                <section className="py-20 md:py-32 border-b border-slate-100 bg-slate-50/50 relative overflow-hidden">
                    {/* Tech Grid Background - Adds "serious tech" vibe */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                    <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px]"></div>

                    <div className="container mx-auto px-4 max-w-5xl text-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-slate-900 leading-tight">
                                Convierte la retención en tu <br className="hidden md:block" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                    mayor fuente de ingresos.
                                </span>
                            </h1>
                            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                                Añade una capa de fidelización con IA a tus clientes sin carga operativa.
                                Perfecto para Agencias, Consultores Independientes y Comerciales Autónomos.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button asChild size="lg" className="bg-slate-900 hover:bg-slate-800 text-white px-8 h-12 text-lg shadow-lg hover:shadow-xl transition-all">
                                    <Link href="https://calendly.com/omarsomoza93/30min" target="_blank">
                                        Agendar Sesión de Estrategia
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="h-12 text-lg border-slate-200 text-slate-700 hover:bg-white hover:text-blue-600 hover:border-blue-200">
                                    <Link href="#calculator">
                                        Calcular Margen
                                    </Link>
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* The Agency & Freelance Problem */}
                <section id="solution" className="py-20 bg-white">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-3xl font-bold mb-6 text-slate-900">
                                    Ya seas Agencia o Freelance: <br />
                                    <span className="text-red-500">¿Tus clientes renuevan?</span>
                                </h2>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="mt-1 bg-red-100 p-2 rounded-lg h-fit">
                                            <TrendingUp className="w-5 h-5 text-red-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg text-slate-900">Resultados invisibles</h3>
                                            <p className="text-slate-600">Tus clientes aman los leads, pero si no ven retorno en caja el primer mes, dudan de tu servicio.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="mt-1 bg-red-100 p-2 rounded-lg h-fit">
                                            <Users className="w-5 h-5 text-red-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg text-slate-900">Alta Rotación (Churn)</h3>
                                            <p className="text-slate-600">Reemplazar un cliente cuesta 5x más que retenerlo. Perder clientes cada 3 meses destruye tu margen.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                                <h3 className="text-xl font-bold mb-4 text-slate-900">La Solución Qronnect</h3>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                        <span className="text-slate-700"><strong>Tangibilidad Inmediata:</strong> Tu cliente ve gente escaneando y volviendo gracias a tu estrategia.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                        <span className="text-slate-700"><strong>Ingreso Recurrente:</strong> Vende Qronnect como un upsell o inclúyelo para justificar fees más altos.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                        <span className="text-slate-700"><strong>Datos Propios:</strong> Deja de depender 100% de algoritmos de terceros. Construye bases de datos reales.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Profit Calculator */}
                <section id="calculator" className="py-20 bg-slate-900 text-white">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <h2 className="text-3xl font-bold mb-12 text-center">Calculadora de Rentabilidad Partner</h2>
                        <ProfitCalculator />
                    </div>
                </section>

                {/* 🔥 What IS Qronnect? — Product Explanation Section */}
                <section className="py-20 bg-white border-b border-slate-100">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-4">
                                <BarChart3 className="w-4 h-4" />
                                El Producto
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
                                ¿Qué es exactamente <span className="text-blue-600">Qronnect</span>?
                            </h2>
                            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                                Una plataforma white-label de fidelización para negocios locales.
                                Tus clientes la ofrecen a <i>sus</i> clientes finales para que vuelvan más y gasten más.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Card 1: QR & Loyalty */}
                            <div className="group p-8 rounded-2xl border border-slate-200 bg-white hover:border-blue-200 hover:shadow-lg transition-all duration-300">
                                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                                    <Zap className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-slate-900">Sistema de Puntos con QR</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Los clientes finales escanean un QR en el local, acumulan puntos por cada compra,
                                    y canjean recompensas. <strong>Sin apps, sin tarjetas, sin complicaciones.</strong>
                                </p>
                            </div>

                            {/* Card 2: Gamification */}
                            <div className="group p-8 rounded-2xl border border-slate-200 bg-white hover:border-purple-200 hover:shadow-lg transition-all duration-300">
                                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors">
                                    <TrendingUp className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-slate-900">Gamificación & Sellos</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Tarjetas de sellos digitales, ruletas de premios (gacha) y retos que convierten
                                    visitas rutinarias en <strong>una experiencia adictiva</strong>.
                                </p>
                            </div>

                            {/* Card 3: Referrals */}
                            <div className="group p-8 rounded-2xl border border-slate-200 bg-white hover:border-green-200 hover:shadow-lg transition-all duration-300">
                                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-6 group-hover:bg-green-600 transition-colors">
                                    <Users className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-slate-900">Referidos Integrados</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Cada cliente se convierte en embajador. Comparte un enlace, trae un amigo,
                                    <strong> ambos ganan</strong>. Adquisición orgánica sin coste en ads.
                                </p>
                            </div>

                            {/* Card 4: AI Analytics */}
                            <div className="group p-8 rounded-2xl border border-slate-200 bg-white hover:border-amber-200 hover:shadow-lg transition-all duration-300">
                                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-6 group-hover:bg-amber-600 transition-colors">
                                    <LineChart className="w-6 h-6 text-amber-600 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-slate-900">Analytics con IA</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Dashboard con métricas reales: frecuencia de visita, ticket medio, predicción de churn.
                                    <strong> Informes automáticos</strong> generados con Gemini AI.
                                </p>
                            </div>

                            {/* Card 5: White-Label */}
                            <div className="group p-8 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg transition-all duration-300">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-6 group-hover:bg-slate-900 transition-colors">
                                    <CheckCircle className="w-6 h-6 text-slate-600 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-slate-900">100% White-Label</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Cada tienda tiene su propio dominio, colores y branding.
                                    Tu cliente nunca ve la marca Qronnect — <strong>tú eres el héroe</strong>.
                                </p>
                            </div>

                            {/* Card 6: Campañas SMS / Email */}
                            <div className="group p-8 rounded-2xl border border-slate-200 bg-white hover:border-rose-200 hover:shadow-lg transition-all duration-300">
                                <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center mb-6 group-hover:bg-rose-600 transition-colors">
                                    <ArrowRight className="w-6 h-6 text-rose-600 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-slate-900">Campañas SMS & Email</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Envía promociones segmentadas a la base de datos del negocio.
                                    <strong> Sin dependencia de Meta Ads ni Google</strong> — datos propios.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Product Lab */}
                <section className="py-24 bg-slate-950 text-white relative overflow-hidden">
                    {/* Background glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/20 blur-[120px] rounded-full"></div>

                    <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm font-semibold mb-8 backdrop-blur-md">
                            <Zap className="w-4 h-4 text-blue-400" />
                            <span className="uppercase tracking-widest text-xs">Qronnect Product Lab</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
                            Desarrollo Ágil para <span className="text-blue-400">Tus Clientes</span>
                        </h2>
                        <p className="text-xl text-slate-400 mb-10 leading-relaxed">
                            ¿Necesitas algo específico? No somos una herramienta estática.
                            Nuestro equipo de <strong className="text-white">Product Lab</strong> puede adaptar funcionalidades o
                            lanzar MVPs exclusivos basados en el feedback real de tu cartera.
                        </p>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 bg-slate-50">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900">¿Hablamos de negocios?</h2>
                        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
                            Agenda una sesión estratégica de 15 minutos para ver si encajamos.
                            Sin compromisos, de experto a experto.
                        </p>
                        <Button asChild size="lg" className="bg-slate-900 hover:bg-slate-800 text-white px-10 h-14 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all">
                            <Link href="https://calendly.com/omarsomoza93" target="_blank">
                                Agendar Sesión Partner
                            </Link>
                        </Button>
                    </div>
                </section>
            </main>

            <footer className="bg-white py-12 border-t border-slate-200">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-slate-500 mb-4">&copy; {new Date().getFullYear()} Qronnect. Todos los derechos reservados.</p>
                    <Link href="/partners/agencias-y-retencion" className="text-sm font-medium text-blue-600 hover:underline">
                        ¿Por qué fracasan las agencias locales? (Leer Artículo)
                    </Link>
                </div>
            </footer>
        </div>
    )
}

function ProfitCalculator() {
    const [newClientsPerMonth, setNewClientsPerMonth] = useState(2)
    const [price, setPrice] = useState(99)
    const [churnRate, setChurnRate] = useState(5) // 5% churn
    const marginPercent = 0.40 // 40% margin

    // Projection Logic (Simplified Compound Growth)
    const calculateProjection = (months: number) => {
        let activeClients = 0
        let monthlyRevenue = 0

        for (let i = 1; i <= months; i++) {
            // New clients added
            activeClients += newClientsPerMonth
            // Churn (clients lost)
            const lostClients = Math.floor(activeClients * (churnRate / 100))
            activeClients -= lostClients
            // Validation
            if (activeClients < 0) activeClients = 0
        }

        const mrr = activeClients * price
        const partnerMrr = mrr * marginPercent
        return { activeClients, mrr, partnerMrr }
    }

    const year1 = calculateProjection(12)
    const year2 = calculateProjection(24)

    // Valuation Multiplier (SaaS typical for agencies: 3x ARR)
    const annualRecurringRevenue = year1.partnerMrr * 12
    const valuation = annualRecurringRevenue * 3

    return (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl">
            <div className="grid lg:grid-cols-2 gap-12">
                {/* Inputs */}
                <div className="space-y-8">
                    <div>
                        <div className="flex justify-between mb-4">
                            <label className="text-slate-300 font-medium flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-500" />
                                Clientes Nuevos / Mes
                            </label>
                            <span className="text-white font-bold text-xl">{newClientsPerMonth}</span>
                        </div>
                        <Slider
                            defaultValue={[2]}
                            max={20}
                            step={1}
                            onValueChange={(val: number[]) => setNewClientsPerMonth(val[0])}
                            className="py-4"
                        />
                        <p className="text-xs text-slate-500 mt-2">Capacidad de venta realista de tu agencia.</p>
                    </div>

                    <div>
                        <div className="flex justify-between mb-4">
                            <label className="text-slate-300 font-medium flex items-center gap-2">
                                <Zap className="w-4 h-4 text-yellow-500" />
                                PVP Mensual (€)
                            </label>
                            <span className="text-white font-bold text-xl">{price}€</span>
                        </div>
                        <Slider
                            defaultValue={[99]}
                            max={500}
                            step={10}
                            onValueChange={(val: number[]) => setPrice(val[0])}
                            className="py-4"
                        />
                        <p className="text-xs text-slate-500 mt-2">Precio que cobras al cliente final (tú controlas el margen).</p>
                    </div>

                    <div>
                        <div className="flex justify-between mb-4">
                            <label className="text-slate-300 font-medium flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-red-500" />
                                Churn Mensual Estimado (%)
                            </label>
                            <span className="text-white font-bold text-xl">{churnRate}%</span>
                        </div>
                        <Slider
                            defaultValue={[5]}
                            max={20}
                            step={1}
                            onValueChange={(val: number[]) => setChurnRate(val[0])}
                            className="py-4"
                        />
                        <p className="text-xs text-slate-500 mt-2">Tasa de cancelación mensual. Sé honesto (5% es estándar).</p>
                    </div>
                </div>

                {/* Outputs / Asset Dashboard */}
                <div className="flex flex-col space-y-6">
                    {/* Main ARR Card */}
                    <div className="bg-gradient-to-br from-blue-900/50 to-slate-800 border border-blue-500/30 p-8 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-500/30 transition-all"></div>
                        <p className="text-blue-300 text-sm font-bold uppercase tracking-widest mb-2">Ingreso Recurrente (Mes 12)</p>
                        <p className="text-5xl font-extrabold text-white mb-1">
                            {year1.partnerMrr.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                            <span className="text-xl text-slate-400 font-normal ml-2">/mes</span>
                        </p>
                        <p className="text-emerald-400 text-sm font-medium flex items-center gap-1 mt-2">
                            <TrendingUp className="w-3 h-3" />
                            {year1.activeClients} Clientes Activos
                        </p>
                    </div>

                    {/* Secondary Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Year 2 Projection */}
                        <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                            <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-2">Proyección Mes 24</p>
                            <p className="text-2xl font-bold text-white group-hover:text-blue-200 transition-colors">
                                {year2.partnerMrr.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                                <span className="text-xs text-slate-500 ml-1">/mes</span>
                            </p>
                        </div>
                        {/* Portfolio Valuation */}
                        <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50 relative overflow-hidden">
                            <div className="absolute inset-0 bg-yellow-500/5"></div>
                            <p className="text-yellow-500/80 text-xs uppercase font-bold tracking-wider mb-2 flex items-center gap-1">
                                <Zap className="w-3 h-3" /> Valor de Cartera
                            </p>
                            <p className="text-2xl font-bold text-white">
                                {valuation.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-1">Si vendieras tu agencia (3x ARR)</p>
                        </div>
                    </div>

                    <div className="bg-slate-800/30 p-4 rounded-xl border border-dashed border-slate-700">
                        <p className="text-xs text-slate-400 text-center">
                            *Cálculo basado en modelo de acumulación con churn compuesto. <br />
                            El interés compuesto es la fuerza más poderosa del universo.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
