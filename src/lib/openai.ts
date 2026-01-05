import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default openai

// CV oluşturma için sistem promptu - AI İş Arama Asistanı
export const CV_SYSTEM_PROMPT = `Sen bir profesyonel kariyer danışmanı ve CV uzmanısın. Kullanıcıdan aldığın bilgileri kullanarak Türkiye kamu ve özel sektörü için optimize edilmiş, profesyonel CV'ler oluşturuyorsun.

ÖNEMLİ KURAL - SADECE CV KONULARI:
Sen SADECE CV oluşturma, kariyer danışmanlığı ve iş arama konularında yardımcı olabilirsin.
Eğer kullanıcı CV dışında bir konuda (hava durumu, genel sohbet, kod yazma, tarif, vb.) soru sorarsa veya yardım isterse, kibarca şu şekilde yanıt ver:
"Teşekkürler! 😊 Ben sadece CV oluşturma ve kariyer konularında size yardımcı olabilen bir asistanım. CV'niz hakkında devam etmek ister misiniz? Şu an hangi aşamadayız, size nasıl yardımcı olabilirim?"

CV dışı konuları KESİNLİKLE reddet ama kibar ve samimi ol.

Görevlerin:
1. Kullanıcıdan gerekli bilgileri adım adım topla (kişisel bilgiler, eğitim, iş deneyimi, beceriler, sertifikalar)
2. Her adımda net ve anlaşılır sorular sor
3. Bilgiler tamamlandığında profesyonel bir CV özeti oluştur
4. Kamu ve özel sektör ilanlarına uygun ifadeler kullan
5. Kullanıcının güçlü yönlerini vurgula

Bilgi toplama sırası:
1. Kişisel Bilgiler (ad soyad, doğum tarihi, iletişim)
2. Eğitim (üniversite, bölüm, mezuniyet yılı, not ortalaması)
3. İş Deneyimi (kurum, pozisyon, tarihler, sorumluluklar)
4. Beceriler (teknik, dil, yazılım)
5. Sertifikalar ve Belgeler
6. Referanslar (opsiyonel)

Her yanıtında:
- Doğal ve samimi bir dil kullan
- Kullanıcının verdiği bilgileri özetle ve onayla
- Bir sonraki adım için net soru sor
- Eksik bilgi varsa nazikçe iste

Önemli: Bilgiler tamamen yeterli olduğunda ve tüm adımlar tamamlandığında, son mesajının en sonuna mutlaka [CV_READY] etiketini ekle. Bu etiket sistemin CV oluşturma butonunu aktif etmesini sağlayacak.

Örnek Final Mesajı: "...Verdiğiniz bilgiler için teşekkürler. CV taslağınız hazır! [CV_READY]"`

// CV verisi çıkarma promptu
export const CV_EXTRACTION_PROMPT = `Aşağıdaki chat geçmişinden CV bilgilerini extract et ve JSON formatında döndür:

    {
      "personalInfo": {
        "fullName": "",
        "birthDate": "",
        "email": "",
        "phone": "",
        "address": "",
        "linkedIn": ""
      },
      "education": [
        {
          "institution": "",
          "degree": "",
          "field": "",
          "startDate": "",
          "endDate": "",
          "gpa": ""
        }
      ],
      "experience": [
        {
          "company": "",
          "position": "",
          "startDate": "",
          "endDate": "",
          "description": "",
          "responsibilities": []
        }
      ],
      "skills": {
        "technical": [],
        "languages": [],
        "software": []
      },
      "certificates": [
        {
          "name": "",
          "issuer": "",
          "date": ""
        }
      ],
      "summary": ""
    }

Sadece JSON döndür, başka bir şey yazma.`

// PDF CV işleme promptu
export const PDF_CV_PARSE_PROMPT = `Aşağıdaki metin bir CV'nin PDF'inden çıkarılmıştır. Bu metni analiz et ve yapılandırılmış CV verisi olarak döndür.

Aşağıdaki JSON formatını kullan:

{
  "personalInfo": {
    "fullName": "",
    "birthDate": "",
    "email": "",
    "phone": "",
    "address": "",
    "linkedIn": ""
  },
  "education": [
    {
      "institution": "",
      "degree": "",
      "field": "",
      "startDate": "",
      "endDate": "",
      "gpa": ""
    }
  ],
  "experience": [
    {
      "company": "",
      "position": "",
      "startDate": "",
      "endDate": "",
      "description": "",
      "responsibilities": []
    }
  ],
  "skills": {
    "technical": [],
    "languages": [],
    "software": []
  },
  "certificates": [
    {
      "name": "",
      "issuer": "",
      "date": ""
    }
  ],
  "missingFields": [],
  "summary": ""
}

ÖNEMLİ KURALLAR:
- CV'deki mevcut bilgileri olduğu gibi çıkar ve ilgili alanlara yerleştir
- "missingFields" alanını SADECE gerçekten CV'de tamamen eksik olan kritik bilgiler için kullan
- Eğer CV yeterli bilgi içeriyorsa, "missingFields" alanını BOŞ ARRAY [] olarak bırak
- Eksik alan tespit etmeden önce CV metnini dikkatlice analiz et
- Küçük eksiklikler veya opsiyonel bilgiler için missingFields ekleme

Sadece JSON döndür, başka bir şey yazma.`

// Eksik bilgi sorma promptu
export const MISSING_INFO_PROMPT = `Sen bir kariyer danışmanısın. Kullanıcının CV'sinde bazı eksik bilgiler var. Bu eksik bilgileri nazikçe sor.

Eksik bilgiler: {missingFields}

Kullanıcıdan bu bilgileri adım adım iste. Samimi ve profesyonel bir dil kullan.`

// Chat mesajı için tip tanımları
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface CVData {
  personalInfo: {
    fullName: string
    birthDate: string
    email: string
    phone: string
    address: string
    linkedIn: string
  }
  education: Array<{
    institution: string
    degree: string
    field: string
    startDate: string
    endDate: string
    gpa: string
  }>
  experience: Array<{
    company: string
    position: string
    startDate: string
    endDate: string
    description: string
    responsibilities: string[]
  }>
  skills: {
    technical: string[]
    languages: string[]
    software: string[]
  }
  certificates: Array<{
    name: string
    issuer: string
    date: string
  }>
  summary: string
  missingFields?: string[]
  rawText?: string
  fileName?: string
  uploadedAt?: string
}

// CV oluşturma chat fonksiyonu
export async function generateCVChat(messages: ChatMessage[]): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: CV_SYSTEM_PROMPT },
      ...messages,
    ],
    temperature: 0.7,
    max_tokens: 1000,
  })

  return response.choices[0]?.message?.content || ''
}

// Chat geçmişinden CV verisi extract etme
export async function extractCVData(chatHistory: ChatMessage[]): Promise<CVData> {
  const conversationText = chatHistory
    .map(m => `${m.role}: ${m.content} `)
    .join('\n')

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: CV_EXTRACTION_PROMPT },
      { role: 'user', content: conversationText },
    ],
    temperature: 0,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content || '{}'
  return JSON.parse(content)
}

// PDF metninden CV verisi çıkarma
export async function parsePDFCV(pdfText: string): Promise<CVData> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: PDF_CV_PARSE_PROMPT },
      { role: 'user', content: pdfText },
    ],
    temperature: 0,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content || '{}'
  return JSON.parse(content)
}

// Eksik bilgiler için soru oluşturma
export async function generateMissingInfoQuestions(missingFields: string[]): Promise<string> {
  const prompt = MISSING_INFO_PROMPT.replace('{missingFields}', missingFields.join(', '))

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 500,
  })

  return response.choices[0]?.message?.content || ''
}

// Profesyonel özet oluşturma
export async function generateProfessionalSummary(cvData: CVData): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'Verilen CV bilgilerini kullanarak 2-3 cümlelik profesyonel bir özet yaz. Kamu ve özel sektör için uygun, etkileyici bir dil kullan.',
      },
      {
        role: 'user',
        content: JSON.stringify(cvData),
      },
    ],
    temperature: 0.7,
    max_tokens: 300,
  })

  return response.choices[0]?.message?.content || ''
}

// CV ve İş İlanı uyumluluk analizi
export async function analyzeCVCompatibility(cvData: CVData, jobListing: { title: string; company?: string; description: string; requirements?: string }): Promise<{ score: number; feedback: string; strengths: string[]; improvements: string[] }> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Sen bir İK uzmanısın.Verilen CV verisi ile iş ilanını karşılaştırıp detaylı bir analiz yap.
        
        Yanıtını şu JSON formatında ver:
{
  "score": number(0 - 100 arası uyumluluk puanı),
    "feedback": "string (genel değerlendirme, 2-3 cümle)",
      "strengths": ["string array - adayın güçlü yönleri"],
        "improvements": ["string array - geliştirilmesi gereken alanlar"]
}
        
        Sadece JSON döndür.`,
      },
      {
        role: 'user',
        content: `CV Verisi: ${JSON.stringify(cvData)} \n\nİş İlanı: ${JSON.stringify(jobListing)} `,
      },
    ],
    temperature: 0,
    max_tokens: 1000,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content || '{"score": 0, "feedback": "Analiz başarısız.", "strengths": [], "improvements": []}'
  return JSON.parse(content)
}

// CV'ye uygun iş ilanlarını bulma
export async function findMatchingJobs(cvData: CVData, jobs: Array<{ id: string; title: string; company: string; description: string; requirements?: string }>): Promise<Array<{ jobId: string; score: number; reason: string }>> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Sen bir kariyer eşleştirme uzmanısın.Verilen CV verisini iş ilanlarıyla karşılaştır ve en uygun ilanları bul.
        
        Her ilan için uyumluluk puanı(0 - 100) ve kısa bir açıklama ver.
        
        Yanıtını şu JSON formatında ver:
{
  "matches": [
    {
      "jobId": "string",
      "score": number,
      "reason": "string (neden uygun olduğuna dair kısa açıklama)"
    }
  ]
}
        
        En yüksek puanlı 10 ilanı döndür.Sadece JSON döndür.`,
      },
      {
        role: 'user',
        content: `CV Verisi: ${JSON.stringify(cvData)} \n\nİş İlanları: ${JSON.stringify(jobs)} `,
      },
    ],
    temperature: 0,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content || '{"matches": []}'
  const result = JSON.parse(content)
  return result.matches || []
}
