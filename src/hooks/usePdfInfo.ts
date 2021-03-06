import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import PdfCpu, { EncryptedPDFError, InvalidPDFError, RestrictedPDFError } from 'utils/PdfCpu'
import Storage from 'utils/Storage'
import { downloadBlob } from 'utils/Utils'
import Logger from 'utils/Logger'

const usePdfInfo = ({ file, wasmLoaded }: { file: File, wasmLoaded: boolean }) => {
  const router = useRouter()

  const [fileLoaded, setFileLoaded] = useState(false)
  const [error, setError] = useState(null as string)
  const [fileInfo, setFileInfo] = useState({} as FileInfo)
  const [newFileInfo, setNewFileInfo] = useState({} as FileInfo)
  const [savingFileInfo, setSavingFileInfo] = useState(false)

  useEffect(() => {
    if(fileLoaded){ // only run once
      return
    }
    if(typeof file === `undefined`){
      router.push(`/`)
    }
    if(wasmLoaded && PdfCpu.go === null){
      Logger.debug(`go is not yet defined`)
      return
    }
    (async () => {
      const arrayBuffer = await file.arrayBuffer()
      const filePath = `/${file.name}`
      globalThis.fs.writeFile(filePath, Buffer.from(arrayBuffer), async (err: any) => {
        if(err){
          throw err
        }
        try {
          const result = await PdfCpu.getInfo(filePath)
          setFileInfo(result)
        } catch (error){
          if(error instanceof EncryptedPDFError) {
            setFileInfo(r => ({
              ...r,
              encrypted: true,
            }))
          } else if (error instanceof RestrictedPDFError) {
            setFileInfo(r => ({
              ...r,
              restricted: true,
            }))
          } else if(error instanceof InvalidPDFError) {
            return setError(error.message)
          } else {
            Logger.error(error)
            setError(`Something went wrong when processing your file`)
          }
        } finally {
          setFileLoaded(true)
        }
      })
    })()

  }, [router, file, fileLoaded, wasmLoaded])

  const reloadFile = useCallback(() => {
    setFileLoaded(false)
    setFileInfo({})
    setError(null)
  }, [])

  const saveFileInfo = useCallback(async () => {
    setSavingFileInfo(true)
    const arrayBuffer = await file.arrayBuffer()
    const filePath = `/${file.name}`
    globalThis.fs.writeFileSync(filePath, Buffer.from(arrayBuffer))
    try {
      await PdfCpu.setProperties(filePath, newFileInfo)
      const outBuffer: Buffer = globalThis.fs.readFileSync(filePath)
      const blob = new Blob([outBuffer])
      const f = new File([outBuffer], file.name)
      Storage.setFile(f)
      downloadBlob(blob, filePath.slice(1).replace(/\.pdf$/, `-edited.pdf`))
    } catch (error) {
      Logger.error(error)
    } finally {
      setSavingFileInfo(false)
    }
  }, [file, newFileInfo])

  return {
    error,
    fileInfo: {
      ...fileInfo,
      ...newFileInfo,
    },
    fileLoaded,
    reloadFile,
    saveFileInfo,
    savingFileInfo,
    setNewFileInfo,
  }
}

export default usePdfInfo