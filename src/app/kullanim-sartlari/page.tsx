import { redirect } from 'next/navigation'

// /kullanim-sartlari -> /kullanim-kosullari yönlendirmesi
export default function KullanimSartlariPage() {
    redirect('/kullanim-kosullari')
}
