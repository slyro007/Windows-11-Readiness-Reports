'use client'

import React, { useState } from 'react'
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent,
  AppBar,
  Toolbar,
  Button,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Grid,
  CardActionArea,
  CardActions,
  IconButton
} from '@mui/material'
import { 
  CloudUpload as CloudUploadIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Computer as ComputerIcon,
  History as HistoryIcon,
  Add as AddIcon,
  Folder as FolderIcon,
  ArrowBack as ArrowBackIcon,
  Brightness4,
  Brightness7
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import FileUploadZone from '@/components/FileUploadZone'
import CompanyInfoForm from '@/components/CompanyInfoForm'
import ProcessingStatus from '@/components/ProcessingStatus'
import ResultsPreview from '@/components/ResultsPreview'
import ReportHistory from '@/components/ReportHistory'
import { useTheme } from '@/components/providers/ThemeProvider'

const steps = ['Upload Files', 'Company Info', 'Processing', 'Results']

interface UploadedFile {
  name: string
  type: 'rmm' | 'scalepad'
  data: any[]
  size: number
}

type ViewMode = 'home' | 'existing-reports' | 'new-report'

export default function HomePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('home')
  const [activeStep, setActiveStep] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [companyInfo, setCompanyInfo] = useState({ name: '', site: '', tenant: '' })
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const { isDarkMode, toggleTheme } = useTheme()

  const handleFilesUploaded = (files: UploadedFile[]) => {
    setUploadedFiles(files)
    setError(null)
    // Don't automatically advance - wait for user to click "Process Reports"
  }

  const handleProcessReports = () => {
    const hasRmm = uploadedFiles.some(f => f.type === 'rmm')
    const hasScalepad = uploadedFiles.some(f => f.type === 'scalepad')
    if (hasRmm && hasScalepad) {
      setActiveStep(1)
    }
  }

  const handleCompanyInfoSubmit = (info: { name: string; site: string; tenant: string }) => {
    setCompanyInfo(info)
    setActiveStep(2)
    startProcessing(info)
  }

  const startProcessing = async (companyData?: { name: string; site: string; tenant: string }) => {
    const infoToUse = companyData || companyInfo
    setProcessing(true)
    setError(null)
    
    try {
      // Simulate processing with your existing Python logic
      const response = await fetch('/api/process-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: uploadedFiles,
          companyInfo: infoToUse,
        }),
      })

      if (!response.ok) {
        throw new Error('Processing failed')
      }

      const data = await response.json()
      setResults(data)
      
      // Save report to server
      const reportHistory = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        companyInfo: infoToUse,
        results: data,
        summary: data.summary
      }
      
      try {
        await fetch('/api/reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reportHistory),
        })
      } catch (error) {
        console.error('Error saving report to server:', error)
        // Fallback to localStorage if server save fails
        const existingReports = localStorage.getItem('windows11-reports')
        const reports = existingReports ? JSON.parse(existingReports) : []
        reports.unshift(reportHistory)
        localStorage.setItem('windows11-reports', JSON.stringify(reports))
      }
      
      setActiveStep(3)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed')
    } finally {
      setProcessing(false)
    }
  }

  const handleReset = () => {
    setActiveStep(0)
    setUploadedFiles([])
    setCompanyInfo({ name: '', site: '', tenant: '' })
    setProcessing(false)
    setResults(null)
    setError(null)
  }

  const handleGoHome = () => {
    setViewMode('home')
    handleReset()
  }

  const handleNewReport = () => {
    setViewMode('new-report')
    handleReset()
  }

  const handleViewReports = () => {
    setViewMode('existing-reports')
  }

  return (
    <>
      {/* Header */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <ComputerIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            Wolff Logics Windows 11 Readiness Report
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {viewMode !== 'home' && (
              <Button 
                color="inherit" 
                onClick={handleGoHome}
                startIcon={<ArrowBackIcon />}
              >
                Home
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth={false} sx={{ maxWidth: '1400px', mt: 4, mb: 4 }}>
        {/* Header with Logo - Centered with Theme Toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4, gap: 3 }}>
          <img 
            src="/wolff-logics-logo.png" 
            alt="Wolff Logics" 
            style={{ height: '80px' }}
          />
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
                Wolff Logics Windows 11 Readiness Report
              </Typography>
              <IconButton
                onClick={toggleTheme}
                color="primary"
                sx={{
                  backgroundColor: 'background.paper',
                  boxShadow: (theme) => theme.shadows[2],
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  }
                }}
              >
                {isDarkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Box>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Comprehensive analysis of your organization's Windows 11 compatibility
            </Typography>
          </Box>
        </Box>

        {/* Home View - Two Main Options */}
        {viewMode === 'home' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Grid container spacing={4} sx={{ mt: 2 }}>
              {/* View Existing Reports Option */}
              <Grid item xs={12} md={6}>
                <Card 
                  sx={{ 
                    height: '100%',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: (theme) => theme.shadows[8]
                    }
                  }}
                >
                  <CardActionArea onClick={handleViewReports} sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 4, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <FolderIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                        View Existing Reports
                      </Typography>
                      <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                        Browse and view previously generated Windows 11 readiness reports organized by company
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Typography variant="body2" color="text.secondary">
                          • Company organized
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          • Historical data
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          • Easy navigation
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>

              {/* Create New Report Option */}
              <Grid item xs={12} md={6}>
                <Card 
                  sx={{ 
                    height: '100%',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: (theme) => theme.shadows[8]
                    }
                  }}
                >
                  <CardActionArea onClick={handleNewReport} sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 4, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <AddIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Create New Report
                      </Typography>
                      <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                        Generate a new Windows 11 readiness report by uploading RMM and ScalePad data files
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Typography variant="body2" color="text.secondary">
                          • Upload data files
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          • Automated analysis
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          • PDF & Excel export
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            </Grid>
          </motion.div>
        )}

        {/* Existing Reports View */}
        {viewMode === 'existing-reports' && (
          <ReportHistory onNewReport={handleNewReport} />
        )}

        {/* New Report Creation View */}
        {viewMode === 'new-report' && (
          <>
            {/* Progress Stepper */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Stepper activeStep={activeStep} alternativeLabel>
                  {steps.map((label, index) => (
                    <Step key={label}>
                      <StepLabel
                        StepIconComponent={({ active, completed }) => (
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: completed 
                                ? 'success.main' 
                                : active 
                                  ? 'primary.main' 
                                  : 'grey.600',
                              color: 'white',
                              fontWeight: 'bold',
                            }}
                          >
                            {index === 0 && <CloudUploadIcon />}
                            {index === 1 && <AssessmentIcon />}
                            {index === 2 && <ComputerIcon />}
                            {index === 3 && <DownloadIcon />}
                          </Box>
                        )}
                      >
                        {label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </CardContent>
            </Card>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 4 }}>
                {error}
              </Alert>
            )}

            {/* Step Content */}
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeStep === 0 && (
                <FileUploadZone 
                  onFilesUploaded={handleFilesUploaded}
                  uploadedFiles={uploadedFiles}
                  onNext={handleProcessReports}
                />
              )}

              {activeStep === 1 && (
                <CompanyInfoForm 
                  onSubmit={handleCompanyInfoSubmit}
                  initialData={companyInfo}
                />
              )}

              {activeStep === 2 && (
                <ProcessingStatus 
                  processing={processing}
                  companyInfo={companyInfo}
                  fileCount={uploadedFiles.length}
                />
              )}

              {activeStep === 3 && results && (
                <ResultsPreview 
                  results={results}
                  companyInfo={companyInfo}
                />
              )}
            </motion.div>
          </>
        )}
      </Container>
    </>
  )
} 