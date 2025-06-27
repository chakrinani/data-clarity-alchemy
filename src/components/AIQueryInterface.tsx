
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Brain, Send, Search, Sparkles } from 'lucide-react';

interface AIQueryInterfaceProps {
  files: {
    [key: string]: {
      name: string;
      data: any[];
      headers: string[];
    };
  };
}

const AIQueryInterface: React.FC<AIQueryInterfaceProps> = ({ files }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);

  const suggestedQueries = [
    "Show tasks with more than 2 phases",
    "Find workers with Python skills",
    "Tasks assigned to overloaded workers",
    "Clients with missing contact information",
    "Tasks with estimated hours > 40"
  ];

  const handleQuery = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      // In a real implementation, this would call OpenAI API
      // For now, we'll simulate AI query processing
      
      // Add to history
      setQueryHistory(prev => [query, ...prev.slice(0, 4)]);
      
      // Simulate filtering based on query keywords
      let filteredResults: any[] = [];
      const lowerQuery = query.toLowerCase();
      
      Object.values(files).forEach(file => {
        const matching = file.data.filter(row => {
          return Object.values(row).some(value => 
            String(value).toLowerCase().includes(lowerQuery.split(' ')[0])
          );
        });
        
        if (matching.length > 0) {
          filteredResults = [...filteredResults, ...matching.slice(0, 10)];
        }
      });

      setResults(filteredResults);
      
    } catch (error) {
      console.error('Query error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuery = (suggestedQuery: string) => {
    setQuery(suggestedQuery);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="h-6 w-6 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">AI Data Query</h2>
          <Sparkles className="h-5 w-5 text-yellow-400" />
        </div>
        <p className="text-slate-300 mb-6">
          Ask questions about your data in natural language. Our AI will understand and filter your data accordingly.
        </p>
        
        <div className="flex space-x-3">
          <Input
            placeholder="e.g., 'Show me tasks longer than 1 phase with preferred phase 2'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
            className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
          />
          <Button onClick={handleQuery} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </Card>

      {/* Suggested Queries */}
      <Card className="p-6 bg-slate-800/50 border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Suggested Queries</h3>
        <div className="flex flex-wrap gap-2">
          {suggestedQueries.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleSuggestedQuery(suggestion)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </Card>

      {/* Query History */}
      {queryHistory.length > 0 && (
        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Queries</h3>
          <div className="space-y-2">
            {queryHistory.map((historyQuery, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700"
                onClick={() => setQuery(historyQuery)}
              >
                <span className="text-slate-300">{historyQuery}</span>
                <Search className="h-4 w-4 text-slate-400" />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Results */}
      {results.length > 0 && (
        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Query Results</h3>
            <Badge variant="secondary">{results.length} results</Badge>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  {results.length > 0 && Object.keys(results[0]).map((key) => (
                    <th key={key} className="px-4 py-2 text-left text-xs font-medium text-slate-300 uppercase">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {results.slice(0, 10).map((row, index) => (
                  <tr key={index} className="hover:bg-slate-700/30">
                    {Object.values(row).map((value: any, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-2 text-sm text-white">
                        {String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {results.length > 10 && (
            <p className="text-center text-slate-400 mt-4">
              Showing first 10 results of {results.length} total
            </p>
          )}
        </Card>
      )}

      {Object.keys(files).length === 0 && (
        <Card className="p-12 bg-slate-800/50 border-slate-700 text-center">
          <Brain className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Data Available</h3>
          <p className="text-slate-400">Upload some data files first to start querying with AI</p>
        </Card>
      )}
    </div>
  );
};

export default AIQueryInterface;
