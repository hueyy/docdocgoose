import React from 'react'
import { useDropzone } from 'react-dropzone'

interface Props {
  onDrop: (files: File[]) => void
}

const DropZone: React.FC<Props> = ({ onDrop }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': [`.pdf`],
      // 'application/msword': [`.doc`],
      // 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [`.docx`],
      // TODO: xlsx & pptx
    },
    maxFiles: 1,
    onDrop,
  })

  return (
    <div className="basis-1/3 flex flex-col justify-center items-center p-4 text-center bg-slate-300 cursor-pointer border-2 border-dotted border-slate-400 outline-none" {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive
        ? (
          <p>Drop your file here</p>
        )
        : (
          <>
            <div className="md:block hidden">
              <p>Drag and drop your file here</p>
              <p className="text-sm">(or click to select a file from your computer)</p>
            </div>
            <div className="md:hidden block">
              <p>Tap here to select a file</p>
            </div>
          </>
        )
      }
    </div>
  )
}

export default DropZone