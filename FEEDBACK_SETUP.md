# AgeVerseGlobal Feedback — ₹0 Google Setup

The website collects only:

1. Date & Time — automatic
2. Country — automatic approximate location
3. City — automatic approximate location
4. Page — automatic
5. Rating — selected by the user (1–5)
6. Feedback — entered by the user

The feedback form does not ask for the visitor's name, email address, phone number or OTP, and the AgeVerseGlobal feedback record does not include the visitor IP address.

## Recommended one-time setup (Google Apps Script + Google Sheet)

This avoids manually creating a Google Form and avoids paid database services.

1. Sign in to the Google account that should own the feedback data.
2. Open Google Apps Script and create a new project.
3. Copy `google-apps-script/Code.gs` into the project.
4. Run `setupFeedback()` once and approve the Google permissions.
5. The script automatically creates:
   - AgeVerseGlobal Feedback Google Form
   - AgeVerseGlobal Feedback Responses Google Sheet
6. Deploy → New deployment → Web app.
7. Set **Execute as: Me** and **Who has access: Anyone**.
8. Copy the Web app URL.
9. In Vercel Environment Variables, add:
   - `GOOGLE_FEEDBACK_WEB_APP_URL` = the Web app URL
10. Redeploy AgeVerseGlobal.

The website will then submit feedback directly to the Google Apps Script, which appends the six fields to the Sheet.

### About the admin email

You do **not** need to put your Google email address into the website. The Google account you use to run/deploy the Apps Script automatically owns the Form and Sheet. An email address alone cannot securely authenticate or connect a website to a Google account, so the setup deliberately does not ask the website to collect or expose your admin email.

## Privacy behavior

Approximate country/city is derived by Vercel from the request IP and only the derived location is sent to the feedback service. The visitor IP is not sent as a feedback field or stored in the feedback Sheet. City/country can be inaccurate for VPNs, mobile networks and some ISPs.
