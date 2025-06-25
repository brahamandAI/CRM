import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ReportGenerator, ReportData } from '@/lib/services/reportGenerator';
import { Incident } from '@/lib/models/Incident';
import { Audit } from '@/lib/models/Audit';
import dbConnect from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { type, ids, timeframe } = body;

    if (!type || !ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
    }

    // Fetch data based on type
    let data;
    if (type === 'incident') {
      data = await Incident.find({ _id: { $in: ids } }).lean();
    } else if (type === 'audit') {
      data = await Audit.find({ _id: { $in: ids } }).lean();
    } else {
      return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    if (!data.length) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 });
    }

    // Prepare report data
    const reportData: ReportData[] = data.map(item => ({
      type,
      data: item,
      timeframe
    }));

    // Generate report
    const report = await ReportGenerator.generateBatchReport(reportData);

    return NextResponse.json({ report }, { status: 200 });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
} 