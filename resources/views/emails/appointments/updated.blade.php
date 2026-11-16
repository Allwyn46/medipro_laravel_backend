<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Schedule Update - Smart Tech Medical Clinic</title>
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
            background-color: #fffbeb;
            color: #b45309;
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
        .changes-card {
            background-color: #fffbeb;
            border: 1px solid #fde68a;
            border-radius: 8px;
            padding: 16px 20px;
            margin: 20px 0;
        }
        .changes-title {
            font-size: 13px;
            font-weight: 700;
            color: #92400e;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
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
            background-color: #d97706;
            color: #ffffff !important;
            font-size: 14px;
            font-weight: 600;
            text-decoration: none;
            padding: 12px 28px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(217, 119, 6, 0.2);
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
            <span class="badge" style="background-color: #fef3c7; color: #92400e; border: 1px solid #fde68a;">Schedule Updated</span>
            <h2 class="title">Your Appointment Details Have Changed</h2>
            <p>Dear {{ $appointment->patient_name }},</p>
            <p>Please note that the schedule for your consultation with <strong>{{ $appointment->doctor }}</strong> at <strong>Smart Tech Medical Clinic</strong> has been revised.</p>

            @if(!empty($changes))
            <div class="changes-card">
                <div class="changes-title">Summary of Revisions</div>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <thead>
                        <tr style="border-bottom: 1px solid #fde68a;">
                            <th style="padding: 6px 0; text-align: left; color: #92400e;">Field</th>
                            <th style="padding: 6px 0; text-align: left; color: #92400e;">Previous</th>
                            <th style="padding: 6px 0; text-align: left; color: #92400e;">Updated</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($changes as $field => $diff)
                        <tr style="border-bottom: 1px solid #fef3c7;">
                            <td style="padding: 6px 0; font-weight: 600; color: #78350f;">{{ $diff['label'] ?? ucfirst($field) }}</td>
                            <td style="padding: 6px 0; color: #64748b; text-decoration: line-through;">{{ $diff['old'] ?: 'None' }}</td>
                            <td style="padding: 6px 0; font-weight: 700; color: #b45309;">{{ $diff['new'] ?: 'None' }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            @endif

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
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Updated Date & Time:</td>
                        <td style="padding: 6px 0; color: #b45309; font-size: 13px; font-weight: 700; text-align: right;">{{ $appointment->date }} at {{ $appointment->time }}</td>
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
                <a href="{{ $googleCalendarUrl }}" class="btn" target="_blank">Update in Google Calendar</a>
            </div>

            <div class="calendar-notice">
                <strong>Updated Calendar Invite Attached:</strong> We have attached an updated <code>.ics</code> calendar file to this email. Opening this attachment will automatically move the consultation to the new time on your Apple Calendar or Outlook.
            </div>

            <div class="notice">
                <strong>Questions or Conflicts?</strong> If this updated consultation schedule does not suit your availability, please contact clinic reception immediately at +91 98765 43210.
            </div>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Smart Tech Medical Clinic &bull; 100 Medical Boulevard, Suite 400 &bull; +91 98765 43210
        </div>
    </div>
</body>
</html>
