'use client'

// Package
import { FormControl, FormErrorMessage, FormHelperText, FormLabel, Input, NumberInput, NumberInputField, UseRadioProps, useRadio } from "@chakra-ui/react"

type Props = {
  title: string,
  placeholder: string,
  rule: (value: number) => boolean
  errorMessage: string
  value: number
  onChange: (value: number) => void
  precision?: number
  disabled?: boolean
}

export default function ValidatedNumberInput({title, placeholder, rule, errorMessage, value, onChange, precision=0, disabled=false}: Props) {
  return (
    <FormControl isInvalid={!rule(value)}>
      <FormLabel className="text-sm">
        {title}
      </FormLabel>
      {disabled ? (
        <div className="ml-2 text-lg">
          {value}
        </div>
      ) : (
        <NumberInput
          variant='filled'
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(Number(e))}
          min={0}
          precision={3}
        >
          <NumberInputField />
        </NumberInput>
      )}
      {rule(value) ? null : (
        <FormErrorMessage className="text-xs">
          {errorMessage}
        </FormErrorMessage>
      )}
    </FormControl>
  )

}