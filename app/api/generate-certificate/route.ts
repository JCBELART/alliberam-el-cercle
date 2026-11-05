import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { generateDiplomaBuffer } from '../../../lib/generateDiploma';
import fs from 'fs';
import path from 'path';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    // Datos de prueba o dinámicos (Nombre y apellidos SIEMPRE EN MAYÚSCULAS)
    const buyerName = "JOAN CARLES BELTRÁN ARTOLA";
    const orderNumber = "ALB-2026-001";
    const dateStr = "03/11/2026";
    const recipientEmail = "joancarlesdisseny@hotmail.com";

    // Colección de botellas de prueba
    const selectedBottles = [
      "Montserrat (Barcelona)",
      "Costa Brava (Girona)",
      "Seu Vella (Lleida)",
      "Els Segadors",
      "Catedral de Tarragona",
      "Pont Vell de Besalú"
    ];

    // 1. Generar el PDF en memoria como Buffer
    const pdfBuffer = await generateDiplomaBuffer(buyerName, orderNumber, dateStr, selectedBottles);

    // 2. Cargar el logotipo local en Base64 para que nunca se rompa en los clientes de correo (Hotmail, Gmail, etc.)
    let logoBase64 = '';
    try {
      const logoPath = path.join(process.cwd(), 'public', 'LOGO_NEGRE.png');
      const logoBuffer = fs.readFileSync(logoPath);
      logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    } catch (e) {
      console.error("No se pudo cargar LOGO_NEGRE.png desde public/:", e);
    }

    // 3. Enviar el correo a través de Resend con la Opción B en el asunto
    const data = await resend.emails.send({
      from: 'El Cercle <onboarding@resend.dev>',
      to: [recipientEmail],
      subject: `EL CERCLE - Enhorabona, Joan Carles. Ja tenim a punt la teva edició exclusiva i el teu certificat.`,
      html: `
        <div style="background-color: #111111; padding: 40px 20px; font-family: 'Helvetica Neue', Arial, sans-serif; color: #f5f5f5; text-align: center;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #1c1c1c; border: 1px solid #333333; border-radius: 8px; overflow: hidden; padding: 40px; text-align: center;">
            
            <!-- Logotipo Institucional Centrado (Base64) -->
            <div style="margin-bottom: 30px; text-align: center;">
              ${logoBase64 ? `<img src="${logoBase64}" alt="El Cercle" style="width: 120px; height: auto; display: block; margin: 0 auto 15px auto;" />` : ''}
              <h1 style="color: #d4af37; font-size: 22px; letter-spacing: 3px; margin: 0; font-weight: 300;">EL CERCLE</h1>
              <p style="color: #888888; font-size: 11px; letter-spacing: 2px; margin-top: 5px; text-transform: uppercase;">EDICIÓ COMMEMORATIVA I LIMITADA 2026</p>
            </div>

            <!-- Cuerpo del Mensaje Centrado con Agradecimiento -->
            <div style="font-size: 15px; line-height: 1.6; color: #cccccc; text-align: center;">
              <p style="margin-bottom: 20px;">Benvolgut/da <strong>${buyerName}</strong>,</p>
              
              <p style="margin-bottom: 20px;">Us volem agrair sincerament la vostra confiança en adquirir les ampolles de la nostra col·lecció exclusiva i limitada. Cada ampolla duu el vostre nom gravat, un número de col·lecció exclusiu i us convida a viure una experiència única a través del mòbil.</p>

              <div style="background-color: #262626; border: 1px solid #333333; padding: 15px 20px; margin: 25px auto; border-radius: 4px; display: inline-block; text-align: center; width: 80%;">
                <p style="margin: 0; color: #ffffff; font-size: 14px;"><strong>Referència de comanda:</strong> ${orderNumber}</p>
                <p style="margin: 8px 0 0 0; color: #d4af37; font-size: 13px;">Adjunt trobaràs el teu Certificat Oficial de Propietat numerat<br>en format PDF.</p>
              </div>

              <p style="margin-bottom: 30px;">Gràcies per la vostra complicitat en aquesta edició limitada i irrepetible.<br>Ens veiem a El Cercle.</p>
            </div>

            <!-- Firma Institucional Centrada -->
            <div style="border-top: 1px solid #333333; padding-top: 20px; margin-top: 30px; text-align: center;">
              <p style="margin: 0; font-size: 13px; color: #888888;">Cordialment,</p>
              <p style="margin: 5px 0 5px 0; font-size: 14px; color: #d4af37; font-weight: bold;">L'equip d'Allibera'm</p>
              <p style="margin: 15px 0 5px 0; font-size: 14px; color: #ffffff; font-weight: bold;">JOAN CARLES BELTRÁN ARTOLA</p>
              <p style="margin: 0; font-size: 13px; color: #aaaaaa;">Tel: 640543624</p>
            </div>

            <!-- Textos Legales y Disclaimer de Envío de Mails -->
            <div style="border-top: 1px solid #222222; padding-top: 20px; margin-top: 30px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #666666; line-height: 1.4;">
                Aquest correu electrònic i els seus fitxers adjunts són confidencials i dirigits exclusivament al seu destinatari. Si l'heu rebut per error, si us plau, notifiqueu-ho immediatament al remitent i elimineu-lo del vostre sistema.<br>
                Compliment de la normativa de protecció de dades (RGPD). Podeu exercir els vostres drets de accés, rectificació i supressió contactant amb nosaltres.<br>
                &copy; 2026 ALLIBERA'M - EL CERCLE. Tots els drets reservats.
              </p>
            </div>

          </div>
        </div>
      `,
      attachments: [
        {
          filename: `Certificat_El_Cercle_${orderNumber}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error crítico detallado en /api/generate-certificate:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error desconocido en el servidor" },
      { status: 500 }
    );
  }
}