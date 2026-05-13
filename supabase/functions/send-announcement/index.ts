import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!BREVO_API_KEY) {
      throw new Error('Configuração ausente: BREVO_API_KEY não encontrada nos segredos do Supabase.')
    }

    const { recipients, subject, content } = await req.json()
    console.log(`Tentando enviar para ${recipients.length} alunos...`)

    const bccList = recipients.map(email => ({ email }))

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: "Academia Edson França", email: "rickcgrj@gmail.com" },
        to: [{ email: "rickcgrj@gmail.com", name: "Professor Edson" }],
        bcc: bccList,
        subject: subject,
        htmlContent: `
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
    console.log('Resposta do Brevo:', JSON.stringify(data))

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data.message || 'Erro no Brevo', details: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Erro na Function:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
