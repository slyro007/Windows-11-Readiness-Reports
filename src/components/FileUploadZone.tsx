'use client'

import React, { useState, useCallback } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Grid,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
} from '@mui/material'
import {
  CloudUpload as CloudUploadIcon,
  InsertDriveFile as FileIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

interface UploadedFile {
  name: string
  type: 'rmm' | 'scalepad'
  data: any[]
  size: number
}

interface FileUploadZoneProps {
  onFilesUploaded: (files: UploadedFile[]) => void
  uploadedFiles: UploadedFile[]
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({ onFilesUploaded, uploadedFiles }) => {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const validateFile = (file: File): { isValid: boolean; error?: string; type?: 'rmm' | 'scalepad' } => {
    // Check file type - accept CSV and Excel files
    const fileName = file.name.toLowerCase()
    const isCsv = fileName.endsWith('.csv')
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls')
    
    if (!isCsv && !isExcel) {
      return { isValid: false, error: 'Only CSV and Excel files (.csv, .xlsx, .xls) are allowed' }
    }

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return { isValid: false, error: 'File size must be less than 50MB' }
    }

    // Determine file type based on filename
    let type: 'rmm' | 'scalepad'

    if (fileName.includes('rmm') || fileName.includes('rmm report')) {
      type = 'rmm'
    } else if (fileName.includes('scalepad') || fileName.includes('scale pad')) {
      type = 'scalepad'
    } else {
      return { isValid: false, error: 'File must be either RMM Report or ScalePad Report (filename should contain "rmm" or "scalepad")' }
    }

    return { isValid: true, type }
  }

  const validateCsvColumns = (data: any[], type: 'rmm' | 'scalepad'): boolean => {
    if (!data || data.length === 0) return false

    const requiredColumns = {
      rmm: ['Machine name', 'Friendly name', 'Site name', 'Output', 'Status'],
      scalepad: ['Name', 'Serial', 'Expires']
    }

    const headers = Object.keys(data[0] || {})
    const required = requiredColumns[type]

    // Check if at least some of the required columns are present
    const foundColumns = required.filter(col => 
      headers.some(header => 
        header.toLowerCase().includes(col.toLowerCase()) ||
        col.toLowerCase().includes(header.toLowerCase())
      )
    )

    // For RMM files, we need at least 'Machine name' and 'Output' columns
    if (type === 'rmm') {
      return foundColumns.length >= 2 && 
             (foundColumns.some(col => col.toLowerCase().includes('machine')) ||
              foundColumns.some(col => col.toLowerCase().includes('output')))
    }
    
    // For ScalePad files, we need at least 'Name' and one of 'Serial' or 'Expires'
    if (type === 'scalepad') {
      return foundColumns.length >= 2 && 
             foundColumns.some(col => col.toLowerCase().includes('name'))
    }

    return foundColumns.length >= 2
  }

  const parseExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { 
            type: 'array',
            cellText: false,
            cellDates: true,
            raw: false
          })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          
          // Use direct sheet_to_json to properly handle all data types
          const result = XLSX.utils.sheet_to_json(worksheet, { 
            defval: '',
            raw: false,
            dateNF: 'yyyy-mm-dd'
          })
          
          if (result.length === 0) {
            reject(new Error('Excel file appears to be empty'))
            return
          }
          
          resolve(result)
        } catch (error) {
          reject(new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`))
        }
      }
      reader.onerror = () => reject(new Error('Failed to read Excel file'))
      reader.readAsArrayBuffer(file)
    })
  }

  const processFile = (file: File): Promise<UploadedFile> => {
    return new Promise(async (resolve, reject) => {
      const validation = validateFile(file)
      if (!validation.isValid) {
        reject(new Error(validation.error))
        return
      }

      try {
        let data: any[]
        
        if (file.name.toLowerCase().endsWith('.csv')) {
          // Parse CSV file
          data = await new Promise((resolve, reject) => {
            Papa.parse(file, {
              header: true,
              skipEmptyLines: true,
              complete: (results) => {
                if (results.errors.length > 0) {
                  reject(new Error(`CSV parsing error: ${results.errors[0].message}`))
                  return
                }
                resolve(results.data)
              },
              error: (error) => {
                reject(new Error(`Failed to parse CSV: ${error.message}`))
              }
            })
          })
        } else {
          // Parse Excel file
          data = await parseExcelFile(file)
        }

        if (!validateCsvColumns(data, validation.type!)) {
          reject(new Error(`Invalid ${validation.type?.toUpperCase()} file format. Missing required columns.`))
          return
        }

        resolve({
          name: file.name,
          type: validation.type!,
          data: data,
          size: file.size,
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  const handleFiles = useCallback(async (files: FileList) => {
    if (files.length === 0) return

    setUploading(true)
    setValidationErrors([])

    try {
      const fileArray = Array.from(files)
      const processedFiles: UploadedFile[] = []
      const errors: string[] = []

      for (const file of fileArray) {
        try {
          const processed = await processFile(file)
          processedFiles.push(processed)
        } catch (error) {
          errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      if (errors.length > 0) {
        setValidationErrors(errors)
      }

      // Check if we have both file types
      const hasRmm = processedFiles.some(f => f.type === 'rmm')
      const hasScalepad = processedFiles.some(f => f.type === 'scalepad')

      if (processedFiles.length > 0) {
        onFilesUploaded([...uploadedFiles, ...processedFiles])
      }

      if (!hasRmm || !hasScalepad) {
        const missing: string[] = []
        if (!hasRmm) missing.push('RMM Report')
        if (!hasScalepad) missing.push('ScalePad Report')
        setValidationErrors(prev => [...prev, `Missing required files: ${missing.join(', ')}`])
      }

    } finally {
      setUploading(false)
    }
  }, [onFilesUploaded, uploadedFiles])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    onFilesUploaded(newFiles)
  }

  const hasRmm = uploadedFiles.some(f => f.type === 'rmm')
  const hasScalepad = uploadedFiles.some(f => f.type === 'scalepad')
  const isComplete = hasRmm && hasScalepad

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Upload Zone */}
        <Grid item xs={12} md={8}>
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              sx={{
                border: dragActive ? '2px dashed #2196f3' : '2px dashed rgba(255,255,255,0.3)',
                backgroundColor: dragActive ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: '#2196f3',
                  backgroundColor: 'rgba(33, 150, 243, 0.05)',
                }
              }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <input
                  type="file"
                  multiple
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileInput}
                  style={{ display: 'none' }}
                  id="file-upload"
                />
                
                <CloudUploadIcon 
                  sx={{ 
                    fontSize: 64, 
                    color: dragActive ? 'primary.main' : 'text.secondary',
                    mb: 2 
                  }} 
                />
                
                <Typography variant="h5" gutterBottom>
                  {dragActive ? 'Drop files here' : 'Upload Files'}
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Drag and drop your RMM Report and ScalePad Report files (CSV or Excel) here, or click to browse
                </Typography>
                
                <Button
                  variant="contained"
                  component="label"
                  htmlFor="file-upload"
                  startIcon={<CloudUploadIcon />}
                  disabled={uploading}
                  sx={{ mb: 2 }}
                >
                  Choose Files
                </Button>
                
                {uploading && (
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      Processing files...
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* File Requirements */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Required Files
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    {hasRmm ? (
                      <CheckIcon color="success" />
                    ) : (
                      <WarningIcon color="warning" />
                    )}
                  </ListItemIcon>
                  <ListItemText 
                    primary="RMM Report"
                    secondary="Must contain Machine name, Output, Status columns"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    {hasScalepad ? (
                      <CheckIcon color="success" />
                    ) : (
                      <WarningIcon color="warning" />
                    )}
                  </ListItemIcon>
                  <ListItemText 
                    primary="ScalePad Report"
                    secondary="Must contain Name, Serial, Expires columns"
                  />
                </ListItem>
              </List>

              {isComplete && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  All required files uploaded! Ready to proceed.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Uploaded Files
            </Typography>
            
            <AnimatePresence>
              {uploadedFiles.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 2,
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <FileIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body1">{file.name}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        <Chip 
                          label={file.type.toUpperCase()} 
                          size="small" 
                          color={file.type === 'rmm' ? 'primary' : 'secondary'}
                        />
                        <Chip 
                          label={`${file.data.length} records`} 
                          size="small" 
                          variant="outlined"
                        />
                        <Chip 
                          label={`${(file.size / 1024).toFixed(1)} KB`} 
                          size="small" 
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                    
                    <IconButton 
                      onClick={() => removeFile(index)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </motion.div>
              ))}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" color="error" gutterBottom>
              Upload Issues
            </Typography>
            {validationErrors.map((error, index) => (
              <Alert key={index} severity="error" sx={{ mb: 1 }}>
                {error}
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

export default FileUploadZone 