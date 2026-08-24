export async function sendOtpSms({
  to,
  code,
}: {
  to: string;
  code: string;
}) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const demoMode = process.env.TWILIO_DEMO_MODE === "true";

  if (!accountSid || !authToken || !from || demoMode) {
    console.log(`Demo OTP for ${to}: ${code}`);
    return { sent: false, demoCode: code };
  }

  const body = new URLSearchParams({
    To: to,
    From: from,
    Body: `Your Pearl Thai Massage verification code is ${code}. It expires in 10 minutes.`,
  });
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString(
          "base64",
        )}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    let message = "Could not send SMS verification code. Please try again later.";

    try {
      const parsed = JSON.parse(detail) as { code?: number; message?: string };

      if (parsed.code === 20003 && parsed.message?.includes("Trial account")) {
        message =
          "Twilio trial accounts cannot send this OTP right now. Verify the recipient number in Twilio, or upgrade the Twilio account for live customer SMS.";
      } else if (parsed.message) {
        message = `Could not send SMS verification code. ${parsed.message}`;
      }
    } catch {
      message = `Could not send SMS verification code. ${detail}`;
    }

    throw new Error(message);
  }

  return { sent: true, demoCode: null };
}
