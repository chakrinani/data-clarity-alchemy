
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ArrowUpDown, Zap, Settings, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface PrioritizationRule {
  id: string;
  name: string;
  weight: number;
  type: 'business' | 'technical' | 'temporal';
  description: string;
}

interface PrioritizationTemplate {
  id: string;
  name: string;
  description: string;
  rules: Omit<PrioritizationRule, 'id'>[];
}

const PrioritizationEngine: React.FC = () => {
  const [activeTemplate, setActiveTemplate] = useState<string>('custom');
  const [prioritizationRules, setPrioritizationRules] = useState<PrioritizationRule[]>([
    {
      id: '1',
      name: 'Data Completeness',
      weight: 80,
      type: 'technical',
      description: 'Prioritize files with fewer missing values'
    },
    {
      id: '2',
      name: 'Business Criticality',
      weight: 90,
      type: 'business',
      description: 'Files marked as business-critical get higher priority'
    },
    {
      id: '3',
      name: 'File Size',
      weight: 60,
      type: 'technical',
      description: 'Smaller files processed first for quick wins'
    },
    {
      id: '4',
      name: 'Upload Timestamp',
      weight: 40,
      type: 'temporal',
      description: 'Recently uploaded files get priority'
    },
    {
      id: '5',
      name: 'Error Density',
      weight: 85,
      type: 'technical',
      description: 'Files with fewer errors processed first'
    }
  ]);

  const templates: PrioritizationTemplate[] = [
    {
      id: 'quality-first',
      name: 'Quality First',
      description: 'Prioritize data quality and completeness over speed',
      rules: [
        { name: 'Data Completeness', weight: 95, type: 'technical', description: 'Prioritize complete datasets' },
        { name: 'Error Density', weight: 90, type: 'technical', description: 'Low error rate priority' },
        { name: 'Business Criticality', weight: 70, type: 'business', description: 'Business importance' },
        { name: 'File Size', weight: 30, type: 'technical', description: 'Size consideration' }
      ]
    },
    {
      id: 'speed-optimized',
      name: 'Speed Optimized',
      description: 'Process files quickly for immediate results',
      rules: [
        { name: 'File Size', weight: 95, type: 'technical', description: 'Small files first' },
        { name: 'Simple Structure', weight: 85, type: 'technical', description: 'Simple schemas first' },
        { name: 'Low Error Count', weight: 80, type: 'technical', description: 'Clean data priority' },
        { name: 'Recent Upload', weight: 60, type: 'temporal', description: 'Recent files' }
      ]
    },
    {
      id: 'business-critical',
      name: 'Business Critical',
      description: 'Business value and impact driven prioritization',
      rules: [
        { name: 'Business Criticality', weight: 100, type: 'business', description: 'Maximum business priority' },
        { name: 'Revenue Impact', weight: 90, type: 'business', description: 'High revenue impact' },
        { name: 'Stakeholder Priority', weight: 85, type: 'business', description: 'Key stakeholder requests' },
        { name: 'Deadline Proximity', weight: 75, type: 'temporal', description: 'Urgent deadlines' }
      ]
    }
  ];

  const updateRuleWeight = (ruleId: string, newWeight: number) => {
    setPrioritizationRules(rules => 
      rules.map(rule => 
        rule.id === ruleId ? { ...rule, weight: newWeight } : rule
      )
    );
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(prioritizationRules);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setPrioritizationRules(items);
    toast.success('Rule order updated');
  };

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const newRules = template.rules.map((rule, index) => ({
        ...rule,
        id: `template-${index}`
      }));
      setPrioritizationRules(newRules);
      setActiveTemplate(templateId);
      toast.success(`Applied ${template.name} template`);
    }
  };

  const resetToDefault = () => {
    // Reset to original default rules
    setPrioritizationRules([
      {
        id: '1',
        name: 'Data Completeness',
        weight: 80,
        type: 'technical',
        description: 'Prioritize files with fewer missing values'
      },
      {
        id: '2',
        name: 'Business Criticality',
        weight: 90,
        type: 'business',
        description: 'Files marked as business-critical get higher priority'
      },
      {
        id: '3',
        name: 'File Size',
        weight: 60,
        type: 'technical',
        description: 'Smaller files processed first for quick wins'
      },
      {
        id: '4',
        name: 'Upload Timestamp',
        weight: 40,
        type: 'temporal',
        description: 'Recently uploaded files get priority'
      },
      {
        id: '5',
        name: 'Error Density',
        weight: 85,
        type: 'technical',
        description: 'Files with fewer errors processed first'
      }
    ]);
    setActiveTemplate('custom');
    toast.success('Reset to default configuration');
  };

  const exportConfiguration = () => {
    const config = {
      template: activeTemplate,
      rules: prioritizationRules,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prioritization-config.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Configuration exported');
  };

  const calculatePriorityScore = () => {
    const totalWeight = prioritizationRules.reduce((sum, rule) => sum + rule.weight, 0);
    return Math.round(totalWeight / prioritizationRules.length);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Processing Prioritization</h2>
          <p className="text-slate-400">Configure how files should be prioritized for processing</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={resetToDefault} variant="outline" size="sm" className="border-slate-600">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={exportConfiguration} variant="outline" size="sm" className="border-slate-600">
            <Save className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Priority Score */}
      <Card className="p-6 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Current Priority Score</h3>
            <p className="text-sm text-slate-300">Overall processing priority based on your rules</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{calculatePriorityScore()}</div>
            <p className="text-sm text-slate-400">out of 100</p>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="sliders" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
          <TabsTrigger value="sliders">Weight Sliders</TabsTrigger>
          <TabsTrigger value="dragdrop">Drag & Drop</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="sliders" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {prioritizationRules.map((rule) => (
              <Card key={rule.id} className="p-6 bg-slate-800/50 border-slate-700">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white">{rule.name}</h4>
                      <p className="text-sm text-slate-400 mt-1">{rule.description}</p>
                    </div>
                    <Badge variant={
                      rule.type === 'business' ? 'default' : 
                      rule.type === 'technical' ? 'secondary' : 'outline'
                    }>
                      {rule.type}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-slate-300">Weight</label>
                      <span className="text-sm font-medium text-white">{rule.weight}%</span>
                    </div>
                    <Slider
                      value={[rule.weight]}
                      onValueChange={(value) => updateRuleWeight(rule.id, value[0])}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="dragdrop" className="space-y-4">
          <Card className="p-6 bg-slate-800/50 border-slate-700">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">Drag to Reorder Priority</h3>
              <p className="text-sm text-slate-400">Rules at the top have higher priority</p>
            </div>
            
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="rules">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {prioritizationRules.map((rule, index) => (
                      <Draggable key={rule.id} draggableId={rule.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-4 bg-slate-700/50 rounded-lg border border-slate-600 transition-all ${
                              snapshot.isDragging ? 'shadow-lg bg-slate-600/50' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <ArrowUpDown className="h-5 w-5 text-slate-400" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-white font-medium">{rule.name}</h4>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="outline">{rule.weight}%</Badge>
                                    <Badge variant={
                                      rule.type === 'business' ? 'default' : 
                                      rule.type === 'technical' ? 'secondary' : 'outline'
                                    }>
                                      {rule.type}
                                    </Badge>
                                  </div>
                                </div>
                                <p className="text-sm text-slate-400 mt-1">{rule.description}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className={`p-6 cursor-pointer transition-all ${
                activeTemplate === template.id 
                  ? 'bg-purple-500/20 border-purple-500/50' 
                  : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/50'
              }`}>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                    <p className="text-sm text-slate-400 mt-1">{template.description}</p>
                  </div>
                  
                  <div className="space-y-2">
                    {template.rules.slice(0, 3).map((rule, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">{rule.name}</span>
                        <span className="text-slate-400">{rule.weight}%</span>
                      </div>
                    ))}
                    {template.rules.length > 3 && (
                      <p className="text-xs text-slate-500">+{template.rules.length - 3} more rules</p>
                    )}
                  </div>
                  
                  <Button 
                    onClick={() => applyTemplate(template.id)}
                    className="w-full"
                    variant={activeTemplate === template.id ? "default" : "outline"}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {activeTemplate === template.id ? 'Active' : 'Apply Template'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Custom Template Creator */}
          <Card className="p-6 bg-slate-800/50 border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Create Custom Template</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="Template name" className="bg-slate-700 border-slate-600" />
              <Input placeholder="Description" className="bg-slate-700 border-slate-600" />
            </div>
            <Button className="mt-4" variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Save as Template
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PrioritizationEngine;
