'use client'

import type { CVData } from '@/types'

interface CVPreviewProps {
    data: CVData
}

export default function CVPreview({ data }: CVPreviewProps) {
    const { personalInfo, education, experience, skills, certificates, summary } = data

    return (
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
                <h1 className="text-2xl font-bold">{personalInfo?.fullName || 'Ad Soyad'}</h1>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-blue-100">
                    {personalInfo?.email && (
                        <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {personalInfo.email}
                        </span>
                    )}
                    {personalInfo?.phone && (
                        <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {personalInfo.phone}
                        </span>
                    )}
                    {personalInfo?.address && (
                        <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {personalInfo.address}
                        </span>
                    )}
                </div>
            </div>

            <div className="p-8">
                {/* Summary */}
                {summary && (
                    <section className="mb-6">
                        <p className="text-gray-700 italic border-l-4 border-blue-500 pl-4 bg-blue-50 py-2">
                            {summary}
                        </p>
                    </section>
                )}

                {/* Education */}
                {education && education.length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-lg font-bold text-blue-700 border-b-2 border-blue-200 pb-2 mb-4">
                            EĞİTİM
                        </h2>
                        {education.map((edu, index) => (
                            <div key={index} className="mb-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{edu.institution}</h3>
                                        <p className="text-gray-600">{edu.degree} - {edu.field}</p>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {edu.startDate} - {edu.endDate || 'Devam'}
                                    </span>
                                </div>
                                {edu.gpa && <p className="text-sm text-gray-500 mt-1">Not Ort: {edu.gpa}</p>}
                            </div>
                        ))}
                    </section>
                )}

                {/* Experience */}
                {experience && experience.length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-lg font-bold text-blue-700 border-b-2 border-blue-200 pb-2 mb-4">
                            İŞ DENEYİMİ
                        </h2>
                        {experience.map((exp, index) => (
                            <div key={index} className="mb-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{exp.position}</h3>
                                        <p className="text-gray-600">{exp.company}</p>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {exp.startDate} - {exp.endDate || 'Devam'}
                                    </span>
                                </div>
                                {exp.description && <p className="text-gray-600 mt-2 text-sm">{exp.description}</p>}
                                {exp.responsibilities && exp.responsibilities.length > 0 && (
                                    <ul className="mt-2 space-y-1">
                                        {exp.responsibilities.map((resp, i) => (
                                            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                                <span className="text-blue-500 mt-1">•</span>
                                                {resp}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </section>
                )}

                {/* Skills */}
                {skills && (skills.technical?.length || skills.languages?.length || skills.software?.length) && (
                    <section className="mb-6">
                        <h2 className="text-lg font-bold text-blue-700 border-b-2 border-blue-200 pb-2 mb-4">
                            BECERİLER
                        </h2>
                        <div className="grid grid-cols-3 gap-4">
                            {skills.technical && skills.technical.length > 0 && (
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <h3 className="font-medium text-gray-700 mb-2">Teknik</h3>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        {skills.technical.map((skill, i) => (
                                            <li key={i}>• {skill}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {skills.languages && skills.languages.length > 0 && (
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <h3 className="font-medium text-gray-700 mb-2">Diller</h3>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        {skills.languages.map((lang, i) => (
                                            <li key={i}>• {lang}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {skills.software && skills.software.length > 0 && (
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <h3 className="font-medium text-gray-700 mb-2">Yazılım</h3>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        {skills.software.map((sw, i) => (
                                            <li key={i}>• {sw}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Certificates */}
                {certificates && certificates.length > 0 && (
                    <section>
                        <h2 className="text-lg font-bold text-blue-700 border-b-2 border-blue-200 pb-2 mb-4">
                            SERTİFİKALAR
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            {certificates.map((cert, index) => (
                                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                    <h3 className="font-medium text-gray-800">{cert.name}</h3>
                                    <p className="text-sm text-gray-500">
                                        {cert.issuer} {cert.date && `- ${cert.date}`}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}
