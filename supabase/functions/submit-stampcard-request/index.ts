import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.56.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestPayload {
  name: string;
  email: string;
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Vain POST-pyynnöt sallittu" }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { name, email }: RequestPayload = await req.json();

    // Validate input
    if (!name || !email) {
      return new Response(
        JSON.stringify({ error: "Nimi ja sähköpostiosoite ovat pakollisia" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Validate name length
    if (name.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: "Nimen on oltava vähintään 2 merkkiä pitkä" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Virheellinen sähköpostiosoite" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials");
      return new Response(
        JSON.stringify({ error: "Palvelinvirhe: Puuttuvat tunnistetiedot" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if email already exists in stamp_cards table
    const { data: existingStampCard, error: stampCardError } = await supabase
      .from("stamp_cards")
      .select("email")
      .ilike("email", email)
      .maybeSingle();

    if (stampCardError) {
      console.error("Error checking existing stamp card:", stampCardError);
      return new Response(
        JSON.stringify({ error: "Palvelinvirhe leimakorttihaun aikana" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (existingStampCard) {
      return new Response(
        JSON.stringify({ 
          error: "Tällä sähköpostiosoitteella on jo leimakortti. Käytä leimakorttiasi kirjautumalla sisään sähköpostiosoitteellasi."
        }),
        {
          status: 409,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Check if there's already a pending request with this email
    const { data: existingRequest, error: requestError } = await supabase
      .from("stamp_card_requests")
      .select("*")
      .ilike("email", email)
      .eq("status", "pending")
      .maybeSingle();

    if (requestError) {
      console.error("Error checking existing request:", requestError);
      return new Response(
        JSON.stringify({ error: "Palvelinvirhe pyynnön tarkistuksen aikana" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (existingRequest) {
      return new Response(
        JSON.stringify({ 
          error: "Olet jo lähettänyt pyynnön tällä sähköpostiosoitteella. Pyyntösi on käsittelyssä.",
          requestDate: existingRequest.created_at
        }),
        {
          status: 409,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Insert the new request
    const { data: newRequest, error: insertError } = await supabase
      .from("stamp_card_requests")
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting request:", insertError);
      return new Response(
        JSON.stringify({ error: "Pyynnön lähettäminen epäonnistui. Yritä uudelleen." }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Send confirmation email — non-blocking, failure does not affect the response
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey) {
      try {
        const customerName = name.trim();
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Babylon Parturi <noreply@notify.babylonparturi.fi>",
            to: [email.trim().toLowerCase()],
            subject: "Leimakorttipyyntö vastaanotettu - Babylon Parturi",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
                <!-- Header -->
                <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border-radius: 12px;">
                  <h1 style="color: white; font-size: 32px; margin: 0; font-weight: bold;">BABYLON PARTURI</h1>
                  <p style="color: white; font-size: 16px; margin: 10px 0 0 0; opacity: 0.9;">Kanta-asiakasohjelma</p>
                </div>

                <!-- Greeting -->
                <div style="margin-bottom: 30px;">
                  <h2 style="color: #374151; margin: 0 0 20px 0; font-size: 24px;">Hei ${customerName}!</h2>
                  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                    Kiitos leimakorttipyynnöstäsi! Olemme vastaanottaneet hakemuksesi Babylon Parturi kanta-asiakasohjelmaan ja käsittelemme sen mahdollisimman pian.
                  </p>

                  <!-- What happens next -->
                  <div style="background: #f8fafc; border-left: 4px solid #f97316; padding: 20px; margin-bottom: 25px;">
                    <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">Mitä tapahtuu seuraavaksi?</h3>
                    <p style="color: #6b7280; margin: 0; font-size: 14px; line-height: 1.6;">
                      Luomme sinulle henkilökohtaisen leimakortin ja lähetämme sähköpostiviestin, kun se on valmis. Sen jälkeen voit alkaa keräämään leimoja jokaisesta käynnistä.
                    </p>
                  </div>

                  <!-- Benefits -->
                  <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                    <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">Leimakortin edut</h3>
                    <div style="color: #6b7280; font-size: 14px; line-height: 1.8;">
                      <p style="margin: 0 0 10px 0;"><strong>Ilmainen hiustenleikkaus:</strong> Kerää 10 leimaa ja saat seuraavan leikkauksen ilmaiseksi</p>
                      <p style="margin: 0 0 10px 0;"><strong>Suosittele ystävää:</strong> Jaa koodisi ja saatte molemmat 5€ alennuksen</p>
                      <p style="margin: 0;"><strong>Helppo seuranta:</strong> Seuraa leimakorttisi tilaa verkossa</p>
                    </div>
                  </div>
                </div>

                <!-- Contact Information -->
                <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                  <h4 style="color: #374151; margin: 0 0 15px 0; font-size: 16px;">Yhteystiedot</h4>
                  <div style="color: #6b7280; font-size: 14px; line-height: 1.8;">
                    <div><strong>Puhelin:</strong> +358 45 6131884</div>
                    <div><strong>Osoite:</strong> Humalistonkatu 7 A, 20100 Turku</div>
                  </div>
                </div>

                <!-- Footer -->
                <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
                  <p style="margin: 0 0 10px 0;">Kiitos, että valitsit Babylon Parturin!</p>
                  <p style="margin: 0;">Nähdään pian!</p>
                  <div style="margin-top: 20px;">
                    <p style="margin: 0; font-size: 12px; color: #9ca3af;">Tämä on automaattinen viesti.</p>
                  </div>
                </div>
              </div>
            `,
          }),
        });

        if (!emailResponse.ok) {
          const emailError = await emailResponse.text();
          console.error("Failed to send confirmation email:", emailError);
        } else {
          console.log("Confirmation email sent successfully to:", email);
        }
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError);
      }
    } else {
      console.warn("RESEND_API_KEY not configured — skipping confirmation email");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Pyyntösi on vastaanotettu! Otamme sinuun yhteyttä pian.",
        requestId: newRequest.id
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Odottamaton palvelinvirhe. Yritä uudelleen myöhemmin." }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});