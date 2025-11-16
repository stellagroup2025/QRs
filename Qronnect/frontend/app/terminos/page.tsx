import { AppShell } from "@/components/app-shell"
import { BRAND } from "@/config/appBrand"
import { COMERCIO } from "@/config/commerce"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: `Términos y Condiciones - ${BRAND.copy.companyName}`,
  description: "Términos y condiciones del programa de fidelización",
}

export default function TerminosPage() {
  const brandName = BRAND.copy.companyName || "{{BRAND_NAME}}"
  const contactEmail = COMERCIO.contacto?.email || "info@micomercio.com"

  return (
    <AppShell showBackButton>
      <main className="max-w-4xl mx-auto py-8 prose prose-slate dark:prose-invert">
        <h1>Términos y Condiciones</h1>
        <p className="text-sm text-muted-foreground">Última actualización: {new Date().toLocaleDateString("es-ES")}</p>

        <section>
          <h2>1. Identificación del Servicio</h2>
          <p>
            El presente programa de fidelización es operado por <strong>{brandName}</strong> (en adelante, "el Comercio"),
            con el objetivo de recompensar la lealtad de nuestros clientes.
          </p>
        </section>

        <section>
          <h2>2. Objeto del Servicio</h2>
          <p>
            El servicio de fidelización permite a los usuarios acumular sellos o descuentos mediante el uso de un código QR único
            asignado a cada cliente. Este código debe ser presentado en cada compra realizada en el establecimiento físico.
          </p>
        </section>

        <section>
          <h2>3. Uso del Código QR</h2>
          <p>Al registrarte en el programa, aceptas que:</p>
          <ul>
            <li>El código QR es personal e intransferible.</li>
            <li>Eres responsable de mantener la confidencialidad de tu código QR.</li>
            <li>Cualquier uso fraudulento del código puede resultar en la cancelación inmediata de tu cuenta.</li>
            <li>El código QR debe ser mostrado al personal del comercio para acumular beneficios.</li>
          </ul>
        </section>

        <section>
          <h2>4. Acumulación y Canje de Beneficios</h2>
          <p>
            Los sellos y descuentos se acumulan según las condiciones específicas establecidas por el Comercio.
            El Comercio se reserva el derecho de modificar las condiciones de acumulación y canje con previo aviso a los usuarios.
          </p>
        </section>

        <section>
          <h2>5. Limitación de Responsabilidad</h2>
          <p>
            El Comercio no se hace responsable de:
          </p>
          <ul>
            <li>Pérdida o extravío del código QR por parte del usuario.</li>
            <li>Uso no autorizado del código QR debido a negligencia del usuario.</li>
            <li>Interrupciones temporales del servicio por mantenimiento o causas de fuerza mayor.</li>
            <li>Errores técnicos que puedan afectar la acumulación de beneficios, salvo que sean atribuibles directamente al Comercio.</li>
          </ul>
        </section>

        <section>
          <h2>6. Modificaciones del Servicio</h2>
          <p>
            El Comercio se reserva el derecho de modificar, suspender o terminar el programa de fidelización en cualquier momento,
            notificando a los usuarios con al menos 30 días de antelación cuando sea posible.
          </p>
        </section>

        <section>
          <h2>7. Cancelación de Cuenta</h2>
          <p>
            Los usuarios pueden solicitar la cancelación de su cuenta y la eliminación de sus datos en cualquier momento
            accediendo a su perfil o contactando con nosotros a través de {contactEmail}.
          </p>
        </section>

        <section>
          <h2>8. Ley Aplicable y Jurisdicción</h2>
          <p>
            Estos términos se rigen por la legislación española. Cualquier disputa será sometida a los juzgados y tribunales
            que correspondan según la normativa vigente.
          </p>
        </section>

        <section>
          <h2>9. Contacto</h2>
          <p>
            Para cualquier consulta sobre estos términos, puedes contactarnos en:
          </p>
          <ul>
            <li>Email: {contactEmail}</li>
            {COMERCIO.contacto?.telefono && <li>Teléfono: {COMERCIO.contacto.telefono}</li>}
            {COMERCIO.contacto?.direccion && <li>Dirección: {COMERCIO.contacto.direccion}</li>}
          </ul>
        </section>
      </main>
    </AppShell>
  )
}
