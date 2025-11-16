import { AppShell } from "@/components/app-shell"
import { BRAND } from "@/config/appBrand"
import { COMERCIO } from "@/config/commerce"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: `Política de Privacidad - ${BRAND.copy.companyName}`,
  description: "Información sobre el tratamiento de datos personales en nuestro programa de fidelización",
}

export default function PrivacidadPage() {
  const brandName = BRAND.copy.companyName || "{{BRAND_NAME}}"
  const contactEmail = COMERCIO.contacto?.email || "info@micomercio.com"
  const businessAddress = COMERCIO.contacto?.direccion || "{{DIRECCIÓN_COMERCIO}}"

  return (
    <AppShell showBackButton>
      <main className="max-w-4xl mx-auto py-8 prose prose-slate dark:prose-invert">
        <h1>Política de Privacidad</h1>
        <p className="text-sm text-muted-foreground">Última actualización: {new Date().toLocaleDateString("es-ES")}</p>

        <section>
          <h2>1. Responsable del Tratamiento</h2>
          <p>
            <strong>Identidad:</strong> {brandName}
            <br />
            <strong>Dirección:</strong> {businessAddress}
            <br />
            <strong>Correo electrónico:</strong> {contactEmail}
          </p>
        </section>

        <section>
          <h2>2. Finalidad del Tratamiento</h2>
          <p>Tratamos tus datos personales con las siguientes finalidades:</p>
          <ul>
            <li>
              <strong>Gestión del programa de fidelización:</strong> Para permitirte acumular sellos, descuentos y canjear recompensas
              mediante tu código QR único.
            </li>
            <li>
              <strong>Comunicaciones relacionadas:</strong> Enviarte información sobre tu cuenta, cambios en el programa,
              y ofertas exclusivas para miembros (solo si has dado tu consentimiento explícito para comunicaciones comerciales).
            </li>
            <li>
              <strong>Cumplimiento legal:</strong> Para cumplir con obligaciones legales aplicables (fiscales, contables, etc.).
            </li>
          </ul>
        </section>

        <section>
          <h2>3. Base Jurídica</h2>
          <p>El tratamiento de tus datos se basa en:</p>
          <ul>
            <li>
              <strong>Consentimiento:</strong> Al registrarte y aceptar estos términos, consientes expresamente el uso de tus datos
              para las finalidades descritas.
            </li>
            <li>
              <strong>Ejecución de un contrato:</strong> Para gestionar tu participación en el programa de fidelización.
            </li>
            <li>
              <strong>Interés legítimo:</strong> Para mejorar nuestros servicios y ofrecerte una mejor experiencia como cliente.
            </li>
          </ul>
        </section>

        <section>
          <h2>4. Destinatarios de los Datos</h2>
          <p>
            Tus datos personales podrán ser compartidos con:
          </p>
          <ul>
            <li>
              <strong>Proveedores tecnológicos:</strong> Empresas que nos ayudan a gestionar la infraestructura técnica del programa
              (alojamiento web, bases de datos, servicios de correo electrónico).
            </li>
            <li>
              <strong>Autoridades públicas:</strong> Cuando sea requerido por ley o por orden judicial.
            </li>
          </ul>
          <p>
            No vendemos ni compartimos tus datos con terceros para fines comerciales ajenos al programa de fidelización.
          </p>
        </section>

        <section>
          <h2>5. Conservación de los Datos</h2>
          <p>
            Conservaremos tus datos personales:
          </p>
          <ul>
            <li>Mientras seas miembro activo del programa de fidelización.</li>
            <li>
              Tras la cancelación de tu cuenta, durante el plazo legalmente establecido para cumplir con obligaciones fiscales
              y contables (generalmente 4-6 años).
            </li>
            <li>
              Una vez transcurridos estos plazos, tus datos serán eliminados o anonimizados de forma irreversible.
            </li>
          </ul>
          <p>
            Puedes solicitar la eliminación anticipada de tus datos en cualquier momento ejerciendo tu derecho de supresión
            (ver sección 6).
          </p>
        </section>

        <section>
          <h2>6. Derechos del Usuario (ARSOPL)</h2>
          <p>
            En cumplimiento del RGPD, tienes derecho a:
          </p>
          <ul>
            <li>
              <strong>Acceso:</strong> Obtener información sobre qué datos tuyos estamos tratando.
            </li>
            <li>
              <strong>Rectificación:</strong> Corregir datos inexactos o incompletos.
            </li>
            <li>
              <strong>Supresión ("derecho al olvido"):</strong> Solicitar la eliminación de tus datos cuando ya no sean necesarios
              o retires tu consentimiento.
            </li>
            <li>
              <strong>Oposición:</strong> Oponerte al tratamiento de tus datos en determinadas circunstancias.
            </li>
            <li>
              <strong>Portabilidad:</strong> Recibir tus datos en un formato estructurado y de uso común para transferirlos
              a otro responsable.
            </li>
            <li>
              <strong>Limitación:</strong> Solicitar que se limite el tratamiento de tus datos en ciertas situaciones.
            </li>
          </ul>
        </section>

        <section>
          <h2>7. Cómo Ejercer tus Derechos</h2>
          <p>
            Para ejercer cualquiera de estos derechos, puedes:
          </p>
          <ul>
            <li>
              Enviar un correo electrónico a: <a href={`mailto:${contactEmail}`} className="text-primary underline">{contactEmail}</a>
            </li>
            <li>
              Utilizar el botón "Eliminar mis datos" en la sección de tu cuenta (para supresión).
            </li>
          </ul>
          <p>
            Responderemos a tu solicitud en un plazo máximo de 30 días, pudiendo extenderse otros 60 días adicionales
            si la solicitud es compleja.
          </p>
        </section>

        <section>
          <h2>8. Reclamación ante la Autoridad de Control</h2>
          <p>
            Si consideras que el tratamiento de tus datos vulnera la normativa de protección de datos, tienes derecho a presentar
            una reclamación ante la <strong>Agencia Española de Protección de Datos (AEPD)</strong>:
          </p>
          <ul>
            <li>
              Web: <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                www.aepd.es
              </a>
            </li>
            <li>Dirección: C/ Jorge Juan, 6, 28001 Madrid</li>
            <li>Teléfono: 901 100 099 / 912 663 517</li>
          </ul>
        </section>

        <section>
          <h2>9. Seguridad de los Datos</h2>
          <p>
            Implementamos medidas técnicas y organizativas apropiadas para proteger tus datos personales contra acceso no autorizado,
            pérdida, destrucción o alteración. Sin embargo, ninguna transmisión por Internet es 100% segura, por lo que no podemos
            garantizar la seguridad absoluta de la información transmitida a través de nuestros servicios.
          </p>
        </section>

        <section>
          <h2>10. Modificaciones de esta Política</h2>
          <p>
            Nos reservamos el derecho de actualizar esta Política de Privacidad para reflejar cambios en nuestras prácticas
            o en la legislación aplicable. Te notificaremos cualquier cambio significativo mediante correo electrónico o
            aviso en la aplicación.
          </p>
        </section>

        <section>
          <h2>11. Contacto</h2>
          <p>
            Si tienes dudas sobre esta política o el tratamiento de tus datos, contáctanos en:
          </p>
          <ul>
            <li>Email: <a href={`mailto:${contactEmail}`} className="text-primary underline">{contactEmail}</a></li>
            {COMERCIO.contacto?.telefono && <li>Teléfono: {COMERCIO.contacto.telefono}</li>}
          </ul>
        </section>
      </main>
    </AppShell>
  )
}
