import { NextResponse } from 'next/server';
// import { sendMail, compileWelcomeTemplate } from '@/lib/cred-mail';
import { memberTaskMail, compileMemberTaskCreateTemplate } from '@/lib/memberTask-mail';

export async function POST(request: Request) {
  const body = await request.json();
  
  try {
    await memberTaskMail({
      to: body.to,
      name: body.name,
      created_by: body.created_by,
      subject: body.subject,
      body: compileMemberTaskCreateTemplate(body.name, body.link, body.created_by, body.to),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending task creation email:', error);
    return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 });
  }
}
