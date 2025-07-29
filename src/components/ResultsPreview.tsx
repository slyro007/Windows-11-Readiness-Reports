'use client'

import React, { useRef, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Chip,
  Alert,
  Divider,
  Collapse,
  IconButton,
  Container,
  useTheme,
} from '@mui/material'
import {
  Download as DownloadIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface ResultsPreviewProps {
  results: any
  companyInfo: { name: string; site: string; tenant: string }
}

const ResultsPreview: React.FC<ResultsPreviewProps> = ({ results, companyInfo }) => {
  const reportRef = useRef<HTMLDivElement>(null)
  const [expandedSites, setExpandedSites] = useState<{ [key: string]: boolean }>({})
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [sortField, setSortField] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const theme = useTheme()

  // Define colors that work well in both light and dark modes
  const CHART_COLORS = {
    ready: theme.palette.mode === 'dark' ? '#81c784' : '#4caf50',      // Green
    notReady: theme.palette.mode === 'dark' ? '#ef5350' : '#f44336',   // Red  
    unsupported: theme.palette.mode === 'dark' ? '#ffb74d' : '#ff9800', // Orange
    offline: theme.palette.mode === 'dark' ? '#bdbdbd' : '#9e9e9e',     // Gray
    info: theme.palette.mode === 'dark' ? '#90caf9' : '#2196f3'        // Blue
  }

  const downloadPDF = async () => {
    try {
      setIsGeneratingPDF(true)
      
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = 210
      const pageHeight = 297
      const margin = 15
      const contentWidth = pageWidth - (margin * 2)
      let currentY = margin

      // Light mode colors (always use these for PDFs)
      const colors = {
        primary: '#1976d2',
        success: '#2e7d32',
        error: '#d32f2f',
        warning: '#ed6c02',
        grey: '#9e9e9e',
        background: '#ffffff',
        surface: '#f5f5f5',
        border: '#e0e0e0',
        text: '#212121',
        textSecondary: '#616161'
      }

      // Helper function to add a new page if needed
      const checkPageBreak = (neededHeight: number) => {
        if (currentY + neededHeight > pageHeight - margin) {
          pdf.addPage()
          currentY = margin
          return true
        }
        return false
      }



      // Page 1: Header with Logo
      // Add logo
      try {
        const logoImg = await fetch('/wolff-logics-logo.png')
        const logoBlob = await logoImg.blob()
        const logoBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(logoBlob)
        })
        pdf.addImage(logoBase64, 'PNG', margin, currentY, 30, 15)
      } catch (error) {
        console.log('Logo not found, continuing without it')
      }
      
      pdf.setFontSize(24)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(colors.primary)
      pdf.text('Windows 11 Readiness Report', margin + 35, currentY + 8)
      currentY += 20

      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(colors.text)
      pdf.text(`${results.companyInfo?.name || 'Company Name'}`, margin, currentY)
      currentY += 6
      
      pdf.setFontSize(10)
      pdf.setTextColor(colors.textSecondary)
      pdf.text(`${results.companyInfo?.site || 'All Sites'} • Generated on ${new Date().toLocaleDateString()}`, margin, currentY)
      currentY += 15

      // Summary Cards Section (matching web design)
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(colors.text)
      pdf.text('Summary Overview', margin, currentY)
      currentY += 12

      const summaryData = [
        { label: 'Windows 11 Ready', value: results.summary?.compatible || 0, color: colors.success },
        { label: 'Not Ready', value: results.summary?.notCompatible || 0, color: colors.error },
        { label: 'Unsupported', value: results.summary?.unsupported || 0, color: colors.warning },
        { label: 'Offline', value: results.summary?.offline || 0, color: colors.grey }
      ]

                    // Create summary cards (2x2 grid)
       const cardWidth = (contentWidth - 5) / 2
       const cardHeight = 25
       
               summaryData.forEach((item, index) => {
          const x = margin + (index % 2) * (cardWidth + 5)
          const y = currentY + Math.floor(index / 2) * (cardHeight + 10)
         
         // Card background
         pdf.setFillColor(colors.surface)
         pdf.setDrawColor(colors.border)
         pdf.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'FD')
         
         // Color accent bar
         pdf.setFillColor(item.color)
         pdf.rect(x, y, 4, cardHeight, 'F')
         
         // Value
         pdf.setFontSize(18)
         pdf.setFont('helvetica', 'bold')
         pdf.setTextColor(item.color)
         pdf.text(item.value.toString(), x + 10, y + 12)
         
         // Label
         pdf.setFontSize(11)
         pdf.setFont('helvetica', 'normal')
         pdf.setTextColor(colors.text)
         pdf.text(item.label, x + 10, y + 20)
                       })
         
         currentY += 75

       // Requirements Section  
       pdf.setFontSize(16)
       pdf.setFont('helvetica', 'bold')
       pdf.setTextColor(colors.text)
       pdf.text('Windows 11 Minimum Requirements', margin, currentY)
       currentY += 12

      const requirements = [
        'Processor: Intel 8th Generation and above',
        'TPM: Version 2.0 or higher', 
        'System Firmware: Must support Secure Boot'
      ]
      
      requirements.forEach(req => {
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(colors.text)
        
        // Bullet point
        pdf.setFillColor(colors.primary)
        pdf.circle(margin + 2, currentY - 1.5, 1, 'F')
        
        pdf.text(req, margin + 8, currentY)
        currentY += 6
                    })
       currentY += 6

       // Important Notice
       pdf.setFillColor('#ffebee')
       pdf.setDrawColor(colors.error)
       pdf.roundedRect(margin, currentY, contentWidth, 22, 3, 3, 'FD')
       
       pdf.setFontSize(12)
       pdf.setFont('helvetica', 'bold')
       pdf.setTextColor(colors.error)
       pdf.text('Important Notice', margin + 10, currentY + 9)
       
       pdf.setFontSize(10)
       pdf.setFont('helvetica', 'normal')
       pdf.setTextColor(colors.text)
              pdf.text('Windows 10 End of Support: October 14, 2025', margin + 10, currentY + 16)
       currentY += 40

       // SecureBoot Statistics - On First Page
       if (results.secureBootStats) {
         pdf.setFontSize(16)
         pdf.setFont('helvetica', 'bold')
         pdf.setTextColor(colors.text)
         pdf.text('SecureBoot Capabilities', margin, currentY)
         currentY += 12

         const secureBootData = [
           { label: 'Capable (Enabled)', value: results.secureBootStats.capableEnabled || 0, color: colors.success },
           { label: 'Capable (Disabled)', value: results.secureBootStats.capableDisabled || 0, color: colors.warning },
           { label: 'Not Capable', value: results.secureBootStats.notCapable || 0, color: colors.error },
           { label: 'Unknown', value: results.secureBootStats.offline || 0, color: colors.grey }
         ]

         // Create a proper table for SecureBoot
         const rowHeight = 12
         
         // Table header
         pdf.setFillColor(colors.surface)
         pdf.setDrawColor(colors.border)
         pdf.rect(margin, currentY, contentWidth, rowHeight, 'FD')
         
         pdf.setFontSize(11)
         pdf.setFont('helvetica', 'bold')
         pdf.setTextColor(colors.text)
         pdf.text('Status', margin + 10, currentY + 8)
         pdf.text('Count', margin + 120, currentY + 8)
         
         currentY += rowHeight

         secureBootData.forEach((item, index) => {
           const rowY = currentY
           
           // Alternate row colors
           if (index % 2 === 0) {
             pdf.setFillColor('#fafafa')
             pdf.rect(margin, rowY, contentWidth, rowHeight, 'F')
           }
           
           // Row border
           pdf.setDrawColor(colors.border)
           pdf.rect(margin, rowY, contentWidth, rowHeight)
           
           // Colored indicator
           pdf.setFillColor(item.color)
           pdf.circle(margin + 8, rowY + 6, 2, 'F')
           
           // Label
           pdf.setFontSize(10)
           pdf.setFont('helvetica', 'normal')
           pdf.setTextColor(colors.text)
           pdf.text(item.label, margin + 18, rowY + 8)
           
           // Value
           pdf.setFontSize(12)
           pdf.setFont('helvetica', 'bold')
           pdf.setTextColor(item.color)
           pdf.text(item.value.toString(), margin + 125, rowY + 8)
           
           currentY += rowHeight
         })
         
         currentY += 20
       }

       // Start new page for workstation details
       pdf.addPage()
       currentY = margin

       // Workstation Details Tables
       const sites = groupDataBySite(results.data || [])
      
             Object.entries(sites).forEach(([siteName, siteData]) => {
         checkPageBreak(50)
         
                 // Sort data by Status (Pass, Fail, Unsupported, Offline)
        const statusOrder: Record<string, number> = { 'Pass': 1, 'Fail': 2, 'Unsupported': 3, 'Offline': 4 }
        const sortedSiteData = siteData.sort((a, b) => {
          const statusA = a['Windows 11 Status'] || 'Unknown'
          const statusB = b['Windows 11 Status'] || 'Unknown'
          return (statusOrder[statusA] || 5) - (statusOrder[statusB] || 5)
        })
         
         // Site header
         pdf.setFontSize(14)
         pdf.setFont('helvetica', 'bold')
         pdf.setTextColor(colors.primary)
         pdf.text(`${siteName}`, margin, currentY)
         
         pdf.setFontSize(10)
         pdf.setFont('helvetica', 'normal')
         pdf.setTextColor(colors.textSecondary)
         pdf.text(`${sortedSiteData.length} machines`, margin + 80, currentY)
         currentY += 12

                 // Table setup - Autofit column widths
         const headers = ['Workstation', 'Status', 'RAM', 'CPU', 'TPM', 'SecureBoot']
         const rowHeight = 12
         
         // Calculate autofit column widths
         const calculateColumnWidths = (headers: string[], data: any[]): number[] => {
           pdf.setFontSize(9)
           pdf.setFont('helvetica', 'normal')
           
           const minColWidth = 15 // Minimum column width in mm
           const maxColWidth = 50 // Maximum column width in mm
           const padding = 4 // Padding for each column
           
                       // Calculate content for each column
            const columnData = headers.map((header, colIndex) => {
              // Get all values for this column
             const allValues = [header, ...data.map(row => {
               switch(colIndex) {
                 case 0: return row.Workstation || ''
                 case 1: return row['Windows 11 Status'] || ''
                 case 2: return row.RAM || ''
                 case 3: return row.CPU || ''
                 case 4: return row['TPM Version'] || ''
                 case 5: return row.SecureBoot || ''
                 default: return ''
               }
             })]
             
             // Find the longest text in this column
             const maxTextWidth = Math.max(...allValues.map(value => {
               const text = String(value)
               // Truncate CPU text if too long
               const displayText = colIndex === 3 && text.length > 25 ? text.substring(0, 22) + '...' : text
               return pdf.getTextWidth(displayText)
             }))
             
             return Math.max(minColWidth, Math.min(maxColWidth, maxTextWidth + padding))
           })
           
           // Scale columns to fit available width
           const totalCalculatedWidth = columnData.reduce((sum, width) => sum + width, 0)
           const scaleFactor = contentWidth / totalCalculatedWidth
           
           return columnData.map(width => width * scaleFactor)
         }
         
         const colWidths = calculateColumnWidths(headers, sortedSiteData)
         let startX = margin

        // Table header
        pdf.setFillColor(colors.surface)
        pdf.setDrawColor(colors.border)
        pdf.rect(margin, currentY - 2, contentWidth, rowHeight, 'FD')

        headers.forEach((header, index) => {
                     pdf.setFontSize(9)
           pdf.setFont('helvetica', 'bold')
           pdf.setTextColor(colors.text)
           pdf.text(header, startX + 2, currentY + 6)
          
                     // Column separators
           if (index < headers.length - 1) {
             pdf.setDrawColor(colors.border)
             pdf.line(startX + colWidths[index], currentY - 2, startX + colWidths[index], currentY + 10)
           }
          startX += colWidths[index]
        })
        currentY += rowHeight

                 // Data rows
         sortedSiteData.forEach((row: any, rowIndex: number) => {
          checkPageBreak(rowHeight + 2)
          
          const rowY = currentY
          
          // Alternate row colors (matching web design)
          if (rowIndex % 2 === 0) {
            pdf.setFillColor('#fafafa')
            pdf.rect(margin, rowY - 2, contentWidth, rowHeight, 'F')
          }
          
          // Row border
          pdf.setDrawColor(colors.border)
          pdf.rect(margin, rowY - 2, contentWidth, rowHeight)

          const cellData = [
            row.Workstation || '',
            row['Windows 11 Status'] || '',
            row.RAM || '',
            row.CPU || '',
            row['TPM Version'] || '',
            row.SecureBoot || ''
          ]

          startX = margin
          cellData.forEach((data, colIndex) => {
            const cellWidth = colWidths[colIndex]
            let displayText = data
            let textColor = colors.text
            
            // Status column styling
            if (colIndex === 1) {
              switch (data) {
                case 'Pass':
                  textColor = colors.success
                  break
                case 'Fail':
                  textColor = colors.error
                  break
                case 'Unsupported':
                  textColor = colors.warning
                  break
                default:
                  textColor = colors.grey
              }
            }
            
                         // CPU column - handle long text
             if (colIndex === 3 && data.length > 25) {
               displayText = data.substring(0, 22) + '...'
             }
             
             pdf.setFontSize(9)
             pdf.setFont('helvetica', 'normal')
             pdf.setTextColor(textColor)
             
             // Single line text, centered vertically in the row
             pdf.text(displayText, startX + 2, currentY + 7)
            
                         // Column separators
             if (colIndex < cellData.length - 1) {
               pdf.setDrawColor(colors.border)
               pdf.line(startX + cellWidth, rowY - 2, startX + cellWidth, rowY + 10)
             }
            
            startX += cellWidth
          })
          
                     currentY += rowHeight
         })
         
         // Add page break after each site (except the last one)
         const siteEntries = Object.entries(sites)
         const currentSiteIndex = siteEntries.findIndex(([name]) => name === siteName)
         const isLastSite = currentSiteIndex === siteEntries.length - 1
         
         if (!isLastSite) {
           pdf.addPage()
           currentY = margin
         } else {
           currentY += 20 // Space only for the last site
         }
      })

             // Footer
       const footerY = pageHeight - 15
       pdf.setFontSize(10)
       pdf.setFont('helvetica', 'bold')
       pdf.setTextColor(colors.primary)
       pdf.text('Wolff Logics', margin, footerY)
       
       pdf.setFontSize(8)
       pdf.setFont('helvetica', 'normal')
       pdf.setTextColor(colors.textSecondary)
       pdf.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, margin, footerY + 5)

      // Save the PDF
      const companyName = results.companyInfo?.name || 'Company'
      const timestamp = new Date().toISOString().split('T')[0]
      pdf.save(`${companyName}_Windows11_Readiness_Report_${timestamp}.pdf`)
      
    } catch (error) {
      console.error('PDF generation failed:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const downloadExcel = () => {
    console.log('Download Excel clicked. Results:', results)
    console.log('Files object:', results.files)
    
    if (results.files?.excel) {
      const link = document.createElement('a')
      link.href = results.files.excel
      link.download = `${companyInfo.tenant}_Windows11_Readiness_Report_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      alert('CSV file not available. Please create a new report to generate the download file.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pass': return 'success'  // Green for Pass
      case 'Fail': return 'error'    // Red for Fail
      case 'Unsupported': return 'warning'  // Orange for Unsupported
      case 'Offline': return 'default'      // Gray for Offline
      default: return 'default'
    }
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'error': return <ErrorIcon color="error" />
      case 'warning': return <WarningIcon color="warning" />
      case 'info': return <InfoIcon color="info" />
      default: return <InfoIcon color="info" />
    }
  }

  // Group data by site for multiple tables
  const groupDataBySite = (data: any[]) => {
    const grouped: { [key: string]: any[] } = {}
    data.forEach(row => {
      const site = row.Site || 'Unknown'
      if (!grouped[site]) {
        grouped[site] = []
      }
      grouped[site].push(row)
    })
    return grouped
  }

  const siteGroups = groupDataBySite(results.data || [])
  const siteNames = Object.keys(siteGroups)
  const hasMutipleSites = siteNames.length > 1

  // Create chart data for pie chart
  const chartData = [
    { 
      name: 'Windows 11 Ready', 
      value: results.summary?.compatible || 0,
      color: CHART_COLORS.ready
    },
    { 
      name: 'Not Ready', 
      value: results.summary?.notCompatible || 0,
      color: CHART_COLORS.notReady
    },
    { 
      name: 'Unsupported', 
      value: results.summary?.unsupported || 0,
      color: CHART_COLORS.unsupported
    },
    { 
      name: 'Offline', 
      value: results.summary?.offline || 0,
      color: CHART_COLORS.offline
    }
  ].filter(item => item.value > 0) // Only include categories with data

  const toggleSiteExpansion = (siteName: string) => {
    setExpandedSites(prev => ({
      ...prev,
      [siteName]: !prev[siteName]
    }))
  }

  const getSiteStatusSummary = (siteData: any[]) => {
    const pass = siteData.filter(row => row['Windows 11 Status'] === 'Pass').length
    const fail = siteData.filter(row => row['Windows 11 Status'] === 'Fail').length
    const unsupported = siteData.filter(row => row['Windows 11 Status'] === 'Unsupported').length
    const offline = siteData.filter(row => row['Windows 11 Status'] === 'Offline' || row['Windows 11 Status'] === 'Unknown').length
    
    return { pass, fail, unsupported, offline }
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortData = (data: any[]) => {
    if (!sortField) return data

    return [...data].sort((a, b) => {
      let aValue = a[sortField] || ''
      let bValue = b[sortField] || ''

      // Handle numeric values (RAM, TPM)
      if (sortField === 'RAM') {
        aValue = parseFloat(aValue.replace(/[^0-9.]/g, '')) || 0
        bValue = parseFloat(bValue.replace(/[^0-9.]/g, '')) || 0
      } else if (sortField === 'TPM Version') {
        aValue = parseFloat(aValue.replace(/[^0-9.]/g, '')) || 0
        bValue = parseFloat(bValue.replace(/[^0-9.]/g, '')) || 0
      } else {
        // String comparison for other fields
        aValue = String(aValue).toLowerCase()
        bValue = String(bValue).toLowerCase()
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }

  const renderWorkstationTable = (data: any[], siteName?: string) => {
    const sortedData = sortData(data)
    return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        maxHeight: 600, 
        overflow: 'auto', 
        width: '100%',
        '@media print': {
          maxHeight: 'none',
          overflow: 'visible',
          pageBreakInside: 'avoid'
        }
      }}
      className="print-table-container"
    >
      <Table 
        size="small" 
        stickyHeader 
        sx={{ 
          minWidth: 800,
          '@media print': {
            minWidth: '100%',
            fontSize: '10px'
          }
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell 
              sx={{ 
                minWidth: 120,
                fontWeight: 'bold',
                '@media print': { 
                  fontSize: '10px', 
                  padding: '4px',
                  border: '1px solid #ddd',
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
              <TableSortLabel
                active={sortField === 'Workstation'}
                direction={sortField === 'Workstation' ? sortDirection : 'asc'}
                onClick={() => handleSort('Workstation')}
                sx={{ fontWeight: 'bold' }}
              >
                Workstation
              </TableSortLabel>
            </TableCell>
            {!siteName && (
              <TableCell 
                sx={{ 
                  minWidth: 100,
                  fontWeight: 'bold',
                  '@media print': { 
                    fontSize: '10px', 
                    padding: '4px',
                    border: '1px solid #ddd',
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                <TableSortLabel
                  active={sortField === 'Site'}
                  direction={sortField === 'Site' ? sortDirection : 'asc'}
                  onClick={() => handleSort('Site')}
                  sx={{ fontWeight: 'bold' }}
                >
                  Site
                </TableSortLabel>
              </TableCell>
            )}
            <TableCell 
              sx={{ 
                minWidth: 140,
                fontWeight: 'bold',
                '@media print': { 
                  fontSize: '10px', 
                  padding: '4px',
                  border: '1px solid #ddd',
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
              <TableSortLabel
                active={sortField === 'Windows 11 Status'}
                direction={sortField === 'Windows 11 Status' ? sortDirection : 'asc'}
                onClick={() => handleSort('Windows 11 Status')}
                sx={{ fontWeight: 'bold' }}
              >
                Status
              </TableSortLabel>
            </TableCell>
            <TableCell 
              sx={{ 
                minWidth: 80,
                fontWeight: 'bold',
                '@media print': { 
                  fontSize: '10px', 
                  padding: '4px',
                  border: '1px solid #ddd',
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
              <TableSortLabel
                active={sortField === 'RAM'}
                direction={sortField === 'RAM' ? sortDirection : 'asc'}
                onClick={() => handleSort('RAM')}
                sx={{ fontWeight: 'bold' }}
              >
                RAM
              </TableSortLabel>
            </TableCell>
            <TableCell 
              sx={{ 
                minWidth: 160,
                fontWeight: 'bold',
                '@media print': { 
                  fontSize: '10px', 
                  padding: '4px',
                  border: '1px solid #ddd',
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
              <TableSortLabel
                active={sortField === 'CPU'}
                direction={sortField === 'CPU' ? sortDirection : 'asc'}
                onClick={() => handleSort('CPU')}
                sx={{ fontWeight: 'bold' }}
              >
                CPU
              </TableSortLabel>
            </TableCell>
            <TableCell 
              sx={{ 
                minWidth: 80,
                fontWeight: 'bold',
                '@media print': { 
                  fontSize: '10px', 
                  padding: '4px',
                  border: '1px solid #ddd',
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
              <TableSortLabel
                active={sortField === 'TPM Version'}
                direction={sortField === 'TPM Version' ? sortDirection : 'asc'}
                onClick={() => handleSort('TPM Version')}
                sx={{ fontWeight: 'bold' }}
              >
                TPM
              </TableSortLabel>
            </TableCell>
            <TableCell 
              sx={{ 
                minWidth: 150,
                fontWeight: 'bold',
                '@media print': { 
                  fontSize: '10px', 
                  padding: '4px',
                  border: '1px solid #ddd',
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
              <TableSortLabel
                active={sortField === 'SecureBoot'}
                direction={sortField === 'SecureBoot' ? sortDirection : 'asc'}
                onClick={() => handleSort('SecureBoot')}
                sx={{ fontWeight: 'bold' }}
              >
                SecureBoot
              </TableSortLabel>
            </TableCell>
            <TableCell 
              sx={{ 
                minWidth: 100,
                fontWeight: 'bold',
                '@media print': { 
                  fontSize: '10px', 
                  padding: '4px',
                  border: '1px solid #ddd',
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
              <TableSortLabel
                active={sortField === 'Warranty'}
                direction={sortField === 'Warranty' ? sortDirection : 'asc'}
                onClick={() => handleSort('Warranty')}
                sx={{ fontWeight: 'bold' }}
              >
                Warranty
              </TableSortLabel>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.map((row: any, index: number) => (
            <TableRow key={index}>
              <TableCell 
                sx={{ 
                  minWidth: 120,
                  '@media print': { 
                    fontSize: '9px', 
                    padding: '4px',
                    border: '1px solid #ddd'
                  }
                }}
              >
                {row.Workstation}
              </TableCell>
              {!siteName && (
                <TableCell 
                  sx={{ 
                    minWidth: 100,
                    '@media print': { 
                      fontSize: '9px', 
                      padding: '4px',
                      border: '1px solid #ddd'
                    }
                  }}
                >
                  {row.Site}
                </TableCell>
              )}
              <TableCell 
                sx={{ 
                  minWidth: 140,
                  '@media print': { 
                    fontSize: '9px', 
                    padding: '4px',
                    border: '1px solid #ddd'
                  }
                }}
              >
                <Chip
                  label={row['Windows 11 Status']}
                  color={getStatusColor(row['Windows 11 Status']) as any}
                  size="small"
                  sx={{
                    '@media print': {
                      fontSize: '8px',
                      height: '16px',
                      '& .MuiChip-label': {
                        padding: '0 4px'
                      }
                    }
                  }}
                />
              </TableCell>
              <TableCell 
                sx={{ 
                  minWidth: 80,
                  '@media print': { 
                    fontSize: '9px', 
                    padding: '4px',
                    border: '1px solid #ddd'
                  }
                }}
              >
                {row.RAM}
              </TableCell>
              <TableCell 
                sx={{ 
                  minWidth: 160,
                  '@media print': { 
                    fontSize: '9px', 
                    padding: '4px',
                    border: '1px solid #ddd',
                    wordBreak: 'break-word'
                  }
                }}
              >
                {row.CPU}
              </TableCell>
              <TableCell 
                sx={{ 
                  minWidth: 80,
                  '@media print': { 
                    fontSize: '9px', 
                    padding: '4px',
                    border: '1px solid #ddd'
                  }
                }}
              >
                {row['TPM Version']}
              </TableCell>
              <TableCell 
                sx={{ 
                  minWidth: 150,
                  '@media print': { 
                    fontSize: '9px', 
                    padding: '4px',
                    border: '1px solid #ddd'
                  }
                }}
              >
                {row.SecureBoot}
              </TableCell>
              <TableCell 
                sx={{ 
                  minWidth: 100,
                  '@media print': { 
                    fontSize: '9px', 
                    padding: '4px',
                    border: '1px solid #ddd'
                  }
                }}
              >
                {row['Warranty Expires']}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    )
  }

  return (
    <Container maxWidth={false} sx={{ maxWidth: '1400px', py: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Action Buttons */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={downloadPDF}
            size="large"
            sx={{ px: 4, py: 1.5 }}
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF Report'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={downloadExcel}
            size="large"
            sx={{ px: 4, py: 1.5 }}
          >
            Download CSV
          </Button>
        </Box>

        {/* Report Content */}
        <div ref={reportRef} id="report-content">
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 4 }}>
              {/* Header with Logo */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                  <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Windows 11 Readiness Report
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    {results.companyInfo?.name || 'Company Name'} - {results.companyInfo?.site || 'All Sites'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Generated on {new Date().toLocaleDateString()}
                  </Typography>
                </Box>
                <img 
                  src="/wolff-logics-logo.png" 
                  alt="Wolff Logics" 
                  style={{ height: '60px' }}
                />
              </Box>

              {/* Windows 11 Requirements & End of Support Info */}
              <Box sx={{ 
                mb: 4, 
                p: 3, 
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)', 
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`
              }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                      Windows 11 Minimum Requirements
                    </Typography>
                    <Box component="ul" sx={{ m: 0, pl: 2 }}>
                      <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                        <strong>Processor:</strong> Intel 8th Generation and above
                      </Typography>
                      <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                        <strong>TPM:</strong> Version 2.0 or higher
                      </Typography>
                      <Typography component="li" variant="body2">
                        <strong>System Firmware:</strong> Must support Secure Boot
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.error.main }}>
                      Important Notice
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.1)' : '#ffebee', 
                      p: 2, 
                      borderRadius: 1,
                      border: `1px solid ${theme.palette.error.light}`
                    }}>
                      <strong>Windows 10 End of Support:</strong><br />
                      October 14, 2025
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Summary Statistics */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ textAlign: 'center', p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(129, 199, 132, 0.2)' : 'rgba(232, 245, 233, 0.8)' }}>
                    <Typography variant="h4" sx={{ 
                      color: theme.palette.mode === 'dark' ? CHART_COLORS.ready : '#1b5e20',
                      fontWeight: 'bold',
                      textShadow: theme.palette.mode === 'light' ? '0 0 1px rgba(0,0,0,0.1)' : 'none'
                    }}>{results.summary?.compatible || 0}</Typography>
                    <Typography variant="body1" sx={{ color: theme.palette.mode === 'dark' ? 'inherit' : '#2e7d32', fontWeight: 500 }}>Windows 11 Ready</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ textAlign: 'center', p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(239, 83, 80, 0.2)' : 'rgba(255, 235, 238, 0.8)' }}>
                    <Typography variant="h4" sx={{ 
                      color: theme.palette.mode === 'dark' ? CHART_COLORS.notReady : '#b71c1c',
                      fontWeight: 'bold',
                      textShadow: theme.palette.mode === 'light' ? '0 0 1px rgba(0,0,0,0.1)' : 'none'
                    }}>{results.summary?.notCompatible || 0}</Typography>
                    <Typography variant="body1" sx={{ color: theme.palette.mode === 'dark' ? 'inherit' : '#d32f2f', fontWeight: 500 }}>Not Ready</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ textAlign: 'center', p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 183, 77, 0.2)' : 'rgba(255, 248, 225, 0.8)' }}>
                    <Typography variant="h4" sx={{ 
                      color: theme.palette.mode === 'dark' ? CHART_COLORS.unsupported : '#e65100',
                      fontWeight: 'bold',
                      textShadow: theme.palette.mode === 'light' ? '0 0 1px rgba(0,0,0,0.1)' : 'none'
                    }}>{results.summary?.unsupported || 0}</Typography>
                    <Typography variant="body1" sx={{ color: theme.palette.mode === 'dark' ? 'inherit' : '#f57c00', fontWeight: 500 }}>Unsupported</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ textAlign: 'center', p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(189, 189, 189, 0.2)' : 'rgba(245, 245, 245, 0.8)' }}>
                    <Typography variant="h4" sx={{ 
                      color: theme.palette.mode === 'dark' ? CHART_COLORS.offline : '#424242',
                      fontWeight: 'bold',
                      textShadow: theme.palette.mode === 'light' ? '0 0 1px rgba(0,0,0,0.1)' : 'none'
                    }}>{results.summary?.offline || 0}</Typography>
                    <Typography variant="body1" sx={{ color: theme.palette.mode === 'dark' ? 'inherit' : '#616161', fontWeight: 500 }}>Offline</Typography>
                  </Card>
                </Grid>
              </Grid>

              {/* Charts */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Pie Chart */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                        Overall Compatibility
                      </Typography>
                      <ResponsiveContainer width="100%" height={500}>
                        <PieChart margin={{ top: 40, right: 150, bottom: 40, left: 150 }}>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: any, name: any) => [value, name]}
                            contentStyle={{
                              backgroundColor: theme.palette.background.paper,
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: '8px',
                              color: theme.palette.text.primary
                            }}
                          />
                          <Legend 
                            wrapperStyle={{
                              paddingTop: '30px',
                              color: theme.palette.text.primary
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* SecureBoot Statistics */}
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>SecureBoot Capabilities</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" sx={{ color: CHART_COLORS.ready }}>
                          {results.secureBootStats?.capableEnabled || 0}
                        </Typography>
                        <Typography variant="body2">Capable (Enabled)</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" sx={{ color: CHART_COLORS.unsupported }}>
                          {results.secureBootStats?.capableDisabled || 0}
                        </Typography>
                        <Typography variant="body2">Capable (Disabled)</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" sx={{ color: CHART_COLORS.notReady }}>
                          {results.secureBootStats?.notCapable || 0}
                        </Typography>
                        <Typography variant="body2">Not Capable</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" sx={{ color: CHART_COLORS.offline }}>
                          {results.secureBootStats?.offline || 0}
                        </Typography>
                        <Typography variant="body2">Unknown</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Recommendations */}
              {results.recommendations && results.recommendations.length > 0 && (
                <Card sx={{ mb: 4 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Recommendations</Typography>
                    <Grid container spacing={2}>
                      {results.recommendations.map((rec: any, index: number) => (
                        <Grid item xs={12} key={index}>
                          <Alert
                            severity={rec.type}
                            icon={getRecommendationIcon(rec.type)}
                            sx={{ mb: 1 }}
                          >
                            <Typography variant="subtitle1" fontWeight="bold">
                              {rec.title}
                            </Typography>
                            <Typography variant="body2">
                              {rec.description}
                            </Typography>
                          </Alert>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Expandable Site Data Tables */}
              {hasMutipleSites ? (
                <Card sx={{ mb: 4 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                      Detailed Workstation Data by Site
                    </Typography>
                    
                    {siteNames.map((siteName) => {
                      const siteData = siteGroups[siteName]
                      const statusSummary = getSiteStatusSummary(siteData)
                      const isExpanded = expandedSites[siteName]
                      
                      return (
                        <Box key={siteName} sx={{ mb: 2 }}>
                          <Paper 
                            sx={{ 
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 2
                            }}
                          >
                            {/* Site Header - Clickable */}
                            <Box 
                              sx={{ 
                                p: 2, 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                '&:hover': {
                                  backgroundColor: 'action.hover'
                                }
                              }}
                              onClick={() => toggleSiteExpansion(siteName)}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="h6" color="primary">
                                  {siteName} ({siteData.length} machines)
                                </Typography>
                                
                                {/* Status Summary Chips */}
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                  {statusSummary.pass > 0 && (
                                    <Chip 
                                      size="small" 
                                      label={`${statusSummary.pass} Pass`} 
                                      color="success" 
                                    />
                                  )}
                                  {statusSummary.fail > 0 && (
                                    <Chip 
                                      size="small" 
                                      label={`${statusSummary.fail} Fail`} 
                                      color="error" 
                                    />
                                  )}
                                  {statusSummary.unsupported > 0 && (
                                    <Chip 
                                      size="small" 
                                      label={`${statusSummary.unsupported} Unsupported`} 
                                      color="warning" 
                                    />
                                  )}
                                  {statusSummary.offline > 0 && (
                                    <Chip 
                                      size="small" 
                                      label={`${statusSummary.offline} Offline`} 
                                      color="default" 
                                    />
                                  )}
                                </Box>
                              </Box>
                              
                              <IconButton>
                                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              </IconButton>
                            </Box>
                            
                            {/* Collapsible Table */}
                            <Collapse in={isExpanded}>
                              <Box sx={{ p: 2, pt: 0 }}>
                                {renderWorkstationTable(siteData, siteName)}
                              </Box>
                            </Collapse>
                          </Paper>
                        </Box>
                      )
                    })}
                  </CardContent>
                </Card>
              ) : (
                <Card sx={{ mb: 4 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Detailed Workstation Data</Typography>
                    {renderWorkstationTable(results.data || [])}
                  </CardContent>
                </Card>
              )}

              {/* Footer */}
              <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
                  <img 
                    src="/wolff-logics-logo.png" 
                    alt="Wolff Logics" 
                    style={{ height: '40px' }}
                  />
                  <Typography variant="h6" color="primary">
                    Wolff Logics
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary">
                  Report generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </Container>
  )
}

export default ResultsPreview