import type { Metadata } from 'next';
import LegalPage from '../../components/LegalPage';

export const metadata: Metadata = {
  title: 'Condicions de compra · El Cercle',
  description: 'Condicions generals de venda de les ampolles El Cercle.',
};

export default function CondicionesPage() {
  return (
    <LegalPage
      title="Condicions de compra"
      subtitle="Condicions generals que regeixen la venda de les ampolles de l'edició El Cercle."
      updatedAt="6 de novembre de 2026"
      sections={[
        {
          heading: '1. Identificació del venedor',
          paragraphs: [
            'El venedor és DELIFUSION FOOD & DRINK S.L., NIF B16449233, amb domicili a Calle Moriles 8 Casa 25, 29740 Vélez-Málaga (Málaga). Contacte: hola@alliberamelcercle.digital · 640 543 624.',
          ],
        },
        {
          heading: '2. Producte',
          paragraphs: [
            '«El Cercle» és una edició limitada i numerada de vi de la comarca de la Terra Alta. Cada comanda inclou ampolles numerades correlativament dins de la tirada vigent i un certificat digital de propietat amb un codi QR únic per ampolla.',
            'Les fotografies i descripcions són orientatives. El color, el got i els detalls de l’etiqueta poden variar lleugerament per les característiques artesanals del producte.',
          ],
        },
        {
          heading: '3. Preu i disponibilitat',
          paragraphs: [
            'El preu de cada ampolla és de 7,50 € (IVA inclòs). Les despeses d’enviament són de 5,50 € per comanda amb destinació a la Península i les Illes Balears.',
            'La tirada vigent és de 500 ampolles. Quan s’esgota, s’inicia automàticament una nova tirada de 500 ampolles amb una numeració nova des de 001. Cada ampolla conserva internament el número de lot per garantir-ne la traçabilitat.',
            'El preu i la disponibilitat es mostren a la web abans de finalitzar la compra. En cas d’error manifest en el preu, et contactarem abans de processar la comanda.',
          ],
        },
        {
          heading: '4. Procés de compra',
          paragraphs: [
            'La compra es formalitza en cinc passos: selecció de les etiquetes i el tipus de vi, dades de contacte i enviament, resum i pagament. Abans de pagar has d’acceptar aquestes condicions i la política de privacitat.',
            'Un cop rebut el pagament, rebràs un correu de confirmació amb el certificat de propietat en PDF. Si has sol·licitat factura amb dades fiscals, també rebràs la factura adjunta.',
          ],
        },
        {
          heading: '5. Formes de pagament',
          paragraphs: [
            'Targeta de crèdit o dèbit, Apple Pay i Google Pay mitjançant Stripe. El càrrec es fa en euros i Stripe aplica els mecanismes de seguretat i autenticació reforçada (3D Secure) quan correspongui.',
            'Bizum: el client fa l’enviament al número 640 543 624 indicant el nom i el codi de comanda al concepte. La comanda queda pendent fins que verifiquem manualment l’arribada de l’import. En confirmar-la, s’assignen les ampolles i s’envia el certificat. Si no es rep el Bizum en un termini raonable, la comanda es pot cancel·lar.',
          ],
        },
        {
          heading: '6. Enviament i lliurament',
          paragraphs: [
            'Enviem a la Península i les Illes Balears. El termini habitual de lliurament és de 3 a 7 dies laborables des de la confirmació del pagament, sense comptar incidències del transportista.',
            'Cal que siguis major d’edat per rebre el lliurament. Si el transportista no pot lliurar la comanda, deixarà un avís per concertar una nova entrega.',
          ],
        },
        {
          heading: '7. Dret de desistiment',
          paragraphs: [
            'Com a consumidor tens dret a desistir de la compra en un termini de 14 dies naturals des de la recepció del producte, sense necessitat de justificar-ho. Pots consultar el procediment i el formulari a la pàgina de desistiment.',
            'El dret de desistiment no s’aplica quan les ampolles han estat obertes o precintades de manera que no es poden retornar per raons de protecció de la salut, ni quan el producte ha estat confeccionat segons especificacions del consumidor (per exemple, contraetiqueta personalitzada), d’acord amb l’article 103 del Text Refós de la Llei General per a la Defensa dels Consumidors i Usuaris.',
          ],
        },
        {
          heading: '8. Devolucions i incidències',
          paragraphs: [
            'Si el producte arriba malmès o no coincideix amb el que has demanat, contacta amb nosaltres a hola@alliberamelcercle.digital o al 640 543 624 en un termini de 14 dies, adjuntant fotografies i el número de comanda. Ens farem càrrec de la recollida i et reenviarem el producte o et retornarem l’import.',
          ],
        },
        {
          heading: '9. Atenció al client i resolució de conflictes',
          paragraphs: [
            'Per a qualsevol consulta o reclamació pots escriure a hola@alliberamelcercle.digital o trucar al 640 543 624. Et responem en el termini més breu possible i, en tot cas, en el termini legalment establert.',
            'Aquestes condicions es regeixen per la legislació espanyola. Com a consumidor pots adreçar-te als jutjats del teu domicili. També pots utilitzar la plataforma europea de resolució de litigis en línia.',
          ],
        },
      ]}
    />
  );
}
