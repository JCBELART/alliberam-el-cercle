import { Resend } from 'resend';
import { generateDiplomaBuffer } from './generateDiploma';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendCertificateEmail({
  toEmail,
  buyerName,
  orderNumber,
  dateStr,
  bottles,
}: {
  toEmail: string;
  buyerName: string;
  orderNumber: string;
  dateStr: string;
  bottles: string[];
}) {
  // 1. Generar el PDF del diploma en Buffer
  const pdfBuffer = await generateDiplomaBuffer(buyerName, orderNumber, dateStr, bottles);

  // 2. Asunto oficial
  const subject = `El Cercle - Enhorabona, ${buyerName}. Ja tenim a punt la teva edició exclusiva i el teu certificat.`;

  // 3. Plantilla HTML profesional con el texto corregido
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>El Cercle - Certificat d'Autenticitat</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #111111; font-family: Helvetica, Arial, sans-serif; color: #ffffff;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #161616; padding: 40px; border-radius: 8px; margin-top: 20px; margin-bottom: 20px;">
          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <!-- Logo en Base64 -->
              <img src="data:image/png;base64,TU0AK..." alt="El Cercle" width="120" style="display: block; border: 0;" />
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <h1 style="color: #c5a880; font-size: 22px; margin: 0; letter-spacing: 2px; font-weight: bold;">EL CERCLE</h1>
              <p style="color: #aaaaaa; font-size: 13px; margin-top: 6px; margin-bottom: 0; letter-spacing: 1.5px; text-transform: uppercase;">EDICIÓ COMMEMORATIVA I LIMITADA 2026</p>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 20px; border-top: 1px solid #333333;">
              <p style="color: #dddddd; font-size: 15px; line-height: 1.6; margin-bottom: 15px;">
                Benvolgut/da <strong>${buyerName.toUpperCase()}</strong>,
              </p>
              <p style="color: #dddddd; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
                Ja tenim a punt la teva edició exclusiva i el teu certificat adjunt en aquest correu.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 20px; border-top: 1px solid #333333; color: #888888; font-size: 12px; text-align: center;">
              <p style="margin: 0;">&copy; 2026 El Cercle. Tots els drets reservats.</p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  // 4. Envío a través de Resend adjuntando el PDF generado
  const response = await resend.emails.send({
    from: 'El Cercle <onboarding@resend.dev>',
    to: toEmail,
    subject: subject,
    html: htmlContent,
    attachments: [
      {
        filename: `Certificat_El_Cercle_${orderNumber}.pdf`,
        content: pdfBuffer,
      },
    ],
  });

  return response;
}