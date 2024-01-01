'use client'

// Package
import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, useDisclosure } from '@chakra-ui/react'
import { useEffect } from 'react'
import { MdInfo } from "react-icons/md"

// Entity
import DialogData from '@/entity/dialog/dialog-data'

type Props = {
  dialogData: DialogData | null
}

export default function InfoDialog({ dialogData }: Props) {
  const { isOpen , onOpen, onClose } = useDisclosure()
  useEffect(() => {
    if (dialogData != null) {
      onOpen()
    }
  }, [dialogData, onOpen])
  if (dialogData == null) return null
  const onClickClose = () => {
    dialogData.callback && dialogData.callback()
    onClose()
  }
  return (
    <Modal isOpen={isOpen} onClose={onClickClose}>
      <ModalOverlay />
      <ModalContent>
      <ModalHeader>
        <div className='text-2xl flex items-center'>
          <span className='text-blue-600 mr-2'>
            <MdInfo />
          </span>
          <span>
            {dialogData.title}
          </span>
        </div>
      </ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        {dialogData.message}
      </ModalBody>
      <ModalFooter>
        <Button colorScheme='blue' onClick={onClickClose}>Close</Button>
      </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
