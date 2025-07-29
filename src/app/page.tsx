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
  Alert
} from '@mui/material'
import { 
  CloudUpload as CloudUploadIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Computer as ComputerIcon
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import FileUploadZone from '@/components/FileUploadZone'
import CompanyInfoForm from '@/components/CompanyInfoForm'
import ProcessingStatus from '@/components/ProcessingStatus'
import ResultsPreview from '@/components/ResultsPreview'

const steps = ['Upload Files', 'Company Info', 'Processing', 'Results']

interface UploadedFile {
  name: string
  type: 'rmm' | 'scalepad'
  data: any[]
  size: number
}

export default function HomePage() {
  const [activeStep, setActiveStep] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [companyInfo, setCompanyInfo] = useState({ name: '', site: '' })
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFilesUploaded = (files: UploadedFile[]) => {
    setUploadedFiles(files)
    setError(null)
    if (files.length === 2) {
      setActiveStep(1)
    }
  }

  const handleCompanyInfoSubmit = (info: { name: string; site: string }) => {
    setCompanyInfo(info)
    setActiveStep(2)
    startProcessing()
  }

  const startProcessing = async () => {
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
          companyInfo,
        }),
      })

      if (!response.ok) {
        throw new Error('Processing failed')
      }

      const data = await response.json()
      setResults(data)
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
    setCompanyInfo({ name: '', site: '' })
    setProcessing(false)
    setResults(null)
    setError(null)
  }

  return (
    <>
      {/* Header */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <ComputerIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            Windows 11 Readiness Report Generator
          </Typography>
          <Button 
            color="inherit" 
            onClick={handleReset}
            disabled={activeStep === 0}
          >
            Start Over
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Hero Section */}
          <Box textAlign="center" mb={6}>
            <Typography 
              variant="h2" 
              component="h1" 
              gutterBottom
              sx={{ 
                background: 'linear-gradient(45deg, #2196f3, #e91e63)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2
              }}
            >
              Generate Professional Reports
            </Typography>
            <Typography 
              variant="h5" 
              color="text.secondary" 
              sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}
            >
              Upload your RMM and ScalePad CSV files to generate comprehensive 
              Windows 11 readiness reports with SecureBoot capability tracking
            </Typography>
          </Box>

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
        </motion.div>
      </Container>
    </>
  )
} 