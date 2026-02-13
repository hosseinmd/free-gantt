# Privacy Policy (Free Gantt Chart)

**Effective date:** 2026-02-13

Free Gantt Chart ("the App") is an open-source, client-side web app. We do not operate our own backend servers for this App.

## What data the App accesses

- **Google Sheets content you choose**: If you connect a Google Sheet, the App reads the selected spreadsheet data and, if you click "Save to Sheet", writes updated data back to that same Google Sheet.
- **CSV files you choose**: If you upload a CSV file, the App processes it locally in your browser to render the Gantt chart.

## How the App uses Google user data

The App uses Google OAuth to request an access token with the Google Sheets scope (`https://www.googleapis.com/auth/spreadsheets`) so it can read and write the sheet you choose, directly from your browser to Google APIs (`sheets.googleapis.com`).

The App’s use and transfer of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements.

## What the App does not do

- **No third-party analytics**: The App does not intentionally send your sheet contents to analytics or advertising services.
- **No selling of data**: We do not sell your data.
- **No custom server storage**: We do not store your Google Sheet content on our own servers.

## Local storage (on your device)

To keep you signed in between refreshes, the App stores the Google OAuth access token and its expiry time in your browser’s local storage (for example under keys like `google_sheets_token` and `google_sheets_token_expiry`). This token is used only to call Google APIs from your browser.

You can remove this data by signing out in the App and/or clearing your browser’s site data for the App.

## Sharing

When you use Google Sheets features, your browser communicates with Google’s services to read/write data. Google’s handling of your data is governed by Google’s own policies.

## Security

We aim to minimize data collection and storage. However, no method of transmission or storage is 100% secure. If you are using a shared computer, we recommend signing out when you are done.

## Changes to this policy

We may update this policy from time to time. We will post the updated version and update the effective date.

## Contact

For questions, requests, or issues, please contact us via the GitHub repository where this App is published (for example by opening an issue).

