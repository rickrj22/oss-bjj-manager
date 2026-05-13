import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { recipients, subject, content } = await req.json()

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'OSS BJJ Manager <onboarding@resend.dev>',
        to: ['rickrj22@gmail.com'],
        bcc: recipients,
        subject: subject,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
              <div style="background: #1a1a1a; padding: 2rem; text-align: center;">
                  <h1 style="color: #fff; margin: 0; letter-spacing: 0.2em;">OSS</h1>
                  <p style="color: #888; font-size: 0.8rem; text-transform: uppercase; margin-top: 0.5rem;">Comunicado Oficial</p>
              </div>
              <div style="padding: 2rem; background: #fff; line-height: 1.6; color: #333;">
                  ${content.replace(/\n/g, '<br>')}
              </div>
              <div style="padding: 1.5rem; background: #f9f9f9; text-align: center; border-top: 1px solid #eee;">
                  <p style="font-size: 0.75rem; color: #999; margin: 0;">OSS BJJ Manager - Gestão Inteligente para Academias</p>
              </div>
          </div>
        `
      })
    })

    const data = await res.json()

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
