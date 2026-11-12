<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm Consultation - MediPro Specialist</title>
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
            background-color: #047857;
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
            color: #047857;
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
            box-shadow: 0 2px 4px rgba(15, 23, 42, 0.2);
        }
        .notice {
            background-color: #f1f5f9;
            border: 1px solid #cbd5e1;
            color: #334155;
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
        <div class="header">
            <h1>MediPro Specialist Schedule</h1>
        </div>
        <div class="content">
            <span class="badge">Consultation Request</span>
            <h2 class="title">Action Required: Confirm Upcoming Appointment</h2>
            <p>Dear {{ $appointment->doctor }},</p>
            <p>You have an upcoming consultation request scheduled with <strong>{{ $appointment->patient_name }}</strong>. Please confirm your availability below to finalize the appointment.</p>

            <div class="details-card">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Patient:</td>
                        <td style="padding: 6px 0; color: #0f172a; font-size: 13px; font-weight: 600; text-align: right;">{{ $appointment->patient_name }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Patient Phone:</td>
                        <td style="padding: 6px 0; color: #0f172a; font-size: 13px; font-weight: 600; text-align: right;">{{ $appointment->patient_phone }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Patient Email:</td>
                        <td style="padding: 6px 0; color: #0f172a; font-size: 13px; font-weight: 600; text-align: right;">{{ $appointment->patient_email }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Service:</td>
                        <td style="padding: 6px 0; color: #0f172a; font-size: 13px; font-weight: 600; text-align: right;">{{ $appointment->service }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Requested Slot:</td>
                        <td style="padding: 6px 0; color: #047857; font-size: 13px; font-weight: 700; text-align: right;">{{ $appointment->date }} at {{ $appointment->time }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Clinical Suite:</td>
                        <td style="padding: 6px 0; color: #0f172a; font-size: 13px; font-weight: 600; text-align: right;">{{ $appointment->room ?: 'Consultation Suite 1' }}</td>
                    </tr>
                    @if($appointment->notes)
                    <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Clinical Notes:</td>
                        <td style="padding: 6px 0; color: #0f172a; font-size: 13px; font-style: italic; text-align: right;">&ldquo;{{ $appointment->notes }}&rdquo;</td>
                    </tr>
                    @endif
                </table>
            </div>

            <div class="btn-container">
                <a href="{{ $confirmUrl }}" class="btn" target="_blank">Confirm Consultation</a>
            </div>

            <div class="notice">
                <strong>No Dashboard Confirmation Needed:</strong> Once you confirm here in this email and the patient confirms on their end, the appointment is automatically booked.
            </div>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} MediPro Clinic &bull; Internal Clinician Communication
        </div>
    </div>
</body>
</html>
