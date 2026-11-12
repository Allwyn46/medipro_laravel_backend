<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm Your Appointment - MediPro</title>
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
            background-color: #eff6ff;
            color: #2563eb;
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
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f1f5f9;
            font-size: 13px;
        }
        .detail-row:last-child {
            border-bottom: none;
            padding-bottom: 0;
        }
        .detail-label {
            color: #64748b;
            font-weight: 500;
        }
        .detail-value {
            color: #0f172a;
            font-weight: 600;
            text-align: right;
        }
        .btn-container {
            text-align: center;
            margin: 32px 0 24px 0;
        }
        .btn {
            display: inline-block;
            background-color: #059669;
            color: #ffffff !important;
            font-size: 15px;
            font-weight: 600;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(5, 150, 105, 0.2);
        }
        .notice {
            background-color: #ecfdf5;
            border: 1px solid #a7f3d0;
            color: #065f46;
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
            <h1>MediPro Clinic</h1>
        </div>
        <div class="content">
            <span class="badge">Appointment Reminder</span>
            <h2 class="title">Please Confirm Your Appointment</h2>
            <p>Dear {{ $appointment->patient_name }},</p>
            <p>This is a reminder for your upcoming consultation at <strong>MediPro Clinic</strong> with <strong>{{ $appointment->doctor }}</strong>. Please confirm your appointment below to finalize your booking.</p>

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
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Date & Time:</td>
                        <td style="padding: 6px 0; color: #059669; font-size: 13px; font-weight: 700; text-align: right;">{{ $appointment->date }} at {{ $appointment->time }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Location:</td>
                        <td style="padding: 6px 0; color: #0f172a; font-size: 13px; font-weight: 600; text-align: right;">{{ $appointment->room ?: 'Consultation Suite 1' }}</td>
                    </tr>
                </table>
            </div>

            <div class="btn-container">
                <a href="{{ $confirmUrl }}" class="btn" target="_blank">Confirm My Appointment</a>
            </div>

            <div class="notice">
                <strong>Dual Confirmation Policy:</strong> For maximum scheduling reliability, an appointment is officially booked once both you and Dr. {{ $appointment->doctor }} confirm via email.
            </div>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} MediPro Clinic &bull; 100 Medical Boulevard, Suite 400 &bull; +91 98765 43210
        </div>
    </div>
</body>
</html>
