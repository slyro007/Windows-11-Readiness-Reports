'use client'

import React, { useEffect, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Chip,
} from '@mui/material'
import {
  DataObject as DataIcon,
  Analytics as AnalyticsIcon,
  Description as ReportIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material'
import { motion } from 'framer-motion'

interface ProcessingStatusProps {
  processing: boolean
  companyInfo: { name: string; site: string }
  fileCount: number
}

const processingSteps = [
  { label: 'Parsing CSV Data', icon: DataIcon, duration: 2000 },
  { label: 'Analyzing Windows 11 Readiness', icon: AnalyticsIcon, duration: 3000 },
  { label: 'Processing SecureBoot Capabilities', icon: AnalyticsIcon, duration: 2500 },
  { label: 'Generating Reports', icon: ReportIcon, duration: 4000 },
]

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ 
  processing, 
  companyInfo, 
  fileCount 
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!processing) return

    let stepIndex = 0
    let totalTime = 0
    const stepIntervals: NodeJS.Timeout[] = []

    // Calculate total processing time
    const totalDuration = processingSteps.reduce((sum, step) => sum + step.duration, 0)

    processingSteps.forEach((step, index) => {
      const timeout = setTimeout(() => {
        setCurrentStep(index + 1)
      }, totalTime)
      
      stepIntervals.push(timeout)
      totalTime += step.duration
    })

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / totalDuration) * 100
        return newProgress >= 100 ? 100 : newProgress
      })
    }, 100)

    return () => {
      stepIntervals.forEach(clearTimeout)
      clearInterval(progressInterval)
    }
  }, [processing])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box textAlign="center" mb={4}>
            <motion.div
              animate={{ rotate: processing ? 360 : 0 }}
              transition={{ duration: 2, repeat: processing ? Infinity : 0, ease: "linear" }}
            >
              <AnalyticsIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            </motion.div>
            
            <Typography variant="h4" gutterBottom>
              Processing Your Reports
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Generating Windows 11 readiness analysis for <strong>{companyInfo.name}</strong>
              {companyInfo.site && ` - ${companyInfo.site}`}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 3 }}>
              <Chip label={`${fileCount} Files`} color="primary" size="small" />
              <Chip label="Dark Mode Ready" color="secondary" size="small" />
              <Chip label="Material Design" color="success" size="small" />
            </Box>
          </Box>

          {/* Progress Bar */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Overall Progress</Typography>
              <Typography variant="body2">{Math.round(progress)}%</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: 'linear-gradient(45deg, #2196f3, #e91e63)',
                }
              }} 
            />
          </Box>

          {/* Processing Steps */}
          <Stepper activeStep={currentStep} orientation="vertical">
            {processingSteps.map((step, index) => {
              const StepIcon = step.icon
              const isCompleted = currentStep > index
              const isActive = currentStep === index
              
              return (
                <Step key={step.label}>
                  <StepLabel
                    StepIconComponent={() => (
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: isCompleted
                            ? 'success.main'
                            : isActive
                              ? 'primary.main'
                              : 'grey.600',
                          color: 'white',
                          mr: 2,
                        }}
                      >
                        {isCompleted ? (
                          <CheckIcon />
                        ) : (
                          <StepIcon />
                        )}
                      </Box>
                    )}
                  >
                    <Box>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: isActive ? 600 : 400,
                          color: isCompleted ? 'success.main' : isActive ? 'primary.main' : 'text.secondary'
                        }}
                      >
                        {step.label}
                      </Typography>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            In progress...
                          </Typography>
                        </motion.div>
                      )}
                      {isCompleted && (
                        <Typography variant="caption" color="success.main">
                          Completed
                        </Typography>
                      )}
                    </Box>
                  </StepLabel>
                </Step>
              )
            })}
          </Stepper>

          {/* Fun Facts */}
          <Box sx={{ mt: 4, p: 3, backgroundColor: 'rgba(33, 150, 243, 0.1)', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Did you know?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This analysis includes tracking of SecureBoot capabilities, TPM versions, 
              RAM requirements, and CPU compatibility to ensure comprehensive Windows 11 readiness assessment.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default ProcessingStatus 