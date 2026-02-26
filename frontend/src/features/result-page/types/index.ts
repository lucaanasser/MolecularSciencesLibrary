export interface CardService<TAggregated, TEvaluation> {
  getAggregatedRatings: (id: number) => Promise<TAggregated>;
  getEvaluations: (id: number) => Promise<TEvaluation[]>;
  getMyEvaluation: (id: number) => Promise<TEvaluation>;
  createEvaluation: (data: any) => Promise<any>;
  updateEvaluation: (id: number, data: any) => Promise<any>;
  deleteEvaluation: (id: number) => Promise<any>;
  toggleLike: (id: number) => Promise<any>;
}
