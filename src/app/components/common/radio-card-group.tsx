'use client'

// Package
import { Box, HStack, UseRadioProps, useRadio, useRadioGroup } from "@chakra-ui/react"
import RadioCard from "./radio-card"

// Entity
import RadioGroupItem from "@/entity/common/radio-group-item"


type Props = {
  defaultValue: string | number | boolean,
  radioGroupItems: RadioGroupItem[],
  onChange: (value: string | number | boolean) => void
}

export default function RadioCardGroup({defaultValue, radioGroupItems, onChange}: Props) {
  const defaultRadioGroupItem = radioGroupItems.find((e) => e.value === defaultValue)
  const defaultText = defaultRadioGroupItem == null ? radioGroupItems[0].text : defaultRadioGroupItem.text

  const { getRootProps, getRadioProps } = useRadioGroup({
    defaultValue: defaultText,
    onChange: (value) => {
      const radioGroupItem = radioGroupItems.find((e) => e.text === value)
      if (radioGroupItem == null) return
      const changedValue = radioGroupItem?.value
      onChange(changedValue)
    },
  })
  const group = getRootProps()
  return (
    <HStack {...group} className="flex justify-center">
      {radioGroupItems.map((radioGroupItem, index) => {
        const radio = getRadioProps({
          value: radioGroupItem.text,
        })
        return (
          <RadioCard
            key={index}
            radioGroupItem={radioGroupItem}
            useRadioProps={radio}
          />
        )
      })}
    </HStack>
  )
}