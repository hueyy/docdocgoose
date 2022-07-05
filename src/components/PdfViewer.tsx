import React, { useCallback } from 'react'
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack5'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer'
import usePdfViewerResize from 'hooks/usePdfViewerResize'
import usePdfViewerZoom from 'hooks/usePdfViewerZoom'
import { PrimaryButton, SecondaryButton } from 'components/button'
import type { DocumentProps, PDFPageProxy } from 'react-pdf'
import { VariableSizeList } from 'react-window'
import type { PDFDocumentProxy } from 'pdfjs-dist'

const ZoomButton = ({ children, onClick = () => {} }) => {
  return (
    <div
      className="shrink bg-slate-700 rounded-full w-9 h-9 flex justify-center items-center border border-slate-400 cursor-pointer"
      onClick={onClick}
    >
      {children}
    </div>
  )
}

const MainPageRenderer = ({ data: { scale, zoom, rotations, setPageHeight, setPageWidth }, index, style }) => {
  const pageNumber = index + 1
  return (
    <div style={style}>
      <MainPage
        pageNumber={pageNumber}
        scale={scale}
        zoom={zoom}
        rotations={rotations}
        setPageHeight={setPageHeight}
        setPageWidth={setPageWidth}
      />
    </div>
  )
}

const MainPage = ({ pageNumber, scale, zoom, rotations, setPageHeight, setPageWidth }) => {
  const onLoadSuccess = useCallback((page: PDFPageProxy) => {
    setPageHeight(pageNumber, page.originalHeight)
    setPageWidth(pageNumber, page.originalWidth)
  }, [setPageHeight, setPageWidth, pageNumber])
  return (
    <Page
      pageNumber={pageNumber}
      scale={scale * zoom}
      rotate={rotations[pageNumber - 1]}
      onLoadSuccess={onLoadSuccess}
    />
  )
}

const MiniPage = ({ pageNumber, gotoPage, rotation, current }) => {
  const onClick = useCallback(() => {
    gotoPage(pageNumber)
  }, [pageNumber, gotoPage])
  const currentClass = current ? `bg-slate-300` : ``

  return (
    <div className={`flex gap-2 p-4 ${currentClass} cursor-pointer`} onClick={onClick}>
      <div className={current ? `text-slate-700` : `text-slate-500`}>
        {pageNumber}
      </div>
      <Page
        className="select-none cursor-pointer"
        pageNumber={pageNumber}
        scale={0.2}
        rotate={rotation}
      />
    </div>
  )
}

interface Props {
  file: File,
  loadingComponent?: React.ReactElement,
  onDocumentLoad: DocumentProps[`onLoadSuccess`],
  pageNumber: number,
  numPages: number,
  gotoPage: (p: number) => void,
  rotations: number[],
  rotatePage: (n: number) => void,
}

const PdfViewer: React.FC<Props> = ({
  file,
  loadingComponent,
  onDocumentLoad,
  pageNumber = 1,
  numPages = 0,
  gotoPage,
  rotations = [],
  rotatePage,
}) => {
  const {
    scale,
    documentRef,
    documentHeight,
    documentWidth,
    onDocumentLoad: runInitialResize,
    setPageHeight,
    getPageHeight,
    setPageWidth,
  } = usePdfViewerResize({ pageNumber })

  const {
    zoom,
    zoomIn,
    zoomOut,
  } = usePdfViewerZoom()

  const onClickRotate = useCallback(() => {
    rotatePage(pageNumber)
  }, [pageNumber, rotatePage])

  const getItemSize = useCallback((index) => {
    getPageHeight(index + 1)
  }, [getPageHeight])

  const onDocumentLoadSuccess = useCallback((pdf: PDFDocumentProxy) => {
    onDocumentLoad(pdf)
    runInitialResize(pdf)
  }, [onDocumentLoad, runInitialResize])

  return (
    <div className="flex max-h-full overflow-hidden select-none">
      <div className="flex flex-col flex-none px-4">
        <div>
          <strong>PAGE</strong>
        </div>
        <div className="grid md:grid-cols-2 grid-cols-1 mt-2 gap-4">
          <PrimaryButton onClick={onClickRotate}>
            🔃 Rotate
          </PrimaryButton>
          <PrimaryButton>
            🗑️ Delete
          </PrimaryButton>
        </div>
      </div>
      <div className="flex flex-col max-w-full overflow-hidden grow">
        <Document
          file={file}
          className="grow overflow-auto max-w-full flex flex-col gap-2"
          loading={loadingComponent}
          onLoadSuccess={onDocumentLoadSuccess}
          externalLinkTarget="_blank"
          inputRef={documentRef}
        >
          {
            (Number.isInteger(numPages) && numPages > 0) && (
              <VariableSizeList
                itemData={{
                  rotations,
                  scale,
                  setPageHeight,
                  setPageWidth,
                  zoom,
                }}
                itemCount={numPages}
                height={documentHeight}
                width={documentWidth}
                itemSize={getItemSize}
              >
                {MainPageRenderer}
              </VariableSizeList>
            )
          }
        </Document>
        <div className="flex justify-between items-center gap-4 p-4">
          <SecondaryButton>
            ℹ️ Info
          </SecondaryButton>
          <div>
            {pageNumber} / {numPages}
          </div>
          <div className="flex gap-3 font-black text-white text-xl">
            <ZoomButton onClick={zoomIn}>
              +
            </ZoomButton>
            <ZoomButton onClick={zoomOut}>
              -
            </ZoomButton>
          </div>
        </div>
      </div>
      <Document
        file={file}
        className="flex flex-none flex-col gap-1 overflow-auto"
      >
        {
          (Number.isInteger(numPages) && numPages > 0) && (
            Array.from({ length: numPages }, (v, i) => i + 1).map((num) => (
              <MiniPage
                key={`mini-page-${num}`}
                current={pageNumber === num}
                pageNumber={num}
                gotoPage={gotoPage}
                rotation={rotations[num - 1]}
              />
            ))
          )
        }
      </Document>
    </div>
  )
}

export default PdfViewer