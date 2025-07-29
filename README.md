# Windows 11 Readiness Report Web Application

A modern, lightweight web application for generating comprehensive Windows 11 readiness reports from RMM and ScalePad CSV data. Built with Next.js 14, Material-UI, and optimized for Vercel deployment.

## 🚀 Features

- **Material Design UI** - Modern, dark-mode interface with smooth animations
- **Drag & Drop File Upload** - Support for RMM and ScalePad CSV files
- **Real-time Processing** - Background processing with live progress indicators
- **Comprehensive Analysis** - Windows 11 compatibility, SecureBoot capabilities, and hardware assessment
- **Multiple Export Formats** - Generate both Excel and HTML reports
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Vercel Ready** - Optimized for serverless deployment

## 📊 Report Analysis

The application processes your data to provide:

- **Windows 11 Compatibility Status**
  - Compatible devices
  - Unsupported devices (compatible but SecureBoot issues)
  - Not compatible devices
  - Offline/unknown status devices

- **SecureBoot Capability Tracking**
  - Capable & Enabled
  - Capable but Disabled
  - Not Capable
  - Unknown Status

- **Hardware Analysis**
  - RAM requirements
  - CPU compatibility
  - TPM version tracking
  - Warranty information integration

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **UI Framework**: Material-UI (MUI) with custom dark theme
- **Animations**: Framer Motion
- **File Processing**: PapaParse for CSV handling
- **Styling**: Tailwind CSS + Material-UI
- **Deployment**: Vercel-ready configuration

## 📋 Prerequisites

- Node.js 18.0 or higher
- npm or yarn package manager

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd windows11-report-webapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel**
   ```bash
   vercel
   ```

3. **Follow the prompts** to link your project and deploy

## 📁 File Requirements

### RMM Report CSV
Required columns:
- `Workstation` - Device hostname
- `Windows 11 Ready` - Compatibility status (Pass/Fail)
- `RAM` - Memory specifications
- `CPU` - Processor information
- `TPM Version` - TPM chip version
- `SecureBoot` - SecureBoot status (Enabled/Disabled/Not Capable)
- `Serial` - Device serial number (for ScalePad matching)

### ScalePad Report CSV
Required columns:
- `Serial` - Device serial number (matches RMM data)
- `Warranty Expires` - Warranty expiration date

## 🎨 Design Features

- **Dark Mode by Default** - Easy on the eyes for IT professionals
- **Material Design 3** - Modern, intuitive interface
- **Smooth Animations** - Framer Motion powered transitions
- **Responsive Layout** - Works on all screen sizes
- **Progress Indicators** - Real-time processing feedback
- **Error Handling** - Comprehensive validation and error messages

## 🔧 Configuration

### Environment Variables
```env
NODE_ENV=production
```

### Vercel Configuration
The project includes `vercel.json` with optimized settings:
- 30-second function timeout for large file processing
- Next.js framework detection
- Production environment configuration

## 📊 Output Formats

### Excel Report (.xlsx)
- Complete device inventory
- All compatibility metrics
- SecureBoot analysis
- Warranty tracking
- Filterable and sortable data

### HTML Report (.html)
- Interactive dashboard
- Visual charts and graphs
- Color-coded status indicators
- Print-ready formatting
- Dark theme styling

## 🔍 Processing Logic

The application implements the same logic as your existing Python scripts:

1. **Data Validation** - Verify required columns and file formats
2. **Data Merging** - Match RMM and ScalePad data by serial numbers
3. **Compatibility Analysis** - Assess Windows 11 readiness
4. **SecureBoot Processing** - Categorize SecureBoot capabilities
5. **Report Generation** - Create formatted Excel and HTML outputs

## 🚦 API Endpoints

### POST `/api/process-reports`
Process uploaded CSV files and generate reports.

**Request Body:**
```json
{
  "files": [
    {
      "name": "RMM Report.csv",
      "type": "rmm",
      "data": [...],
      "size": 1024
    },
    {
      "name": "ScalePad Report.csv",
      "type": "scalepad", 
      "data": [...],
      "size": 512
    }
  ],
  "companyInfo": {
    "name": "Your Company",
    "site": "Main Office"
  }
}
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "total": 100,
    "compatible": 75,
    "unsupported": 10,
    "notCompatible": 15,
    "offline": 0
  },
  "secureBoot": {
    "capableEnabled": 60,
    "capableDisabled": 25,
    "notCapable": 10,
    "unknown": 5
  },
  "files": {
    "excel": "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,...",
    "html": "data:text/html;base64,..."
  }
}
```

## 🔒 Security & Privacy

- **Client-side Processing** - Files are processed in-browser when possible
- **No Data Storage** - Reports are generated and downloaded immediately
- **Temporary Processing** - Server-side processing uses temporary memory only
- **No External Dependencies** - All processing logic is self-contained

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🆘 Support

For support, email your IT team or create an issue in the repository.

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
  - File upload and validation
  - Windows 11 compatibility analysis
  - SecureBoot capability tracking
  - Excel and HTML report generation
  - Vercel deployment optimization
