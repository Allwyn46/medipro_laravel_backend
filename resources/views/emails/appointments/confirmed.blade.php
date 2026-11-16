<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Appointment is Confirmed - Smart Tech Medical Clinic</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            color: #1e293b;
            margin: 0;
            padding: 0;
            -webkit-text-size-adjust: 100%;
        }
        .container {
            max-width: 580px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .header {
            background-color: #0f172a;
            color: #ffffff;
            padding: 24px 32px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 20px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .content {
            padding: 32px;
        }
        .badge {
            display: inline-block;
            background-color: #ecfdf5;
            color: #059669;
            font-size: 11px;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 9999px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 12px;
        }
        .title {
            font-size: 20px;
            font-weight: 700;
            color: #0f172a;
            margin-top: 0;
            margin-bottom: 12px;
        }
        p {
            font-size: 14px;
            line-height: 1.6;
            color: #475569;
            margin: 0 0 16px 0;
        }
        .details-card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
        }
        .btn-container {
            text-align: center;
            margin: 28px 0 20px 0;
        }
        .btn {
            display: inline-block;
            background-color: #2563eb;
            color: #ffffff !important;
            font-size: 14px;
            font-weight: 600;
            text-decoration: none;
            padding: 12px 28px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
        }
        .calendar-notice {
            background-color: #eff6ff;
            border: 1px solid #bfdbfe;
            color: #1e40af;
            font-size: 12px;
            padding: 12px 16px;
            border-radius: 6px;
            line-height: 1.5;
            margin: 16px 0;
        }
        .notice {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            color: #475569;
            font-size: 12px;
            padding: 12px 16px;
            border-radius: 6px;
            line-height: 1.5;
            margin-top: 20px;
        }
        .footer {
            background-color: #f8fafc;
            border-top: 1px solid #e2e8f0;
            padding: 20px 32px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header" style="background: linear-gradient(135deg, #070B19 0%, #0F172A 100%); border-bottom: 2px solid #00D2FF; text-align: center; padding: 24px;">
            <img src="{{ config('app.url') }}/images/smart-tech-logo.jpg" alt="SMART TECH Medical" style="max-height: 48px; width: auto; margin: 0 auto; display: block;" onerror="this.style.display='none'" />
            <h1 style="margin: 6px 0 0; color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: 2px;">SMART TECH <span style="color: #00D2FF;">CLINIC</span></h1>
        </div>
        <div class="content">
            <span class="badge" style="background-color: #ecfeff; color: #0284c7; border: 1px solid #bae6fd;">Appointment Confirmed</span>
            <h2 class="title">Your Consultation is Confirmed!</h2>
            <p>Dear {{ $appointment->patient_name }},</p>
            <p>Your upcoming medical appointment at <strong>Smart Tech Medical Clinic</strong> with <strong>{{ $appointment->doctor }}</strong> has been officially confirmed. We have scheduled your consultation as detailed below:</p>

            <div class="details-card">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Attending Specialist:</td>
                        <td style="padding: 6px 0; color: #0f172a; font-size: 13px; font-weight: 600; text-align: right;">{{ $appointment->doctor }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Clinical Procedure:</td>
                        <td style="padding: 6px 0; color: #0f172a; font-size: 13px; font-weight: 600; text-align: right;">{{ $appointment->service }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Date & Time:</td>
                        <td style="padding: 6px 0; color: #059669; font-size: 13px; font-weight: 700; text-align: right;">{{ $appointment->date }} at {{ $appointment->time }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Location / Room:</td>
                        <td style="padding: 6px 0; color: #0f172a; font-size: 13px; font-weight: 600; text-align: right;">{{ $appointment->room ?: 'Consultation Suite 1' }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Duration:</td>
                        <td style="padding: 6px 0; color: #0f172a; font-size: 13px; font-weight: 600; text-align: right;">{{ $appointment->duration ?: '45 mins' }}</td>
                    </tr>
                </table>
            </div>

            <div class="btn-container">
                <a href="{{ $googleCalendarUrl }}" class="btn" target="_blank">Add to Google Calendar</a>
            </div>

            <div class="calendar-notice">
                <strong>Apple Calendar & Outlook:</strong> We have attached an <code>.ics</code> calendar file to this email. Open or tap the attachment to automatically save this consultation to your device calendar.
            </div>

            <div class="notice">
                <strong>Arrival Guidelines:</strong> Please arrive 10 minutes prior to your scheduled consultation time. If you need to make changes to your booking, please contact clinic reception at +91 98765 43210.
            </div>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Smart Tech Medical Clinic &bull; 100 Medical Boulevard, Suite 400 &bull; +91 98765 43210
        </div>
    </div>
</body>
</html>
