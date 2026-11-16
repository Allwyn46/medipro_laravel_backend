<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Update - Smart Tech Medical Clinic</title>
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
            background-color: #f1f5f9;
            color: #475569;
            font-size: 11px;
            font-weight: 600;
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
            margin: 32px 0 24px 0;
        }
        .btn {
            display: inline-block;
            background-color: #0f172a;
            color: #ffffff !important;
            font-size: 15px;
            font-weight: 600;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(15, 23, 42, 0.15);
        }
        .notice {
            background-color: #fffbeb;
            border: 1px solid #fde68a;
            color: #92400e;
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
            <span class="badge">Appointment Update</span>
            <h2 class="title">Your Consultation Needs Rescheduling</h2>
            <p>Dear {{ $appointment->patient_name ?? 'Patient' }},</p>
            
            @if($reason === 'pending_unreviewed')
                <p>We apologize that our clinical team was unable to confirm your online consultation request for <strong>{{ $appointment->date }} at {{ $appointment->time }}</strong> before the scheduled time.</p>
                <p>To ensure you receive the care you need without delay, please click the button below to pick your next preferred time slot with priority availability.</p>
            @else
                <p>Your scheduled consultation on <strong>{{ $appointment->date }} at {{ $appointment->time }}</strong> with <strong>{{ $appointment->doctor }}</strong> was not confirmed prior to the 15-minute start cutoff, and the calendar slot has been released.</p>
                <p>We would love to welcome you to our clinic. Please choose an alternate date and time that fits your schedule.</p>
            @endif

            <div class="details-card">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Specialist:</td>
                        <td style="padding: 6px 0; color: #0f172a; font-size: 13px; font-weight: 600; text-align: right;">{{ $appointment->doctor }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Clinical Service:</td>
                        <td style="padding: 6px 0; color: #0f172a; font-size: 13px; font-weight: 600; text-align: right;">{{ $appointment->service }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Previous Slot:</td>
                        <td style="padding: 6px 0; color: #dc2626; font-size: 13px; font-weight: 700; text-align: right;">{{ $appointment->date }} at {{ $appointment->time }} (Expired)</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Status:</td>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px; font-weight: 600; text-align: right;">Reschedule</td>
                    </tr>
                </table>
            </div>

            <div class="btn-container">
                <a href="{{ $rebookUrl }}" class="btn" target="_blank">Select a New Appointment Time</a>
            </div>

            <div class="notice">
                <strong>Need immediate assistance?</strong> You can also reach our clinic reception directly at +91 98765 43210 during operating hours (Mon–Sat, 8:00 AM – 8:00 PM).
            </div>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Smart Tech Medical Clinic &bull; 100 Medical Boulevard, Suite 400 &bull; +91 98765 43210
        </div>
    </div>
</body>
</html>
