# 🤖 NOTION AI SETUP PROMPT

Copy and paste this entire prompt into Notion AI to automatically set up your developer integration system:

---

**NOTION AI PROMPT:**

```
Create a comprehensive developer integration workspace for tracking GitHub collaboration between me (Ollie) and my developer (wtnelso). I need:

1. **PRIMARY DATABASE: "Ollie's Development Tracker"**
   - Properties needed:
     * Task Title (Title)
     * GitHub PR (GitHub Pull Requests) - connect to https://github.com/OBTRICE1658/-homeops-agent
     * Status (Select): Draft, In Progress, Review, Approved, Merged, Deployed
     * Priority (Select): P0-Critical, P1-High, P2-Medium, P3-Low
     * Developer Review (Person) - for @wtnelso tagging
     * Branch Name (Text) - format: ollie-enhanced-YYYYMMDD
     * Files Changed (Multi-select)
     * Impact Level (Select): Low, Medium, High, Critical
     * Screenshots (Files & Media)
     * Business Context (Rich Text)
     * Technical Notes (Rich Text)
     * Due Date (Date)
     * Created Date (Created time)

2. **SECONDARY DATABASE: "Developer Updates Monitor"**
   - Properties needed:
     * Update Title (Title)
     * GitHub Item (GitHub Pull Requests) - connect to https://github.com/wtnelso/-homeops-agent
     * Type (Select): New Feature, Bug Fix, Enhancement, Breaking Change
     * Priority Assessment (Select): Must Review, Nice to Know, Plan Response
     * Our Response Plan (Rich Text)
     * Impact on Our Work (Rich Text)
     * Follow-up Needed (Checkbox)
     * Date Discovered (Created time)

3. **TEMPLATE: Change Request**
   Create a template with this structure:
   ```
   # 🔄 Change Request: [TITLE]
   
   ## 📝 Summary
   Brief description of what I'm changing and why
   
   ## 🎯 Business Context  
   - Problem being solved:
   - Expected outcome:
   - Success metrics:
   
   ## 🔧 Technical Details
   - Files modified:
   - Key changes:
   - Dependencies:
   
   ## 👥 Developer Sync
   - @wtnelso please review
   - Questions/concerns:
   - Approval needed by:
   
   ## 🚀 Deployment Plan
   - Merge to: [branch name]
   - Deploy date:
   - Rollback plan:
   ```

4. **TEMPLATE: Weekly Sync Report**
   ```
   # 📅 Weekly Sync: [Date Range]
   
   ## ✅ Completed This Week
   - Feature 1: [description + commit link]
   - Feature 2: [description + commit link]
   
   ## 🚧 In Progress  
   - Feature: [status, blockers, ETA]
   
   ## 🔄 Developer Updates Reviewed
   - [List items from developer monitoring]
   
   ## 🤝 Next Week Coordination
   - Priority discussions needed:
   - Approvals requested:
   ```

5. **DASHBOARD PAGE: "Development Command Center"**
   - Embed both databases with filtered views:
     * My Active Tasks (Status ≠ Merged)
     * Pending Developer Review (Status = Review)
     * Recent Developer Updates (Last 7 days)
     * High Priority Items (P0, P1)
   - Add quick action buttons for:
     * New Change Request
     * Weekly Sync Report
     * Safety Check Reminder

6. **AUTOMATION RULES** (if possible):
   - When GitHub PR status changes → Update Notion status
   - When Priority = P0 → Notify via email/Slack
   - When Developer Review person added → Send notification

7. **CUSTOM VIEWS:**
   - "Sprint Planning" - Group by Priority, Filter by Status
   - "Developer Coordination" - Filter by needs review
   - "Timeline View" - Calendar view by Due Date
   - "Impact Analysis" - Group by Impact Level

Please set this up as a complete workspace with all databases, templates, and views ready to use immediately. Include sample entries showing the workflow in action.
```

---

**ADDITIONAL NOTION AI FOLLOW-UP PROMPTS:**

After the initial setup, use these prompts for specific enhancements:

**For GitHub Integration:**
```
Help me connect the GitHub Pull Requests property to sync automatically with these repositories:
- Primary: https://github.com/OBTRICE1658/-homeops-agent (my work)
- Monitor: https://github.com/wtnelso/-homeops-agent (developer updates)

Create filtered views that separate my PRs from developer PRs and show sync status.
```

**For Workflow Automation:**
```
Create a complete workflow template that guides me through:
1. Creating a new development task
2. Linking it to a GitHub branch
3. Tracking progress with developer
4. Managing approvals and deployment
5. Post-completion review

Include checklists and automation where possible.
```

**For Dashboard Enhancement:**
```
Design a master dashboard that shows:
- My current development pipeline (kanban style)
- Developer activity feed (what they're working on)
- Coordination items needing my attention
- Weekly/monthly progress metrics
- Safety reminders and quick actions

Make it executive-friendly but technically detailed.
```
