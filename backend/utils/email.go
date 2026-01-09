package utils

import (
	"fmt"
	"net/smtp"
	"os"
	"strconv"
)

// EmailConfig holds SMTP configuration
type EmailConfig struct {
	Host     string
	Port     int
	Username string
	Password string
	From     string
	FromName string
}

// GetEmailConfig loads email configuration from environment
func GetEmailConfig() EmailConfig {
	port, _ := strconv.Atoi(os.Getenv("SMTP_PORT"))
	if port == 0 {
		port = 587
	}

	fromName := os.Getenv("SMTP_FROM_NAME")
	if fromName == "" {
		fromName = "Webbinar"
	}

	return EmailConfig{
		Host:     os.Getenv("SMTP_HOST"),
		Port:     port,
		Username: os.Getenv("SMTP_USER"),
		Password: os.Getenv("SMTP_PASS"),
		From:     os.Getenv("SMTP_FROM"),
		FromName: fromName,
	}
}

// SendEmail sends an email using SMTP
func SendEmail(to, subject, htmlBody string) error {
	config := GetEmailConfig()

	if config.Host == "" || config.Username == "" || config.Password == "" {
		return fmt.Errorf("SMTP not configured")
	}

	// Set up authentication
	auth := smtp.PlainAuth("", config.Username, config.Password, config.Host)

	// Format From with name: "Name <email@domain.com>"
	fromHeader := fmt.Sprintf("%s <%s>", config.FromName, config.From)

	// Build the email message
	mime := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"
	msg := []byte(fmt.Sprintf(
		"From: %s\r\nTo: %s\r\nSubject: %s\r\n%s\r\n%s",
		fromHeader,
		to,
		subject,
		mime,
		htmlBody,
	))

	// Send the email
	addr := fmt.Sprintf("%s:%d", config.Host, config.Port)
	err := smtp.SendMail(addr, auth, config.From, []string{to}, msg)

	if err != nil {
		fmt.Printf("❌ Failed to send email to %s: %v\n", to, err)
		return err
	}

	fmt.Printf("✅ Email sent successfully to %s\n", to)
	return nil
}

// SendPasswordResetEmail sends a password reset email with verification code
func SendPasswordResetEmail(to, resetCode, userName string) error {
	subject := "🔐 Kode Reset Password - Webbinar"

	htmlBody := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
    <table width="100%%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="100%%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #3b82f6 0%%, #1e40af 100%%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">🔐 Reset Password</h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Webbinar Learning Platform</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="color: #1e293b; font-size: 18px; margin: 0 0 10px 0;">Halo <strong>%s</strong>,</p>
                            <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                Kami menerima permintaan untuk mereset password akun Anda. Gunakan kode berikut untuk mereset password:
                            </p>
                            
                            <!-- Code Box -->
                            <table width="100%%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <div style="display: inline-block; background: linear-gradient(135deg, #f0f9ff 0%%, #e0f2fe 100%%); border: 2px dashed #3b82f6; border-radius: 12px; padding: 20px 40px;">
                                            <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1e40af; font-family: monospace;">%s</span>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
                                ⏰ Kode ini akan kadaluarsa dalam <strong>15 menit</strong>.
                            </p>
                            <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 10px 0 0 0; text-align: center;">
                                Jika Anda tidak meminta reset password, abaikan email ini.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 24px 30px; border-top: 1px solid #e2e8f0;">
                            <p style="color: #94a3b8; font-size: 13px; margin: 0; text-align: center;">
                                © 2026 Webbinar. All rights reserved.<br>
                                Email ini dikirim secara otomatis, mohon tidak membalas email ini.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`, userName, resetCode)

	return SendEmail(to, subject, htmlBody)
}
