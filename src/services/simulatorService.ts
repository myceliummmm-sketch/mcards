export interface SimulatorParams {
  userClass: 'coder' | 'founder';
  difficulty: 'hard' | 'god';
  language: string;
}

export interface SimulationResult {
  title: string;
  description: string;
  stats: {
    users: string;
    revenue: string;
  };
}

export const simulatorService = {
  async generateStartup(params: SimulatorParams): Promise<SimulationResult> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      title: params.userClass === 'coder' ? "AI Code Assistant" : "Global Marketplace",
      description: params.difficulty === 'hard' ? "Survival mode activated." : "Viral growth achieved.",
      stats: {
        users: "1.2M",
        revenue: "$50k/mo"
      }
    };
  }
};
