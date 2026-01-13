
export enum ModuleType {
  SOFIA = 'SOFIA',
  BRENNER = 'BRENNER',
  DANTE = 'DANTE',
  RUBENS = 'RUBENS'
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  value: number;
  status: 'PROSPECÇÃO' | 'QUALIFICAÇÃO' | 'PROPOSTA' | 'FECHAMENTO';
}

export interface KPI {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
}

export interface CreativeDelivery {
  id: string;
  client: string;
  type: string;
  deadline: string;
  status: 'PENDENTE' | 'EM_PRODUCAO' | 'REVISAO' | 'ENTREGUE';
}
