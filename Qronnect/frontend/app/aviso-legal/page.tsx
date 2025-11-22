import { AppShell } from "@/components/app-shell"
import { BRAND } from "@/config/appBrand"
import { COMERCIO } from "@/config/commerce"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: `Aviso Legal - ${BRAND.copy.companyName}`,
  description: "Información legal del servicio de fidelización",
}

export default function AvisoLegalPage() {
  const brandName = BRAND.copy.companyName || "{{BRAND_NAME}}"
  const contactEmail = COMERCIO.contacto?.email || "info@micomercio.com"
  const businessAddress = COMERCIO.contacto?.direccion || "{{DIRECCIÓN_COMERCIO}}"
  const businessPhone = COMERCIO.contacto?.telefono

  // Estos campos se cargarán dinámicamente desde la BD cuando estén disponibles
  const nif = "{{NIF/CIF}}" // TODO: Cargar desde tiendas.nif
  const razonSocial = brandName // TODO: Cargar desde tiendas.razon_social
  const datosRegistrales = "{{DATOS_REGISTRALES}}" // TODO: Cargar desde tiendas.datos_registrales

  return (
    <AppShell showBackButton>
      <main className="max-w-4xl mx-auto py-8 prose prose-slate dark:prose-invert">
        <h1>Aviso Legal</h1>
        <p className="text-sm text-muted-foreground">
          Última actualización: {new Date().toLocaleDateString("es-ES")}
        </p>

        <section>
          <h2>1. Información General</h2>
          <p>
            En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad
            de la Información y de Comercio Electrónico (LSSI-CE), se informa a los usuarios de los datos
            identificativos del titular de este servicio de fidelización:
          </p>
        </section>

        <section>
          <h2>2. Datos Identificativos</h2>
          <ul className="space-y-2">
            <li>
              <strong>Denominación social:</strong> {razonSocial}
            </li>
            <li>
              <strong>Nombre comercial:</strong> {brandName}
            </li>
            <li>
              <strong>NIF/CIF:</strong> {nif}
            </li>
            <li>
              <strong>Domicilio social:</strong> {businessAddress}
            </li>
            <li>
              <strong>Correo electrónico:</strong>{" "}
              <a href={`mailto:${contactEmail}`} className="text-primary underline">
                {contactEmail}
              </a>
            </li>
            {businessPhone && (
              <li>
                <strong>Teléfono:</strong> {businessPhone}
              </li>
            )}
            {datosRegistrales !== "{{DATOS_REGISTRALES}}" && (
              <li>
                <strong>Datos registrales:</strong> {datosRegistrales}
              </li>
            )}
          </ul>
        </section>

        <section>
          <h2>3. Objeto y Ámbito de Aplicación</h2>
          <p>
            El presente Aviso Legal regula el uso del servicio de programa de fidelización accesible a través
            de esta plataforma web (en adelante, "el Servicio").
          </p>
          <p>
            El acceso y uso del Servicio atribuye la condición de usuario, aceptando plenamente y sin reservas
            todas y cada una de las disposiciones incluidas en este Aviso Legal, que pueden sufrir modificaciones.
          </p>
          <p>
            El usuario se obliga a hacer un uso correcto del Servicio de conformidad con las leyes, la buena fe,
            el orden público, los usos del tráfico y el presente Aviso Legal.
          </p>
        </section>

        <section>
          <h2>4. Condiciones de Acceso y Uso</h2>
          <p>
            El acceso al Servicio es gratuito. Sin embargo, algunos servicios o funcionalidades pueden estar
            condicionados al registro previo del usuario.
          </p>
          <p>
            El usuario se compromete a:
          </p>
          <ul>
            <li>Proporcionar información veraz y exacta en el proceso de registro.</li>
            <li>Mantener actualizados sus datos personales.</li>
            <li>Hacer un uso adecuado y lícito del Servicio.</li>
            <li>No utilizar el Servicio con fines fraudulentos o contrarios a la ley.</li>
            <li>No realizar ninguna acción que pueda dañar, inutilizar o sobrecargar el Servicio.</li>
          </ul>
        </section>

        <section>
          <h2>5. Propiedad Intelectual e Industrial</h2>
          <p>
            Todos los contenidos, textos, imágenes, marcas, gráficos, logotipos, botones, archivos de software,
            combinaciones de colores, así como la estructura, selección, ordenación y presentación de sus
            contenidos, se encuentran protegidos por las leyes sobre Propiedad Intelectual e Industrial.
          </p>
          <p>
            El usuario se compromete a respetar los derechos de Propiedad Intelectual e Industrial del titular
            del Servicio. Podrá visualizar los elementos del Servicio e incluso imprimirlos, copiarlos y
            almacenarlos en el disco duro de su ordenador o en cualquier otro soporte físico siempre y cuando
            sea, única y exclusivamente, para su uso personal y privado.
          </p>
          <p>
            Queda prohibida la reproducción, distribución, comunicación pública y transformación de los contenidos
            sin la autorización expresa del titular.
          </p>
        </section>

        <section>
          <h2>6. Exclusión de Garantías y Responsabilidad</h2>
          <p>
            El titular del Servicio no se hace responsable de:
          </p>
          <ul>
            <li>
              La continuidad, disponibilidad y utilidad del Servicio, ni de los contenidos ofrecidos en el mismo.
            </li>
            <li>
              Los daños y perjuicios que puedan derivarse de interferencias, omisiones, interrupciones, virus
              informáticos, averías telefónicas o desconexiones en el funcionamiento operativo del sistema
              electrónico, motivadas por causas ajenas a su control.
            </li>
            <li>
              Los daños o perjuicios causados a los usuarios por un uso inadecuado del Servicio o por
              fallos en el mismo.
            </li>
            <li>
              Los contenidos y servicios prestados por terceros a través de enlaces (links) contenidos en
              el Servicio.
            </li>
          </ul>
          <p>
            El titular se reserva el derecho de suspender temporalmente, y sin previo aviso, el acceso al
            Servicio con motivo de operaciones de mantenimiento, reparación, actualización o mejora.
          </p>
        </section>

        <section>
          <h2>7. Modificaciones</h2>
          <p>
            El titular se reserva el derecho de efectuar, sin previo aviso, las modificaciones que considere
            oportunas en el Servicio, pudiendo cambiar, suprimir o añadir tanto los contenidos y servicios
            que se presten a través de la misma como la forma en la que éstos aparezcan presentados o
            localizados.
          </p>
          <p>
            Asimismo, el titular se reserva el derecho a modificar en cualquier momento las presentes
            Condiciones Generales, debiendo el usuario verificar periódicamente los términos de las mismas.
          </p>
        </section>

        <section>
          <h2>8. Enlaces</h2>
          <p>
            El Servicio puede contener enlaces a sitios web de terceros. El titular no asume responsabilidad
            alguna sobre el contenido de dichos sitios web ni se hace responsable de los daños que puedan
            derivarse del acceso o uso de los mismos.
          </p>
          <p>
            El establecimiento de cualquier tipo de enlace desde un sitio web de terceros hacia el Servicio
            debe cumplir con las siguientes condiciones:
          </p>
          <ul>
            <li>No se permite la reproducción total o parcial del Servicio.</li>
            <li>No se incluirán manifestaciones falsas, inexactas o incorrectas sobre el Servicio.</li>
            <li>
              No se declarará ni dará a entender que el titular ha autorizado el enlace o que ha supervisado
              o asumido de cualquier forma los contenidos o servicios ofrecidos en el sitio web en el que se
              establece el enlace.
            </li>
          </ul>
        </section>

        <section>
          <h2>9. Protección de Datos</h2>
          <p>
            Para información sobre el tratamiento de datos personales, consulte nuestra{" "}
            <Link href="/privacidad" className="text-primary underline">
              Política de Privacidad
            </Link>
            , donde se detalla el cumplimiento del Reglamento General de Protección de Datos (RGPD).
          </p>
        </section>

        <section>
          <h2>10. Cookies</h2>
          <p>
            Este sitio web utiliza cookies. Para más información sobre el uso de cookies, consulte nuestra{" "}
            <Link href="/politica-cookies" className="text-primary underline">
              Política de Cookies
            </Link>
            .
          </p>
        </section>

        <section>
          <h2>11. Legislación Aplicable y Jurisdicción</h2>
          <p>
            Las presentes Condiciones Generales se rigen por la legislación española vigente.
          </p>
          <p>
            Para la resolución de cualquier controversia o conflicto que pueda surgir en relación con el
            acceso, navegación o uso del Servicio, el titular y el usuario acuerdan someterse a los Juzgados
            y Tribunales del domicilio del usuario, si éste tiene la condición de consumidor, o del domicilio
            del titular en caso contrario, con renuncia expresa a cualquier otro fuero que pudiera
            corresponderles.
          </p>
        </section>

        <section>
          <h2>12. Contacto</h2>
          <p>
            Para cualquier consulta, sugerencia o reclamación relacionada con el Servicio, puede ponerse en
            contacto con nosotros a través de:
          </p>
          <ul>
            <li>
              <strong>Email:</strong>{" "}
              <a href={`mailto:${contactEmail}`} className="text-primary underline">
                {contactEmail}
              </a>
            </li>
            {businessPhone && (
              <li>
                <strong>Teléfono:</strong> {businessPhone}
              </li>
            )}
            <li>
              <strong>Dirección postal:</strong> {businessAddress}
            </li>
          </ul>
        </section>

        <div className="mt-8 p-4 bg-muted rounded-lg border">
          <p className="text-sm text-muted-foreground mb-0">
            <strong>Nota importante:</strong> Los campos marcados como {"{{PLACEHOLDER}}"} deben ser completados
            con la información específica del comercio. Para actualizar esta información, accede al panel de
            administración y completa los datos legales de tu tienda.
          </p>
        </div>
      </main>
    </AppShell>
  )
}
