# Windows 11 Readiness Report - Web Application

![Wolff Logics Logo](public/wolff-logics-logo.png)

A comprehensive web application for analyzing and reporting Windows 11 compatibility across enterprise environments. This tool processes RMM (Remote Monitoring and Management) reports and ScalePad data to generate detailed Windows 11 readiness assessments.

## 🚀 Features

### 📊 **Comprehensive Analysis**
- **Windows 11 Compatibility Assessment**: Analyzes hardware requirements including RAM, TPM, CPU, and SecureBoot
- **Multi-Source Data Processing**: Combines RMM reports with ScalePad warranty data
- **Intelligent Status Detection**: Automatically categorizes machines as Pass, Fail, Unsupported, or Offline

### 📈 **Interactive Dashboard**
- **Real-time Charts**: Interactive pie charts showing overall compatibility breakdown
- **Sortable Tables**: Click any column header to sort workstation data
- **Site-by-Site Analysis**: Expandable sections for each location
- **Status Summary Cards**: Visual overview of compatibility statistics

### 📄 **Professional Reports**
- **PDF Generation**: High-quality, print-ready PDF reports with company branding
- **CSV Export**: Clean data export for further analysis
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Dark/Light Mode**: Toggle between themes for comfortable viewing

### 🏢 **Multi-Company Support**
- **Company Management**: Smart dropdown for existing companies with auto-population
- **Report History**: Track and revisit previous assessments
- **Tenant-based Organization**: Organize reports by company tenant codes

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI Framework**: Material-UI (MUI) with custom theming
- **Charts**: Recharts for interactive data visualization
- **PDF Generation**: jsPDF with custom table rendering
- **Animation**: Framer Motion for smooth transitions
- **Storage**: Server-side JSON storage with localStorage fallback
- **Deployment**: Docker containerization for easy deployment

## 📦 Installation & Deployment

### Option 1: Docker Deployment (Recommended)

#### Prerequisites
- Docker and Docker Compose
- Linux server or VM with sufficient disk space

#### Quick Start
1. **Clone the repository**
   ```bash
   git clone https://github.com/slyro007/Windows-11-Readiness-Reports.git
   cd Windows-11-Readiness-Reports
   ```

2. **Deploy with automated script**
   ```bash
   # Make the deploy script executable and run it
   chmod +x deploy.sh
   ./deploy.sh
   ```

   **Or manually build and run:**
   ```bash
   # Build the Docker image
   docker build -t windows11-readiness-app .
   
   # Create data directory for persistent storage
   mkdir -p $(pwd)/data
   
   # Run the container with volume mounting
   docker run -d -p 3000:3000 -v $(pwd)/data:/app/data --name windows11-app windows11-readiness-app
   ```

3. **Access the application**
   - Navigate to `http://YOUR_SERVER_IP:3000`
   - Reports are shared between all users accessing the application
   - Data persists across container restarts

#### Docker Management Commands
```bash
# Update the application (automated)
./update-app.sh

# View running containers
docker ps

# View application logs
docker logs windows11-app

# Stop the application
docker stop windows11-app

# Start the application
docker start windows11-app

# Manual update process
git pull origin master
docker build --no-cache -t windows11-readiness-app .
docker stop windows11-app && docker rm windows11-app
docker run -d -p 3000:3000 -v $(pwd)/data:/app/data --name windows11-app windows11-readiness-app
```

### Option 2: Local Development

#### Prerequisites
- Node.js 18.0 or higher
- npm or yarn package manager

#### Setup
1. **Clone the repository**
   ```bash
   git clone https://github.com/slyro007/Windows-11-Readiness-Reports.git
   cd Windows-11-Readiness-Reports
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📋 Usage

### 1. **Upload Reports**
- Upload your RMM report (Excel format)
- Upload ScalePad report (Excel format) - Optional but recommended for warranty data
- Enter company information (use dropdown for existing companies)

### 2. **Review Results**
- Interactive dashboard shows compatibility breakdown
- Sort tables by any column (Workstation, Status, RAM, CPU, etc.)
- Expand site sections to view detailed machine information
- Toggle between light and dark themes

### 3. **Generate Reports**
- **PDF Download**: Professional report with company branding
- **CSV Export**: Clean data for spreadsheet analysis
- **Report History**: Access previously generated reports

## 📊 Report Categories

| Status | Description | Criteria |
|--------|-------------|----------|
| **Pass** | Ready for Windows 11 | Meets all hardware requirements, SecureBoot enabled |
| **Fail** | Hardware insufficient | Missing RAM, TPM, or unsupported CPU |
| **Unsupported** | Hardware capable but configuration issues | Usually SecureBoot disabled or other config problems |
| **Offline** | Machine unavailable | No data available from RMM scan |

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in the root directory:

```env
# Optional: Custom API endpoints
NEXT_PUBLIC_API_URL=http://localhost:3000

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your-analytics-id
```

### Company Branding
- Replace `public/wolff-logics-logo.png` with your company logo
- Update company information in the header sections
- Modify color themes in `src/components/providers/ThemeProvider.tsx`

## 📁 Project Structure

```
Windows11-Readiness-Reports/
├── public/                 # Static assets
│   └── wolff-logics-logo.png
├── src/
│   ├── app/               # Next.js app directory
│   │   ├── api/          # API routes
│   │   │   ├── process-reports/
│   │   │   │   └── route.ts    # Report processing endpoint
│   │   │   └── reports/
│   │   │       └── route.ts    # Report storage CRUD operations
│   │   ├── globals.css   # Global styles
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Home page
│   └── components/        # React components
│       ├── CompanyInfoForm.tsx    # Company selection form
│       ├── FileUploadZone.tsx     # File upload interface
│       ├── ProcessingStatus.tsx   # Processing indicator
│       ├── ReportHistory.tsx      # Historical reports
│       ├── ResultsPreview.tsx     # Main results display
│       └── providers/
│           └── ThemeProvider.tsx  # Theme management
├── data/                  # Server-side storage (created at runtime)
│   └── reports.json       # Persistent report storage
├── deploy.sh              # Initial deployment script
├── update-app.sh          # Production update script
├── Dockerfile             # Docker container configuration
├── .dockerignore          # Docker build exclusions
├── analyze_excel.py       # Python analysis script
├── process_company.py     # Company processing utilities
└── package.json          # Dependencies and scripts
```

## 🔍 API Endpoints

### POST `/api/process-reports`
Processes uploaded RMM and ScalePad reports

**Request Body:**
```json
{
  "files": [
    {
      "name": "rmm-report.xlsx",
      "type": "rmm",
      "data": [...],
      "size": 12345
    },
    {
      "name": "scalepad-report.xlsx", 
      "type": "scalepad",
      "data": [...],
      "size": 6789
    }
  ],
  "companyInfo": {
    "name": "Company Name",
    "site": "Location",
    "tenant": "TENANT_CODE"
  }
}
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "total": 50,
    "compatible": 30,
    "notCompatible": 10,
    "unsupported": 8,
    "offline": 2
  },
  "data": [...],
  "charts": {...},
  "files": {
    "excel": "base64-csv-data"
  }
}
```

### GET `/api/reports`
Retrieves all stored reports

**Response:**
```json
[
  {
    "id": "1640995200000",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "companyInfo": {
      "name": "Company Name",
      "site": "Main Office",
      "tenant": "TENANT"
    },
    "results": {...},
    "summary": {...}
  }
]
```

### POST `/api/reports`
Saves a new report to server storage

**Request Body:**
```json
{
  "id": "1640995200000",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "companyInfo": {...},
  "results": {...},
  "summary": {...}
}
```

### DELETE `/api/reports?id={reportId}`
Deletes a specific report from server storage

## 🎨 Customization

### Themes
The application supports both light and dark themes. Customize colors in:
- `src/components/providers/ThemeProvider.tsx`
- Update Material-UI theme configuration
- Modify chart colors in `src/components/ResultsPreview.tsx`

### PDF Styling
PDF generation styling can be customized in the `downloadPDF` function:
- Header styling and logo placement
- Color schemes (always uses light mode for PDFs)
- Table formatting and column widths
- Page layout and margins

## 💾 Data Management & Backup

### Server Storage
Reports are stored in `/app/data/reports.json` inside the Docker container and mapped to `./data/reports.json` on the host system.

### Backup Strategy
```bash
# Backup reports data
cp ./data/reports.json ./backups/reports-$(date +%Y%m%d).json

# Restore from backup
cp ./backups/reports-20240101.json ./data/reports.json
docker restart windows11-app
```

### Migration
To move the application to a new server:
1. Stop the container: `docker stop windows11-app`
2. Copy the `data/` directory to the new server
3. Set up Docker on the new server
4. Deploy the application with the existing data directory

### Storage Location
- **Docker deployment**: `./data/reports.json` (host) → `/app/data/reports.json` (container)
- **Local development**: Browser localStorage with server fallback

## 🐛 Troubleshooting

### Common Issues

1. **File Upload Errors**
   - Ensure Excel files are in `.xlsx` format
   - Check file size limits (default: 10MB)
   - Verify column headers match expected format

2. **PDF Generation Issues**
   - Large datasets may take longer to process
   - Ensure sufficient browser memory for PDF generation
   - Check console for any JavaScript errors

3. **Data Processing Errors**
   - Verify RMM report contains "Output" column with machine data
   - Check that machine names match between RMM and ScalePad reports
   - Ensure proper date formats in warranty data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software developed by Wolff Logics for Windows 11 migration assessments.

## 🆘 Support

For technical support or feature requests:
- Email: support@wolfflogics.com
- Documentation: [Internal Wiki](https://wiki.wolfflogics.com)
- Issue Tracker: GitHub Issues

## 📈 Changelog

### v1.1.0 (Current)
- ✅ **Docker Deployment**: Full containerization with persistent storage
- ✅ **Server-Side Storage**: Shared reports between users with JSON file storage
- ✅ **Multi-User Access**: Multiple users can access and view the same reports
- ✅ **Data Persistence**: Reports survive container restarts and system reboots
- ✅ **RESTful API**: Complete CRUD operations for report management
- ✅ **Volume Mounting**: Easy backup and data management with Docker volumes
- ✅ **Fallback Support**: localStorage fallback for offline compatibility

### v1.0.0
- ✅ Initial release with full Windows 11 compatibility analysis
- ✅ Multi-company support with smart dropdown selection
- ✅ Professional PDF report generation with auto-fit columns
- ✅ Sortable tables with comprehensive filtering
- ✅ CSV export functionality
- ✅ Dark/light theme support
- ✅ Responsive design for all devices
- ✅ Report history and management
- ✅ Enhanced SecureBoot logic for accurate assessments

---

**Built with ❤️ by Wolff Logics IT Solutions**
