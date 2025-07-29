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
- **Storage**: LocalStorage for client-side data persistence

## 📦 Installation

### Prerequisites
- Node.js 18.0 or higher
- npm or yarn package manager

### Setup
1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Windows11-Readiness-Webapp.git
   cd Windows11-Readiness-Webapp
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
Windows11-Readiness-Webapp/
├── public/                 # Static assets
│   └── wolff-logics-logo.png
├── src/
│   ├── app/               # Next.js app directory
│   │   ├── api/          # API routes
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
  "rmmFile": "base64-encoded-excel-file",
  "scalepadFile": "base64-encoded-excel-file", // Optional
  "companyInfo": {
    "name": "Company Name",
    "site": "Location", // Optional
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
  "data": [...], // Processed machine data
  "charts": {...}, // Chart data
  "files": {
    "excel": "base64-csv-data"
  }
}
```

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

### v1.0.0 (Current)
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
