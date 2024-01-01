'use client'

// Package
import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, useDisclosure } from '@chakra-ui/react'
import { useEffect } from 'react'
import { FaQuestionCircle } from 'react-icons/fa'

// Entity
import DialogData from '@/entity/dialog/dialog-data'

type Props = {
  dialogData: DialogData | null
}

export default function YesNoDialog({ dialogData }: Props) {
  const { isOpen , onOpen, onClose } = useDisclosure()
  useEffect(() => {
    if (dialogData != null) {
      onOpen()
    }
  }, [dialogData, onOpen])

  if (dialogData == null) return null

  const onClickCancel = () => {
    dialogData.cancelCallback && dialogData.cancelCallback()
    onClose()
  }
  const onClickOk = () => {
    dialogData.callback && dialogData.callback()
    onClose()
  }
  return (
    <Modal isOpen={isOpen} onClose={onClickCancel}>
      <ModalOverlay />
      <ModalContent>
      <ModalHeader>
        <div className='text-2xl flex items-center'>
          <span className='text-blue-600 mr-2'>
            <FaQuestionCircle />
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
      <ModalFooter className='space-x-2'>
        <Button colorScheme='red' onClick={onClickCancel}>Cancel</Button>
        <Button colorScheme='blue' onClick={onClickOk}>OK</Button>
      </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
