import { detectAddress, AddressMatch } from '@/utils/addressDetection';
import { Property, CommandType, CommandResult } from '@/types';

export interface ProcessedCommand {
  type: CommandType;
  input: string;
  confidence: number;
  data?: any;
  addressMatch?: AddressMatch;
}

export class CommandProcessor {
  private static instance: CommandProcessor;

  static getInstance(): CommandProcessor {
    if (!CommandProcessor.instance) {
      CommandProcessor.instance = new CommandProcessor();
    }
    return CommandProcessor.instance;
  }

  async processInput(input: string, context?: { activeTab?: string }): Promise<ProcessedCommand> {
    const trimmed = input.trim();
    
    if (!trimmed) {
      return {
        type: 'unknown',
        input,
        confidence: 0
      };
    }

    // 1. Check for address first (highest priority)
    const addressMatch = detectAddress(trimmed);
    if (addressMatch.isAddress && addressMatch.confidence > 0.6) {
      return {
        type: 'address',
        input: trimmed,
        confidence: addressMatch.confidence,
        addressMatch,
        data: {
          formatted: addressMatch.formatted,
          components: addressMatch.components
        }
      };
    }

    // 2. Check for commands based on context
    const contextualCommand = this.detectContextualCommand(trimmed, context?.activeTab);
    if (contextualCommand.confidence > 0.7) {
      return contextualCommand;
    }

    // 3. Check for general commands
    const generalCommand = this.detectGeneralCommand(trimmed);
    if (generalCommand.confidence > 0.6) {
      return generalCommand;
    }

    // 4. Default to search
    return {
      type: 'search',
      input: trimmed,
      confidence: 0.5,
      data: { query: trimmed }
    };
  }

  private detectContextualCommand(input: string, activeTab?: string): ProcessedCommand {
    const lower = input.toLowerCase();

    // Overview tab commands
    if (activeTab === 'overview') {
      if (lower.includes('health') || lower.includes('score')) {
        return {
          type: 'analysis',
          input,
          confidence: 0.8,
          data: { analysisType: 'health' }
        };
      }
      if (lower.includes('alert') || lower.includes('issue')) {
        return {
          type: 'analysis',
          input,
          confidence: 0.8,
          data: { analysisType: 'alerts' }
        };
      }
    }

    // Operations tab commands
    if (activeTab === 'operations') {
      if (lower.includes('maintenance') || lower.includes('repair')) {
        return {
          type: 'maintenance',
          input,
          confidence: 0.9,
          data: { action: 'create_work_order' }
        };
      }
      if (lower.includes('tenant') || lower.includes('lease')) {
        return {
          type: 'tenant',
          input,
          confidence: 0.9,
          data: { action: 'tenant_management' }
        };
      }
      if (lower.includes('schedule') || lower.includes('appointment')) {
        return {
          type: 'scheduling',
          input,
          confidence: 0.8,
          data: { action: 'schedule' }
        };
      }
    }

    // Intelligence tab commands
    if (activeTab === 'intelligence') {
      if (lower.includes('market') || lower.includes('comp') || lower.includes('value')) {
        return {
          type: 'analysis',
          input,
          confidence: 0.9,
          data: { analysisType: 'market' }
        };
      }
      if (lower.includes('rent') || lower.includes('pricing')) {
        return {
          type: 'analysis',
          input,
          confidence: 0.9,
          data: { analysisType: 'rent_optimization' }
        };
      }
      if (lower.includes('expense') || lower.includes('cost')) {
        return {
          type: 'analysis',
          input,
          confidence: 0.8,
          data: { analysisType: 'expenses' }
        };
      }
    }

    return {
      type: 'unknown',
      input,
      confidence: 0
    };
  }

  private detectGeneralCommand(input: string): ProcessedCommand {
    const lower = input.toLowerCase();

    // Navigation commands
    if (lower.includes('go to') || lower.includes('navigate') || lower.includes('show')) {
      if (lower.includes('overview')) {
        return {
          type: 'navigation',
          input,
          confidence: 0.9,
          data: { target: 'overview' }
        };
      }
      if (lower.includes('operations')) {
        return {
          type: 'navigation',
          input,
          confidence: 0.9,
          data: { target: 'operations' }
        };
      }
      if (lower.includes('intelligence')) {
        return {
          type: 'navigation',
          input,
          confidence: 0.9,
          data: { target: 'intelligence' }
        };
      }
      if (lower.includes('home')) {
        return {
          type: 'navigation',
          input,
          confidence: 0.9,
          data: { target: 'home' }
        };
      }
    }

    // Help commands
    if (lower.includes('help') || lower.includes('how') || lower.includes('what')) {
      return {
        type: 'help',
        input,
        confidence: 0.8,
        data: { query: input }
      };
    }

    // Create commands
    if (lower.startsWith('create') || lower.startsWith('add') || lower.startsWith('new')) {
      return {
        type: 'create',
        input,
        confidence: 0.7,
        data: { entity: this.extractEntityType(lower) }
      };
    }

    return {
      type: 'unknown',
      input,
      confidence: 0
    };
  }

  private extractEntityType(input: string): string {
    if (input.includes('property')) return 'property';
    if (input.includes('tenant')) return 'tenant';
    if (input.includes('work order') || input.includes('maintenance')) return 'work_order';
    if (input.includes('expense')) return 'expense';
    if (input.includes('document')) return 'document';
    return 'unknown';
  }

  // Execute the processed command
  async executeCommand(command: ProcessedCommand): Promise<CommandResult> {
    try {
      switch (command.type) {
        case 'address':
          return await this.handleAddressCommand(command);
        
        case 'navigation':
          return await this.handleNavigationCommand(command);
        
        case 'maintenance':
          return await this.handleMaintenanceCommand(command);
        
        case 'tenant':
          return await this.handleTenantCommand(command);
        
        case 'analysis':
          return await this.handleAnalysisCommand(command);
        
        case 'search':
          return await this.handleSearchCommand(command);
        
        case 'help':
          return await this.handleHelpCommand(command);
        
        case 'create':
          return await this.handleCreateCommand(command);
        
        default:
          return {
            success: false,
            message: `Unknown command type: ${command.type}`,
            data: null
          };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error executing command: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: null
      };
    }
  }

  private async handleAddressCommand(command: ProcessedCommand): Promise<CommandResult> {
    // This will be handled by PropertyGenesis service
    return {
      success: true,
      message: `Processing address: ${command.addressMatch?.formatted}`,
      data: {
        type: 'address_detected',
        address: command.addressMatch
      }
    };
  }

  private async handleNavigationCommand(command: ProcessedCommand): Promise<CommandResult> {
    return {
      success: true,
      message: `Navigating to ${command.data.target}`,
      data: {
        type: 'navigation',
        target: command.data.target
      }
    };
  }

  private async handleMaintenanceCommand(command: ProcessedCommand): Promise<CommandResult> {
    return {
      success: true,
      message: 'Creating maintenance work order...',
      data: {
        type: 'maintenance',
        action: command.data.action
      }
    };
  }

  private async handleTenantCommand(command: ProcessedCommand): Promise<CommandResult> {
    return {
      success: true,
      message: 'Opening tenant management...',
      data: {
        type: 'tenant',
        action: command.data.action
      }
    };
  }

  private async handleAnalysisCommand(command: ProcessedCommand): Promise<CommandResult> {
    return {
      success: true,
      message: `Running ${command.data.analysisType} analysis...`,
      data: {
        type: 'analysis',
        analysisType: command.data.analysisType
      }
    };
  }

  private async handleSearchCommand(command: ProcessedCommand): Promise<CommandResult> {
    return {
      success: true,
      message: `Searching for: ${command.data.query}`,
      data: {
        type: 'search',
        query: command.data.query
      }
    };
  }

  private async handleHelpCommand(command: ProcessedCommand): Promise<CommandResult> {
    return {
      success: true,
      message: 'Here are some things you can try:\n• Type an address to create a property\n• Say "show maintenance" for work orders\n• Ask "what is the health score?"',
      data: {
        type: 'help',
        suggestions: [
          'Type an address like "123 Main Street"',
          'Navigate with "go to operations"',
          'Create work orders with "schedule maintenance"',
          'Ask about market value or rent optimization'
        ]
      }
    };
  }

  private async handleCreateCommand(command: ProcessedCommand): Promise<CommandResult> {
    return {
      success: true,
      message: `Creating new ${command.data.entity}...`,
      data: {
        type: 'create',
        entity: command.data.entity
      }
    };
  }
}
