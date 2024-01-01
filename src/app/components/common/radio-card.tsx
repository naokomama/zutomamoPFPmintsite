'use client'

// Package
import { Box, UseRadioProps, useRadio } from "@chakra-ui/react"

// Entity
import RadioGroupItem from "@/entity/common/radio-group-item"


type Props = {
  radioGroupItem: RadioGroupItem
  useRadioProps: UseRadioProps
}

export default function RadioCard({radioGroupItem, useRadioProps}: Props) {
  const { getInputProps, getRadioProps } = useRadio(useRadioProps)
  const input = getInputProps()
  const checkbox = getRadioProps()
  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...checkbox}
        cursor='pointer'
        borderWidth='1px'
        borderRadius='md'
        boxShadow='md'
        _checked={{
          bg: radioGroupItem.color,
          color: 'white',
          borderColor: radioGroupItem.color,
        }}
        _focus={{
          boxShadow: 'outline',
        }}
        px={3}
        py={2}
      >
        <span className="font-bold">
          {radioGroupItem.text}
        </span>
      </Box>
    </Box>
  )

}