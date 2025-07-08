import { NextResponse } from 'next/server';
import { sendMail, compileWelcomeTemplate } from '@/lib/cred-mail';

export async function POST(request: Request) {
  const body = await request.json();
  
  try {
    await sendMail({
      to: body.to,
      name: body.name,
      password: body.password,
      subject: body.subject,
      body: compileWelcomeTemplate(body.name, body.link, body.password, body.to),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 });
  }
}
