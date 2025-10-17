import { Client } from '@notionhq/client'

let notion: Client | null = null

if (process.env.NOTION_TOKEN) {
  notion = new Client({
    auth: process.env.NOTION_TOKEN,
  })
} else {
  console.warn('NOTION_TOKEN not provided - Notion integration will be disabled')
}

export { notion }
