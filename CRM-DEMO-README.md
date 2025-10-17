# Legacy CRM Demo

An interactive demo showcasing the limitations of legacy CRM systems with AI agents. Designed to be embedded in Notion.

## Quick Deploy to Netlify

1. **Install Netlify CLI** (if not already installed):
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy the demo**:
   ```bash
   ./deploy-crm.sh
   ```

3. **Embed in Notion**:
   - Copy the Live URL from Netlify
   - In Notion, type `/embed`
   - Paste the URL
   - Set height to 800px for optimal viewing

## Manual Deployment

If you prefer manual deployment:

1. **Login to Netlify**:
   ```bash
   netlify login
   ```

2. **Deploy**:
   ```bash
   netlify deploy --prod --dir=.
   ```

## Demo Features

- Interactive AI query interface
- Realistic legacy system responses
- Professional CRM-like design
- Optimized for Notion embedding
- Demonstrates limitations of legacy architecture with AI agents

## Files

- `crm-demo-standalone.html` - Main demo file
- `index.html` - Redirect to demo
- `netlify.toml` - Netlify configuration
- `deploy-crm.sh` - Deployment script

## Usage in Notion

Once deployed, the demo works perfectly when embedded in Notion pages. Users can:

1. Ask the AI assistant questions about customer churn
2. See realistic but limited responses from legacy systems
3. Understand why modern architecture is needed for actionable AI insights
