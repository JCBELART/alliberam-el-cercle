import type { Metadata } from 'next';
import LegalPage from '../../components/LegalPage';

export const metadata: Metadata = {
  title: 'Dret de desistiment · El Cercle',
  description: 'Com exercir el dret de desistiment en la compra de les ampolles El Cercle.',
};

export default function DesistimientoPage() {
  return (
    <LegalPage
      title="Dret de desistiment"
      subtitle="Tens 14 dies naturals per desistir de la teva compra sense justificar-ho."
      updatedAt="6 de novembre de 2026"
      sections={[
        {
          heading: '1. Termini',
          paragraphs: [
            'El termini de desistiment és de 14 dies naturals a comptar des del dia en què tu o una persona autoritzada per tu rebeu el producte. Si la comanda inclou diverses ampolles lliurades per separat, el termini comença amb la recepció de la darrera.',
          ],
        },
        {
          heading: '2. Com exercir-lo',
          paragraphs: [
            'Per exercir el dret de desistiment, has de notificar-nos la teva decisió de forma inequívoca abans que finalitzi el termini. Pots fer-ho per correu electrònic a hola@alliberamelcercle.digital o per correu postal a DELIFUSION FOOD & DRINK S.L., Calle Moriles 8 Casa 25, 29740 Vélez-Málaga (Málaga).',
            'Pots utilitzar el formulari model que trobaràs a continuació, tot i que no és obligatori. Si vols, també pots trucar-nos al 640 543 624 perquè et guiem.',
          ],
        },
        {
          heading: '3. Formulari model',
          paragraphs: [
            'A la atenció de DELIFUSION FOOD & DRINK S.L., Calle Moriles 8 Casa 25, 29740 Vélez-Málaga (Málaga), hola@alliberamelcercle.digital:',
            'Per la present us comunico que desisteixo del meu contracte de compravenda del producte següent: vi El Cercle, comanda número [NÚMERO DE COMANDA], rebuda el [DATA DE RECEPCIÓ].',
            'Nom i cognoms del consumidor: [NOM]. Adreça: [ADREÇA]. Signatura (només si s’envia en paper). Data: [DATA].',
          ],
        },
        {
          heading: '4. Devolució del producte',
          paragraphs: [
            'Un cop comunicat el desistiment, has de retornar el producte sense cap demora indeguda i, en tot cas, dins dels 14 dies naturals següents. Les despeses directes de devolució van a càrrec teu, tret que el producte sigui defectuós o no coincideixi amb la comanda.',
            'Les ampolles s’han de retornar precintades, en bon estat i amb l’embalatge original. Et recomanem fer servir un transportista que permeti el seguiment del paquet.',
          ],
        },
        {
          heading: '5. Reembossament',
          paragraphs: [
            'Et retornarem l’import pagat, incloses les despeses d’enviament estàndard, en un termini màxim de 14 dies naturals des que rebem la teva comunicació o, si és posterior, des que rebem el producte retornat.',
            'El reembossament es farà pel mateix mitjà de pagament que vas utilitzar. En el cas de Bizum, et demanarem les dades necessàries per fer la transferència.',
          ],
        },
        {
          heading: '6. Excepcions',
          paragraphs: [
            'No hi ha dret de desistiment quan les ampolles han estat obertes o precintades de manera que no es poden retornar per raons de protecció de la salut, ni quan el producte ha estat confeccionat segons especificacions del consumidor (per exemple, una contraetiqueta personalitzada), d’acord amb l’article 103 de la Llei General per a la Defensa dels Consumidors i Usuaris.',
            'Tampoc s’aplica el dret de desistiment als productes que es deteriorin amb rapidesa o que tinguin una data de caducitat propera, quan ja hagin estat lliurats.',
          ],
        },
      ]}
    />
  );
}
