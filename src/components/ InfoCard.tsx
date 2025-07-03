'use client'

import Slideshow from './Slideshow'

export default function InfoCard() {
  return (
    <div className="card bg-white rounded-3xl shadow-lg p-8 relative overflow-hidden">
      <div className="mb-6">
        <h2 className="text-4xl font-bold text-[#9ACBF6]">Mindness</h2>
        <p className="text-lg text-gray-700 mt-2">
          Soluções em saúde emocional para empresas
        </p>
      </div>

      <div className="rounded-xl overflow-hidden">
        <Slideshow />
      </div>

      <div className="circle absolute bottom-6 right-6 w-24 h-24 bg-green-300 rounded-full opacity-60" />
    </div>
  )
}
