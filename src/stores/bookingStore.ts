import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface BookingData {
  serviceType: string;
  pickupLocation: string;
  dropoffLocation?: string;
  scheduledDateTime?: string;
  passengers?: number;
  packageSelection?: string;
  packageDetails?: {
    id: string;
    name: string;
    duration_hours: number;
    included_kilometers: number;
    vehicle_type: string;
    base_fare: number;
  };
  carType?: string;
  selectedFare?: {
    type: string;
    price: number;
  };
  isRoundTrip?: boolean;
  returnDateTime?: string;
  tripType?: string;
  specialInstructions?: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  dropoffLatitude?: number;
  dropoffLongitude?: number;
  vehicleType?: string;
  distanceKm?: number;
  durationMinutes?: number;
  
}

interface BookingStore {
  // State
  bookingData: BookingData;
  currentStep: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  setBookingData: (data: Partial<BookingData>) => void;
  resetBookingData: () => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const initialBookingData: BookingData = {
  serviceType: "ride_later",
  pickupLocation: "",
  dropoffLocation: "",
  scheduledDateTime: "",
  passengers: 1,
  packageSelection: "",
  carType: "",
  selectedFare: undefined,
  isRoundTrip: false,
  returnDateTime: "",
  tripType: "",
  specialInstructions: "",
  pickupLatitude: undefined,
  pickupLongitude: undefined,
  dropoffLatitude: undefined,
  dropoffLongitude: undefined,
  vehicleType: "",
  distanceKm: 0,
  durationMinutes: 0,
  packageDetails: undefined,
};

export const useBookingStore = create<BookingStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        bookingData: initialBookingData,
        currentStep: 1,
        isLoading: false,
        error: null,

        // Actions
        setBookingData: (data) =>
          set((state) => ({
            bookingData: { ...state.bookingData, ...data },
          })),

        resetBookingData: () =>
          set({
            bookingData: initialBookingData,
            currentStep: 1,
            error: null,
          }),

        setCurrentStep: (step) => set({ currentStep: step }),

        nextStep: () =>
          set((state) => {
            console.log("🔄 nextStep called - current step:", state.currentStep, "moving to:", state.currentStep + 1);
            return { currentStep: state.currentStep + 1 };
          }),

        prevStep: () =>
          set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),

        setLoading: (loading) => set({ isLoading: loading }),

        setError: (error) => set({ error }),
      }),
      {
        name: 'booking-storage',
        partialize: (state) => ({
          bookingData: state.bookingData,
          currentStep: state.currentStep,
        }),
      }
    ),
    { name: 'booking-store' }
  )
);