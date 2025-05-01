import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { RecruitmentEvent, EventRegistration, EventMaterial } from '../models/types';
import { useTalentPool } from './TalentPoolContext';

// Context interface
interface EventManagementContextType {
  // State
  events: RecruitmentEvent[];
  isLoading: boolean;
  error: string | null;

  // Event operations
  createEvent: (
    event: Omit<RecruitmentEvent, 'id' | 'createdAt' | 'updatedAt' | 'registrations' | 'materials'>
  ) => Promise<RecruitmentEvent>;
  updateEvent: (id: string, updates: Partial<RecruitmentEvent>) => Promise<RecruitmentEvent>;
  deleteEvent: (id: string) => Promise<boolean>;

  // Registration operations
  registerCandidate: (
    eventId: string,
    registration: Omit<EventRegistration, 'id' | 'eventId' | 'registrationDate'>
  ) => Promise<EventRegistration>;
  updateRegistration: (
    eventId: string,
    registrationId: string,
    updates: Partial<EventRegistration>
  ) => Promise<EventRegistration>;
  markAttendance: (
    eventId: string,
    registrationId: string,
    attended: boolean
  ) => Promise<EventRegistration>;

  // Material operations
  addEventMaterial: (
    eventId: string,
    material: Omit<EventMaterial, 'id' | 'eventId'>
  ) => Promise<EventMaterial>;
  updateEventMaterial: (
    eventId: string,
    materialId: string,
    updates: Partial<EventMaterial>
  ) => Promise<EventMaterial>;
  removeEventMaterial: (eventId: string, materialId: string) => Promise<boolean>;

  // Event analytics
  getEventAttendanceRate: (eventId: string) => Promise<number>;
  getEventStats: (eventId: string) => Promise<{
    registrationCount: number;
    attendeeCount: number;
    attendanceRate: number;
    resumeSubmissionRate: number;
    conversionRate: number;
    totalCost: number;
    costPerAttendee: number;
  }>;
  getRegistrationsByEmail: (email: string) => EventRegistration[];

  // Talent pool integration
  assignRegistrantsToTalentPool: (eventId: string, talentPoolId: string) => Promise<number>;
}

// Sample data
const sampleEvents: RecruitmentEvent[] = [
  {
    id: 'event-1',
    name: 'Tech Career Fair 2023',
    type: 'Career Fair',
    startDate: new Date('2023-09-15T09:00:00').toISOString(),
    endDate: new Date('2023-09-15T17:00:00').toISOString(),
    location: 'Downtown Convention Center',
    virtual: false,
    description: 'Annual tech career fair targeting software engineers and data scientists',
    budget: 5000,
    expectedAttendees: 300,
    actualAttendees: 275,
    registrations: [
      {
        id: 'reg-1',
        eventId: 'event-1',
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael.chen@example.com',
        phone: '555-123-4567',
        registrationDate: new Date('2023-08-10').toISOString(),
        attended: true,
        resumeUploaded: true,
        resumeUrl: 'https://storage.example.com/resumes/michaelchen.pdf',
        talentPoolAssigned: 'pool-1',
        followUpStatus: 'Contacted',
      },
      {
        id: 'reg-2',
        eventId: 'event-1',
        firstName: 'Sophia',
        lastName: 'Rodriguez',
        email: 'sophia.rodriguez@example.com',
        registrationDate: new Date('2023-08-12').toISOString(),
        attended: true,
        resumeUploaded: true,
        resumeUrl: 'https://storage.example.com/resumes/sophiarodriguez.pdf',
        talentPoolAssigned: 'pool-1',
        followUpStatus: 'Responded',
      },
      {
        id: 'reg-3',
        eventId: 'event-1',
        firstName: 'David',
        lastName: 'Kim',
        email: 'david.kim@example.com',
        phone: '555-987-6543',
        registrationDate: new Date('2023-08-15').toISOString(),
        attended: false,
        resumeUploaded: false,
      },
    ],
    team: ['user-101', 'user-102', 'user-103'],
    status: 'Completed',
    materials: [
      {
        id: 'material-1',
        eventId: 'event-1',
        name: 'Company Brochures',
        type: 'Handout',
        quantity: 500,
        cost: 750,
        notes: 'Double-sided, full color',
      },
      {
        id: 'material-2',
        eventId: 'event-1',
        name: 'Company Overview Presentation',
        type: 'Presentation',
        url: 'https://storage.example.com/presentations/company_overview.pptx',
      },
      {
        id: 'material-3',
        eventId: 'event-1',
        name: 'Branded Pens',
        type: 'Swag',
        quantity: 400,
        cost: 600,
      },
    ],
    notes: 'Great turnout with high-quality candidates. Consider booking a larger venue next year.',
    createdAt: new Date('2023-06-01').toISOString(),
    updatedAt: new Date('2023-09-16').toISOString(),
  },
  {
    id: 'event-2',
    name: 'Virtual Engineering Mixer',
    type: 'Networking',
    startDate: new Date('2023-10-05T18:00:00').toISOString(),
    endDate: new Date('2023-10-05T20:00:00').toISOString(),
    location: 'Online',
    virtual: true,
    virtualLink: 'https://zoom.us/j/example',
    description: 'Virtual networking event for software engineers to meet our team',
    budget: 1000,
    expectedAttendees: 50,
    registrations: [
      {
        id: 'reg-4',
        eventId: 'event-2',
        firstName: 'Emily',
        lastName: 'Johnson',
        email: 'emily.johnson@example.com',
        registrationDate: new Date('2023-09-15').toISOString(),
        attended: false,
        resumeUploaded: true,
        resumeUrl: 'https://storage.example.com/resumes/emilyjohnson.pdf',
      },
      {
        id: 'reg-5',
        eventId: 'event-2',
        firstName: 'James',
        lastName: 'Wilson',
        email: 'james.wilson@example.com',
        phone: '555-222-3333',
        registrationDate: new Date('2023-09-18').toISOString(),
        attended: false,
        resumeUploaded: false,
      },
    ],
    team: ['user-101', 'user-104'],
    status: 'Active',
    materials: [
      {
        id: 'material-4',
        eventId: 'event-2',
        name: 'Digital Information Packet',
        type: 'Handout',
        url: 'https://storage.example.com/materials/info_packet.pdf',
      },
    ],
    notes: 'Prepare technical demonstrations for the virtual event',
    createdAt: new Date('2023-08-15').toISOString(),
    updatedAt: new Date('2023-09-20').toISOString(),
  },
];

// Create the context
const EventManagementContext = createContext<EventManagementContextType | undefined>(undefined);

// Provider component
export const EventManagementProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<RecruitmentEvent[]>(sampleEvents);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { addCandidateToPool } = useTalentPool();

  // Event operations
  const createEvent = useCallback(
    async (
      event: Omit<
        RecruitmentEvent,
        'id' | 'createdAt' | 'updatedAt' | 'registrations' | 'materials'
      >
    ): Promise<RecruitmentEvent> => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        const newEvent: RecruitmentEvent = {
          ...event,
          id: `event-${Date.now()}`,
          registrations: [],
          materials: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setEvents((prev) => [...prev, newEvent]);
        return newEvent;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create event';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updateEvent = useCallback(
    async (id: string, updates: Partial<RecruitmentEvent>): Promise<RecruitmentEvent> => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        const eventIndex = events.findIndex((event) => event.id === id);
        if (eventIndex === -1) {
          throw new Error('Event not found');
        }

        const updatedEvent = {
          ...events[eventIndex],
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        const newEvents = [...events];
        newEvents[eventIndex] = updatedEvent;
        setEvents(newEvents);

        return updatedEvent;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update event';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [events]
  );

  const deleteEvent = useCallback(
    async (id: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        const eventIndex = events.findIndex((event) => event.id === id);
        if (eventIndex === -1) {
          throw new Error('Event not found');
        }

        // Check if event has already occurred
        const event = events[eventIndex];
        const now = new Date().toISOString();
        if (event.endDate < now && event.status === 'Completed') {
          throw new Error('Cannot delete a completed event');
        }

        setEvents(events.filter((event) => event.id !== id));
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete event';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [events]
  );

  // Registration operations
  const registerCandidate = useCallback(
    async (
      eventId: string,
      registration: Omit<EventRegistration, 'id' | 'eventId' | 'registrationDate'>
    ): Promise<EventRegistration> => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        const eventIndex = events.findIndex((event) => event.id === eventId);
        if (eventIndex === -1) {
          throw new Error('Event not found');
        }

        // Check if the event is still open for registration
        const event = events[eventIndex];
        const now = new Date().toISOString();
        if (event.startDate < now && event.status !== 'Planned' && event.status !== 'Active') {
          throw new Error('Event is no longer open for registration');
        }

        // Check if the email is already registered
        const existingRegistration = event.registrations.find(
          (reg) => reg.email === registration.email
        );
        if (existingRegistration) {
          throw new Error('Email is already registered for this event');
        }

        const newRegistration: EventRegistration = {
          ...registration,
          id: `reg-${Date.now()}`,
          eventId,
          registrationDate: new Date().toISOString(),
          attended: false,
        };

        const updatedEvent = {
          ...event,
          registrations: [...event.registrations, newRegistration],
          updatedAt: new Date().toISOString(),
        };

        const newEvents = [...events];
        newEvents[eventIndex] = updatedEvent;
        setEvents(newEvents);

        return newRegistration;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to register candidate';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [events]
  );

  const updateRegistration = useCallback(
    async (
      eventId: string,
      registrationId: string,
      updates: Partial<EventRegistration>
    ): Promise<EventRegistration> => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 400));

        const eventIndex = events.findIndex((event) => event.id === eventId);
        if (eventIndex === -1) {
          throw new Error('Event not found');
        }

        const registrationIndex = events[eventIndex].registrations.findIndex(
          (reg) => reg.id === registrationId
        );
        if (registrationIndex === -1) {
          throw new Error('Registration not found');
        }

        const updatedRegistration = {
          ...events[eventIndex].registrations[registrationIndex],
          ...updates,
        };

        const updatedRegistrations = [...events[eventIndex].registrations];
        updatedRegistrations[registrationIndex] = updatedRegistration;

        const updatedEvent = {
          ...events[eventIndex],
          registrations: updatedRegistrations,
          updatedAt: new Date().toISOString(),
        };

        const newEvents = [...events];
        newEvents[eventIndex] = updatedEvent;
        setEvents(newEvents);

        return updatedRegistration;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update registration';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [events]
  );

  const markAttendance = useCallback(
    async (
      eventId: string,
      registrationId: string,
      attended: boolean
    ): Promise<EventRegistration> => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 300));

        const eventIndex = events.findIndex((event) => event.id === eventId);
        if (eventIndex === -1) {
          throw new Error('Event not found');
        }

        const registrationIndex = events[eventIndex].registrations.findIndex(
          (reg) => reg.id === registrationId
        );
        if (registrationIndex === -1) {
          throw new Error('Registration not found');
        }

        const updatedRegistration = {
          ...events[eventIndex].registrations[registrationIndex],
          attended,
        };

        const updatedRegistrations = [...events[eventIndex].registrations];
        updatedRegistrations[registrationIndex] = updatedRegistration;

        // Update actual attendees count if necessary
        const attendeeCount = updatedRegistrations.filter((reg) => reg.attended).length;

        const updatedEvent = {
          ...events[eventIndex],
          registrations: updatedRegistrations,
          actualAttendees: attendeeCount,
          updatedAt: new Date().toISOString(),
        };

        const newEvents = [...events];
        newEvents[eventIndex] = updatedEvent;
        setEvents(newEvents);

        return updatedRegistration;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to mark attendance';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [events]
  );

  // Material operations
  const addEventMaterial = useCallback(
    async (
      eventId: string,
      material: Omit<EventMaterial, 'id' | 'eventId'>
    ): Promise<EventMaterial> => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 400));

        const eventIndex = events.findIndex((event) => event.id === eventId);
        if (eventIndex === -1) {
          throw new Error('Event not found');
        }

        const newMaterial: EventMaterial = {
          ...material,
          id: `material-${Date.now()}`,
          eventId,
        };

        const updatedEvent = {
          ...events[eventIndex],
          materials: [...events[eventIndex].materials, newMaterial],
          updatedAt: new Date().toISOString(),
        };

        const newEvents = [...events];
        newEvents[eventIndex] = updatedEvent;
        setEvents(newEvents);

        return newMaterial;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add event material';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [events]
  );

  const updateEventMaterial = useCallback(
    async (
      eventId: string,
      materialId: string,
      updates: Partial<EventMaterial>
    ): Promise<EventMaterial> => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 400));

        const eventIndex = events.findIndex((event) => event.id === eventId);
        if (eventIndex === -1) {
          throw new Error('Event not found');
        }

        const materialIndex = events[eventIndex].materials.findIndex(
          (material) => material.id === materialId
        );
        if (materialIndex === -1) {
          throw new Error('Material not found');
        }

        const updatedMaterial = {
          ...events[eventIndex].materials[materialIndex],
          ...updates,
        };

        const updatedMaterials = [...events[eventIndex].materials];
        updatedMaterials[materialIndex] = updatedMaterial;

        const updatedEvent = {
          ...events[eventIndex],
          materials: updatedMaterials,
          updatedAt: new Date().toISOString(),
        };

        const newEvents = [...events];
        newEvents[eventIndex] = updatedEvent;
        setEvents(newEvents);

        return updatedMaterial;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update event material';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [events]
  );

  const removeEventMaterial = useCallback(
    async (eventId: string, materialId: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 300));

        const eventIndex = events.findIndex((event) => event.id === eventId);
        if (eventIndex === -1) {
          throw new Error('Event not found');
        }

        const materialIndex = events[eventIndex].materials.findIndex(
          (material) => material.id === materialId
        );
        if (materialIndex === -1) {
          throw new Error('Material not found');
        }

        const updatedEvent = {
          ...events[eventIndex],
          materials: events[eventIndex].materials.filter((material) => material.id !== materialId),
          updatedAt: new Date().toISOString(),
        };

        const newEvents = [...events];
        newEvents[eventIndex] = updatedEvent;
        setEvents(newEvents);

        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to remove event material';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [events]
  );

  // Event analytics
  const getEventAttendanceRate = useCallback(
    async (eventId: string): Promise<number> => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 300));

        const event = events.find((event) => event.id === eventId);
        if (!event) {
          throw new Error('Event not found');
        }

        const registrations = event.registrations;
        if (registrations.length === 0) {
          return 0;
        }

        const attendees = registrations.filter((reg) => reg.attended).length;
        return attendees / registrations.length;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to get attendance rate';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [events]
  );

  const getEventStats = useCallback(
    async (
      eventId: string
    ): Promise<{
      registrationCount: number;
      attendeeCount: number;
      attendanceRate: number;
      resumeSubmissionRate: number;
      conversionRate: number;
      totalCost: number;
      costPerAttendee: number;
    }> => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        const event = events.find((event) => event.id === eventId);
        if (!event) {
          throw new Error('Event not found');
        }

        const registrations = event.registrations;
        const registrationCount = registrations.length;
        const attendeeCount = registrations.filter((reg) => reg.attended).length;
        const attendanceRate = registrationCount > 0 ? attendeeCount / registrationCount : 0;

        const resumeSubmissions = registrations.filter((reg) => reg.resumeUploaded).length;
        const resumeSubmissionRate =
          registrationCount > 0 ? resumeSubmissions / registrationCount : 0;

        // Conversion is defined as registrants who were assigned to a talent pool
        const conversions = registrations.filter((reg) => reg.talentPoolAssigned).length;
        const conversionRate = registrationCount > 0 ? conversions / registrationCount : 0;

        // Calculate total cost from the budget and materials
        const materialsCost = event.materials.reduce(
          (sum, material) => sum + (material.cost || 0),
          0
        );
        const totalCost = (event.budget || 0) + materialsCost;

        const costPerAttendee = attendeeCount > 0 ? totalCost / attendeeCount : 0;

        return {
          registrationCount,
          attendeeCount,
          attendanceRate,
          resumeSubmissionRate,
          conversionRate,
          totalCost,
          costPerAttendee,
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to get event stats';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [events]
  );

  const getRegistrationsByEmail = useCallback(
    (email: string): EventRegistration[] => {
      // Collect all registrations across all events for the given email
      return events.flatMap((event) => event.registrations.filter((reg) => reg.email === email));
    },
    [events]
  );

  // Talent pool integration
  const assignRegistrantsToTalentPool = useCallback(
    async (eventId: string, talentPoolId: string): Promise<number> => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));

        const eventIndex = events.findIndex((event) => event.id === eventId);
        if (eventIndex === -1) {
          throw new Error('Event not found');
        }

        const event = events[eventIndex];

        // Get candidates who attended and don't have a talent pool assigned yet
        const eligibleRegistrations = event.registrations.filter(
          (reg) => reg.attended && !reg.talentPoolAssigned
        );

        if (eligibleRegistrations.length === 0) {
          return 0;
        }

        // Update each eligible registration
        const updatedRegistrations = [...event.registrations];
        let count = 0;

        for (const reg of eligibleRegistrations) {
          // Find the index of the registration to update
          const regIndex = updatedRegistrations.findIndex((r) => r.id === reg.id);
          if (regIndex !== -1) {
            // Update the registration
            updatedRegistrations[regIndex] = {
              ...updatedRegistrations[regIndex],
              talentPoolAssigned: talentPoolId,
              followUpStatus: 'Pending',
            };
            count++;

            // If the candidate has a candidateId, add them to the talent pool
            if (reg.candidateId) {
              try {
                await addCandidateToPool(talentPoolId, reg.candidateId);
              } catch (err) {
                console.error(`Failed to add candidate ${reg.candidateId} to talent pool:`, err);
                // Continue processing other candidates
              }
            }
          }
        }

        // Update the event with the new registrations
        const updatedEvent = {
          ...event,
          registrations: updatedRegistrations,
          updatedAt: new Date().toISOString(),
        };

        const newEvents = [...events];
        newEvents[eventIndex] = updatedEvent;
        setEvents(newEvents);

        return count;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to assign registrants to talent pool';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [events, addCandidateToPool]
  );

  // Context value
  const contextValue: EventManagementContextType = {
    events,
    isLoading,
    error,

    createEvent,
    updateEvent,
    deleteEvent,

    registerCandidate,
    updateRegistration,
    markAttendance,

    addEventMaterial,
    updateEventMaterial,
    removeEventMaterial,

    getEventAttendanceRate,
    getEventStats,
    getRegistrationsByEmail,

    assignRegistrantsToTalentPool,
  };

  return (
    <EventManagementContext.Provider value={contextValue}>
      {children}
    </EventManagementContext.Provider>
  );
};

// Custom hook for using the context
export const useEventManagement = () => {
  const context = useContext(EventManagementContext);

  if (context === undefined) {
    throw new Error('useEventManagement must be used within an EventManagementProvider');
  }

  return context;
};

export default EventManagementContext;
