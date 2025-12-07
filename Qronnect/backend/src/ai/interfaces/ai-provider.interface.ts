export interface AiProvider {
    // Existing features
    generateKpiAnalysis(params: any): Promise<any>;
    generatePromoIdeas(params: any): Promise<any>;
    generateEmailCampaignIdeas(params: any): Promise<any>;
    generatePlanAccion(params: any): Promise<any>;
    generarCampanaSMS(params: any): Promise<any>;

    // Info Reports features
    analyzePromoImpact(promociones: any[], kpis: any, comparativa: any): Promise<any>;
    generateNextMonthPlan(tienda: any, kpis: any, analisisIA: any): Promise<any>;
}
