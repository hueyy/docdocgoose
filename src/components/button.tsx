import React from 'react'
import Link from 'next/link'

interface Props {
  children: React.ReactNode,
  href?: string,
  onClick?: () => void,
  loading?: boolean,
  loadingComponent?: React.ReactElement,
  download?: string,
  className?: string,
  title?: string,
}

const buttonClasses = `font-light rounded md:px-4 px-2 md:py-2 py-1 no-underline border border-slate-400 hover:border-slate-500 h-full flex items-center justify-center text-center select-none`

export const PrimaryButton: React.FC<Props> = ({
  children,
  href,
  onClick,
  loading = false,
  loadingComponent,
  download,
  className = ``,
  title = ``,
}) => {
  const loadingContent = loadingComponent ? loadingComponent : <span>Loading...</span>
  const innerContent = loading ? loadingContent : children
  const cursorClass = loading ? `cursor-not-allowed` : `cursor-pointer`
  const content = (
    <div className={`${buttonClasses} bg-slate-100 ${cursorClass} ${className}`} title={title}>
      {innerContent}
    </div>
  )
  if(loading){
    return content
  }
  if(href){
    if(href.slice(0, 1) === `/`){
      return (
        <Link href={href}>{content}</Link>
      )
    } else {
      return (
        <a href={href} className="no-underline" download={download}>{content}</a>
      )
    }
  } else {
    return (
      <div onClick={onClick}>{content}</div>
    )
  }
}

export const SecondaryButton: React.FC<Props> = ({
  children,
  href,
  onClick,
  loading,
  loadingComponent,
  download,
  className,
  title = ``,
}) => {
  const loadingContent = loadingComponent ? loadingComponent : <span>Loading...</span>
  const innerContent = loading ? loadingContent : children
  const cursorClass = loading ? `cursor-not-allowed` : `cursor-pointer`
  const content = (
    <div className={`${buttonClasses} bg-slate-200 ${cursorClass} ${className}`} title={title}>
      {innerContent}
    </div>
  )
  if(loading){
    return content
  }
  if(href){
    if(href.slice(0, 1) === `/`){
      return (
        <Link href={href}>{content}</Link>
      )
    } else {
      return (
        <a href={href} className="no-underline" download={download}>{content}</a>
      )
    }
  } else {
    return (
      <div onClick={onClick}>{content}</div>
    )
  }
}