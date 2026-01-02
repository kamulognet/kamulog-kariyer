import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkLimit, incrementUsage } from '@/lib/usage-limiter'

// Modern CV HTML şablonu
function generateCVHTML(cvData: any): string {
    const { personalInfo = {}, education = [], experience = [], skills = {}, certificates = [], summary = '' } = cvData

    return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>${personalInfo.fullName || 'CV'}</title>
  <style>
    @page {
      size: A4;
      margin: 20mm;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #333;
      background: #fff;
    }
    .container {
      max-width: 210mm;
      margin: 0 auto;
      padding: 15mm;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .name {
      font-size: 28pt;
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 8px;
    }
    .contact {
      display: flex;
      justify-content: center;
      gap: 20px;
      flex-wrap: wrap;
      font-size: 10pt;
      color: #666;
    }
    .contact-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .section {
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 14pt;
      font-weight: 600;
      color: #1e40af;
      border-bottom: 2px solid #dbeafe;
      padding-bottom: 5px;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .summary {
      font-style: italic;
      color: #555;
      padding: 10px;
      background: #f8fafc;
      border-left: 4px solid #2563eb;
      margin-bottom: 20px;
    }
    .item {
      margin-bottom: 15px;
    }
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .item-title {
      font-weight: 600;
      color: #1e3a5f;
    }
    .item-subtitle {
      color: #666;
      font-size: 10pt;
    }
    .item-date {
      color: #888;
      font-size: 9pt;
      white-space: nowrap;
    }
    .item-description {
      margin-top: 5px;
      color: #555;
      font-size: 10pt;
    }
    .responsibilities {
      margin-top: 8px;
      padding-left: 20px;
    }
    .responsibilities li {
      margin-bottom: 3px;
      color: #555;
      font-size: 10pt;
    }
    .skills-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
    }
    .skill-category {
      background: #f8fafc;
      padding: 10px;
      border-radius: 5px;
    }
    .skill-category-title {
      font-weight: 600;
      color: #1e40af;
      font-size: 10pt;
      margin-bottom: 5px;
    }
    .skill-list {
      list-style: none;
    }
    .skill-list li {
      font-size: 10pt;
      color: #555;
      padding: 2px 0;
    }
    .certificates-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    .certificate {
      background: #f8fafc;
      padding: 8px 12px;
      border-radius: 5px;
      font-size: 10pt;
    }
    .certificate-name {
      font-weight: 600;
      color: #1e3a5f;
    }
    .certificate-issuer {
      color: #666;
      font-size: 9pt;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1 class="name">${personalInfo.fullName || ''}</h1>
      <div class="contact">
        ${personalInfo.email ? `<span class="contact-item">📧 ${personalInfo.email}</span>` : ''}
        ${personalInfo.phone ? `<span class="contact-item">📱 ${personalInfo.phone}</span>` : ''}
        ${personalInfo.address ? `<span class="contact-item">📍 ${personalInfo.address}</span>` : ''}
        ${personalInfo.linkedIn ? `<span class="contact-item">🔗 ${personalInfo.linkedIn}</span>` : ''}
      </div>
    </header>

    ${summary ? `
    <div class="summary">
      ${summary}
    </div>
    ` : ''}

    ${education.length > 0 ? `
    <section class="section">
      <h2 class="section-title">Eğitim</h2>
      ${education.map((edu: any) => `
        <div class="item">
          <div class="item-header">
            <div>
              <div class="item-title">${edu.institution || ''}</div>
              <div class="item-subtitle">${edu.degree || ''} - ${edu.field || ''}</div>
            </div>
            <div class="item-date">${edu.startDate || ''} - ${edu.endDate || ''}</div>
          </div>
          ${edu.gpa ? `<div class="item-description">Not Ortalaması: ${edu.gpa}</div>` : ''}
        </div>
      `).join('')}
    </section>
    ` : ''}

    ${experience.length > 0 ? `
    <section class="section">
      <h2 class="section-title">İş Deneyimi</h2>
      ${experience.map((exp: any) => `
        <div class="item">
          <div class="item-header">
            <div>
              <div class="item-title">${exp.position || ''}</div>
              <div class="item-subtitle">${exp.company || ''}</div>
            </div>
            <div class="item-date">${exp.startDate || ''} - ${exp.endDate || 'Devam Ediyor'}</div>
          </div>
          ${exp.description ? `<div class="item-description">${exp.description}</div>` : ''}
          ${exp.responsibilities && exp.responsibilities.length > 0 ? `
            <ul class="responsibilities">
              ${exp.responsibilities.map((r: string) => `<li>${r}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `).join('')}
    </section>
    ` : ''}

    ${(skills.technical?.length || skills.languages?.length || skills.software?.length) ? `
    <section class="section">
      <h2 class="section-title">Beceriler</h2>
      <div class="skills-grid">
        ${skills.technical?.length ? `
          <div class="skill-category">
            <div class="skill-category-title">Teknik Beceriler</div>
            <ul class="skill-list">
              ${skills.technical.map((s: string) => `<li>• ${s}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        ${skills.languages?.length ? `
          <div class="skill-category">
            <div class="skill-category-title">Dil Becerileri</div>
            <ul class="skill-list">
              ${skills.languages.map((s: string) => `<li>• ${s}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        ${skills.software?.length ? `
          <div class="skill-category">
            <div class="skill-category-title">Yazılım</div>
            <ul class="skill-list">
              ${skills.software.map((s: string) => `<li>• ${s}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    </section>
    ` : ''}

    ${certificates.length > 0 ? `
    <section class="section">
      <h2 class="section-title">Sertifikalar</h2>
      <div class="certificates-list">
        ${certificates.map((cert: any) => `
          <div class="certificate">
            <div class="certificate-name">${cert.name || ''}</div>
            <div class="certificate-issuer">${cert.issuer || ''} ${cert.date ? `- ${cert.date}` : ''}</div>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}
  </div>
</body>
</html>
`
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Limit kontrolü
        const limitCheck = await checkLimit(session.user.id, 'PDF_EXPORT')
        if (!limitCheck.allowed) {
            return NextResponse.json({
                error: 'Aylık PDF export limitinize ulaştınız',
                limit: limitCheck.limit,
                current: limitCheck.current,
            }, { status: 429 })
        }

        const { cvId } = await req.json()

        if (!cvId) {
            return NextResponse.json({ error: 'CV ID gerekli' }, { status: 400 })
        }

        const cv = await prisma.cV.findUnique({
            where: { id: cvId },
        })

        if (!cv) {
            return NextResponse.json({ error: 'CV bulunamadı' }, { status: 404 })
        }

        if (cv.userId !== session.user.id && session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 })
        }

        const cvData = JSON.parse(cv.data)
        const html = generateCVHTML(cvData)

        // Kullanımı artır
        await incrementUsage(session.user.id, 'PDF_EXPORT')

        // HTML döndür - client tarafında print/PDF yapılacak
        return NextResponse.json({
            html,
            title: cv.title,
            remaining: limitCheck.remaining - 1,
        })
    } catch (error) {
        console.error('Export PDF error:', error)
        return NextResponse.json({ error: 'PDF oluşturulamadı' }, { status: 500 })
    }
}
