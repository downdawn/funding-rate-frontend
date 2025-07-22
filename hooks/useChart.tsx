"use client"

import type React from "react"

import { createContext, useContext } from "react"

interface ChartContextProps {
  config: any
}

const ChartContext = createContext<ChartContextProps | undefined>(undefined)

export const ChartProvider = ({ config, children }: { config: any; children: React.ReactNode }) => {
  return <ChartContext.Provider value={{ config }}>{children}</ChartContext.Provider>
}

export const useChart = () => {
  const context = useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a ChartProvider")
  }
  return context
}
