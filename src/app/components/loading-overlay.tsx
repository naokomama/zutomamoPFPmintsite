'use client'

import { Box, Spinner } from '@chakra-ui/react'

type Props = {
  loading: boolean
}

export default function LoadingOverlay({ loading }: Props) {
  if (!loading) return null
  return (
    <Box className='w-screen h-screen top-0 left-0 fixed flex flex-col items-center justify-center z-50 bg-black bg-opacity-80'>
      <Spinner
        size="xl"
        thickness='4px'
        color='blue.500'
        emptyColor='gray.200'
        speed='0.8s'
      />
      <span className='text-white text-lg font-bold mt-4 ml-2'>
        Loading...
      </span>
    </Box>
  )
}
