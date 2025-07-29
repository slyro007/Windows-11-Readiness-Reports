'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Autocomplete,
} from '@mui/material'
import { Business as BusinessIcon, LocationOn as LocationIcon, Code as CodeIcon } from '@mui/icons-material'
import { motion } from 'framer-motion'

interface CompanyInfoFormProps {
  onSubmit: (info: { name: string; site: string; tenant: string }) => void
  initialData: { name: string; site: string; tenant: string }
}

interface ExistingCompany {
  name: string
  tenant: string
  site?: string
}

const CompanyInfoForm: React.FC<CompanyInfoFormProps> = ({ onSubmit, initialData }) => {
  const [companyName, setCompanyName] = useState(initialData.name)
  const [siteName, setSiteName] = useState(initialData.site)
  const [tenantSlug, setTenantSlug] = useState(initialData.tenant)
  const [existingCompanies, setExistingCompanies] = useState<ExistingCompany[]>([])

  // Load existing companies from localStorage
  useEffect(() => {
    try {
      const savedReports = localStorage.getItem('windows11-reports')
      if (savedReports) {
        const reports = JSON.parse(savedReports)
        
        // Extract unique companies
        const companiesMap = new Map<string, ExistingCompany>()
        
        reports.forEach((report: any) => {
          if (report.companyInfo?.name && report.companyInfo?.tenant) {
            const key = `${report.companyInfo.name}-${report.companyInfo.tenant}`
            if (!companiesMap.has(key)) {
              companiesMap.set(key, {
                name: report.companyInfo.name,
                tenant: report.companyInfo.tenant,
                site: report.companyInfo.site || ''
              })
            }
          }
        })
        
        const uniqueCompanies = Array.from(companiesMap.values())
          .sort((a, b) => a.name.localeCompare(b.name))
        
        setExistingCompanies(uniqueCompanies)
      }
    } catch (error) {
      console.error('Error loading existing companies:', error)
    }
  }, [])

  const handleCompanySelect = (company: ExistingCompany | null) => {
    if (company) {
      setCompanyName(company.name)
      setTenantSlug(company.tenant)
      setSiteName(company.site || '')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (companyName.trim() && tenantSlug.trim()) {
      onSubmit({ name: companyName.trim(), site: siteName.trim(), tenant: tenantSlug.trim() })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box textAlign="center" mb={4}>
            <BusinessIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Company Information
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enter your company details to customize the report
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  freeSolo
                  fullWidth
                  options={existingCompanies}
                  getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                  value={existingCompanies.find(c => c.name === companyName) || companyName}
                  onChange={(_, newValue) => {
                    if (typeof newValue === 'string') {
                      setCompanyName(newValue)
                    } else if (newValue) {
                      handleCompanySelect(newValue)
                    }
                  }}
                  onInputChange={(_, newInputValue) => {
                    setCompanyName(newInputValue)
                  }}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="body1">{option.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.tenant}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Company Name"
                      required
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            {params.InputProps.startAdornment}
                          </>
                        ),
                      }}
                      helperText="Select existing company or type a new one"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tenant Slug"
                  value={tenantSlug}
                  onChange={(e) => setTenantSlug(e.target.value)}
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <CodeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    ),
                  }}
                  helperText="Enter your tenant identifier (e.g., KCP, ENT)"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Site/Location (Optional)"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    ),
                  }}
                  helperText="Leave blank if not applicable"
                />
              </Grid>

              <Grid item xs={12}>
                <Box textAlign="center" mt={3}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={!companyName.trim() || !tenantSlug.trim()}
                    sx={{ px: 4, py: 1.5 }}
                  >
                    Generate Report
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default CompanyInfoForm 