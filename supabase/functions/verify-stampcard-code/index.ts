import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

interface RequestBody {
  userEmail: string
  verificationCode: string
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
    const { userEmail, verificationCode }: RequestBody = await req.json()

    if (!userEmail || !verificationCode) {
      return new Response(
        JSON.stringify({ error: 'Sähköpostiosoite ja vahvistuskoodi vaaditaan' }),
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

    // Check if verification code exists and is not expired
    const { data: verificationRecord, error: verificationError } = await supabase
      .from('email_verification_codes')
      .select('*')
      .eq('email', userEmail.toLowerCase())
      .eq('code', verificationCode)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (verificationError || !verificationRecord) {
      return new Response(
        JSON.stringify({ 
          error: 'Virheellinen tai vanhentunut vahvistuskoodi',
          details: 'Tarkista koodisi tai pyydä uusi koodi'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Delete the verification code to prevent reuse
    const { error: deleteError } = await supabase
      .from('email_verification_codes')
      .delete()
      .eq('id', verificationRecord.id)

    if (deleteError) {
      console.error('Failed to delete verification code:', deleteError)
      // Continue anyway - the code was valid
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Vahvistus onnistui',
        verified: true
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