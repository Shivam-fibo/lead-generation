"use client"

import React from "react"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useCompanyStore } from "@/stores/company-store"
import { companyApi } from "@/lib/api"
import { toast } from "sonner"


export function useCompany() {
  const { companies, setCompanies, addCompany, updateCompany, removeCompany } = useCompanyStore()
  // const queryClient = useQueryClient()

  // const { data: companyData, isLoading } = useQuery({
  //   queryKey: ["companies"],
  //   queryFn: companyApi.getAllCompanies,
  //   staleTime: 5 * 60 * 1000,
  // })

  const createCompanyMutation = useMutation({
    mutationFn: (company: Omit<any, "_id" | "createdAt" | "updatedAt" | "__v">) =>
      companyApi.createCompany(company),
    onSuccess: (newCompany) => {
      toast.success(`Company '${newCompany.name || ""}' created successfully!`)
      addCompany(newCompany)
      // queryClient.invalidateQueries({ queryKey: ["companies"] })
    },
    onError: (error: any) => {
      toast.error('Error creating company', {
        description: error?.message ? error?.message : error,
      })
    },
  })

  // const updateCompanyMutation = useMutation({
  //   mutationFn: ({ id, company }: { id: string; company: Partial<any> }) =>
  //     companyApi.updateCompany(id, company),
  //   onSuccess: (updatedCompany) => {
  //     // Update store with the full updated company from API response
  //     updateCompany(updatedCompany._id, updatedCompany)
  //     queryClient.invalidateQueries({ queryKey: ["companies"] })
  //   },
  // })

  // const deleteCompanyMutation = useMutation({
  //   mutationFn: (id: string) => companyApi.deleteCompany(id),
  //   onSuccess: (_, id) => {
  //     removeCompany(id)
  //     queryClient.invalidateQueries({ queryKey: ["companies"] })
  //   },
  // })

  // const createCompaniesCsvMutation = useMutation({
  //   mutationFn: (companies: Omit<any, "_id" | "createdAt" | "updatedAt" | "__v">[]) => 
  //     companyApi.createCompaniesCsv(companies),
  //   onSuccess: (newCompanies) => {
  //     // Add all new companies to the store
  //     newCompanies.forEach(company => addCompany(company));
  //     queryClient.invalidateQueries({ queryKey: ["companies"] });
  //   },
  // });

  // Update store when query data changes
  // React.useEffect(() => {
  //   if (companyData) {
  //     setCompanies(companyData)
  //   }
  // }, [companyData, setCompanies])

  return {
    // companies: companies.length > 0 ? companies : companyData || [],
    // isLoading,
    createCompany: createCompanyMutation.mutate,
    isCreatingCompany: createCompanyMutation.isPending,
    // createCompaniesCsv: createCompaniesCsvMutation.mutate,
    // updateCompany: (id: string, company: Partial<any>) => 
    //   updateCompanyMutation.mutate({ id, company }),
    // deleteCompany: deleteCompanyMutation.mutate,
    // isCreatingCompaniesCsv: createCompaniesCsvMutation.isPending,
    // isUpdatingCompany: updateCompanyMutation.isPending,
    // isDeletingCompany: deleteCompanyMutation.isPending,
  }
}

