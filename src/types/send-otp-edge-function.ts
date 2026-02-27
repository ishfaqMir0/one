/**
 * Supabase Edge Function: send-otp
 * Generates and sends OTP to user's phone number
 *
 * Deploy: supabase functions deploy send-otp
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { phone } = await req.json();

    if (!phone) {
      return new Response(
        JSON.stringify({ error: 'Phone number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration time (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Delete old OTPs for this phone number
    await supabase
      .from('phone_otp_verifications')
      .delete()
      .eq('phone', phone);

    // Insert new OTP
    const { error: insertError } = await supabase
      .from('phone_otp_verifications')
      .insert({
        phone,
        otp_code: otpCode,
        expires_at: expiresAt,
        verified: false,
        attempts: 0,
      });

    if (insertError) {
      throw insertError;
    }

    // TODO: Integrate with SMS provider (Twilio, MSG91, etc.)
    // For now, we'll just log the OTP (DEVELOPMENT ONLY!)
    console.log(`OTP for ${phone}: ${otpCode}`);

    // Example Twilio integration (uncomment and configure):
    /*
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')!;
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')!;
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')!;

    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: phone,
          From: twilioPhoneNumber,
          Body: `Your AppleKul verification code is: ${otpCode}. Valid for 10 minutes.`,
        }),
      }
    );

    if (!twilioResponse.ok) {
      throw new Error('Failed to send SMS');
    }
    */

    // Example MSG91 integration (popular in India):
    /*
    const msg91AuthKey = Deno.env.get('MSG91_AUTH_KEY')!;
    const msg91SenderId = Deno.env.get('MSG91_SENDER_ID')!;
    const msg91TemplateId = Deno.env.get('MSG91_TEMPLATE_ID')!;

    const msg91Response = await fetch(
      `https://api.msg91.com/api/v5/flow/`,
      {
        method: 'POST',
        headers: {
          'authkey': msg91AuthKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flow_id: msg91TemplateId,
          sender: msg91SenderId,
          mobiles: phone.replace('+', ''),
          otp: otpCode,
        }),
      }
    );

    if (!msg91Response.ok) {
      throw new Error('Failed to send SMS');
    }
    */

    return new Response(
      JSON.stringify({
        success: true,
        message: 'OTP sent successfully',
        // Only for development - remove in production!
        debug_otp: Deno.env.get('ENVIRONMENT') === 'development' ? otpCode : undefined,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
