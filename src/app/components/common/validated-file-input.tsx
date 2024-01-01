'use client'

// Package
import { FormControl, FormLabel, Input } from "@chakra-ui/react"

type Props = {
  title: string,
  placeholder: string,
  errorMessage: string
  onChange: (value: File) => void
}

export default function ValidatedFileInput({title, placeholder, errorMessage, onChange}: Props) {
  return (
    <FormControl isInvalid={false}>
      <FormLabel className="text-sm">
        {title}
      </FormLabel>
      <Input
        type="file"
        variant='filled'
        placeholder={placeholder}
        onChange={(e) => {
          if (e.target.files == null) return
          onChange(e.target.files[0])
        }}
      />
    </FormControl>
  )

}