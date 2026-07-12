
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

interface BookingConfirmationBody {
  bookingId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  bookingDate: string
  bookingTime: string
  endTime: string
  totalDuration: number
  services: Array<{
    name: string
    price: number
    isMainService: boolean
  }>
  totalPrice: number
  notes?: string
}

Deno.serve(async (req: Request) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      })
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Parse request body
    const {
      bookingId,
      customerName,
      customerEmail,
      bookingDate,
      bookingTime,
      endTime,
      totalDuration,
      services,
      totalPrice,
      notes
    }: BookingConfirmationBody = await req.json();

    // Validate required fields
    if (!bookingId || !customerName || !customerEmail || !bookingDate || !bookingTime || !services || services.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Pakollisia varaustietoja puuttuu' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get Resend API key
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const adminEmail = Deno.env.get('ADMIN_EMAIL')
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'Sähköpostipalvelu ei ole määritetty' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (!adminEmail) {
      console.error('ADMIN_EMAIL not configured')
      return new Response(
        JSON.stringify({ error: 'Ylläpitäjän sähköposti ei ole määritetty' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Format date for display
    const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('fi-FI', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    }

    // Generate services list HTML
    const servicesListHtml = services.map(service => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
        <span style="color: #374151; font-size: 14px;">
          ${service.isMainService ? '' : '+ '}${service.name}:
        </span>
        <span style="color: #f97316; font-weight: bold; font-size: 14px;">
          ${service.price}€
        </span>
      </div>
    `).join('')

    // Send confirmation email to customer using Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'K-Parturi <booking@notify.k-parturi.fi>',
        to: [customerEmail],
        subject: 'Varausvahvistus - K-Parturi',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border-radius: 12px;">
              <h1 style="color: white; font-size: 32px; margin: 0; font-weight: bold;">BABYLON PARTURI</h1>
              <p style="color: white; font-size: 16px; margin: 10px 0 0 0; opacity: 0.9;">Varausvahvistus</p>
            </div>
            
            <!-- Greeting -->
            <div style="margin-bottom: 30px;">
              <h2 style="color: #374151; margin: 0 0 15px 0; font-size: 24px;">Hei ${customerName}!</h2>
              <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0;">
                Kiitos varauksestasi! Vahvistamme, että aikasi on varattu onnistuneesti. 
                Alla näet varauksen tiedot.
              </p>
            </div>
            
            <!-- Booking Details Card -->
            <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
              <h3 style="color: #374151; margin: 0 0 20px 0; font-size: 20px; display: flex; align-items: center;">
                📅 Varauksen tiedot
              </h3>
              
              <div style="display: grid; gap: 15px;">
                <div style="display: flex; align-items: center; padding: 10px 0;">
                  <div style="width: 40px; height: 40px; background: #fef3e2; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                    <span style="font-size: 18px;">📅</span>
                  </div>
                  <div>
                    <div style="font-weight: bold; color: #374151; font-size: 16px;">Päivämäärä</div>
                    <div style="color: #6b7280; font-size: 14px;">${formatDate(bookingDate)}</div>
                  </div>
                </div>
                
                <div style="display: flex; align-items: center; padding: 10px 0;">
                  <div style="width: 40px; height: 40px; background: #fef3e2; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                    <span style="font-size: 18px;">🕐</span>
                  </div>
                  <div>
                    <div style="font-weight: bold; color: #374151; font-size: 16px;">Aika</div>
                    <div style="color: #6b7280; font-size: 14px;">klo ${bookingTime} - ${endTime} (${totalDuration} min)</div>
                  </div>
                </div>
                
                <div style="display: flex; align-items: center; padding: 10px 0;">
                  <div style="width: 40px; height: 40px; background: #fef3e2; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                    <span style="font-size: 18px;">📍</span>
                  </div>
                  <div>
                    <div style="font-weight: bold; color: #374151; font-size: 16px;">Sijainti</div>
                    <div style="color: #6b7280; font-size: 14px;">Heinolankaari 9, 67600 Kokkola</div>
                    <div style="color: #6b7280; font-size: 12px;">K-Citymarketissa</div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Services and Pricing -->
            <div style="background: white; border: 2px solid #e2e8f0; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
              <h3 style="color: #374151; margin: 0 0 20px 0; font-size: 20px;">💇‍♂️ Palvelut ja hinnat</h3>
              
              <div style="margin-bottom: 15px;">
                ${servicesListHtml}
              </div>
              
              <div style="border-top: 2px solid #f97316; padding-top: 15px; margin-top: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-weight: bold; color: #374151; font-size: 18px;">Yhteensä:</span>
                  <span style="font-weight: bold; color: #f97316; font-size: 20px;">${totalPrice}€</span>
                </div>
              </div>
            </div>
            
            ${notes ? `
            <!-- Notes -->
            <div style="background: #fffbeb; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
              <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">📝 Lisätiedot</h4>
              <p style="color: #92400e; margin: 0; font-size: 14px;">${notes}</p>
            </div>
            ` : ''}
            
            <!-- Important Information -->
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <h4 style="color: #dc2626; margin: 0 0 15px 0; font-size: 16px;">⚠️ Tärkeää muistaa</h4>
              <ul style="color: #dc2626; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
                <li>Saavu paikalle ajoissa tai hieman etuajassa</li>
                <li>Jos tarvitset peruuttaa, tee se vähintään 24 tuntia etukäteen</li>
                <li>Peruutukset alle 24h ennen aikaa voivat aiheuttaa 50% maksun</li>
                <li>Ota mukaan maski, jos haluat käyttää sellaista</li>
              </ul>
            </div>
            
            <!-- Contact Information -->
            <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <h4 style="color: #374151; margin: 0 0 15px 0; font-size: 16px;">📞 Yhteystiedot</h4>
              <div style="color: #6b7280; font-size: 14px; line-height: 1.8;">
                <div><strong>Puhelin:</strong> +358 40 773 6334</div>
                <div><strong>Osoite:</strong> Humalistonkatu 7 A, Turku 20100</div>
                <div><strong>Sijainti:</strong> K-Citymarketissa</div>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
              <p style="margin: 0 0 10px 0;">Kiitos, että valitsit K-Parturin!</p>
              <p style="margin: 0;">Nähdään pian! 💇‍♂️</p>
              
              <div style="margin-top: 20px;">
                <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                  Varausnumero: ${bookingId.substring(0, 8).toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        `,
      }),
    })

    if (!emailResponse.ok) {
      const emailError = await emailResponse.text()
      console.error('Failed to send booking confirmation email:', emailError)
      return new Response(
        JSON.stringify({ error: 'Vahvistussähköpostin lähettäminen epäonnistui' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const customerEmailResult = await emailResponse.json()
    console.log('Customer booking confirmation email sent successfully:', customerEmailResult.id)
    
    // Send notification email to admin
    const adminEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Babylon Parturi Varaukset <bookings@notify.babylonparturi.fi>',
        to: [adminEmail],
        subject: '🗓️ Uusi varaus vastaanotettu - Babylon Parturi',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border-radius: 12px;">
              <h1 style="color: white; font-size: 28px; margin: 0; font-weight: bold;">🗓️ UUSI VARAUS</h1>
              <p style="color: white; font-size: 14px; margin: 10px 0 0 0; opacity: 0.9;">Babylon Parturi Admin Notification</p>
            </div>
            
            <!-- Customer Info -->
            <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
              <h3 style="color: #374151; margin: 0 0 20px 0; font-size: 18px;">👤 Asiakastiedot</h3>
              
              <div style="display: grid; gap: 10px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                  <span style="font-weight: bold; color: #374151;">Nimi:</span>
                  <span style="color: #6b7280;">${customerName}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                  <span style="font-weight: bold; color: #374151;">Sähköposti:</span>
                  <span style="color: #6b7280;">${customerEmail}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                  <span style="font-weight: bold; color: #374151;">Puhelin:</span>
                  <span style="color: #6b7280;">${customerPhone}</span>
                </div>
              </div>
            </div>
            
            <!-- Booking Details -->
            <div style="background: #fef3e2; border: 2px solid #f97316; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
              <h3 style="color: #ea580c; margin: 0 0 20px 0; font-size: 18px;">📅 Varauksen tiedot</h3>
              
              <div style="display: grid; gap: 15px;">
                <div style="display: flex; align-items: center; padding: 10px 0;">
                  <div style="width: 35px; height: 35px; background: #f97316; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                    <span style="color: white; font-size: 16px;">📅</span>
                  </div>
                  <div>
                    <div style="font-weight: bold; color: #ea580c; font-size: 14px;">Päivämäärä</div>
                    <div style="color: #9a3412; font-size: 13px;">${formatDate(bookingDate)}</div>
                  </div>
                </div>
                
                <div style="display: flex; align-items: center; padding: 10px 0;">
                  <div style="width: 35px; height: 35px; background: #f97316; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                    <span style="color: white; font-size: 16px;">🕐</span>
                  </div>
                  <div>
                    <div style="font-weight: bold; color: #ea580c; font-size: 14px;">Aika</div>
                    <div style="color: #9a3412; font-size: 13px;">klo ${bookingTime} - ${endTime} (${totalDuration} min)</div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Services and Pricing -->
            <div style="background: white; border: 2px solid #e2e8f0; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
              <h3 style="color: #374151; margin: 0 0 20px 0; font-size: 18px;">💇‍♂️ Palvelut</h3>
              
              <div style="margin-bottom: 15px;">
                ${servicesListHtml}
              </div>
              
              <div style="border-top: 2px solid #f97316; padding-top: 15px; margin-top: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-weight: bold; color: #374151; font-size: 16px;">Yhteensä:</span>
                  <span style="font-weight: bold; color: #f97316; font-size: 18px;">${totalPrice}€</span>
                </div>
              </div>
            </div>
            
            ${notes ? `
            <!-- Notes -->
            <div style="background: #fffbeb; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
              <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 14px;">📝 Asiakkaan lisätiedot</h4>
              <p style="color: #92400e; margin: 0; font-size: 13px; font-style: italic;">"${notes}"</p>
            </div>
            ` : ''}
            
            <!-- Quick Actions -->
            <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <h4 style="color: #374151; margin: 0 0 15px 0; font-size: 16px;">⚡ Pikavalinnat</h4>
              <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <a href="tel:${customerPhone}" style="background: #10b981; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: bold;">📞 Soita asiakkaalle</a>
                <a href="mailto:${customerEmail}" style="background: #3b82f6; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: bold;">✉️ Lähetä sähköposti</a>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
              <p style="margin: 0 0 5px 0;">Varausnumero: ${bookingId.substring(0, 8).toUpperCase()}</p>
              <p style="margin: 0;">Varattu: ${new Date().toLocaleString('fi-FI')}</p>
            </div>
          </div>
        `,
      }),
    });

    if (!adminEmailResponse.ok) {
      const adminEmailError = await adminEmailResponse.text()
      console.error('Failed to send admin notification email:', adminEmailError)
      // Don't fail the entire process if admin email fails - customer email was successful
    } else {
      const adminEmailResult = await adminEmailResponse.json()
      console.log('Admin notification email sent successfully:', adminEmailResult.id)
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Varausvahvistus lähetetty onnistuneesti',
        customerEmailId: customerEmailResult.id,
        adminEmailSent: adminEmailResponse.ok
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Unexpected error in send-booking-confirmation function:', error)
    return new Response(
      JSON.stringify({ error: 'Sisäinen palvelinvirhe' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})