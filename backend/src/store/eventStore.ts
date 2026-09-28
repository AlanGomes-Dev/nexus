import { NexusEvent } from '../types/events.js'

const events: NexusEvent[] = []

export function addEvent(event: NexusEvent): NexusEvent {
  const eventWithTimestamp: NexusEvent = {
    ...event,
    timestamp: event.timestamp ?? new Date().toISOString(),
  }

  events.push(eventWithTimestamp)

  return eventWithTimestamp
}

export function getEvents(): NexusEvent[] {
  return events
}

export function getEventCount(): number {
  return events.length
}