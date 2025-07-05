import { create } from "zustand"
import { devtools } from "zustand/middleware"

interface CompanyState {
  companies: any[]
  isLoading: boolean
  setCompanies: (companies: any[]) => void
  addCompany: (company: any) => void
  updateCompany: (id: string, company: Partial<any>) => void
  removeCompany: (id: string) => void
  setLoading: (loading: boolean) => void
}

export const useCompanyStore = create<CompanyState>()(
  devtools(
    (set) => ({
      companies: [],
      isLoading: false,
      setCompanies: (companies) => set({ companies }),
      addCompany: (company) =>
        set((state) => {
          const updatedCompanies = [...state.companies, ...(Array.isArray(company) ? company : [company])];
          return {
            companies: updatedCompanies,
          };
        }),
      updateCompany: (id: string, company: Partial<any>) =>
        set((state) => ({
          companies: state.companies.map((c) =>
            c._id === id ? { ...c, ...company } : c // Merge the partial update with existing company
          ),
        })),
      removeCompany: (id: string) =>
        set((state) => ({
          companies: state.companies.filter((c) => c._id !== id),
        })),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "company-store",
    },
  ),
)