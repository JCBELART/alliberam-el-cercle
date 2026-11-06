import type { Metadata } from 'next';
import LegalPage from '../../components/LegalPage';

export const metadata: Metadata = {
  title: 'Política de cookies · El Cercle',
  description: 'Quines cookies utilitza El Cercle i com pots gestionar-les.',
};

export default function CookiesPage() {
  return (
    <LegalPage
      title="Política de cookies"
      subtitle="Informació sobre les cookies i tecnologies similars que utilitza aquest lloc web."
      updatedAt="6 de novembre de 2026"
      sections={[
        {
          heading: '1. Què són les cookies?',
          paragraphs: [
            'Les cookies són petits fitxers que es desen al teu dispositiu quan visites un lloc web. Serveixen per recordar informació sobre la teva visita, com les preferències o l’estat del carret, i per obtenir estadístiques d’ús.',
            'També utilitzem emmagatzematge local del navegador (localStorage) per recordar la teva confirmació d’edat i la teva decisió sobre les cookies.',
          ],
        },
        {
          heading: '2. Cookies que utilitzem',
          paragraphs: [
            'Cookies tècniques necessàries: permeten el funcionament bàsic del lloc, com recordar la teva elecció al bàner de cookies o mantenir la sessió de compra. No requereixen consentiment.',
            'Cookies de preferències: recorden la teva confirmació de majoria d’edat per no tornar a mostrar el missatge en cada visita. Es desen al teu navegador i no s’envien a tercers.',
            'Cookies de tercers necessàries per al pagament: Stripe pot instal·lar cookies pròpies durant el procés de pagament per prevenció del frau i seguretat. Es regeixen per la política de Stripe.',
            'Cookies analítiques: només s’activarien amb el teu consentiment exprés. Actualment no instal·lem cap eina d’analítica de tercers.',
          ],
        },
        {
          heading: '3. Consentiment i configuració',
          paragraphs: [
            'En la teva primera visita et mostrem un bàner on pots acceptar o rebutjar les cookies no necessàries. Les cookies tècniques i de seguretat s’activen sempre perquè són imprescindibles per al funcionament del lloc.',
            'Pots canviar o retirar el teu consentiment en qualsevol moment esborrant les dades del lloc al teu navegador i tornant a entrar. També pots configurar el navegador per bloquejar o eliminar cookies.',
          ],
        },
        {
          heading: '4. Com desactivar les cookies',
          paragraphs: [
            'Pots gestionar les cookies des de la configuració del teu navegador: Chrome, Safari, Firefox i Edge permeten bloquejar-les, eliminar-les o rebre avisos abans que es desin.',
            'Si bloqueges totes les cookies, algunes funcions del lloc —com el procés de compra o la confirmació d’edat— poden no funcionar correctament.',
          ],
        },
        {
          heading: '5. Actualitzacions',
          paragraphs: [
            'Aquesta política es pot actualitzar si canvien les cookies utilitzades o la normativa aplicable. Et recomanem revisar-la periòdicament.',
          ],
        },
      ]}
    />
  );
}
