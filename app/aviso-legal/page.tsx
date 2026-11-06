import type { Metadata } from 'next';
import LegalPage from '../../components/LegalPage';

export const metadata: Metadata = {
  title: 'Avís legal · El Cercle',
  description: 'Informació legal del titular del lloc web El Cercle.',
};

export default function AvisoLegalPage() {
  return (
    <LegalPage
      title="Avís legal"
      subtitle="Informació sobre el titular d'aquest lloc web i les condicions d'ús."
      updatedAt="6 de novembre de 2026"
      sections={[
        {
          heading: '1. Titular del lloc web',
          paragraphs: [
            'En compliment de l’article 10 de la Llei 34/2002, de Serveis de la Societat de la Informació i de Comerç Electrònic (LSSI-CE), s’informa que aquest lloc web és titularitat de DELIFUSION FOOD & DRINK S.L., amb NIF B16449233 i domicili social a Calle Moriles 8 Casa 25, 29740 Vélez-Málaga (Málaga), Espanya.',
            'Correu electrònic de contacte: hola@alliberamelcercle.digital. Telèfon: 640 543 624.',
          ],
        },
        {
          heading: '2. Objecte',
          paragraphs: [
            'Aquest lloc web té com a finalitat presentar i comercialitzar l’edició limitada i numerada «El Cercle», un vi de la comarca de la Terra Alta, així com oferir la informació i els serveis relacionats amb la compra, el certificat de propietat i l’experiència digital associada a cada ampolla.',
            'L’accés al lloc web atribueix la condició d’usuari i implica l’acceptació plena d’aquest avís legal. L’usuari es compromet a utilitzar el lloc de forma diligent, correcta i lícita.',
          ],
        },
        {
          heading: '3. Accés i ús',
          paragraphs: [
            'L’accés a aquest lloc web està restringit a persones majors de 18 anys. En confirmar l’edat, l’usuari declara tenir l’edat legal per consumir alcohol al país de residència.',
            'L’usuari és responsable de la veracitat de les dades que faciliti i de la confidencialitat de les seves credencials. Queda prohibit l’ús del lloc amb finalitats fraudulentes, il·lícites o que puguin perjudicar tercers o el propi titular.',
          ],
        },
        {
          heading: '4. Propietat intel·lectual i industrial',
          paragraphs: [
            'Tots els continguts d’aquest lloc web —textos, fotografies, dissenys d’etiquetes, logotips, marques, codi font, estructura i elements gràfics— són titularitat de DELIFUSION FOOD & DRINK S.L. o es fan servir amb autorització dels seus titulars, i estan protegits per la normativa de propietat intel·lectual i industrial.',
            'Queda prohibida la reproducció, distribució, transformació, comunicació pública o qualsevol altra forma d’explotació, total o parcial, sense autorització expressa i per escrit del titular.',
          ],
        },
        {
          heading: '5. Responsabilitat',
          paragraphs: [
            'El titular adopta mesures raonables per mantenir el lloc web operatiu, segur i actualitzat, però no garanteix l’absència d’interrupcions, errors o incidències tècniques alienes al seu control.',
            'El titular no serà responsable dels danys derivats d’un ús inadequat del lloc, de la introducció de programari maliciós per part de tercers o de la impossibilitat temporal d’accés al servei.',
          ],
        },
        {
          heading: '6. Enllaços a tercers',
          paragraphs: [
            'El lloc pot incloure enllaços a serveis de tercers, com la passarel·la de pagament Stripe. Aquests serveis es regeixen per les seves pròpies condicions i polítiques de privacitat, sobre les quals el titular no té control directe.',
          ],
        },
        {
          heading: '7. Legislació aplicable i jurisdicció',
          paragraphs: [
            'Aquest avís legal es regeix per la legislació espanyola. Per a qualsevol controvèrsia derivada de l’accés o ús del lloc web, les parts se sotmeten als jutjats i tribunals del domicili de l’usuari consumidor, quan la normativa aplicable així ho estableixi.',
          ],
        },
      ]}
    />
  );
}
