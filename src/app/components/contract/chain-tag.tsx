'use client'

// Package
import { Tag } from '@chakra-ui/react'

type Props = {
  chainId: number
}

export default function ChainTag({chainId}: Props) {
  const getTagColor = (chainId: number) => {
    switch (chainId) {
      case 1:
        return 'blue'
      case 137:
        return 'purple'
      case 11155111:
        return 'blackAlpha'
      case 5:
        return 'blackAlpha'
      default:
        return 'gray'
    }
  }
  const getChainName = (chainId: number) => {
    switch (chainId) {
      case 1:
        return 'Ethereum'
      case 137:
        return 'Polygon'
      case 11155111:
        return 'Sepolia'
      case 5:
        return 'Goerli'
      default:
        return 'unknown'
    }
  }

  return (
    <Tag colorScheme={getTagColor(chainId)}>
      {getChainName(chainId)}
    </Tag>
  )
}
