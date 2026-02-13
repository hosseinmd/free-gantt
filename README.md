# Free Gantt Chart

A beautiful, free Gantt chart visualization tool built with React, TypeScript. Connect your Google Sheets or upload CSV files to instantly visualize project timelines and task dependencies.

## 🚀 Features

- 📊 Interactive Gantt chart visualization with dark theme
- 🔗 **Google Sheets Integration** - Connect directly to your Google Sheets
  - Real-time data sync
  - Edit in the Gantt chart and save back to Google Sheets
  - No file uploads needed
- 📁 CSV file upload support with drag & drop
- ✏️ Full editing capabilities:
  - Add, edit, and delete tasks
  - Drag to adjust task dates and durations
  - Create task dependencies
  - Move tasks to reorder
- 💾 Export edited data back to CSV format
- 🔐 Secure Google OAuth authentication
- 🎨 Modern, responsive UI powered by Ant Design
- 🛠️ Built-in toolbar with task management features
- 📥 Sample CSV file included
- 🎯 Professional component library for better UX
- 📱 Mobile-friendly responsive design

## 📋 CSV Format

Your CSV file should include the following columns:

| Column     | Required | Description                                | Example        |
| ---------- | -------- | ------------------------------------------ | -------------- |
| `id`       | Yes      | Unique identifier for each task            | 1, 2, 3        |
| `text`     | Yes      | Task name/description                      | "Design Phase" |
| `start`    | Yes      | Start date in YYYY-MM-DD format            | 2024-01-01     |
| `end`      | Yes      | End date in YYYY-MM-DD format              | 2024-01-15     |
| `duration` | Yes      | Task duration in days                      | 15             |
| `progress` | Yes      | Completion progress (0-1, where 1 = 100%)  | 0.5            |
| `parent`   | No       | Parent task ID for creating task hierarchy | 1              |
| `type`     | No       | Task type (task, project, milestone)       | project        |

### 📥 Sample CSV

Download the [sample-gantt.csv](./public/sample-gantt.csv) file to see the format in action, or click the "Download Sample CSV" button in the app.

Example CSV content:

```csv
id,text,start,end,duration,progress,parent,type
1,Project Planning,2024-01-01,2024-01-15,15,0.8,,project
2,Define Requirements,2024-01-01,2024-01-05,5,1,1,task
3,Design Phase,2024-01-06,2024-01-15,10,0.6,1,task
4,Development,2024-01-16,2024-02-29,45,0.4,,project
5,Backend Development,2024-01-16,2024-02-10,25,0.5,4,task
```

## 🏁 Getting Started

### Install Dependencies

```bash
pnpm install
```

### Set Up Google Sheets API (Optional)

To use the Google Sheets integration feature:

1. Follow the detailed guide in [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md)
2. Create a `.env` file with your Google API credentials:

```bash
cp .env.example .env
```

3. Add your credentials to the `.env` file:

```env
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=your_api_key
```

> **Note:** Google Sheets integration is optional. You can still use the app with CSV files without setting up Google API credentials.

### Run Development Server

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
pnpm build
```

### Preview Production Build

```bash
pnpm preview
```

### Lint Code

```bash
pnpm lint
```

### Format Code

```bash
pnpm format
```

## 🎯 How to Use

### Option 1: Google Sheets (Recommended)

1. **Sign in**: Click "Sign in with Google" to authenticate
2. **Connect your sheet**: Click "Connect Google Sheet" and paste your sheet URL
3. **Edit your Gantt chart**: Make changes directly in the interactive chart
4. **Save changes**: Click "Save to Sheet" to update your Google Sheet
5. **Real-time sync**: Your changes are saved back to Google Sheets instantly

### Option 2: CSV Files

1. **Upload a CSV file**: Click "Choose CSV File" and select your CSV file
2. **Download sample**: Click "Download Sample" to get a template CSV
3. **View your Gantt chart**: The chart will automatically render after upload
4. **Edit tasks**: Use the toolbar to manage tasks:
   - Add new tasks
   - Edit task details (double-click on tasks)
   - Delete tasks
   - Move tasks up/down
   - Adjust task dates by dragging
   - Connect tasks with dependencies
5. **Export your changes**: Click "Export to CSV" to download your modified data
6. **Clear data**: Click "Clear Data" to reset and upload a new file

## 📦 Deploy to GitHub Pages

### Automatic Deployment (Recommended)

The project includes a GitHub Actions workflow that automatically deploys to GitHub Pages when you push to the `main` branch.

### Manual Deployment (Alternative)

You can also deploy manually using the command:

```bash
pnpm deploy
```

This will build your project and deploy it to the `gh-pages` branch.

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Ant Design** - Professional UI component library
- **@svar-ui/react-gantt** - Gantt chart component
- **Google Sheets API** - Real-time spreadsheet integration
- **@react-oauth/google** - Modern Google OAuth authentication
- **PapaParse** - CSV parsing library
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **pnpm** - Fast, disk space efficient package manager
- **gh-pages** - GitHub Pages deployment

## 📚 Resources

- [Google Sheets Setup Guide](./GOOGLE_SHEETS_SETUP.md)
- [SVAR React Gantt Documentation](https://docs.svar.dev/react/gantt/)
- [Toolbar Configuration Guide](https://docs.svar.dev/react/gantt/guides/configuration/toolbar)
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [PapaParse Documentation](https://www.papaparse.com/)

## 📝 License

MIT

## 🔒 Privacy Policy

- **Repo copy**: [PRIVACY_POLICY.md](./PRIVACY_POLICY.md)
- **Deployed page (GitHub Pages-friendly)**: `privacy-policy.html` (it’s included in `public/` and will be published to your Pages site at `<your-pages-url>/privacy-policy.html`)

## 📜 Terms of Service

- **Repo copy**: [TERMS_OF_SERVICE.md](./TERMS_OF_SERVICE.md)
- **Deployed page (GitHub Pages-friendly)**: `terms-of-service.html` (it’s included in `public/` and will be published to your Pages site at `<your-pages-url>/terms-of-service.html`)

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.
