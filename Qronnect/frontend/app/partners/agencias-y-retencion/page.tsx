import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Clock, User, Tag } from 'lucide-react'

export default function AgencyRetentionArticle() {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            {/* Article Header */}
            <header className="bg-slate-50 border-b border-slate-100 py-20">
                <div className="container mx-auto px-4 max-w-3xl">
                    <Link href="/partners" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-8 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver a Partners
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-slate-900 leading-tight">
                        Por qué el 60% de las agencias de marketing local fracasan <br />
                        <span className="text-slate-500 font-medium text-3xl md:text-4xl">(y cómo la infraestructura de datos puede salvarlas)</span>
                    </h1>
                    <div className="flex items-center gap-6 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>Qronnect Research</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>Lectura de 5 min</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            <span>Estrategia B2B</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Article Content */}
            <article className="py-20">
                <div className="container mx-auto px-4 max-w-3xl prose prose-slate prose-lg">
                    <p className="lead text-xl text-slate-600 mb-8 font-light">
                        Vender tráfico es fácil. Vender resultados tangibles es difícil. Pero mantener a un cliente que no ve el ROI en su caja registradora es imposible.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-12">El Espejismo del Tráfico</h2>
                    <p className="mb-6 text-slate-700 leading-relaxed">
                        La mayoría de las agencias de marketing local (SMA/SMMA) cometen el mismo error: se centran exclusivamente en la adquisición. Venden Facebook Ads, Google Ads o SEO. Prometen leads. Y a menudo, cumplen.
                    </p>
                    <p className="mb-6 text-slate-700 leading-relaxed">
                        Pero el dueño de un restaurante o una clínica estética no paga facturas con "leads". Paga con ventas. Si envías 100 personas a su puerta pero no tienes forma de saber cuántas compraron, o mejor aún, cuántas <strong>volvieron a comprar</strong>, tu valor es cuestionable.
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-12">El Abismo de los Datos (The Data Gap)</h2>
                    <p className="mb-6 text-slate-700 leading-relaxed">
                        Aquí es donde mueren los contratos (Churn). El cliente paga un fee mensual de 500€ o 1000€. Al tercer mes, pregunta: "¿Qué me estáis aportando realmente?".
                    </p>
                    <p className="mb-6 text-slate-700 leading-relaxed">
                        Tú muestras un reporte de Clicks y Reach. Él mira su caja y la ve igual. Resultado: "Vamos a pausar el servicio un tiempo".
                    </p>
                    <div className="bg-red-50 border-l-4 border-red-500 p-6 my-8 rounded-r-lg">
                        <p className="font-semibold text-red-900 italic">
                            "Sin datos de conversión física, eres un gasto, no una inversión."
                        </p>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-12">La Infraestructura de Fidelización como Escudo</h2>
                    <p className="mb-6 text-slate-700 leading-relaxed">
                        La solución no es traer más leads, sino <strong>rentabilizar los que ya existen</strong>. Implementar un sistema de fidelización automatizado como Qronnect cambia la conversación.
                    </p>
                    <p className="mb-6 text-slate-700 leading-relaxed">
                        Ya no dices: "Te conseguí 1000 visitas a la web".<br />
                        Ahora dices: "Este mes, 45 clientes escanearon su QR y volvieron una segunda vez, generando 1.200€ extra en facturación recurrente".
                    </p>

                    <h3 className="text-xl font-bold text-slate-900 mb-4 mt-8">Por qué esto reduce el Churn:</h3>
                    <ul className="list-disc pl-6 space-y-2 mb-8 text-slate-700">
                        <li><strong>Tangibilidad:</strong> El dueño ve a la gente usando el sistema en su local.</li>
                        <li><strong>Propiedad de Datos:</strong> Estás construyendo UNA BASE DE DATOS de clientes reales, no solo píxeles.</li>
                        <li><strong>Automatización:</strong> El sistema trabaja solo. Tú cobras el fee por la "gestión y estrategia", pero la carga operativa es mínima.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-12">Conclusión: Pasa de "Agencia de Ads" a "Socio de Crecimiento"</h2>
                    <p className="mb-8 text-slate-700 leading-relaxed">
                        El mercado está saturado de gente que sabe montar una campaña en Meta. Pero está hambriento de socios que entiendan el negocio completo: Adquisición + Retención.
                    </p>

                    <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl mt-12 text-center">
                        <h3 className="text-2xl font-bold mb-4">¿Quieres implementar esto en tus clientes?</h3>
                        <p className="text-slate-300 mb-8">
                            Agenda una sesión estratégica para partners. Te enseñamos cómo integrar Qronnect en tu oferta y aumentar tu LTV.
                        </p>
                        <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto px-8 py-6 text-lg rounded-xl">
                            <Link href="https://calendly.com/omniscient-wow/30min" target="_blank">
                                Agendar Llamada Partner
                            </Link>
                        </Button>
                    </div>
                </div>
            </article>
        </div>
    )
}
