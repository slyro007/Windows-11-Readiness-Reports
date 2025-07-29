'use client'

import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
  LinearProgress,
} from '@mui/material'
import {
  Download as DownloadIcon,
  Preview as PreviewIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Computer as ComputerIcon,
} from '@mui/icons-material'
import { motion } from 'framer-motion'

interface ResultsPreviewProps {
  results: {
    summary: {
      total: number
      compatible: number
      unsupported: number
      notCompatible: number
      offline: number
    }
    secureBoot: {
      capableEnabled: number
      capableDisabled: number
      notCapable: number
      unknown: number
    }
    files: {
      excel: string
      html: string
    }
  }
  companyInfo: { name: string; site: string }
}

const ResultsPreview: React.FC<ResultsPreviewProps> = ({ results, companyInfo }) => {
  const { summary, secureBoot, files } = results

  const handleDownload = (fileType: 'excel' | 'html') => {
    const fileName = fileType === 'excel' 
      ? `${companyInfo.name}_Windows11_Readiness_Report.xlsx`
      : `${companyInfo.name}_Windows11_Readiness_Report.html`
    
    // Create download link
    const link = document.createElement('a')
    link.href = files[fileType]
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePreview = () => {
    window.open(files.html, '_blank')
  }

  const compatiblePercentage = (summary.compatible / summary.total) * 100
  const unsupportedPercentage = (summary.unsupported / summary.total) * 100
  const notCompatiblePercentage = (summary.notCompatible / summary.total) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Box textAlign="center" mb={4}>
                <CheckIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                <Typography variant="h4" gutterBottom>
                  Report Generated Successfully!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Windows 11 readiness analysis for <strong>{companyInfo.name}</strong>
                  {companyInfo.site && ` - ${companyInfo.site}`}
                </Typography>
              </Box>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ backgroundColor: 'rgba(76, 175, 80, 0.1)' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <CheckIcon sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
                      <Typography variant="h4" color="success.main">
                        {summary.compatible}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Compatible
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={compatiblePercentage} 
                        sx={{ mt: 1, backgroundColor: 'rgba(76, 175, 80, 0.2)' }}
                        color="success"
                      />
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ backgroundColor: 'rgba(255, 193, 7, 0.1)' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <WarningIcon sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
                      <Typography variant="h4" color="warning.main">
                        {summary.unsupported}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Unsupported
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={unsupportedPercentage} 
                        sx={{ mt: 1, backgroundColor: 'rgba(255, 193, 7, 0.2)' }}
                        color="warning"
                      />
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ backgroundColor: 'rgba(244, 67, 54, 0.1)' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <ErrorIcon sx={{ fontSize: 32, color: 'error.main', mb: 1 }} />
                      <Typography variant="h4" color="error.main">
                        {summary.notCompatible}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Not Compatible
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={notCompatiblePercentage} 
                        sx={{ mt: 1, backgroundColor: 'rgba(244, 67, 54, 0.2)' }}
                        color="error"
                      />
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ backgroundColor: 'rgba(158, 158, 158, 0.1)' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <ComputerIcon sx={{ fontSize: 32, color: 'text.secondary', mb: 1 }} />
                      <Typography variant="h4" color="text.secondary">
                        {summary.total}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Devices
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* SecureBoot Capabilities */}
              <Typography variant="h6" gutterBottom>
                SecureBoot Capability Analysis
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                  <Chip 
                    label={`${secureBoot.capableEnabled} Enabled`} 
                    color="success" 
                    sx={{ width: '100%' }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Chip 
                    label={`${secureBoot.capableDisabled} Disabled`} 
                    color="warning" 
                    sx={{ width: '100%' }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Chip 
                    label={`${secureBoot.notCapable} Not Capable`} 
                    color="error" 
                    sx={{ width: '100%' }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Chip 
                    label={`${secureBoot.unknown} Unknown`} 
                    color="default" 
                    sx={{ width: '100%' }}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Download Actions */}
              <Box textAlign="center">
                <Typography variant="h6" gutterBottom>
                  Download Your Reports
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Choose your preferred format to download the complete analysis
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload('excel')}
                    sx={{ px: 4 }}
                  >
                    Download Excel Report
                  </Button>

                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload('html')}
                    sx={{ px: 4 }}
                  >
                    Download HTML Report
                  </Button>

                  <Button
                    variant="text"
                    size="large"
                    startIcon={<PreviewIcon />}
                    onClick={handlePreview}
                    sx={{ px: 4 }}
                  >
                    Preview HTML Report
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Additional Info */}
        <Grid item xs={12}>
          <Card sx={{ backgroundColor: 'rgba(33, 150, 243, 0.1)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                What's Included in Your Reports
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" paragraph>
                    <strong>Excel Report:</strong> Complete device inventory with Windows 11 compatibility status, 
                    SecureBoot capabilities, TPM versions, RAM specifications, and warranty information.
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" paragraph>
                    <strong>HTML Report:</strong> Interactive dashboard with charts, graphs, and detailed 
                    analysis including prioritization recommendations and visual breakdowns.
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </motion.div>
  )
}

export default ResultsPreview 