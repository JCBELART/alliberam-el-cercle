import type { Metadata } from 'next';
import LegalPage from '../../components/LegalPage';

export const metadata: Metadata = {
  title: 'Política de privacitat · El Cercle',
  description: 'Com tractem les teves dades personals quan compres a El Cercle.',
};

export default function PrivacidadPage() {
  return (
    <LegalPage
      title="Política de privacitat"
      subtitle="Informació sobre el tractament de dades personals d'acord amb el RGPD i la LOPDGDD."
      updatedAt="6 de novembre de 2026"
      sections={[
        {
          heading: '1. Responsable del tractament',
          paragraphs: [
            'El responsable del tractament de les teves dades és DELIFUSION FOOD & DRINK S.L., NIF B16449233, Calle Moriles 8 Casa 25, 29740 Vélez-Málaga (Málaga). Pots contactar-nos a hola@alliberamelcercle.digital o al 640 543 624.',
          ],
        },
        {
          heading: '2. Finalitats del tractament',
          paragraphs: [
            'Gestionar i executar la teva comanda: identificar-te, processar el pagament, assignar-te els números de sèrie de les ampolles, generar el certificat de propietat, enviar-te el correu de confirmació i lliurar la comanda al transportista.',
            'Emetre la factura quan sol·licitis factura amb dades fiscals, en compliment de les obligacions comptables i fiscals.',
            'Atendre consultes, incidències, devolucions i exercici de drets.',
            'Enviar-te comunicacions comercials sobre El Cercle o futures edicions, només si has donat el teu consentiment exprés mitjançant la casella corresponent.',
          ],
        },
        {
          heading: '3. Base jurídica',
          paragraphs: [
            'L’execució del contracte de compravenda i l’aplicació de mesures precontractuals (art. 6.1.b RGPD) per a la gestió de la comanda i l’enviament.',
            'El compliment d’obligacions legals (art. 6.1.c RGPD) per a la facturació i la conservació de documents.',
            'El consentiment (art. 6.1.a RGPD) per a les comunicacions comercials. Pots retirar-lo en qualsevol moment sense que això afecti la licitud del tractament previ.',
            'L’interès legítim (art. 6.1.f RGPD) per a la seguretat del lloc i la prevenció del frau.',
          ],
        },
        {
          heading: '4. Conservació de les dades',
          paragraphs: [
            'Les dades relacionades amb la comanda es conserven durant el temps necessari per gestionar-la i, després, durant els terminis de prescripció legal i les obligacions fiscals i comptables (amb caràcter general, fins a 6 anys).',
            'Les dades per a comunicacions comercials es conserven fins que retiris el consentiment o sol·licitis la supressió.',
          ],
        },
        {
          heading: '5. Destinataris i encarregats',
          paragraphs: [
            'Les teves dades poden ser comunicades als proveïdors que ens ajuden a prestar el servei: Stripe (processament de pagaments), Resend (enviament de correus), Vercel (allotjament i emmagatzematge), el banc per a la verificació dels Bizums i l’empresa de transport encarregada del lliurament.',
            'Aquests proveïdors actuen com a encarregats del tractament o com a responsables independents segons el cas, i disposen de les garanties adequades. Algunes transferències internacionals poden implicar garanties com les clàusules contractuals tipus aprovades per la Comissió Europea.',
          ],
        },
        {
          heading: '6. Drets de les persones',
          paragraphs: [
            'Pots exercir els drets d’accés, rectificació, supressió, oposició, limitació del tractament i portabilitat enviant un correu a hola@alliberamelcercle.digital, indicant el dret que vols exercir i adjuntant una còpia d’un document identificatiu.',
            'Si consideres que no hem atès correctament la teva sol·licitud, pots presentar una reclamació davant l’Agència Espanyola de Protecció de Dades (www.aepd.es).',
          ],
        },
        {
          heading: '7. Seguretat',
          paragraphs: [
            'Apliquem mesures tècniques i organitzatives raonables per protegir les dades contra l’accés no autoritzat, la pèrdua o l’alteració, incloent-hi xifratge en trànsit, control d’accés al panell d’administració i minimització de dades.',
            'No elaborem perfils comercials automatitzats ni prenem decisions automatitzades amb efectes jurídics sobre tu.',
          ],
        },
      ]}
    />
  );
}
