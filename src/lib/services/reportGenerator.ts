import OpenAI from 'openai';
import { Incident } from '../models/Incident';
import { Audit } from '../models/Audit';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type ReportType = 'incident' | 'audit';

export interface ReportData {
  type: ReportType;
  data: any;
  timeframe?: string;
}

export class ReportGenerator {
  private static async generatePrompt(data: any, type: ReportType): Promise<string> {
    if (type === 'incident') {
      return `Generate a professional security incident report summary based on the following data:
      Incident Type: ${data.type}
      Location: ${data.location}
      Date: ${data.date}
      Description: ${data.description}
      Involved Parties: ${data.involvedParties}
      Actions Taken: ${data.actionsTaken}
      Status: ${data.status}
      
      Please provide a clear, concise, and professional summary of this security incident.`;
    } else {
      return `Generate a professional security audit report summary based on the following data:
      Audit Type: ${data.type}
      Location: ${data.location}
      Date: ${data.date}
      Findings: ${data.findings}
      Recommendations: ${data.recommendations}
      Compliance Status: ${data.complianceStatus}
      
      Please provide a clear, concise, and professional summary of this security audit.`;
    }
  }

  public static async generateReport(reportData: ReportData): Promise<string> {
    try {
      const prompt = await this.generatePrompt(reportData.data, reportData.type);
      
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a professional security report writer. Write clear, concise, and formal reports."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "gpt-3.5-turbo",
      });

      return completion.choices[0].message.content || 'Unable to generate report';
    } catch (error) {
      console.error('Error generating report:', error);
      throw new Error('Failed to generate report');
    }
  }

  public static async generateBatchReport(reports: ReportData[]): Promise<string> {
    try {
      const summaries = await Promise.all(
        reports.map(report => this.generateReport(report))
      );
      
      return summaries.join('\n\n---\n\n');
    } catch (error) {
      console.error('Error generating batch report:', error);
      throw new Error('Failed to generate batch report');
    }
  }
} 