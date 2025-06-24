import { useState } from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

interface ReportGeneratorProps {
  type: 'incident' | 'audit';
  selectedIds: string[];
  onClose: () => void;
}

export default function ReportGenerator({ type, selectedIds, onClose }: ReportGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          ids: selectedIds,
          timeframe: 'all', // You can make this configurable
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate report');
      }

      const data = await response.json();
      setReport(data.report);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate report');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Generate {type.charAt(0).toUpperCase() + type.slice(1)} Report
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {!report ? (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Generate a report for {selectedIds.length} selected {type}(s).
            </p>
            <button
              onClick={generateReport}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="animate-spin mr-2">⌛</span>
              ) : (
                <DocumentTextIcon className="w-5 h-5 mr-2" />
              )}
              {isLoading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {report}
              </pre>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={downloadReport}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Download Report
              </button>
              <button
                onClick={() => setReport(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
              >
                Generate Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 