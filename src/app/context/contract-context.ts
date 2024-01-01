import { createContext } from 'react'

export type ContractInfo = {
  totalSupply: number
  maxMintAmountPerTerm: number
  mintedAmountInTerm: number,
  mintedAmountInMonth: number,
  setTotalSupply: (totalSupply: number) => void
  setMaxMintAmountPerTerm: (maxMintAmountPerTerm: number) => void
  setMintedAmountInTerm: (mintedAmountInTerm: number) => void
  setMintedAmountInMonth: (mintedAmountInMonth: number) => void
}

export const ContractContext = createContext<ContractInfo>({
  totalSupply: 0,
  maxMintAmountPerTerm: 0,
  mintedAmountInTerm: 0,
  mintedAmountInMonth: 0,
  setTotalSupply: () => {},
  setMaxMintAmountPerTerm: () => {},
  setMintedAmountInTerm: () => {},
  setMintedAmountInMonth: () => {},
})
