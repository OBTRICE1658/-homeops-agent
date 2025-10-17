import type { Plan, Exports } from '../types/plan'

class ExportService {
  generateExports(plan: Plan): Exports {
    return {
      sow_markdown: this.generateSOW(plan),
      pilot_scorecard_markdown: this.generateScorecard(plan),
      notion_template_json: this.generateTemplate(plan)
    }
  }

  private generateSOW(plan: Plan): string {
    const { industry, context, fit_score, roi, databases, workflows, governance, risks } = plan

    return `# Statement of Work - ${industry.charAt(0).toUpperCase() + industry.slice(1)} Notion Implementation

## Project Overview

This Statement of Work outlines the implementation of a comprehensive Notion workspace for a ${industry} company with ${context.team_size} team members.

**Fit Score:** ${fit_score.overall}/10 (${this.getFitDescription(fit_score.overall)})

## Scope of Work

### Phase 1: Database Setup
${databases.map((db: any) => `- **${db.title}**: ${db.description}`).join('\n')}

### Phase 2: Workflow Implementation
${workflows.map((wf: any) => `- **${wf.name}**: ${wf.steps.length} step process`).join('\n')}

### Phase 3: Governance & Training
${governance.roles.map((role: string) => `- ${role} role configuration`).join('\n')}
${governance.rules.map((rule: string) => `- ${rule}`).join('\n')}

## Financial Projections

- **Implementation Cost**: $${roi.implementation_cost.toLocaleString()}
- **Annual Savings**: $${roi.annual_savings.toLocaleString()}
- **Payback Period**: ${roi.payback_months} months
- **Efficiency Gain**: ${roi.efficiency_gain_pct}%

### Stack Consolidation Savings
- **Monthly Stack Savings**: $${roi.monthly_stack_savings.toLocaleString()}
- **Annual Stack Savings**: $${roi.annual_stack_savings.toLocaleString()}

## Risk Mitigation

${risks.map((risk: any) => `### ${risk.risk}\n**Mitigation**: ${risk.mitigation}\n`).join('\n')}

## Timeline

- **Week 1-2**: Database setup and initial configuration
- **Week 3-4**: Workflow implementation and testing
- **Week 5-6**: User training and rollout
- **Week 7-8**: Optimization and documentation

## Success Criteria

- All databases populated with existing data
- ${Math.round(context.team_size * 0.8)}+ team members actively using the workspace
- ${roi.efficiency_gain_pct}% improvement in workflow efficiency
- ROI achievement within ${roi.payback_months} months

---

*This SOW is valid for 30 days from the date of issue.*`
  }

  private generateScorecard(plan: Plan): string {
    const { industry, context, fit_score, roi, databases } = plan

    return `# Pilot Scorecard - ${industry.charAt(0).toUpperCase() + industry.slice(1)} Notion Implementation

## Implementation Overview

**Industry**: ${industry.charAt(0).toUpperCase() + industry.slice(1)}  
**Team Size**: ${context.team_size}  
**Databases**: ${databases.length}  
**Fit Score**: ${fit_score.overall}/10  

## Success Metrics

### Data Migration
- [ ] Customer data migrated (Target: 100%)
- [ ] Historical data preserved (Target: 95%+)
- [ ] Data validation completed (Target: 100%)

### User Adoption
- [ ] Team members onboarded (Target: ${Math.round(context.team_size * 0.8)}/${context.team_size})
- [ ] Daily active users (Target: 70%+)
- [ ] Feature utilization (Target: 80%+)

### Process Efficiency
- [ ] Time savings achieved (Target: ${roi.hours_saved_per_week} hours/week)
- [ ] Workflow automation (Target: 80% of manual tasks)
- [ ] Error reduction (Target: 50% fewer errors)

### Financial Performance
- [ ] Implementation within budget (Target: ±10%)
- [ ] Stack consolidation achieved (Target: $${roi.monthly_stack_savings}/month)
- [ ] ROI timeline met (Target: ${roi.payback_months} months)

## Fit Score Breakdown

${Object.entries(fit_score.rationale).map(([dimension, rationale]) => 
  `### ${dimension.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
**Score**: ${fit_score[dimension as keyof typeof fit_score]}/10  
**Rationale**: ${rationale}
`).join('\n')}

## Risk Assessment

### Identified Risks
${plan.risks.map((risk: any, index: number) => `${index + 1}. **${risk.risk}**
   - Mitigation: ${risk.mitigation}
`).join('\n')}

## Next Steps

1. **Week 1**: Complete database setup
2. **Week 2**: Begin user training
3. **Week 3**: Monitor adoption metrics
4. **Week 4**: Optimize based on feedback

## Contact Information

For questions about this scorecard, please contact your implementation team.

---

*Scorecard generated on ${new Date().toLocaleDateString()}*`
  }

  private generateTemplate(plan: Plan): Record<string, any> {
    return {
      template_name: `${plan.industry}_notion_workspace`,
      version: "1.0",
      industry: plan.industry,
      team_size: plan.context.team_size,
      databases: plan.databases.map((db: any) => ({
        name: db.title,
        key: db.key,
        properties: db.properties.length,
        views: db.default_views.length
      })),
      workflows: plan.workflows.length,
      estimated_setup_time: this.calculateSetupTime(plan),
      complexity_level: this.getComplexityLevel(plan.fit_score.overall),
      recommended_rollout: this.getRolloutStrategy(plan.context.team_size)
    }
  }

  private getFitDescription(score: number): string {
    if (score >= 8) return 'Excellent Fit'
    if (score >= 6) return 'Good Fit'
    if (score >= 4) return 'Moderate Fit'
    return 'Challenging Fit'
  }

  private calculateSetupTime(plan: Plan): string {
    const baseHours = plan.databases.length * 4
    const workflowHours = plan.workflows.length * 2
    const teamMultiplier = Math.ceil(plan.context.team_size / 10)
    
    const totalHours = (baseHours + workflowHours) * teamMultiplier
    return `${totalHours}-${totalHours + 20} hours`
  }

  private getComplexityLevel(fitScore: number): string {
    if (fitScore >= 8) return 'Low'
    if (fitScore >= 6) return 'Medium'
    return 'High'
  }

  private getRolloutStrategy(teamSize: number): string[] {
    if (teamSize < 10) {
      return ['All team members simultaneously', 'Complete training in 1 week']
    } else if (teamSize < 50) {
      return ['Department-by-department rollout', 'Pilot with 20% of team first', '2-week rollout timeline']
    } else {
      return ['Phased rollout approach', 'Start with core team of 10-15 users', 'Expand weekly to new departments', '4-6 week rollout timeline']
    }
  }
}

export const exportService = new ExportService()
