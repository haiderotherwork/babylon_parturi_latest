
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

interface ErrorReportBody {
  errorMessage: string
  bookingData: string
  timestamp: string
  userAgent?: string
  url?: string
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
    const { errorMessage, bookingData, timestamp, userAgent, url }: ErrorReportBody = await req.json()

    if (!errorMessage || !timestamp) {
      return new Response(
        JSON.stringify({ error: 'Virheilmoitus ja aikaleima vaaditaan' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Parse bookingData from JSON string back to object
    let parsedBookingData: Record<string, unknown> | null = null
    try {
      parsedBookingData = JSON.parse(bookingData)
    } catch (parseError) {
      console.error('Failed to parse bookingData:', parseError)
      parsedBookingData = { error: 'Failed to parse booking data', raw: bookingData }
    }

    // Get environment variables
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

    // Format booking data for email
    const formatBookingData = (data: Record<string, unknown> | null) => {
      if (!data) return 'No booking data available'
      
      let formatted = ''
      
      if (data.selectedService) {
        formatted += `<strong>Palvelu:</strong> ${data.selectedService.name} (${data.selectedService.price}€)<br>`
      }
      
      if (data.selectedAddOns && Array.isArray(data.selectedAddOns) && data.selectedAddOns.length > 0) {
        formatted += `<strong>Lisäpalvelut:</strong><br>`
        data.selectedAddOns.forEach((addOn: Record<string, unknown>) => {
          formatted += `&nbsp;&nbsp;• ${addOn.name} (${addOn.price}€)<br>`
        })
      }
      
      if (data.selectedDate && data.selectedTime) {
        formatted += `<strong>Aika:</strong> ${data.selectedDate} klo ${data.selectedTime}<br>`
      }
      
      if (data.userDetails) {
        formatted += `<strong>Asiakas:</strong><br>`
        if (data.userDetails.name) formatted += `&nbsp;&nbsp;Nimi: ${data.userDetails.name}<br>`
        if (data.userDetails.phone) formatted += `&nbsp;&nbsp;Puhelin: ${data.userDetails.phone}<br>`
        if (data.userDetails.email) formatted += `&nbsp;&nbsp;Email: ${data.userDetails.email}<br>`
        if (data.userDetails.notes) formatted += `&nbsp;&nbsp;Lisätiedot: ${data.userDetails.notes}<br>`
      }
      
      return formatted || 'Booking data available but could not be formatted'
    }

    // Send error report email using Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Babylon Parturi Errors <errors@notify.babylonparturi.fi>',
        to: [adminEmail],
        subject: '🚨 Babylon Parturi Booking Error Alert',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #dc2626; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 24px;">🚨 Booking Error Alert</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">A user encountered an error while trying to book an appointment</p>
            </div>
            
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <h2 style="color: #dc2626; margin: 0 0 15px 0; font-size: 18px;">Error Details</h2>
              <p style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #dc2626; margin: 0; font-family: monospace; color: #374151;">
                ${errorMessage}
              </p>
            </div>
            
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <h2 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">Booking Information</h2>
              <div style="color: #374151; line-height: 1.6;">
                ${formatBookingData(parsedBookingData)}
              </div>
            </div>
            
            <div style="background: #f3f4f6; border-radius: 8px; padding: 20px;">
              <h2 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">Technical Details</h2>
              <div style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                <strong>Timestamp:</strong> ${new Date(timestamp).toLocaleString('fi-FI')}<br>
                ${userAgent ? `<strong>User Agent:</strong> ${userAgent}<br>` : ''}
                ${url ? `<strong>URL:</strong> ${url}<br>` : ''}
              </div>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
              <p>This is an automated error report from Babylon Parturi booking system.</p>
              <p>Please investigate and resolve the issue as soon as possible.</p>
            </div>
          </div>
        `,
      }),
    })

    if (!emailResponse.ok) {
      const emailError = await emailResponse.text()
      console.error('Failed to send error report email:', emailError)
      return new Response(
        JSON.stringify({ error: 'Virheraportin lähettäminen epäonnistui' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    //console.log('Error report email sent successfully')
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Virheraportti lähetetty onnistuneesti' 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Unexpected error in report-booking-error function:', error)
    return new Response(
      JSON.stringify({ error: 'Sisäinen palvelinvirhe' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})