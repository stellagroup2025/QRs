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
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/LogoQronnect.png" alt="Qronnect" className="h-8 w-auto" />
                        <span className="font-bold text-lg tracking-tight">Partners</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="#calculator" className="text-sm font-medium text-slate-600 hover:text-slate-900">Calculadora</Link>
                        <Link href="#solution" className="text-sm font-medium text-slate-600 hover:text-slate-900">Por qué Qronnect</Link>
                        <Button asChild variant="default" size="sm" className="bg-slate-900 text-white hover:bg-slate-800">
                            <Link href="https://calendly.com/omniscient-wow/30min" target="_blank">Agendar Estrategia</Link>
                        </Button>
                    </div>
                </div>
            </nav>

            <main>
                {/* Hero Section */}
                <section className="py-20 md:py-32 border-b border-slate-100 bg-slate-50/50">
                    <div className="container mx-auto px-4 max-w-5xl text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-slate-900 leading-tight">
                                Convierte la retención en tu <br className="hidden md:block" />
                                <span className="text-blue-600">mayor fuente de ingresos.</span>
                            </h1>
                            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                                Añade una capa de fidelización con IA a tus clientes sin carga operativa.
                                Reduce el churn y aumenta el LTV de tu cartera de agencias.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 text-lg">
                                    <Link href="https://calendly.com/omniscient-wow/30min" target="_blank">
                                        Agendar Sesión de Estrategia
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="h-12 text-lg border-slate-300 text-slate-700 hover:bg-white">
                                    <Link href="#calculator">
                                        Calcular Margen
                                    </Link>
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* The Agency Problem */}
                <section id="solution" className="py-20 bg-white">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-3xl font-bold mb-6 text-slate-900">El problema no es captar clientes. <br /><span className="text-red-500">Es que se queden.</span></h2>
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

                {/* Product Lab */}
                <section className="py-20 bg-white border-b border-slate-100">
                    <div className="container mx-auto px-4 max-w-5xl text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-6">
                            <Zap className="w-4 h-4" />
                            Product Lab
                        </div>
                        <h2 className="text-3xl font-bold mb-4 text-slate-900">Desarrollo Ágil para tus Clientes</h2>
                        <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
                            ¿Necesitas algo específico? No somos una herramienta estática.
                            Nuestro equipo de <strong>Product Lab</strong> puede adaptar funcionalidades o lanzar MVPs exclusivos
                            basados en el feedback real de tu cartera de clientes.
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
                            <Link href="https://calendly.com/omniscient-wow/30min" target="_blank">
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
    const [clients, setClients] = useState(10)
    const [price, setPrice] = useState(99)
    const marginPercent = 0.40 // 40% margin

    const monthlyRevenue = clients * price
    const partnerProfit = monthlyRevenue * marginPercent

    return (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-slate-300 font-medium">Clientes Activos</label>
                        <span className="text-white font-bold text-lg">{clients}</span>
                    </div>
                    <Slider
                        defaultValue={[10]}
                        max={100}
                        step={1}
                        onValueChange={(val: number[]) => setClients(val[0])}
                        className="py-4"
                    />
                </div>
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-slate-300 font-medium">PVP Mensual por Cliente (€)</label>
                        <span className="text-white font-bold text-lg">{price}€</span>
                    </div>
                    <Slider
                        defaultValue={[99]}
                        max={500}
                        step={10}
                        onValueChange={(val: number[]) => setPrice(val[0])}
                        className="py-4"
                    />
                </div>
            </div>
            <div className="flex flex-col justify-center space-y-6">
                <div className="bg-blue-600/20 border border-blue-500/30 p-6 rounded-xl">
                    <p className="text-blue-200 text-sm font-semibold uppercase tracking-wider mb-1">Tu Beneficio Mensual Recurrente</p>
                    <p className="text-4xl font-bold text-white">
                        {partnerProfit.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                        <span className="text-sm text-slate-300 font-normal ml-2">/mes</span>
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-xl">
                        <p className="text-slate-400 text-xs uppercase mb-1">Facturación Total</p>
                        <p className="text-xl font-bold text-white">{monthlyRevenue.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl">
                        <p className="text-slate-400 text-xs uppercase mb-1">Margen Partner</p>
                        <p className="text-xl font-bold text-green-400">{marginPercent * 100}%</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
