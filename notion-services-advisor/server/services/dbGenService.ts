import type { Industry, Context, DatabaseSpec } from '../types/plan'

class DbGenService {
  generateDatabases(industry: Industry, context: Context): DatabaseSpec[] {
    const baseDb = this.getIndustryDatabases(industry)
    const customized = this.customizeForContext(baseDb, context)
    
    return customized
  }

  private getIndustryDatabases(industry: Industry): DatabaseSpec[] {
    const templates: Record<Industry, DatabaseSpec[]> = {
      ecommerce: [
        {
          key: 'customers',
          title: 'Customer Database',
          description: 'Centralized customer profiles with purchase history and segmentation',
          properties: [
            { name: 'Customer Name', type: 'title' },
            { name: 'Email', type: 'rich_text' },
            { name: 'Phone', type: 'rich_text' },
            { name: 'Segment', type: 'select', options: ['VIP', 'Regular', 'New', 'At Risk'] },
            { name: 'Total Orders', type: 'number' },
            { name: 'Lifetime Value', type: 'number' },
            { name: 'Last Purchase', type: 'date' },
            { name: 'Acquisition Channel', type: 'select', options: ['Organic', 'Paid Ads', 'Social', 'Referral', 'Email'] }
          ],
          default_views: [
            { name: 'All Customers' },
            { name: 'VIP Customers', filter: { 'Segment': 'VIP' } },
            { name: 'At Risk', filter: { 'Segment': 'At Risk' } }
          ]
        },
        {
          key: 'products',
          title: 'Product Catalog',
          description: 'Complete product inventory with performance metrics',
          properties: [
            { name: 'Product Name', type: 'title' },
            { name: 'SKU', type: 'rich_text' },
            { name: 'Category', type: 'select', options: ['Electronics', 'Clothing', 'Home', 'Books', 'Sports'] },
            { name: 'Price', type: 'number' },
            { name: 'Stock Level', type: 'number' },
            { name: 'Sales This Month', type: 'number' },
            { name: 'Profit Margin', type: 'number' },
            { name: 'Status', type: 'select', options: ['Active', 'Discontinued', 'Out of Stock'] }
          ],
          default_views: [
            { name: 'All Products' },
            { name: 'Low Stock', filter: { 'Stock Level': { 'number': { 'less_than': 10 } } } },
            { name: 'Top Sellers' }
          ]
        }
      ],
      saas: [
        {
          key: 'customers',
          title: 'Customer Accounts',
          description: 'SaaS customer accounts with subscription and usage data',
          properties: [
            { name: 'Account Name', type: 'title' },
            { name: 'Contact Email', type: 'rich_text' },
            { name: 'Plan Type', type: 'select', options: ['Free', 'Starter', 'Professional', 'Enterprise'] },
            { name: 'MRR', type: 'number' },
            { name: 'Usage Score', type: 'number' },
            { name: 'Health Score', type: 'number' },
            { name: 'Renewal Date', type: 'date' },
            { name: 'Account Manager', type: 'people' }
          ],
          default_views: [
            { name: 'All Accounts' },
            { name: 'High Value', filter: { 'MRR': { 'number': { 'greater_than': 1000 } } } },
            { name: 'Renewal This Month' }
          ]
        },
        {
          key: 'features',
          title: 'Feature Requests',
          description: 'Product feature requests and development pipeline',
          properties: [
            { name: 'Feature Title', type: 'title' },
            { name: 'Description', type: 'rich_text' },
            { name: 'Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] },
            { name: 'Status', type: 'select', options: ['Requested', 'Planning', 'Development', 'Testing', 'Released'] },
            { name: 'Votes', type: 'number' },
            { name: 'Requesting Customers', type: 'relation', relation: { database: 'customers', synced: true } },
            { name: 'Estimated Effort', type: 'select', options: ['Small', 'Medium', 'Large', 'XL'] }
          ],
          default_views: [
            { name: 'All Features' },
            { name: 'High Priority', filter: { 'Priority': 'High' } },
            { name: 'In Development', filter: { 'Status': 'Development' } }
          ]
        }
      ],
      legal: [
        {
          key: 'cases',
          title: 'Case Management',
          description: 'Legal case tracking and document management',
          properties: [
            { name: 'Case Name', type: 'title' },
            { name: 'Client', type: 'relation', relation: { database: 'clients', synced: true } },
            { name: 'Case Type', type: 'select', options: ['Corporate', 'Litigation', 'Real Estate', 'Family', 'Criminal'] },
            { name: 'Status', type: 'select', options: ['Active', 'Pending', 'Closed', 'On Hold'] },
            { name: 'Lead Attorney', type: 'people' },
            { name: 'Start Date', type: 'date' },
            { name: 'Court Date', type: 'date' },
            { name: 'Billable Hours', type: 'number' }
          ],
          default_views: [
            { name: 'Active Cases' },
            { name: 'Upcoming Court Dates' },
            { name: 'By Attorney' }
          ]
        }
      ],
      consulting: [
        {
          key: 'projects',
          title: 'Client Projects',
          description: 'Consulting project management and deliverables tracking',
          properties: [
            { name: 'Project Name', type: 'title' },
            { name: 'Client', type: 'relation', relation: { database: 'clients', synced: true } },
            { name: 'Project Type', type: 'select', options: ['Strategy', 'Implementation', 'Assessment', 'Training'] },
            { name: 'Status', type: 'select', options: ['Planning', 'Active', 'Review', 'Completed', 'On Hold'] },
            { name: 'Project Manager', type: 'people' },
            { name: 'Start Date', type: 'date' },
            { name: 'End Date', type: 'date' },
            { name: 'Budget', type: 'number' },
            { name: 'Hours Spent', type: 'number' }
          ],
          default_views: [
            { name: 'Active Projects' },
            { name: 'By Client' },
            { name: 'Overdue' }
          ]
        }
      ],
      marketing: [
        {
          key: 'campaigns',
          title: 'Marketing Campaigns',
          description: 'Campaign performance tracking and optimization',
          properties: [
            { name: 'Campaign Name', type: 'title' },
            { name: 'Channel', type: 'select', options: ['Email', 'Social Media', 'PPC', 'Content', 'Events'] },
            { name: 'Status', type: 'select', options: ['Planning', 'Active', 'Paused', 'Completed'] },
            { name: 'Budget', type: 'number' },
            { name: 'Spend', type: 'number' },
            { name: 'Impressions', type: 'number' },
            { name: 'Clicks', type: 'number' },
            { name: 'Conversions', type: 'number' },
            { name: 'CTR', type: 'formula', formula: 'prop("Clicks") / prop("Impressions") * 100' }
          ],
          default_views: [
            { name: 'All Campaigns' },
            { name: 'Active Campaigns' },
            { name: 'Top Performing' }
          ]
        }
      ],
      technology: [
        {
          key: 'projects',
          title: 'Development Projects',
          description: 'Software development project and sprint tracking',
          properties: [
            { name: 'Project Name', type: 'title' },
            { name: 'Repository', type: 'rich_text' },
            { name: 'Status', type: 'select', options: ['Planning', 'Development', 'Testing', 'Deployed', 'Maintenance'] },
            { name: 'Tech Stack', type: 'multi_select', options: ['React', 'Node.js', 'Python', 'Go', 'TypeScript', 'PostgreSQL', 'MongoDB'] },
            { name: 'Lead Developer', type: 'people' },
            { name: 'Sprint', type: 'select', options: ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4'] },
            { name: 'Story Points', type: 'number' },
            { name: 'Completion %', type: 'number' }
          ],
          default_views: [
            { name: 'All Projects' },
            { name: 'Current Sprint' },
            { name: 'By Developer' }
          ]
        }
      ]
    }

    return templates[industry] || templates.technology
  }

  private customizeForContext(databases: DatabaseSpec[], context: Context): DatabaseSpec[] {
    // Add context-specific customizations
    return databases.map(db => {
      // Add team-specific properties if team is large
      if (context.team_size > 20) {
        db.properties.push({
          name: 'Department',
          type: 'select',
          options: ['Sales', 'Marketing', 'Support', 'Engineering', 'Operations']
        })
      }

      // Add constraint-based modifications
      if (context.constraints?.some((c: string) => c.toLowerCase().includes('compliance'))) {
        db.properties.push({
          name: 'Compliance Status',
          type: 'select',
          options: ['Compliant', 'Under Review', 'Non-Compliant']
        })
      }

      return db
    })
  }
}

export const dbGenService = new DbGenService()
