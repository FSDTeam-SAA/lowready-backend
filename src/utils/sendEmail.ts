import nodemailer from 'nodemailer'

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; message: string; error?: any }> => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.APP_USER,
        pass: process.env.APP_PASS,
      },
    })

    await transporter.sendMail({
      from: process.env.APP_USER, // better to use env
      to,
      subject: subject || 'Password change Link : change it by 10 minutes',
      html,
    })

    return {
      success: true,
      message: 'Email sent successfully',
    }
  } catch (error: any) {
    console.error('Email send failed:', error?.message || error)

    // Handle Gmail-specific quota error
    if (
      error?.response?.includes('Daily user sending limit exceeded') ||
      error?.message?.includes('Daily user sending limit exceeded')
    ) {
      return {
        success: false,
        message:
          'Daily sending limit exceeded. Please try again after 24 hours or use another email service.',
        error,
      }
    }

    return {
      success: false,
      message: 'Failed to send email',
      error,
    }
  }
}
