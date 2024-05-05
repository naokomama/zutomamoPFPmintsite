'use client'

import DialogData from '@/entity/dialog/dialog-data'
import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, useDisclosure } from '@chakra-ui/react'
import { useEffect } from 'react'
import { MdError } from "react-icons/md"

type Props = {
  dialogData: DialogData | null
}

export default function ErrorDialog({ dialogData }: Props) {
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
        <div className='text-2xl flex items-center '>
          <span className='mr-2 text-red-600'>
            <MdError />
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
        <Button bg='#fa4e74' color='white' onClick={onClickClose}>Close</Button>
      </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
