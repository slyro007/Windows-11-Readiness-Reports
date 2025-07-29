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
    tenant: string
  }
}

// Helper function to simulate the Python processing logic
function processRmmData(rmmData: any[], scalepadData: any[], companyInfo: { name: string; site: string; tenant: string }) {
  // Parse the Output column to extract Windows 11 readiness and specifications
  function parseOutputData(outputText: string) {
    if (!outputText || typeof outputText !== 'string' || outputText.trim() === '') {
      return {
        win11_ready: 'Offline',
        ram: 'Offline',
        tpm: 'Offline',
        cpu: 'Offline',
        os: 'Offline',
        secure_boot: 'Offline'
      }
    }

    const output = outputText.trim()
    
    // Check for "Machine was offline" specifically
    if (output.includes('Machine was offline')) {
      return {
        win11_ready: 'Offline',
        ram: 'Offline',
        tpm: 'Offline',
        cpu: 'Offline',
        os: 'Offline',
        secure_boot: 'Offline'
      }
    }
    
    // Initialize result with default values
    const result = {
      win11_ready: 'Unknown',
      ram: 'Unknown',
      tpm: 'Unknown',
      cpu: 'Unknown',
      os: 'Unknown',
      secure_boot: 'Unknown'
    }

    // Parse Memory
    const memoryMatch = output.match(/Memory:\s*System_Memory=(\d+)GB\s*::\s*(PASS|FAIL)/i)
    if (memoryMatch) {
      result.ram = `${memoryMatch[1]}GB`
    }

    // Parse TPM
    const tpmMatch = output.match(/TPM:\s*TPMVersion=([^:]+)\s*::\s*(PASS|FAIL)/i)
    if (tpmMatch) {
      result.tpm = tpmMatch[1].split(',')[0] // Get just the version number
    }

    // Parse OS
    const osMatch = output.match(/OsVersion:\s*version=([^:]+)\s*::\s*(PASS|FAIL)/i)
    if (osMatch) {
      result.os = osMatch[1].replace(/Microsoft\s+/i, '').trim()
    }

    // Parse SecureBoot - this is complex because it has multiple indicators
    const secureBootCapable = output.includes('SecureBoot: Capable :: PASS')
    const secureBootDisabled = output.includes('Secure Boot is not enabled :: FAIL')
    const secureBootEnabled = output.includes('Secure Boot is enabled :: PASS')
    
    if (secureBootCapable) {
      if (secureBootEnabled) {
        result.secure_boot = 'Enabled'
      } else if (secureBootDisabled) {
        result.secure_boot = 'Capable but Disabled'
      } else {
        // If capable and no explicit disabled message, assume it's enabled
        result.secure_boot = 'Enabled'
      }
    } else {
      result.secure_boot = 'Not Capable'
    }
    
    // Parse CPU - extract Intel generation from processor info
    const processorMatch = output.match(/Caption=Intel64 Family 6 Model (\d+)/i)
    if (processorMatch) {
      const model = parseInt(processorMatch[1])
      const generation = getIntelGeneration(model)
      if (generation > 0) {
        result.cpu = `Intel ${generation}th Gen (Model ${model})`
      } else {
        result.cpu = `Intel Unknown Gen (Model ${model})`
      }
    }

    // Determine Windows 11 readiness based on component analysis
    // This follows the same logic as the Python script
    const memoryPassed = output.includes('Memory:') && output.includes(':: PASS')
    const tpmPassed = output.includes('TPM:') && output.includes(':: PASS')
    const secureBootPassed = secureBootCapable
    const processorPassed = output.includes('Processor:') && output.includes(':: PASS')
    
    // Check if running Windows 11 already
    const isWindows11 = result.os.includes('Windows 11')
    
    // Check for explicit status first - trust the RMM tool's assessment
    if (output.includes('Status : Supported')) {
      // If RMM says "Supported", it means Windows 11 ready
      result.win11_ready = 'Pass'
    } else if (output.includes('Status : Unsupported')) {
      // If RMM says "Unsupported", check if it's due to SecureBoot or other issues
      if (secureBootCapable && memoryPassed && tpmPassed && processorPassed) {
        // Hardware meets requirements but something else (likely SecureBoot disabled)
        result.win11_ready = 'Unsupported'
      } else {
        // Hardware doesn't meet basic requirements
        result.win11_ready = 'Fail'
      }
    } else if (output.includes('Status : Unknown')) {
      result.win11_ready = 'Offline'
    } else {
      // Fallback logic for machines without explicit status
      if (isWindows11 && memoryPassed && tpmPassed && secureBootPassed && processorPassed) {
        result.win11_ready = 'Pass' // Already on Windows 11 and everything works
      } else if (memoryPassed && tpmPassed && secureBootPassed && processorPassed) {
        if (result.secure_boot === 'Enabled') {
          result.win11_ready = 'Pass' // Ready for Windows 11
        } else {
          result.win11_ready = 'Unsupported' // Capable but SecureBoot disabled
        }
      } else {
        // Check what's failing
        if (!memoryPassed || !tpmPassed || !processorPassed) {
          result.win11_ready = 'Fail' // Hardware doesn't meet requirements
        } else if (!secureBootPassed) {
          result.win11_ready = 'Unsupported' // Hardware doesn't support SecureBoot
        } else {
          result.win11_ready = 'Fail' // Other compatibility issues
        }
      }
    }

    return result
  }

  // Helper function to determine Intel generation (from Python script)
  function getIntelGeneration(modelNumber: number): number {
    // Intel model number to generation mapping 
    // Based on actual Intel processor model numbers
    
    if (modelNumber >= 206) return 14; // 14th gen (Meteor Lake, Arrow Lake)
    if (modelNumber >= 183) return 13; // 13th gen (Raptor Lake)
    if (modelNumber >= 154) return 12; // 12th gen (Alder Lake)
    if (modelNumber >= 140) return 11; // 11th gen (Tiger Lake, Rocket Lake)  
    if (modelNumber >= 125) return 10; // 10th gen (Ice Lake, Comet Lake)
    if (modelNumber >= 159) return 9;  // 9th gen (Coffee Lake Refresh) - specific models
    if (modelNumber >= 142) return 8;  // 8th gen (Coffee Lake) - includes Model 158
    if (modelNumber >= 78) return 7;   // 7th gen (Kaby Lake)
    if (modelNumber >= 74) return 6;   // 6th gen (Skylake)
    if (modelNumber >= 61) return 5;   // 5th gen (Broadwell)
    if (modelNumber >= 60) return 4;   // 4th gen (Haswell)
    if (modelNumber >= 58) return 3;   // 3rd gen (Ivy Bridge)
    if (modelNumber >= 42) return 2;   // 2nd gen (Sandy Bridge)
    if (modelNumber >= 26) return 1;   // 1st gen (Nehalem, Westmere)
    
    return 0; // Unknown or very old
  }

  // Process each machine
  const processedData = rmmData.map(machine => {
    // Get the Output data - this contains the actual Windows 11 compatibility info
    let outputText = machine['Output'] || ''
    const outputData = parseOutputData(outputText)
    
    // Find matching ScalePad data
    const scalepadMatch = scalepadData.find(sp => {
      const machineName = (machine['Machine name'] || '').toLowerCase().trim()
      const scalepadName = (sp['Name'] || '').toLowerCase().trim()
      return machineName === scalepadName
    })

    return {
      'Workstation': machine['Machine name'] || 'Unknown',
      'Friendly Name': machine['Friendly name'] || '',
      'Site': machine['Site name'] || '',
      'Serial': scalepadMatch?.['Serial'] || '',
      'Windows 11 Status': outputData.win11_ready, // This is the key field!
      'RAM': outputData.ram,
      'CPU': outputData.cpu,
      'TPM Version': outputData.tpm,
      'SecureBoot': outputData.secure_boot,
      'OS Version': outputData.os,
      'Warranty Expires': scalepadMatch?.['Expires'] || 'Unknown',
      'In ScalePad': scalepadMatch ? 'Yes' : 'No'
    }
  })

  return processedData
}

// Generate summary statistics
function generateSummary(processedData: any[]) {
  const total = processedData.length
  const compatible = processedData.filter(row => row['Windows 11 Status'] === 'Pass').length
  const notCompatible = processedData.filter(row => row['Windows 11 Status'] === 'Fail').length
  const unsupported = processedData.filter(row => row['Windows 11 Status'] === 'Unsupported').length
  const offline = processedData.filter(row => 
    row['Windows 11 Status'] === 'Offline' || row['Windows 11 Status'] === 'Unknown'
  ).length

  const secureBootStats = {
    capableEnabled: processedData.filter(row => 
      row['SecureBoot'] === 'Enabled'
    ).length,
    capableDisabled: processedData.filter(row => 
      row['SecureBoot'] === 'Capable but Disabled'
    ).length,
    notCapable: processedData.filter(row => 
      row['SecureBoot'] === 'Not Capable'
    ).length,
    offline: processedData.filter(row => 
      row['SecureBoot'] === 'Offline' || row['SecureBoot'] === 'Unknown'
    ).length
  }

  return {
      total,
      compatible,
    notCompatible,
      unsupported,
    offline,
    secureBootStats
  }
}

// Generate Excel file (simplified - in production you'd use a library like xlsx)
function generateExcelFile(processedData: any[], companyInfo: { name: string; site: string; tenant: string }) {
  // For now, we'll return a CSV format as base64
  // In production, you'd use xlsx library to create actual Excel files
  const headers = [
    'Workstation', 'Friendly Name', 'Site', 'Serial', 'Windows 11 Status',
    'RAM', 'CPU', 'TPM Version', 'SecureBoot', 'OS Version', 'Warranty Expires', 'In ScalePad'
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

// Generate comprehensive report data (no HTML file)
function generateReportData(processedData: any[], companyInfo: { name: string; site: string; tenant: string }, stats: any) {
  const { total, compatible, notCompatible, unsupported, offline, secureBootStats } = stats
  
  // Calculate additional statistics for charts
  const siteStats: any = {}
  const osStats: any = {}
  const cpuStats: any = {}
  const ramStats: any = {}
  
  processedData.forEach(row => {
    // Site statistics
    const site = row['Site'] || 'Unknown'
    if (!siteStats[site]) siteStats[site] = { total: 0, compatible: 0, notCompatible: 0, unsupported: 0, offline: 0 }
    siteStats[site].total++
    if (row['Windows 11 Status'] === 'Pass') siteStats[site].compatible++
    else if (row['Windows 11 Status'] === 'Fail') siteStats[site].notCompatible++
    else if (row['Windows 11 Status'] === 'Unsupported') siteStats[site].unsupported++
    else siteStats[site].offline++
    
    // OS statistics
    const os = row['OS Version'] || 'Unknown'
    if (!osStats[os]) osStats[os] = 0
    osStats[os]++
    
    // CPU statistics
    const cpu = row['CPU'] || 'Unknown'
    if (!cpuStats[cpu]) cpuStats[cpu] = 0
    cpuStats[cpu]++
    
    // RAM statistics
    const ram = row['RAM'] || 'Unknown'
    if (!ramStats[ram]) ramStats[ram] = 0
    ramStats[ram]++
  })

  // Create chart data
  const readinessChartData = [
    { name: 'Windows 11 Ready', value: compatible, color: '#4CAF50' },
    { name: 'Not Windows 11 Ready', value: notCompatible, color: '#F44336' },
    { name: 'Unsupported', value: unsupported, color: '#FF9800' },
    { name: 'Offline', value: offline, color: '#9E9E9E' }
  ]

  const siteChartData = Object.keys(siteStats).map(site => ({
    site,
    compatible: siteStats[site].compatible,
    notCompatible: siteStats[site].notCompatible,
    unsupported: siteStats[site].unsupported,
    offline: siteStats[site].offline
  }))

  const secureBootChartData = [
    { name: 'Enabled', value: secureBootStats.capableEnabled, color: '#4CAF50' },
    { name: 'Disabled', value: secureBootStats.capableDisabled, color: '#F44336' },
    { name: 'Not Present', value: secureBootStats.notCapable, color: '#FF9800' },
    { name: 'Offline', value: secureBootStats.offline, color: '#9E9E9E' }
  ]

  return {
    summary: {
      total,
      compatible,
      notCompatible,
      unsupported,
      offline,
      compatiblePercentage: total > 0 ? Math.round((compatible / total) * 100) : 0,
      notCompatiblePercentage: total > 0 ? Math.round((notCompatible / total) * 100) : 0,
      unsupportedPercentage: total > 0 ? Math.round((unsupported / total) * 100) : 0,
      offlinePercentage: total > 0 ? Math.round((offline / total) * 100) : 0
    },
    secureBootStats,
    charts: {
      readiness: readinessChartData,
      siteBreakdown: siteChartData,
      secureBoot: secureBootChartData
    },
    data: processedData,
    companyInfo
  }
}

// Generate recommendations based on the data
function generateRecommendations(processedData: any[], stats: any) {
  const { summary } = stats
  const recommendations = []
  
  // Windows 11 readiness recommendations
  if (summary.notCompatible > 0) {
    recommendations.push({
      type: 'warning',
      title: 'Hardware Upgrades Needed',
      description: `${summary.notCompatible} workstations need hardware upgrades to support Windows 11`,
      priority: 'high'
    })
  }
  
  if (summary.unsupported > 0) {
    recommendations.push({
      type: 'info',
      title: 'SecureBoot Configuration',
      description: `${summary.unsupported} workstations are Windows 11 ready but have SecureBoot disabled`,
      priority: 'medium'
    })
  }
  
  if (summary.offline > 0) {
    recommendations.push({
      type: 'warning',
      title: 'Offline Systems',
      description: `${summary.offline} workstations are offline and need to be checked for Windows 11 readiness`,
      priority: 'medium'
    })
  }
  
  // Warranty recommendations
  const expiredWarranty = processedData.filter(row => row['Warranty Expires'] === 'Expired').length
  if (expiredWarranty > 0) {
    recommendations.push({
      type: 'error',
      title: 'Warranty Expired',
      description: `${expiredWarranty} workstations have expired warranties`,
      priority: 'high'
    })
  }
  
  const notInScalePad = processedData.filter(row => row['In ScalePad'] === 'No').length
  if (notInScalePad > 0) {
    recommendations.push({
      type: 'warning',
      title: 'Missing from ScalePad',
      description: `${notInScalePad} workstations are not tracked in ScalePad`,
      priority: 'medium'
    })
  }
  
  return recommendations
}

export async function POST(request: NextRequest) {
  try {
    const data: ProcessReportsRequest = await request.json()
    
    console.log('Processing request for:', data.companyInfo?.name, 'with', data.files?.length, 'files')
    
    // Validate input
    if (!data.files || data.files.length !== 2) {
      return NextResponse.json(
        { error: 'Two files are required: RMM Report and ScalePad Report' },
        { status: 400 }
      )
    }

    if (!data.companyInfo?.name?.trim()) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      )
    }

    if (!data.companyInfo?.tenant?.trim()) {
      return NextResponse.json(
        { error: 'Tenant slug is required' },
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

    console.log('Processing', rmmFile.data.length, 'machines from RMM report')
    
    // Process the data
    const processedData = processRmmData(rmmFile.data, scalepadFile.data, data.companyInfo)
    
    // Generate summary statistics
    const summary = generateSummary(processedData)
    
    // Generate report data
    const reportData = generateReportData(processedData, data.companyInfo, summary)
    
    // Generate Excel file
    try {
      const excelFile = generateExcelFile(processedData, data.companyInfo)
      console.log('Excel file generated successfully, length:', excelFile.length)

      return NextResponse.json({
        success: true,
        summary: reportData.summary,
        secureBootStats: reportData.secureBootStats, 
        charts: reportData.charts,
        data: reportData.data,
        companyInfo: reportData.companyInfo,
        files: {
          excel: `data:text/csv;base64,${excelFile}`
        }
      })
    } catch (error) {
      console.error('Error generating Excel file:', error)
      return NextResponse.json({
        success: true,
        summary: reportData.summary,
        secureBootStats: reportData.secureBootStats, 
        charts: reportData.charts,
        data: reportData.data,
        companyInfo: reportData.companyInfo,
        files: {
          excel: null
        }
      })
    }

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 