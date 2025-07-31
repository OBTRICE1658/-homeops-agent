// services/calendar-sync.js
// Comprehensive bidirectional Google Calendar sync service

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

class CalendarSyncService {
  constructor(oauth2Client) {
    this.auth = oauth2Client;
    this.calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    this.syncTokenPath = path.join(__dirname, '..', 'calendar-sync-token.json');
    this.localEventsPath = path.join(__dirname, '..', 'local-events.json');
  }

  // ===== CORE SYNC METHODS =====

  async fullBidirectionalSync() {
    console.log('🔄 Starting full bidirectional calendar sync...');
    
    try {
      // 1. Pull changes from Google Calendar
      const googleEvents = await this.pullFromGoogle();
      
      // 2. Load local events
      const localEvents = this.loadLocalEvents();
      
      // 3. Resolve conflicts and merge
      const mergedEvents = await this.mergeEvents(googleEvents, localEvents);
      
      // 4. Push changes back to Google
      await this.pushToGoogle(mergedEvents);
      
      // 5. Update local storage
      this.saveLocalEvents(mergedEvents);
      
      console.log('✅ Bidirectional sync completed');
      return {
        success: true,
        totalEvents: mergedEvents.length,
        lastSync: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Sync failed:', error);
      throw error;
    }
  }

  // ===== PULL FROM GOOGLE CALENDAR =====

  async pullFromGoogle() {
    console.log('📥 Pulling events from Google Calendar...');
    
    try {
      const syncToken = this.loadSyncToken();
      const timeMin = new Date().toISOString();
      const timeMax = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // 1 year

      let allEvents = [];
      let pageToken = null;

      do {
        const params = {
          calendarId: 'primary',
          singleEvents: true,
          orderBy: 'startTime',
          ...(syncToken ? { syncToken } : { timeMin, timeMax }),
          ...(pageToken && { pageToken })
        };

        const response = await this.calendar.events.list(params);
        
        if (response.data.items) {
          allEvents = allEvents.concat(response.data.items);
        }

        pageToken = response.data.nextPageToken;

        // Save new sync token for incremental sync
        if (response.data.nextSyncToken) {
          this.saveSyncToken(response.data.nextSyncToken);
        }

      } while (pageToken);

      console.log(`✅ Pulled ${allEvents.length} events from Google Calendar`);
      return allEvents;

    } catch (error) {
      if (error.code === 410) {
        // Sync token expired, do full sync
        console.log('🔄 Sync token expired, performing full sync...');
        this.clearSyncToken();
        return this.pullFromGoogle();
      }
      throw error;
    }
  }

  // ===== PUSH TO GOOGLE CALENDAR =====

  async pushToGoogle(events) {
    console.log('📤 Pushing events to Google Calendar...');
    
    let created = 0, updated = 0, deleted = 0;

    for (const event of events) {
      try {
        if (event._homeops_action === 'create') {
          await this.createGoogleEvent(event);
          created++;
        } else if (event._homeops_action === 'update' && event.id) {
          await this.updateGoogleEvent(event);
          updated++;
        } else if (event._homeops_action === 'delete' && event.id) {
          await this.deleteGoogleEvent(event.id);
          deleted++;
        }
      } catch (error) {
        console.error(`❌ Failed to sync event ${event.id}:`, error.message);
      }
    }

    console.log(`✅ Pushed to Google: ${created} created, ${updated} updated, ${deleted} deleted`);
    return { created, updated, deleted };
  }

  async createGoogleEvent(event) {
    const googleEvent = this.convertToGoogleFormat(event);
    const response = await this.calendar.events.insert({
      calendarId: 'primary',
      resource: googleEvent,
    });
    
    // Update local event with Google ID
    event.id = response.data.id;
    event.googleId = response.data.id;
    delete event._homeops_action;
    
    return response.data;
  }

  async updateGoogleEvent(event) {
    const googleEvent = this.convertToGoogleFormat(event);
    const response = await this.calendar.events.update({
      calendarId: 'primary',
      eventId: event.googleId || event.id,
      resource: googleEvent,
    });
    
    delete event._homeops_action;
    return response.data;
  }

  async deleteGoogleEvent(eventId) {
    await this.calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
    });
  }

  // ===== EVENT MERGING AND CONFLICT RESOLUTION =====

  async mergeEvents(googleEvents, localEvents) {
    console.log('🔀 Merging Google and local events...');
    
    const merged = new Map();
    
    // Add Google events (source of truth for existing events)
    googleEvents.forEach(event => {
      if (event.status !== 'cancelled') {
        const homeopsEvent = this.convertToHomeOpsFormat(event);
        merged.set(event.id, homeopsEvent);
      }
    });
    
    // Process local events
    localEvents.forEach(localEvent => {
      const existingEvent = merged.get(localEvent.googleId || localEvent.id);
      
      if (existingEvent) {
        // Conflict resolution: Google wins for basic data, HomeOps wins for custom fields
        const resolvedEvent = this.resolveConflict(existingEvent, localEvent);
        merged.set(localEvent.googleId || localEvent.id, resolvedEvent);
      } else if (localEvent._homeops_new) {
        // New local event to be created in Google
        localEvent._homeops_action = 'create';
        merged.set(localEvent.tempId || `temp_${Date.now()}`, localEvent);
      }
    });
    
    return Array.from(merged.values());
  }

  resolveConflict(googleEvent, localEvent) {
    console.log(`🔧 Resolving conflict for event: ${googleEvent.summary}`);
    
    // Google Calendar wins for: title, time, location, description
    // HomeOps wins for: custom fields, AI insights, user preferences
    return {
      ...googleEvent,
      // HomeOps custom fields
      homeops_category: localEvent.homeops_category,
      homeops_priority: localEvent.homeops_priority,
      homeops_ai_insights: localEvent.homeops_ai_insights,
      homeops_user_notes: localEvent.homeops_user_notes,
      homeops_last_modified: localEvent.homeops_last_modified,
      // Check if basic fields were modified locally and need updating
      _homeops_action: this.needsUpdate(googleEvent, localEvent) ? 'update' : undefined
    };
  }

  needsUpdate(googleEvent, localEvent) {
    // Check if local event has newer modifications to basic fields
    const googleModified = new Date(googleEvent.updated);
    const localModified = new Date(localEvent.homeops_last_modified || 0);
    
    return localModified > googleModified;
  }

  // ===== FORMAT CONVERSION =====

  convertToGoogleFormat(homeopsEvent) {
    return {
      summary: homeopsEvent.title || homeopsEvent.summary,
      description: homeopsEvent.description,
      location: homeopsEvent.location,
      start: {
        dateTime: homeopsEvent.start?.dateTime || homeopsEvent.startTime,
        timeZone: homeopsEvent.start?.timeZone || 'America/New_York',
      },
      end: {
        dateTime: homeopsEvent.end?.dateTime || homeopsEvent.endTime,
        timeZone: homeopsEvent.end?.timeZone || 'America/New_York',
      },
      // Store HomeOps metadata in extended properties
      extendedProperties: {
        private: {
          homeops_category: homeopsEvent.homeops_category,
          homeops_priority: homeopsEvent.homeops_priority,
          homeops_ai_insights: JSON.stringify(homeopsEvent.homeops_ai_insights || {}),
        }
      }
    };
  }

  convertToHomeOpsFormat(googleEvent) {
    return {
      id: googleEvent.id,
      googleId: googleEvent.id,
      title: googleEvent.summary,
      summary: googleEvent.summary,
      description: googleEvent.description,
      location: googleEvent.location,
      startTime: googleEvent.start?.dateTime,
      endTime: googleEvent.end?.dateTime,
      start: googleEvent.start,
      end: googleEvent.end,
      created: googleEvent.created,
      updated: googleEvent.updated,
      // HomeOps custom fields from extended properties
      homeops_category: googleEvent.extendedProperties?.private?.homeops_category,
      homeops_priority: googleEvent.extendedProperties?.private?.homeops_priority,
      homeops_ai_insights: this.parseJSON(googleEvent.extendedProperties?.private?.homeops_ai_insights),
      homeops_last_sync: new Date().toISOString(),
    };
  }

  parseJSON(str) {
    try {
      return str ? JSON.parse(str) : {};
    } catch {
      return {};
    }
  }

  // ===== LOCAL STORAGE MANAGEMENT =====

  loadLocalEvents() {
    try {
      if (fs.existsSync(this.localEventsPath)) {
        const data = fs.readFileSync(this.localEventsPath, 'utf8');
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('❌ Error loading local events:', error);
      return [];
    }
  }

  saveLocalEvents(events) {
    try {
      fs.writeFileSync(this.localEventsPath, JSON.stringify(events, null, 2));
      console.log(`✅ Saved ${events.length} events locally`);
    } catch (error) {
      console.error('❌ Error saving local events:', error);
    }
  }

  loadSyncToken() {
    try {
      if (fs.existsSync(this.syncTokenPath)) {
        const data = fs.readFileSync(this.syncTokenPath, 'utf8');
        return JSON.parse(data).token;
      }
      return null;
    } catch {
      return null;
    }
  }

  saveSyncToken(token) {
    try {
      fs.writeFileSync(this.syncTokenPath, JSON.stringify({ 
        token, 
        updated: new Date().toISOString() 
      }));
    } catch (error) {
      console.error('❌ Error saving sync token:', error);
    }
  }

  clearSyncToken() {
    try {
      if (fs.existsSync(this.syncTokenPath)) {
        fs.unlinkSync(this.syncTokenPath);
      }
    } catch (error) {
      console.error('❌ Error clearing sync token:', error);
    }
  }

  // ===== PUBLIC API METHODS =====

  async addEvent(eventData) {
    console.log('➕ Adding new event:', eventData.title);
    
    // Create in Google Calendar first
    const googleEvent = await this.createGoogleEvent({
      ...eventData,
      _homeops_new: true
    });
    
    // Add to local storage
    const localEvents = this.loadLocalEvents();
    const homeopsEvent = this.convertToHomeOpsFormat(googleEvent);
    localEvents.push(homeopsEvent);
    this.saveLocalEvents(localEvents);
    
    return homeopsEvent;
  }

  async updateEvent(eventId, updates) {
    console.log('✏️ Updating event:', eventId);
    
    const localEvents = this.loadLocalEvents();
    const eventIndex = localEvents.findIndex(e => e.id === eventId || e.googleId === eventId);
    
    if (eventIndex === -1) {
      throw new Error('Event not found');
    }
    
    // Update local event
    localEvents[eventIndex] = { ...localEvents[eventIndex], ...updates };
    localEvents[eventIndex].homeops_last_modified = new Date().toISOString();
    localEvents[eventIndex]._homeops_action = 'update';
    
    // Update in Google Calendar
    await this.updateGoogleEvent(localEvents[eventIndex]);
    
    this.saveLocalEvents(localEvents);
    return localEvents[eventIndex];
  }

  async deleteEvent(eventId) {
    console.log('🗑️ Deleting event:', eventId);
    
    // Delete from Google Calendar
    await this.deleteGoogleEvent(eventId);
    
    // Remove from local storage
    const localEvents = this.loadLocalEvents();
    const filteredEvents = localEvents.filter(e => e.id !== eventId && e.googleId !== eventId);
    this.saveLocalEvents(filteredEvents);
    
    return true;
  }

  async getEvents(timeMin, timeMax) {
    const localEvents = this.loadLocalEvents();
    
    if (!timeMin && !timeMax) {
      return localEvents;
    }
    
    return localEvents.filter(event => {
      const eventStart = new Date(event.startTime);
      const start = timeMin ? new Date(timeMin) : new Date(0);
      const end = timeMax ? new Date(timeMax) : new Date('2099-12-31');
      
      return eventStart >= start && eventStart <= end;
    });
  }
}

module.exports = CalendarSyncService;
