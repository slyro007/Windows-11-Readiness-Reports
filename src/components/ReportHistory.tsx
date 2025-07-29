'use client'

import React, { useState, useEffect } from 'react'
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
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Badge,
  Breadcrumbs,
  Link,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
} from '@mui/material'
import {
  History as HistoryIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Assessment as AssessmentIcon,
  Business as BusinessIcon,
  ExpandMore as ExpandMoreIcon,
  ArrowBack as ArrowBackIcon,
  Schedule as ScheduleIcon,
  Computer as ComputerIcon,
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import ResultsPreview from './ResultsPreview'

interface ReportHistoryItem {
  id: string
  timestamp: string
  companyInfo: { name: string; site: string; tenant: string }
  results: any
  summary: {
    total: number
    compatible: number
    notCompatible: number
    unsupported: number
    offline: number
  }
}

interface GroupedReports {
  [companyName: string]: ReportHistoryItem[]
}

interface ReportHistoryProps {
  onNewReport: () => void
}

type ViewMode = 'companies' | 'company-reports' | 'report-detail'

const ReportHistory: React.FC<ReportHistoryProps> = ({ onNewReport }) => {
  const [reports, setReports] = useState<ReportHistoryItem[]>([])
  const [groupedReports, setGroupedReports] = useState<GroupedReports>({})
  const [selectedReport, setSelectedReport] = useState<ReportHistoryItem | null>(null)
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('companies')
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  useEffect(() => {
    // Load reports from server
    const loadReports = async () => {
      try {
        const response = await fetch('/api/reports')
        if (response.ok) {
          const loadedReports: ReportHistoryItem[] = await response.json()
          setReports(loadedReports)
          
          // Group reports by company
          const grouped = loadedReports.reduce((acc, report) => {
            const companyName = report.companyInfo.name
            if (!acc[companyName]) {
              acc[companyName] = []
            }
            acc[companyName].push(report)
            return acc
          }, {} as GroupedReports)
          
          // Sort reports within each company by timestamp (newest first)
          Object.keys(grouped).forEach(companyName => {
            grouped[companyName].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          })
          
          setGroupedReports(grouped)
        } else {
          console.error('Failed to load reports')
        }
      } catch (error) {
        console.error('Error loading reports:', error)
      }
    }
    
    loadReports()
  }, [])

  const handleViewReport = (report: ReportHistoryItem) => {
    setSelectedReport(report)
    setViewDialogOpen(true)
  }

  const handleDeleteReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports?id=${reportId}`, { 
        method: 'DELETE' 
      })
      
      if (response.ok) {
        // Update local state
        const updatedReports = reports.filter(report => report.id !== reportId)
        setReports(updatedReports)
        
        // Update grouped reports
        const grouped = updatedReports.reduce((acc, report) => {
          const companyName = report.companyInfo.name
          if (!acc[companyName]) {
            acc[companyName] = []
          }
          acc[companyName].push(report)
          return acc
        }, {} as GroupedReports)
        
        Object.keys(grouped).forEach(companyName => {
          grouped[companyName].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        })
        
        setGroupedReports(grouped)
        
        // If we deleted all reports for the selected company, go back to companies view
        if (selectedCompany && (!grouped[selectedCompany] || grouped[selectedCompany].length === 0)) {
          setViewMode('companies')
          setSelectedCompany(null)
        }
      } else {
        console.error('Failed to delete report')
      }
    } catch (error) {
      console.error('Error deleting report:', error)
    }
  }

  const handleSelectCompany = (companyName: string) => {
    setSelectedCompany(companyName)
    setViewMode('company-reports')
  }

  const handleBackToCompanies = () => {
    setViewMode('companies')
    setSelectedCompany(null)
  }

  const getCompanyStats = (companyReports: ReportHistoryItem[]) => {
    const latestReport = companyReports[0] // Already sorted by newest first
    const totalReports = companyReports.length
    return { latestReport, totalReports }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Compatible': return 'success'
      case 'Not Compatible': return 'error'
      case 'Unsupported': return 'warning'
      case 'Offline': return 'default'
      default: return 'default'
    }
  }

  if (reports.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <HistoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No Reports Generated Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Generate your first Windows 11 readiness report to see it here
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={onNewReport}
              startIcon={<AssessmentIcon />}
              sx={{ px: 4, py: 1.5 }}
            >
              Generate New Report
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Report History
          </Typography>
          {/* Breadcrumbs */}
          <Breadcrumbs aria-label="breadcrumb">
            <Link
              component="button"
              variant="body2"
              onClick={handleBackToCompanies}
              sx={{ 
                textDecoration: viewMode === 'companies' ? 'none' : 'underline',
                color: viewMode === 'companies' ? 'text.primary' : 'primary.main',
                cursor: viewMode === 'companies' ? 'default' : 'pointer'
              }}
            >
              All Companies
            </Link>
            {selectedCompany && (
              <Typography color="text.primary" variant="body2">
                {selectedCompany}
              </Typography>
            )}
          </Breadcrumbs>
        </Box>
        <Button
          variant="contained"
          onClick={onNewReport}
          startIcon={<AssessmentIcon />}
        >
          Generate New Report
        </Button>
      </Box>

      {/* Companies View */}
      {viewMode === 'companies' && (
        <Grid container spacing={3}>
          {Object.entries(groupedReports)
            .sort(([a], [b]) => a.localeCompare(b)) // Sort companies alphabetically
            .map(([companyName, companyReports]) => {
            const { latestReport, totalReports } = getCompanyStats(companyReports)
            
            return (
              <Grid item xs={12} sm={6} md={4} key={companyName}>
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: (theme) => theme.shadows[8]
                    }
                  }}
                  onClick={() => handleSelectCompany(companyName)}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <BusinessIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
                        {companyName}
                      </Typography>
                      <Badge badgeContent={totalReports} color="primary" />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Latest: {new Date(latestReport.timestamp).toLocaleDateString()}
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                          label={latestReport.summary.compatible}
                          color="success"
                          size="small"
                          title="Compatible"
                        />
                        <Chip
                          label={latestReport.summary.notCompatible}
                          color="error"
                          size="small"
                          title="Not Compatible"
                        />
                        {latestReport.summary.unsupported > 0 && (
                          <Chip
                            label={latestReport.summary.unsupported}
                            color="warning"
                            size="small"
                            title="Unsupported"
                          />
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {totalReports} report{totalReports !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}

      {/* Company Reports View */}
      {viewMode === 'company-reports' && selectedCompany && (
        <Card>
          <CardContent>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {selectedCompany} Reports
              </Typography>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={handleBackToCompanies}
                variant="outlined"
              >
                Back to Companies
              </Button>
            </Box>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date Generated</TableCell>
                    <TableCell>Tenant</TableCell>
                    <TableCell>Site</TableCell>
                    <TableCell>Total Devices</TableCell>
                    <TableCell>Compatible</TableCell>
                    <TableCell>Not Compatible</TableCell>
                    <TableCell>Unsupported</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groupedReports[selectedCompany]?.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ScheduleIcon fontSize="small" color="action" />
                          <Box>
                            <Typography variant="body2">
                              {new Date(report.timestamp).toLocaleDateString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(report.timestamp).toLocaleTimeString()}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={report.companyInfo.tenant} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{report.companyInfo.site || 'All Sites'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ComputerIcon fontSize="small" color="action" />
                          {report.summary.total}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={report.summary.compatible}
                          color="success"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={report.summary.notCompatible}
                          color="error"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={report.summary.unsupported}
                          color="warning"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Report">
                            <IconButton
                              size="small"
                              onClick={() => handleViewReport(report)}
                              color="primary"
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Report">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteReport(report.id)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* View Report Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {selectedReport?.companyInfo.name} - Windows 11 Readiness Report
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedReport && new Date(selectedReport.timestamp).toLocaleDateString()}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedReport && (
            <ResultsPreview
              results={selectedReport.results}
              companyInfo={selectedReport.companyInfo}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  )
}

export default ReportHistory 