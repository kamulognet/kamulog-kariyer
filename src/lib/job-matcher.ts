/**
 * AI İş Eşleştirme Servisi
 * 
 * CV verisi ile iş ilanlarını karşılaştırarak uyumluluk analizi yapar.
 */

import openai from './openai'

export interface JobMatch {
    jobId: string
    title: string
    company: string
    type: string
    score: number
    matchReasons: string[]
    feedback: string
}

export interface CVData {
    rawText?: string // PDF'den çıkarılan ham metin
    fileName?: string
    uploadedAt?: string
    personalInfo?: {
        fullName?: string
        email?: string
        phone?: string
    }
    education?: Array<{
        institution?: string
        degree?: string
        field?: string
        startDate?: string
        endDate?: string
        gpa?: string
    }>
    experience?: Array<{
        company?: string
        position?: string
        startDate?: string
        endDate?: string
        description?: string
        responsibilities?: string[]
    }>
    skills?: {
        technical?: string[]
        languages?: string[]
        software?: string[]
    }
    certificates?: Array<{
        name?: string
        issuer?: string
        date?: string
    }>
    summary?: string
}

export interface JobListing {
    id: string
    title: string
    company: string
    location?: string
    description: string
    requirements?: string
    type: string
}

/**
 * CV verisinden özet oluşturur (rawText veya yapılandırılmış veri)
 */
function getCVSummary(cvData: CVData): string {
    // Eğer rawText varsa onu kullan
    if (cvData.rawText && cvData.rawText.length > 0) {
        // İlk 3000 karakteri al (token limiti için)
        return cvData.rawText.substring(0, 3000)
    }

    // Yapılandırılmış veriden özet oluştur
    const parts: string[] = []

    if (cvData.education && cvData.education.length > 0) {
        parts.push(`Eğitim: ${cvData.education.map(e => `${e.field || ''} - ${e.institution || ''}`).join(', ')}`)
    }

    if (cvData.experience && cvData.experience.length > 0) {
        parts.push(`Deneyim: ${cvData.experience.map(e => `${e.position || ''} - ${e.company || ''}`).join(', ')}`)
    }

    if (cvData.skills) {
        const allSkills = [
            ...(cvData.skills.technical || []),
            ...(cvData.skills.languages || []),
            ...(cvData.skills.software || [])
        ]
        if (allSkills.length > 0) {
            parts.push(`Beceriler: ${allSkills.join(', ')}`)
        }
    }

    if (cvData.certificates && cvData.certificates.length > 0) {
        parts.push(`Sertifikalar: ${cvData.certificates.map(c => c.name).join(', ')}`)
    }

    if (cvData.summary) {
        parts.push(`Özet: ${cvData.summary}`)
    }

    return parts.join('\n') || 'CV bilgisi mevcut değil'
}

/**
 * CV verisi ile iş ilanlarını toplu olarak eşleştirir
 */
export async function matchCVWithJobs(
    cvData: CVData,
    jobs: JobListing[],
    filter?: { type?: 'PUBLIC' | 'PRIVATE' | 'ALL' }
): Promise<JobMatch[]> {
    // Filtreleme
    let filteredJobs = jobs
    if (filter?.type && filter.type !== 'ALL') {
        filteredJobs = jobs.filter(j => j.type === filter.type)
    }

    if (filteredJobs.length === 0) {
        return []
    }

    const cvSummary = getCVSummary(cvData)

    // Tüm ilanları tek seferde analiz et (maliyet optimizasyonu için)
    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            {
                role: 'system',
                content: `Sen bir İK ve kariyer uzmanısın. Verilen CV verisi ile iş ilanlarını karşılaştırarak her ilan için uyumluluk puanı ve analiz yapacaksın.

Değerlendirme kriterleri:
- Eğitim uyumu (20 puan)
- İş deneyimi uyumu (30 puan)
- Teknik beceriler uyumu (25 puan)
- Genel profil uyumu (15 puan)
- Sertifikalar ve ek yetkinlikler (10 puan)

Her ilan için:
1. 0-100 arası puan ver
2. Eşleşme nedenlerini listele (maksimum 3)
3. Kısa geri bildirim yaz

Yanıtını şu JSON formatında ver:
{
  "matches": [
    {
      "jobId": "string",
      "score": number,
      "matchReasons": ["string", "string"],
      "feedback": "string"
    }
  ]
}

Sadece JSON döndür.`,
            },
            {
                role: 'user',
                content: `CV Verisi:
${cvSummary}

İş İlanları:
${JSON.stringify(filteredJobs.map(j => ({
                    id: j.id,
                    title: j.title,
                    company: j.company,
                    description: j.description,
                    requirements: j.requirements,
                    type: j.type,
                })), null, 2)}`,
            },
        ],
        temperature: 0.3,
        max_tokens: 3000,
        response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content || '{"matches": []}'
    const result = JSON.parse(content)

    // Sonuçları iş bilgileriyle birleştir ve sırala
    const matches: JobMatch[] = result.matches
        .map((match: any) => {
            const job = filteredJobs.find(j => j.id === match.jobId)
            if (!job) return null

            return {
                jobId: match.jobId,
                title: job.title,
                company: job.company,
                type: job.type,
                score: match.score,
                matchReasons: match.matchReasons || [],
                feedback: match.feedback || '',
            }
        })
        .filter(Boolean)
        .sort((a: JobMatch, b: JobMatch) => b.score - a.score)

    return matches
}

/**
 * Tek bir CV-İş ilanı eşleştirmesi (detaylı)
 */
export async function analyzeSingleJobMatch(
    cvData: CVData,
    job: JobListing
): Promise<{
    score: number
    strengths: string[]
    weaknesses: string[]
    recommendations: string[]
    feedback: string
}> {
    const cvSummary = getCVSummary(cvData)

    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            {
                role: 'system',
                content: `Sen bir kariyer koçu ve İK uzmanısın. Verilen CV verisi ile iş ilanını detaylı olarak analiz edeceksin.

Yanıtını şu JSON formatında ver:
{
  "score": number (0-100),
  "strengths": ["güçlü yön 1", "güçlü yön 2", ...],
  "weaknesses": ["eksik yön 1", "eksik yön 2", ...],
  "recommendations": ["öneri 1", "öneri 2", ...],
  "feedback": "Genel profesyonel geri bildirim"
}

Türkçe yaz, samimi ve yapıcı ol. Sadece JSON döndür.`,
            },
            {
                role: 'user',
                content: `CV Verisi:
${cvSummary}

İş İlanı:
${JSON.stringify(job, null, 2)}`,
            },
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content || '{}'
    return JSON.parse(content)
}

/**
 * CV'ye göre en uygun ilanları öner
 */
export async function suggestBestJobs(
    cvData: CVData,
    jobs: JobListing[],
    limit: number = 5
): Promise<{ jobId: string; reason: string; isAlternative: boolean }[]> {
    const cvSummary = getCVSummary(cvData)

    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            {
                role: 'system',
                content: `CV profiline en uygun ${limit} iş ilanını seç. 
Eğer profil ile doğrudan eşleşen (mükemmel uyumlu) ilanlar yoksa, CV'deki becerilerle yapılabilecek alternatif veya yakın sektördeki ilanları öner. 

Önemli:
- Eğer tam eşleşme varsa "Uygun İlan" olarak işaretle.
- Eğer beceriler transfer edilebilirse "Alternatif Fırsat" olarak değerlendir.
- Her öneri için neden uygun olduğunu veya neden alternatif olarak önerildiğini kısaca açıkla.

JSON formatında yanıt ver:
{
  "suggestions": [
    { "jobId": "string", "reason": "kısa açıklama", "isAlternative": boolean }
  ]
}

Sadece JSON döndür.`,
            },
            {
                role: 'user',
                content: `CV Bilgisi:
${cvSummary}

İlanlar:
${jobs.map(j => `- ${j.id}: ${j.title} (${j.company}) - ${j.type === 'PUBLIC' ? 'Kamu' : 'Özel'}\n  Açıklama: ${j.description.substring(0, 200)}...`).join('\n')}`,
            },
        ],
        temperature: 0.5,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content || '{"suggestions": []}'
    const result = JSON.parse(content)
    return result.suggestions || []
}
