import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const REPORTS_FILE = path.join(process.cwd(), 'data', 'reports.json')

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.dirname(REPORTS_FILE)
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

// GET - Retrieve all reports
export async function GET() {
  try {
    await ensureDataDir()
    
    try {
      const data = await fs.readFile(REPORTS_FILE, 'utf-8')
      const reports = JSON.parse(data)
      return NextResponse.json(reports)
    } catch (error) {
      // File doesn't exist yet, return empty array
      return NextResponse.json([])
    }
  } catch (error) {
    console.error('Error loading reports:', error)
    return NextResponse.json({ error: 'Failed to load reports' }, { status: 500 })
  }
}

// POST - Save a new report
export async function POST(request: NextRequest) {
  try {
    await ensureDataDir()
    
    const report = await request.json()
    
    // Load existing reports
    let reports = []
    try {
      const data = await fs.readFile(REPORTS_FILE, 'utf-8')
      reports = JSON.parse(data)
    } catch (error) {
      // File doesn't exist yet, start with empty array
    }
    
    // Add new report
    reports.unshift(report)
    
    // Save back to file
    await fs.writeFile(REPORTS_FILE, JSON.stringify(reports, null, 2))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving report:', error)
    return NextResponse.json({ error: 'Failed to save report' }, { status: 500 })
  }
}

// DELETE - Remove a report
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get('id')
    
    if (!reportId) {
      return NextResponse.json({ error: 'Report ID required' }, { status: 400 })
    }
    
    await ensureDataDir()
    
    // Load existing reports
    let reports = []
    try {
      const data = await fs.readFile(REPORTS_FILE, 'utf-8')
      reports = JSON.parse(data)
    } catch (error) {
      return NextResponse.json({ error: 'No reports found' }, { status: 404 })
    }
    
    // Remove the report
    const filteredReports = reports.filter((r: any) => r.id !== reportId)
    
    // Save back to file
    await fs.writeFile(REPORTS_FILE, JSON.stringify(filteredReports, null, 2))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting report:', error)
    return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 })
  }
} 