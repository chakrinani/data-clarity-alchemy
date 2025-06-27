
export interface ValidationRule {
  id: string;
  name: string;
  type: 'required' | 'email' | 'phone' | 'reference' | 'duplicate' | 'range' | 'regex' | 'custom';
  field: string;
  message: string;
  severity: 'error' | 'warning';
  config?: any;
}

export interface ValidationError {
  row: number;
  column: string;
  message: string;
  severity: 'error' | 'warning';
  ruleId: string;
}

export class ValidationEngine {
  private rules: ValidationRule[] = [
    {
      id: 'req-client-name',
      name: 'Required Client Name',
      type: 'required',
      field: 'Name',
      message: 'Client name is required',
      severity: 'error'
    },
    {
      id: 'email-format',
      name: 'Email Format',
      type: 'email',
      field: 'Email',
      message: 'Invalid email format',
      severity: 'error'
    },
    {
      id: 'phone-format',
      name: 'Phone Format',
      type: 'phone',
      field: 'PhoneNumber',
      message: 'Invalid phone number format',
      severity: 'warning'
    },
    {
      id: 'duplicate-ids',
      name: 'Duplicate IDs',
      type: 'duplicate',
      field: 'ClientID',
      message: 'Duplicate ID found',
      severity: 'error'
    },
    {
      id: 'worker-load-range',
      name: 'Worker Load Range',
      type: 'range',
      field: 'CurrentLoad',
      message: 'Current load exceeds maximum capacity',
      severity: 'warning',
      config: { min: 0, max: 100 }
    },
    {
      id: 'task-reference',
      name: 'Task References',
      type: 'reference',
      field: 'TaskIDs',
      message: 'Referenced task ID not found',
      severity: 'error'
    },
    {
      id: 'hourly-rate-range',
      name: 'Hourly Rate Range',
      type: 'range',
      field: 'HourlyRate',
      message: 'Hourly rate seems unusually high/low',
      severity: 'warning',
      config: { min: 15, max: 200 }
    },
    {
      id: 'skill-format',
      name: 'Skills Format',
      type: 'regex',
      field: 'Skills',
      message: 'Skills must be in JSON array format',
      severity: 'error',
      config: { pattern: /^\[.*\]$/ }
    }
  ];

  validateData(data: any[], headers: string[], fileName: string, allFiles?: { [key: string]: any }): ValidationError[] {
    const errors: ValidationError[] = [];
    const duplicateTracker = new Map<string, number[]>();

    data.forEach((row, rowIndex) => {
      this.rules.forEach(rule => {
        const fieldValue = row[rule.field];
        const error = this.validateField(fieldValue, rule, rowIndex, row, allFiles);
        
        if (error) {
          errors.push(error);
        }

        // Track duplicates
        if (rule.type === 'duplicate' && fieldValue) {
          if (!duplicateTracker.has(fieldValue)) {
            duplicateTracker.set(fieldValue, []);
          }
          duplicateTracker.get(fieldValue)!.push(rowIndex);
        }
      });
    });

    // Add duplicate errors
    duplicateTracker.forEach((rows, value) => {
      if (rows.length > 1) {
        rows.forEach(rowIndex => {
          errors.push({
            row: rowIndex,
            column: 'ClientID',
            message: `Duplicate ID "${value}" found in rows ${rows.map(r => r + 1).join(', ')}`,
            severity: 'error',
            ruleId: 'duplicate-ids'
          });
        });
      }
    });

    return errors;
  }

  private validateField(value: any, rule: ValidationRule, rowIndex: number, row: any, allFiles?: any): ValidationError | null {
    switch (rule.type) {
      case 'required':
        if (!value || String(value).trim() === '') {
          return {
            row: rowIndex,
            column: rule.field,
            message: rule.message,
            severity: rule.severity,
            ruleId: rule.id
          };
        }
        break;

      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return {
            row: rowIndex,
            column: rule.field,
            message: rule.message,
            severity: rule.severity,
            ruleId: rule.id
          };
        }
        break;

      case 'phone':
        if (value && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[-\s\(\)]/g, ''))) {
          return {
            row: rowIndex,
            column: rule.field,
            message: rule.message,
            severity: rule.severity,
            ruleId: rule.id
          };
        }
        break;

      case 'range':
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && (numValue < rule.config.min || numValue > rule.config.max)) {
          return {
            row: rowIndex,
            column: rule.field,
            message: `${rule.message} (${rule.config.min}-${rule.config.max})`,
            severity: rule.severity,
            ruleId: rule.id
          };
        }
        break;

      case 'regex':
        if (value && !rule.config.pattern.test(String(value))) {
          return {
            row: rowIndex,
            column: rule.field,
            message: rule.message,
            severity: rule.severity,
            ruleId: rule.id
          };
        }
        break;

      case 'reference':
        if (value && allFiles) {
          const taskIds = this.parseJsonArray(value);
          const allTaskIds = this.getAllTaskIds(allFiles);
          const invalidRefs = taskIds.filter(id => !allTaskIds.includes(id));
          
          if (invalidRefs.length > 0) {
            return {
              row: rowIndex,
              column: rule.field,
              message: `${rule.message}: ${invalidRefs.join(', ')}`,
              severity: rule.severity,
              ruleId: rule.id
            };
          }
        }
        break;
    }

    return null;
  }

  private parseJsonArray(value: string): string[] {
    try {
      return JSON.parse(value) || [];
    } catch {
      return [];
    }
  }

  private getAllTaskIds(allFiles: { [key: string]: any }): string[] {
    const taskFile = Object.values(allFiles).find(file => 
      file.name.toLowerCase().includes('task')
    );
    
    return taskFile ? taskFile.data.map((row: any) => row.TaskID).filter(Boolean) : [];
  }

  getRules(): ValidationRule[] {
    return this.rules;
  }

  addCustomRule(rule: ValidationRule): void {
    this.rules.push(rule);
  }
}

export const validationEngine = new ValidationEngine();
