// Static legal pages. Bilingual (EN/ES) — the active locale picks the copy.
// Please have counsel review before hard launch — this is production-ready
// boilerplate tailored to alcohol e-commerce, not a substitute for legal advice.
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

type Section = { heading: string; body: string[] };
type Doc = { title: string; updated: string; intro?: string; sections: Section[] };

const LAST_UPDATED = '2026-09-27';

const CONTENT: Record<'privacy' | 'terms' | 'shipping', { en: Doc; es: Doc }> = {
  privacy: {
    en: {
      title: 'Privacy Policy',
      updated: LAST_UPDATED,
      intro:
        'ADO Palm Winery ("we", "us") respects your privacy. This policy explains what personal information we collect, how we use it, and the choices you have.',
      sections: [
        {
          heading: 'Information we collect',
          body: [
            'Account information you provide: name, email, phone number, and shipping/billing addresses.',
            'Order information: products purchased, currency, order total, and delivery details.',
            'Payment information is collected and processed directly by our payment processor (ONVO Pay). We do not store your card details on our servers.',
            'Technical information: IP address, browser type, device information, and pages visited. Used to secure the site and improve the experience.',
          ],
        },
        {
          heading: 'How we use your information',
          body: [
            'To process and fulfill your orders, including verifying legal drinking age at delivery.',
            'To provide customer support and respond to your inquiries.',
            'To send transactional emails (order confirmations, shipping updates, password resets).',
            'To detect and prevent fraud, abuse, and unauthorized activity.',
            'To comply with our legal obligations, including alcohol-sale record-keeping.',
          ],
        },
        {
          heading: 'Sharing your information',
          body: [
            'We share information with service providers strictly to deliver our service: our payment processor (ONVO Pay), our email provider (Resend), our hosting provider (Render), and shipping carriers.',
            'We may share information if required by law, subpoena, or to protect our rights and users.',
            'We do not sell your personal information.',
          ],
        },
        {
          heading: 'Your rights',
          body: [
            'You may request access to, correction of, or deletion of your personal information by emailing info@adopalmwinery.com.',
            'You may close your account at any time. We retain order records as required by applicable tax and alcohol-sale laws.',
          ],
        },
        {
          heading: 'Cookies',
          body: [
            'We use essential cookies to keep you signed in and remember your cart. We do not use third-party advertising or tracking cookies.',
          ],
        },
        {
          heading: 'Contact',
          body: ['Questions about this policy: info@adopalmwinery.com'],
        },
      ],
    },
    es: {
      title: 'Politica de Privacidad',
      updated: LAST_UPDATED,
      intro:
        'ADO Palm Winery ("nosotros") respeta tu privacidad. Esta politica explica que informacion personal recopilamos, como la usamos y las opciones que tienes.',
      sections: [
        {
          heading: 'Informacion que recopilamos',
          body: [
            'Informacion de cuenta que proporcionas: nombre, correo, telefono y direcciones de envio/facturacion.',
            'Informacion de pedido: productos comprados, moneda, total y detalles de entrega.',
            'La informacion de pago es recopilada y procesada directamente por nuestro procesador de pagos (ONVO Pay). No almacenamos los datos de tu tarjeta en nuestros servidores.',
            'Informacion tecnica: direccion IP, tipo de navegador, informacion del dispositivo y paginas visitadas. Usada para asegurar el sitio y mejorar la experiencia.',
          ],
        },
        {
          heading: 'Como usamos tu informacion',
          body: [
            'Para procesar y cumplir tus pedidos, incluyendo la verificacion de edad legal para beber al momento de la entrega.',
            'Para brindar atencion al cliente y responder a tus consultas.',
            'Para enviar correos transaccionales (confirmaciones de pedido, actualizaciones de envio, restablecimientos de contrasena).',
            'Para detectar y prevenir fraude, abuso y actividad no autorizada.',
            'Para cumplir con nuestras obligaciones legales, incluida la conservacion de registros de venta de alcohol.',
          ],
        },
        {
          heading: 'Compartir tu informacion',
          body: [
            'Compartimos informacion con proveedores de servicios estrictamente para brindar nuestro servicio: nuestro procesador de pagos (ONVO Pay), nuestro proveedor de correo (Resend), nuestro proveedor de hosting (Render) y los transportistas.',
            'Podemos compartir informacion si lo requiere la ley, una orden judicial o para proteger nuestros derechos y usuarios.',
            'No vendemos tu informacion personal.',
          ],
        },
        {
          heading: 'Tus derechos',
          body: [
            'Puedes solicitar acceso, correccion o eliminacion de tu informacion personal enviando un correo a info@adopalmwinery.com.',
            'Puedes cerrar tu cuenta en cualquier momento. Conservamos los registros de pedidos segun lo requieran las leyes fiscales y de venta de alcohol aplicables.',
          ],
        },
        {
          heading: 'Cookies',
          body: [
            'Usamos cookies esenciales para mantenerte con sesion iniciada y recordar tu carrito. No usamos cookies publicitarias o de rastreo de terceros.',
          ],
        },
        {
          heading: 'Contacto',
          body: ['Preguntas sobre esta politica: info@adopalmwinery.com'],
        },
      ],
    },
  },
  terms: {
    en: {
      title: 'Terms of Service',
      updated: LAST_UPDATED,
      intro:
        'By using adopalmwinery.com and purchasing from us, you agree to these Terms. Please read them carefully.',
      sections: [
        {
          heading: 'Age requirement',
          body: [
            'You must be of legal drinking age in your jurisdiction (18+ in Costa Rica, 21+ in the United States) to purchase or receive alcoholic products from us.',
            'By placing an order, you certify that you meet the applicable age requirement.',
            'An adult 18+ (or 21+ where required) with a valid government-issued photo ID must be present to accept delivery of alcohol.',
          ],
        },
        {
          heading: 'Orders and pricing',
          body: [
            'All prices are shown in your selected currency. Payment is charged in the currency displayed at checkout.',
            'We reserve the right to refuse or cancel any order, including for suspected fraud, pricing errors, or inability to verify age at delivery.',
            'Stock is not reserved until payment is confirmed. Rare oversells will be refunded in full.',
          ],
        },
        {
          heading: 'Shipping and delivery',
          body: [
            'We ship internationally. Shipping cost and delivery timelines are shown at checkout and depend on destination and weight.',
            'You are responsible for ensuring alcohol delivery is legal to your address. Some jurisdictions restrict alcohol shipping.',
            'Risk of loss transfers to you at delivery. Please inspect your shipment and report any damage within 48 hours.',
          ],
        },
        {
          heading: 'Returns and refunds',
          body: [
            'Due to the nature of alcohol, we do not accept returns of opened bottles.',
            'If your order arrives damaged or incorrect, contact info@adopalmwinery.com within 48 hours with photos. We will arrange a replacement or refund.',
            'Refunds are issued to the original payment method through ONVO Pay.',
          ],
        },
        {
          heading: 'Prohibited use',
          body: [
            'You may not use our site to resell products commercially without a wholesale agreement, or to make purchases on behalf of a person who does not meet the legal drinking age.',
          ],
        },
        {
          heading: 'Limitation of liability',
          body: [
            'We are not liable for any indirect, incidental, or consequential damages arising from your use of our products. Please drink responsibly.',
          ],
        },
        {
          heading: 'Governing law',
          body: [
            'These Terms are governed by the laws of Costa Rica.',
          ],
        },
        {
          heading: 'Contact',
          body: ['Questions about these Terms: info@adopalmwinery.com'],
        },
      ],
    },
    es: {
      title: 'Terminos de Servicio',
      updated: LAST_UPDATED,
      intro:
        'Al usar adopalmwinery.com y comprar con nosotros, aceptas estos Terminos. Por favor leelos con atencion.',
      sections: [
        {
          heading: 'Requisito de edad',
          body: [
            'Debes tener la edad legal para beber en tu jurisdiccion (18+ en Costa Rica, 21+ en Estados Unidos) para comprar o recibir productos alcoholicos de nuestra parte.',
            'Al realizar un pedido, certificas que cumples con el requisito de edad aplicable.',
            'Un adulto de 18+ (o 21+ donde corresponda) con identificacion oficial valida debe estar presente para recibir la entrega de alcohol.',
          ],
        },
        {
          heading: 'Pedidos y precios',
          body: [
            'Todos los precios se muestran en la moneda que selecciones. El cobro se realiza en la moneda mostrada en el checkout.',
            'Nos reservamos el derecho de rechazar o cancelar cualquier pedido, incluyendo por sospecha de fraude, errores de precio o imposibilidad de verificar la edad en la entrega.',
            'El stock no queda reservado hasta que se confirma el pago. En caso raro de sobreventa se reembolsara la totalidad.',
          ],
        },
        {
          heading: 'Envio y entrega',
          body: [
            'Enviamos internacionalmente. El costo y los plazos de envio se muestran en el checkout y dependen del destino y el peso.',
            'Eres responsable de asegurar que la entrega de alcohol sea legal en tu direccion. Algunas jurisdicciones restringen el envio de alcohol.',
            'El riesgo de perdida se transfiere a ti en la entrega. Inspecciona tu envio y reporta cualquier dano dentro de 48 horas.',
          ],
        },
        {
          heading: 'Devoluciones y reembolsos',
          body: [
            'Debido a la naturaleza del alcohol, no aceptamos devoluciones de botellas abiertas.',
            'Si tu pedido llega danado o incorrecto, contactanos a info@adopalmwinery.com dentro de 48 horas con fotos. Coordinaremos un reemplazo o reembolso.',
            'Los reembolsos se emiten al metodo de pago original a traves de ONVO Pay.',
          ],
        },
        {
          heading: 'Uso prohibido',
          body: [
            'No puedes usar nuestro sitio para revender productos comercialmente sin un acuerdo de mayorista, ni para hacer compras en nombre de una persona que no cumpla con la edad legal para beber.',
          ],
        },
        {
          heading: 'Limitacion de responsabilidad',
          body: [
            'No somos responsables por danos indirectos, incidentales o consecuentes que surjan del uso de nuestros productos. Por favor bebe con responsabilidad.',
          ],
        },
        {
          heading: 'Ley aplicable',
          body: [
            'Estos Terminos se rigen por las leyes de Costa Rica.',
          ],
        },
        {
          heading: 'Contacto',
          body: ['Preguntas sobre estos Terminos: info@adopalmwinery.com'],
        },
      ],
    },
  },
  shipping: {
    en: {
      title: 'Shipping & Returns',
      updated: LAST_UPDATED,
      intro:
        'Where we ship, how long it takes, and what to do if something arrives wrong.',
      sections: [
        {
          heading: 'Where we ship',
          body: [
            'We ship worldwide from Liberia, Costa Rica.',
            'Some jurisdictions restrict or prohibit alcohol delivery. It is your responsibility to confirm that alcohol delivery is legal at your address before ordering.',
          ],
        },
        {
          heading: 'Shipping cost',
          body: [
            'Shipping is calculated at checkout based on destination and total weight. Rates and delivery estimates appear before you pay.',
          ],
        },
        {
          heading: 'Delivery times',
          body: [
            'Costa Rica: 2–4 business days',
            'United States and Canada: 7–14 business days',
            'Europe and United Kingdom: 10–18 business days',
            'Rest of world: 14–28 business days',
            'These are typical windows — customs delays can occur and are outside our control.',
          ],
        },
        {
          heading: 'Adult signature required',
          body: [
            'An adult 18+ (or 21+ in the United States) with a valid government-issued photo ID must be present to sign for the delivery. Shipments that cannot be delivered because no eligible adult is available will be returned to us at your cost.',
          ],
        },
        {
          heading: 'Damaged or incorrect orders',
          body: [
            'Contact info@adopalmwinery.com within 48 hours of delivery with your order number and photos of the damage or incorrect items.',
            'We will arrange a replacement shipment or issue a refund via ONVO Pay to your original payment method.',
          ],
        },
        {
          heading: 'Returns',
          body: [
            'Because we sell alcohol, we cannot accept returns of opened bottles.',
            'Unopened bottles may be returned in original condition within 14 days of delivery at your cost — email us first so we can authorize the return.',
          ],
        },
        {
          heading: 'Customs and duties',
          body: [
            'International orders may incur customs duties or import taxes. These are the responsibility of the recipient and are not included in the shipping cost.',
          ],
        },
      ],
    },
    es: {
      title: 'Envio y Devoluciones',
      updated: LAST_UPDATED,
      intro:
        'A donde enviamos, cuanto demora y que hacer si algo llega mal.',
      sections: [
        {
          heading: 'A donde enviamos',
          body: [
            'Enviamos a todo el mundo desde Liberia, Costa Rica.',
            'Algunas jurisdicciones restringen o prohiben la entrega de alcohol. Es tu responsabilidad confirmar que la entrega de alcohol sea legal en tu direccion antes de ordenar.',
          ],
        },
        {
          heading: 'Costo de envio',
          body: [
            'El envio se calcula en el checkout segun el destino y el peso total. Las tarifas y los tiempos estimados aparecen antes de pagar.',
          ],
        },
        {
          heading: 'Tiempos de entrega',
          body: [
            'Costa Rica: 2–4 dias habiles',
            'Estados Unidos y Canada: 7–14 dias habiles',
            'Europa y Reino Unido: 10–18 dias habiles',
            'Resto del mundo: 14–28 dias habiles',
            'Estos son plazos tipicos — pueden ocurrir demoras en aduanas fuera de nuestro control.',
          ],
        },
        {
          heading: 'Firma de adulto requerida',
          body: [
            'Un adulto de 18+ (o 21+ en Estados Unidos) con identificacion oficial valida debe estar presente para firmar la entrega. Los envios que no puedan entregarse por falta de un adulto elegible seran devueltos a nosotros a tu costo.',
          ],
        },
        {
          heading: 'Pedidos danados o incorrectos',
          body: [
            'Contactanos a info@adopalmwinery.com dentro de 48 horas de la entrega con tu numero de pedido y fotos del dano o los articulos incorrectos.',
            'Coordinaremos un reemplazo o emitiremos un reembolso via ONVO Pay al metodo de pago original.',
          ],
        },
        {
          heading: 'Devoluciones',
          body: [
            'Como vendemos alcohol, no podemos aceptar devoluciones de botellas abiertas.',
            'Las botellas sin abrir pueden devolverse en condiciones originales dentro de los 14 dias de entrega a tu costo — escribenos antes para autorizar la devolucion.',
          ],
        },
        {
          heading: 'Aduanas e impuestos',
          body: [
            'Los pedidos internacionales pueden generar aranceles o impuestos de importacion. Estos son responsabilidad del destinatario y no estan incluidos en el costo de envio.',
          ],
        },
      ],
    },
  },
};

type Key = keyof typeof CONTENT;

function pageKey(pathname: string): Key {
  if (pathname.startsWith('/terms')) return 'terms';
  if (pathname.startsWith('/shipping')) return 'shipping';
  return 'privacy';
}

export default function Legal() {
  const { i18n } = useTranslation();
  const { pathname } = useLocation();
  const key = pageKey(pathname);
  const lang: 'en' | 'es' = i18n.language?.startsWith('es') ? 'es' : 'en';
  const doc = CONTENT[key][lang];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 font-[family-name:var(--font-heading)]">
        {doc.title}
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        {lang === 'es' ? 'Ultima actualizacion' : 'Last updated'}: {doc.updated}
      </p>

      {doc.intro && <p className="text-gray-700 leading-relaxed mb-10">{doc.intro}</p>}

      <div className="space-y-10">
        {doc.sections.map(s => (
          <section key={s.heading}>
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">{s.heading}</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              {s.body.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-14 pt-6 border-t border-gray-200 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
        <Link to="/privacy" className="hover:text-gray-900">{lang === 'es' ? 'Privacidad' : 'Privacy'}</Link>
        <Link to="/terms" className="hover:text-gray-900">{lang === 'es' ? 'Terminos' : 'Terms'}</Link>
        <Link to="/shipping" className="hover:text-gray-900">{lang === 'es' ? 'Envio y Devoluciones' : 'Shipping & Returns'}</Link>
        <Link to="/contact" className="hover:text-gray-900">{lang === 'es' ? 'Contacto' : 'Contact'}</Link>
      </div>
    </div>
  );
}
