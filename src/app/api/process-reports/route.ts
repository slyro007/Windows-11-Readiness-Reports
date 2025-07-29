import { NextRequest, NextResponse } from 'next/server'

// TypeScript interface for the request data
interface ProcessReportsRequest {
  files: Array<{
    name: string
    type: 'rmm' | 'scalepad'
    data: any[]
    size: number
  }>
  companyInfo: {
    name: string
    site: string
  }
}

// Helper function to simulate the Python processing logic
function processRmmData(rmmData: any[], scalepadData: any[], companyInfo: { name: string; site: string }) {
  // Merge RMM and ScalePad data (simplified version of your Python logic)
  const processedData = rmmData.map(rmmRow => {
    // Find matching ScalePad record by serial
    const scalepadRow = scalepadData.find(sp => 
      sp.Serial && rmmRow.Serial && 
      sp.Serial.toString().toLowerCase() === rmmRow.Serial.toString().toLowerCase()
    )

    // Process Windows 11 readiness
    let win11Status = 'Offline'
    const win11Ready = rmmRow['Windows 11 Ready']?.toString().toLowerCase()
    
    if (win11Ready === 'pass' || win11Ready === 'true' || win11Ready === 'yes') {
      win11Status = 'Compatible'
    } else if (win11Ready === 'fail' || win11Ready === 'false' || win11Ready === 'no') {
      win11Status = 'Not Compatible'
    }

    // Process SecureBoot capability
    let secureBootCapability = 'Unknown'
    let isUnsupported = false
    const secureBootValue = rmmRow.SecureBoot?.toString().toLowerCase()

    if (secureBootValue) {
      if (secureBootValue.includes('enabled') || secureBootValue === 'true' || secureBootValue === 'yes') {
        secureBootCapability = 'Capable (Enabled)'
      } else if (secureBootValue.includes('disabled') || secureBootValue === 'false' || secureBootValue === 'no') {
        secureBootCapability = 'Capable (Disabled)'
        // Mark as unsupported if Windows 11 ready but SecureBoot disabled
        if (win11Status === 'Compatible') {
          isUnsupported = true
          win11Status = 'Unsupported'
        }
      } else if (secureBootValue.includes('notcapable') || secureBootValue.includes('not capable')) {
        secureBootCapability = 'Not Capable'
        if (win11Status === 'Compatible') {
          isUnsupported = true
          win11Status = 'Unsupported'
        }
      }
    }

    return {
      ...rmmRow,
      'Windows 11 Status': win11Status,
      'SecureBoot Capability': secureBootCapability,
      'Unsupported': isUnsupported,
      'Warranty Expires': scalepadRow?.['Warranty Expires'] || '',
      'In ScalePad': !!scalepadRow
    }
  })

  return processedData
}

// Generate summary statistics
function generateSummary(processedData: any[]) {
  const total = processedData.length
  const compatible = processedData.filter(row => row['Windows 11 Status'] === 'Compatible').length
  const unsupported = processedData.filter(row => row['Windows 11 Status'] === 'Unsupported').length
  const notCompatible = processedData.filter(row => row['Windows 11 Status'] === 'Not Compatible').length
  const offline = processedData.filter(row => row['Windows 11 Status'] === 'Offline').length

  const secureBootStats = {
    capableEnabled: processedData.filter(row => row['SecureBoot Capability'] === 'Capable (Enabled)').length,
    capableDisabled: processedData.filter(row => row['SecureBoot Capability'] === 'Capable (Disabled)').length,
    notCapable: processedData.filter(row => row['SecureBoot Capability'] === 'Not Capable').length,
    unknown: processedData.filter(row => row['SecureBoot Capability'] === 'Unknown').length,
  }

  return {
    summary: {
      total,
      compatible,
      unsupported,
      notCompatible,
      offline
    },
    secureBoot: secureBootStats
  }
}

// Generate Excel file (simplified - in production you'd use a library like xlsx)
function generateExcelFile(processedData: any[], companyInfo: { name: string; site: string }) {
  // For now, we'll return a CSV format as base64
  // In production, you'd use xlsx library to create actual Excel files
  const headers = [
    'Workstation', 'Friendly Name', 'Site', 'Serial', 'Windows 11 Status',
    'RAM', 'CPU', 'TPM Version', 'SecureBoot', 'SecureBoot Capability', 
    'Unsupported', 'OS Version', 'Warranty Expires', 'In ScalePad'
  ]
  
  let csvContent = headers.join(',') + '\n'
  
  processedData.forEach(row => {
    const values = headers.map(header => {
      const value = row[header] || ''
      return `"${value.toString().replace(/"/g, '""')}"`
    })
    csvContent += values.join(',') + '\n'
  })

  return Buffer.from(csvContent).toString('base64')
}

// Generate HTML file (simplified version of your existing HTML generation)
function generateHtmlFile(processedData: any[], companyInfo: { name: string; site: string }, stats: any) {
  const { summary, secureBoot } = stats
  
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${companyInfo.name} - Windows 11 Readiness Report</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #121212; 
            color: #ffffff; 
        }
        .header { 
            text-align: center; 
            margin-bottom: 30px; 
            padding: 20px;
            background: linear-gradient(45deg, #2196f3, #e91e63);
            border-radius: 12px;
        }
        .dashboard { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 20px; 
            margin-bottom: 30px; 
        }
        .card { 
            background: #1e1e1e; 
            padding: 20px; 
            border-radius: 12px; 
            text-align: center;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .card h3 { margin: 0 0 10px 0; }
        .card .value { font-size: 2em; font-weight: bold; margin: 10px 0; }
        .compatible { border-left: 4px solid #4caf50; }
        .unsupported { border-left: 4px solid #ffc107; }
        .not-compatible { border-left: 4px solid #f44336; }
        .offline { border-left: 4px solid #9e9e9e; }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            background: #1e1e1e; 
            border-radius: 12px; 
            overflow: hidden;
        }
        th, td { 
            padding: 12px; 
            text-align: left; 
            border-bottom: 1px solid rgba(255,255,255,0.1); 
        }
        th { 
            background: #2196f3; 
            color: white; 
            font-weight: 600;
        }
        .status-compatible { color: #4caf50; font-weight: bold; }
        .status-unsupported { color: #ffc107; font-weight: bold; }
        .status-not-compatible { color: #f44336; font-weight: bold; }
        .status-offline { color: #9e9e9e; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${companyInfo.name} Windows 11 Readiness Report</h1>
        ${companyInfo.site ? `<h2>${companyInfo.site}</h2>` : ''}
        <p>Generated on ${new Date().toLocaleDateString()}</p>
    </div>

    <div class="dashboard">
        <div class="card compatible">
            <h3>Compatible</h3>
            <div class="value">${summary.compatible}</div>
            <p>${((summary.compatible / summary.total) * 100).toFixed(1)}% of total</p>
        </div>
        <div class="card unsupported">
            <h3>Unsupported</h3>
            <div class="value">${summary.unsupported}</div>
            <p>${((summary.unsupported / summary.total) * 100).toFixed(1)}% of total</p>
        </div>
        <div class="card not-compatible">
            <h3>Not Compatible</h3>
            <div class="value">${summary.notCompatible}</div>
            <p>${((summary.notCompatible / summary.total) * 100).toFixed(1)}% of total</p>
        </div>
        <div class="card offline">
            <h3>Total Devices</h3>
            <div class="value">${summary.total}</div>
            <p>Analyzed</p>
        </div>
    </div>

    <div class="dashboard">
        <div class="card compatible">
            <h3>SecureBoot Enabled</h3>
            <div class="value">${secureBoot.capableEnabled}</div>
            <p>Ready for Windows 11</p>
        </div>
        <div class="card unsupported">
            <h3>SecureBoot Disabled</h3>
            <div class="value">${secureBoot.capableDisabled}</div>
            <p>Needs activation</p>
        </div>
        <div class="card not-compatible">
            <h3>Not Capable</h3>
            <div class="value">${secureBoot.notCapable}</div>
            <p>Hardware limitation</p>
        </div>
        <div class="card offline">
            <h3>Unknown Status</h3>
            <div class="value">${secureBoot.unknown}</div>
            <p>Needs investigation</p>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Workstation</th>
                <th>Windows 11 Status</th>
                <th>SecureBoot</th>
                <th>RAM</th>
                <th>CPU</th>
                <th>TPM</th>
                <th>Warranty</th>
            </tr>
        </thead>
        <tbody>
            ${processedData.map(row => `
                <tr>
                    <td>${row.Workstation || row['Friendly Name'] || 'Unknown'}</td>
                    <td class="status-${row['Windows 11 Status'].toLowerCase().replace(' ', '-')}">${row['Windows 11 Status']}</td>
                    <td>${row['SecureBoot Capability']}</td>
                    <td>${row.RAM || 'Unknown'}</td>
                    <td>${row.CPU || 'Unknown'}</td>
                    <td>${row['TPM Version'] || 'Unknown'}</td>
                    <td>${row['Warranty Expires'] || 'Unknown'}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>`

  return Buffer.from(htmlContent).toString('base64')
}

export async function POST(request: NextRequest) {
  try {
    const data: ProcessReportsRequest = await request.json()
    
    // Validate input
    if (!data.files || data.files.length !== 2) {
      return NextResponse.json(
        { error: 'Two files are required: RMM Report and ScalePad Report' },
        { status: 400 }
      )
    }

    if (!data.companyInfo?.name) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      )
    }

    // Find RMM and ScalePad files
    const rmmFile = data.files.find(f => f.type === 'rmm')
    const scalepadFile = data.files.find(f => f.type === 'scalepad')

    if (!rmmFile || !scalepadFile) {
      return NextResponse.json(
        { error: 'Both RMM and ScalePad files are required' },
        { status: 400 }
      )
    }

    // Process the data using your existing logic
    const processedData = processRmmData(rmmFile.data, scalepadFile.data, data.companyInfo)
    
    // Generate summary statistics
    const stats = generateSummary(processedData)
    
    // Generate files
    const excelFile = generateExcelFile(processedData, data.companyInfo)
    const htmlFile = generateHtmlFile(processedData, data.companyInfo, stats)

    // Return the results
    return NextResponse.json({
      success: true,
      ...stats,
      files: {
        excel: `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${excelFile}`,
        html: `data:text/html;base64,${htmlFile}`
      },
      processedData: processedData.slice(0, 10) // Return first 10 rows for preview
    })

  } catch (error) {
    console.error('Error processing reports:', error)
    return NextResponse.json(
      { error: 'Failed to process reports', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 