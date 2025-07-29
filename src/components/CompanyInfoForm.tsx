'use client'

import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
} from '@mui/material'
import { Business as BusinessIcon, LocationOn as LocationIcon } from '@mui/icons-material'
import { motion } from 'framer-motion'

interface CompanyInfoFormProps {
  onSubmit: (info: { name: string; site: string }) => void
  initialData: { name: string; site: string }
}

const CompanyInfoForm: React.FC<CompanyInfoFormProps> = ({ onSubmit, initialData }) => {
  const [companyName, setCompanyName] = useState(initialData.name)
  const [siteName, setSiteName] = useState(initialData.site)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (companyName.trim()) {
      onSubmit({ name: companyName.trim(), site: siteName.trim() })
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
                <TextField
                  fullWidth
                  label="Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    ),
                  }}
                  helperText="This will appear in the report header"
                />
              </Grid>

              <Grid item xs={12} md={6}>
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
                    disabled={!companyName.trim()}
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