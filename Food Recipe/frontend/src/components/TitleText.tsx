import React from 'react'

const TitleText:React.FC<{ title:string }> = ({ title }) => {
  return (
    <h2 className="sm:text-2xl md:text-3xl lg:text-4xl text-amber-600 font-bold mb-4">{title}</h2>
  )
}

export default TitleText