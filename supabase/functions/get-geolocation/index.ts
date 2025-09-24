import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the client's IP address from the request headers
    const forwardedFor = req.headers.get('x-forwarded-for')
    const realIp = req.headers.get('x-real-ip')
    const clientIp = forwardedFor?.split(',')[0] || realIp || 'unknown'

    console.log('Client IP:', clientIp)

    // For development/localhost, return default values
    if (clientIp === 'unknown' || clientIp.includes('127.0.0.1') || clientIp.includes('localhost')) {
      return new Response(
        JSON.stringify({ 
          country: 'Unknown', 
          city: 'Unknown',
          ip: clientIp 
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    // Try to get geolocation data (using HTTP for free tier)
    try {
      const response = await fetch(`http://ip-api.com/json/${clientIp}?fields=status,message,country,city,query`)
      const data = await response.json()

      if (data.status === 'success') {
        return new Response(
          JSON.stringify({
            country: data.country || 'Unknown',
            city: data.city || 'Unknown',
            ip: data.query || clientIp
          }),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            } 
          }
        )
      } else {
        console.error('IP-API error:', data.message)
        throw new Error(data.message || 'Unknown error')
      }
    } catch (error) {
      console.error('Geolocation lookup failed:', error)
      
      // Return default values on error
      return new Response(
        JSON.stringify({ 
          country: 'Unknown', 
          city: 'Unknown',
          ip: clientIp 
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

  } catch (error) {
    console.error('Function error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to get geolocation',
        country: 'Unknown',
        city: 'Unknown' 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})