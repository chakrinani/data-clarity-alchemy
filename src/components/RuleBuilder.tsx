
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Download, Trash2, Settings, Code } from 'lucide-react';
import { toast } from 'sonner';

interface RuleBuilderProps {
  rules: any[];
  onRulesChange: (rules: any[]) => void;
  files: {
    [key: string]: {
      name: string;
      data: any[];
      headers: string[];
    };
  };
}

interface Rule {
  id: string;
  name: string;
  type: 'co-run' | 'slot-restriction' | 'load-limit' | 'phase-window' | 'regex' | 'custom';
  description: string;
  conditions: any;
  priority: number;
  enabled: boolean;
}

const RuleBuilder: React.FC<RuleBuilderProps> = ({ rules, onRulesChange, files }) => {
  const [newRule, setNewRule] = useState<Partial<Rule>>({
    name: '',
    type: 'co-run',
    description: '',
    conditions: {},
    priority: 1,
    enabled: true
  });
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [naturalLanguageRule, setNaturalLanguageRule] = useState('');

  const ruleTypes = [
    { value: 'co-run', label: 'Co-run Tasks', description: 'Tasks that must run together' },
    { value: 'slot-restriction', label: 'Slot Restrictions', description: 'Limit resource allocation' },
    { value: 'load-limit', label: 'Load Limits', description: 'Maximum workload per worker' },
    { value: 'phase-window', label: 'Phase Windows', description: 'Time-based scheduling rules' },
    { value: 'regex', label: 'Regex Validation', description: 'Pattern-based data validation' },
    { value: 'custom', label: 'Custom Rule', description: 'Define your own logic' }
  ];

  const addRule = () => {
    if (!newRule.name) {
      toast.error('Rule name is required');
      return;
    }

    const rule: Rule = {
      id: Date.now().toString(),
      name: newRule.name!,
      type: newRule.type!,
      description: newRule.description || '',
      conditions: newRule.conditions || {},
      priority: newRule.priority || 1,
      enabled: true
    };

    onRulesChange([...rules, rule]);
    setNewRule({
      name: '',
      type: 'co-run',
      description: '',
      conditions: {},
      priority: 1,
      enabled: true
    });
    setShowRuleForm(false);
    toast.success('Rule added successfully');
  };

  const removeRule = (id: string) => {
    onRulesChange(rules.filter(rule => rule.id !== id));
    toast.success('Rule removed');
  };

  const toggleRule = (id: string) => {
    onRulesChange(rules.map(rule => 
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const processNaturalLanguageRule = () => {
    if (!naturalLanguageRule.trim()) return;

    // Simple NLP processing - in a real app, this would use OpenAI
    let ruleType = 'custom';
    let conditions = {};
    
    const text = naturalLanguageRule.toLowerCase();
    
    if (text.includes('together') || text.includes('co-run')) {
      ruleType = 'co-run';
      conditions = { taskIds: [] };
    } else if (text.includes('limit') || text.includes('maximum')) {
      ruleType = 'load-limit';
      conditions = { maxLoad: 100 };
    } else if (text.includes('phase') || text.includes('window')) {
      ruleType = 'phase-window';
      conditions = { phases: [] };
    }

    const suggestedRule: Partial<Rule> = {
      name: `Auto-generated: ${naturalLanguageRule.slice(0, 30)}...`,
      type: ruleType as any,
      description: `Generated from: "${naturalLanguageRule}"`,
      conditions,
      priority: 1,
      enabled: true
    };

    setNewRule(suggestedRule);
    setShowRuleForm(true);
    setNaturalLanguageRule('');
    toast.success('Rule generated from natural language!');
  };

  const exportRules = () => {
    const rulesConfig = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      rules: rules,
      metadata: {
        totalRules: rules.length,
        enabledRules: rules.filter(r => r.enabled).length,
        ruleTypes: [...new Set(rules.map(r => r.type))]
      }
    };

    const blob = new Blob([JSON.stringify(rulesConfig, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rules.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Rules exported successfully');
  };

  return (
    <div className="space-y-6">
      {/* Natural Language Rule Input */}
      <Card className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Natural Language Rule Builder
        </h3>
        <p className="text-slate-300 mb-4">
          Describe rules in plain English and we'll convert them to structured rules
        </p>
        <div className="flex space-x-3">
          <Textarea
            placeholder="e.g., 'Tasks T1 and T2 must always run together' or 'Worker group A should have a maximum load of 80%'"
            value={naturalLanguageRule}
            onChange={(e) => setNaturalLanguageRule(e.target.value)}
            className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
          />
          <Button onClick={processNaturalLanguageRule} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Generate
          </Button>
        </div>
      </Card>

      {/* Rule Form */}
      {showRuleForm && (
        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Add New Rule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ruleName" className="text-slate-300">Rule Name</Label>
              <Input
                id="ruleName"
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Enter rule name"
              />
            </div>
            <div>
              <Label htmlFor="ruleType" className="text-slate-300">Rule Type</Label>
              <Select value={newRule.type} onValueChange={(value) => setNewRule({ ...newRule, type: value as any })}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ruleTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-slate-400">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="ruleDescription" className="text-slate-300">Description</Label>
              <Textarea
                id="ruleDescription"
                value={newRule.description}
                onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Describe what this rule does"
              />
            </div>
            <div>
              <Label htmlFor="rulePriority" className="text-slate-300">Priority (1-10)</Label>
              <Input
                id="rulePriority"
                type="number"
                min="1"
                max="10"
                value={newRule.priority}
                onChange={(e) => setNewRule({ ...newRule, priority: parseInt(e.target.value) })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={() => setShowRuleForm(false)}>
              Cancel
            </Button>
            <Button onClick={addRule} className="bg-purple-600 hover:bg-purple-700">
              Add Rule
            </Button>
          </div>
        </Card>
      )}

      {/* Add Rule Button */}
      {!showRuleForm && (
        <Button onClick={() => setShowRuleForm(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Add New Rule
        </Button>
      )}

      {/* Export Button */}
      {rules.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={exportRules} variant="outline" className="border-slate-600 text-slate-300">
            <Download className="h-4 w-4 mr-2" />
            Export Rules
          </Button>
        </div>
      )}

      {/* Rules List */}
      <div className="space-y-4">
        {rules.map((rule) => (
          <Card key={rule.id} className="p-6 bg-slate-800/50 border-slate-700">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-lg font-semibold text-white">{rule.name}</h4>
                  <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                    {rule.type}
                  </Badge>
                  <Badge variant={rule.enabled ? 'default' : 'outline'}>
                    Priority: {rule.priority}
                  </Badge>
                </div>
                <p className="text-slate-400 mb-3">{rule.description}</p>
                <div className="flex items-center space-x-2">
                  <Code className="h-4 w-4 text-slate-500" />
                  <span className="text-xs text-slate-500 font-mono">
                    {JSON.stringify(rule.conditions, null, 0)}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleRule(rule.id)}
                  className={rule.enabled ? 'border-green-500 text-green-400' : 'border-slate-600 text-slate-400'}
                >
                  {rule.enabled ? 'Enabled' : 'Disabled'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeRule(rule.id)}
                  className="border-red-500 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {rules.length === 0 && (
        <Card className="p-12 bg-slate-800/50 border-slate-700 text-center">
          <Settings className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Rules Defined</h3>
          <p className="text-slate-400">Create rules to define data validation and processing logic</p>
        </Card>
      )}
    </div>
  );
};

export default RuleBuilder;
