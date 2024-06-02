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
        return 'pink'
      case 137:
        return 'purple'
      case 8453:
        return 'pink'
      case 11155111:
        return 'blackAlpha'
      case 5:
        return 'blackAlpha'
      case 3776:
        return 'lightblue'
      case 84532:
        return 'blue'
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
      case 8453:
          return 'Base'
      case 11155111:
        return 'Sepolia'
      case 5:
        return 'Goerli'
      case 3776:
        return 'Astar zkEVM'
      case 84532:
          return 'Base Sepolia'
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
