import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

interface RequestBody {
  userEmail: string
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
    const { userEmail }: RequestBody = await req.json()

    if (!userEmail || !userEmail.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Kelvollinen sähköpostiosoite vaaditaan' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if email exists in stamp_cards table
    const { data: stampCard, error: stampCardError } = await supabase
      .from('stamp_cards')
      .select('email')
      .ilike('email', userEmail)
      .single()

    if (stampCardError || !stampCard) {
      return new Response(
        JSON.stringify({ error: 'Leimakorttia ei löytynyt tällä sähköpostiosoitteella' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Calculate expiration time (15 minutes from now)
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 15)

    // Store verification code in database (upsert to handle existing codes)
    const { error: dbError } = await supabase
      .from('email_verification_codes')
      .upsert({
        email: userEmail.toLowerCase(),
        code: verificationCode,
        expires_at: expiresAt.toISOString(),
      }, {
        onConflict: 'email'
      })

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({ error: 'Vahvistuskoodin tallentaminen epäonnistui' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get Resend API key
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
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

    // Send email using Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Babylon Parturi <codeverification@notify.babylonparturi.fi>',
        to: [userEmail],
        subject: 'Leimakortin vahvistuskoodi - Babylon Parturi',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #f97316; font-size: 32px; margin: 0;">BABYLON PARTURI</h1>
              <p style="color: #666; font-size: 16px; margin: 10px 0 0 0;">Leimakortin vahvistuskoodi</p>
            </div>
            
            <div style="background: #f8f9fa; border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
              <h2 style="color: #333; margin: 0 0 20px 0;">Vahvistuskoodi</h2>
              <div style="background: white; border: 2px solid #f97316; border-radius: 8px; padding: 20px; display: inline-block; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; color: #f97316; letter-spacing: 4px;">${verificationCode}</span>
              </div>
              <p style="color: #666; margin: 20px 0 0 0;">Syötä tämä koodi leimakortin avaamiseksi</p>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin-bottom: 30px;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>Tärkeää:</strong> Tämä koodi on voimassa 15 minuuttia. Älä jaa koodia kenenkään kanssa.
              </p>
            </div>
            
            <div style="text-align: center; color: #666; font-size: 14px;">
              <p>Jos et pyytänyt tätä koodia, voit jättää tämän viestin huomiotta.</p>
              <p style="margin-top: 30px;">
                <strong>Babylon Parturi</strong><br>
                Humalistonkatu 7 A, 20100 Turku<br>
                Puh: +358 45 6131884
              </p>
            </div>
          </div>
        `,
      }),
    })

    if (!emailResponse.ok) {
      const emailError = await emailResponse.text()
      console.error('Email sending failed:', emailError)
      return new Response(
        JSON.stringify({ error: 'Vahvistussähköpostin lähettäminen epäonnistui' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Vahvistuskoodi lähetetty onnistuneesti',
        expiresIn: 15 // minutes
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Sisäinen palvelinvirhe' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})