// Package
import { createContext, useState } from 'react'

// Entity
import DialogData from '@/entity/dialog/dialog-data'

// Component
import ErrorDialog from '../components/error-dialog'
import InfoDialog from '../components/info-dialog'
import YesNoDialog from '../components/yes-no-dialog'
import LoadingOverlay from '../components/loading-overlay'

export type DialogInfo = {
  setErrorDialogData: (errorDialogData: DialogData) => void
  setInfoDialogData: (infoDialogData: DialogData) => void
  setYesNoDialogData: (yesNoDialogData: DialogData) => void
  setLoading: (loading: boolean) => void
}

export const DialogContext = createContext<DialogInfo>({
  setErrorDialogData: () => {},
  setInfoDialogData: () => {},
  setYesNoDialogData: () => {},
  setLoading: () => {}
})


export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState<boolean>(false)
  const [errorDialogData, setErrorDialogData] = useState<DialogData | null>(null)
  const [infoDialogData, setInfoDialogData] = useState<DialogData | null>(null)
  const [yesNoDialogData, setYesNoDialogData] = useState<DialogData | null>(null)

  return (
    <DialogContext.Provider value={{setErrorDialogData, setInfoDialogData, setYesNoDialogData, setLoading}}>
      {children}
      <ErrorDialog
        dialogData={errorDialogData}
      />
      <InfoDialog
        dialogData={infoDialogData}
      />
      <YesNoDialog
        dialogData={yesNoDialogData}
      />
      <LoadingOverlay
        loading={loading}
      />
    </DialogContext.Provider>
  )
}