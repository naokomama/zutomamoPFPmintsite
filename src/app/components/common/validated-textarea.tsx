'use client'

// Package
import { FormControl, FormErrorMessage, FormHelperText, FormLabel, Input, Textarea, UseRadioProps, useRadio } from "@chakra-ui/react"

type Props = {
  title: string,
  placeholder: string,
  rule: (value: string) => boolean
  errorMessage: string
  value: string
  onChange: (value: string) => void
}

export default function ValidatedTextarea({title, placeholder, rule, errorMessage, value, onChange}: Props) {
  return (
    <FormControl isInvalid={!rule(value)}>
      <FormLabel className="text-sm">
        {title}
      </FormLabel>
      <Textarea
        variant='filled'
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
        }}
      />
      {rule(value) ? null : (
        <FormErrorMessage className="text-xs">
          {errorMessage}
        </FormErrorMessage>
      )}
    </FormControl>
  )

}