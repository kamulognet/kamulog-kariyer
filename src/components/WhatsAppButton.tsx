'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X } from 'lucide-react'

interface WhatsAppButtonProps {
    phoneNumber?: string
}

export default function WhatsAppButton({ phoneNumber }: WhatsAppButtonProps) {
    const [phone, setPhone] = useState(phoneNumber || '')
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [isVisible, setIsVisible] = useState(true)
    const buttonRef = useRef<HTMLDivElement>(null)
    const dragOffset = useRef({ x: 0, y: 0 })

    useEffect(() => {
        // Load phone from settings
        if (!phoneNumber) {
            fetch('/api/settings/payment')
                .then(res => res.json())
                .then(data => {
                    if (data.whatsappNumber) {
                        setPhone(data.whatsappNumber)
                    }
                })
                .catch(console.error)
        }

        // Load saved position
        const savedPosition = localStorage.getItem('whatsapp-button-position')
        if (savedPosition) {
            try {
                const pos = JSON.parse(savedPosition)
                setPosition(pos)
            } catch {
                // Use default
            }
        } else {
            // Default: bottom-right
            setPosition({ x: window.innerWidth - 80, y: window.innerHeight - 100 })
        }
    }, [phoneNumber])

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!buttonRef.current) return
        setIsDragging(true)
        const rect = buttonRef.current.getBoundingClientRect()
        dragOffset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        }
    }

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return
        const newX = Math.max(0, Math.min(window.innerWidth - 60, e.clientX - dragOffset.current.x))
        const newY = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragOffset.current.y))
        setPosition({ x: newX, y: newY })
    }

    const handleMouseUp = () => {
        if (isDragging) {
            setIsDragging(false)
            localStorage.setItem('whatsapp-button-position', JSON.stringify(position))
        }
    }

    const handleTouchStart = (e: React.TouchEvent) => {
        if (!buttonRef.current) return
        setIsDragging(true)
        const touch = e.touches[0]
        const rect = buttonRef.current.getBoundingClientRect()
        dragOffset.current = {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        }
    }

    const handleTouchMove = (e: TouchEvent) => {
        if (!isDragging) return
        const touch = e.touches[0]
        const newX = Math.max(0, Math.min(window.innerWidth - 60, touch.clientX - dragOffset.current.x))
        const newY = Math.max(0, Math.min(window.innerHeight - 60, touch.clientY - dragOffset.current.y))
        setPosition({ x: newX, y: newY })
    }

    const handleTouchEnd = () => {
        if (isDragging) {
            setIsDragging(false)
            localStorage.setItem('whatsapp-button-position', JSON.stringify(position))
        }
    }

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
            window.addEventListener('touchmove', handleTouchMove)
            window.addEventListener('touchend', handleTouchEnd)
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
            window.removeEventListener('touchmove', handleTouchMove)
            window.removeEventListener('touchend', handleTouchEnd)
        }
    }, [isDragging, position])

    const handleClick = () => {
        if (isDragging) return
        if (!phone) return

        // Format phone - remove non-digits, ensure +90
        let formattedPhone = phone.replace(/\D/g, '')
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '90' + formattedPhone.substring(1)
        } else if (!formattedPhone.startsWith('90')) {
            formattedPhone = '90' + formattedPhone
        }

        const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent('Merhaba, bilgi almak istiyorum.')}`
        window.open(whatsappUrl, '_blank')
    }

    if (!isVisible || !phone) return null

    return (
        <div
            ref={buttonRef}
            className="fixed z-[9999] cursor-grab active:cursor-grabbing"
            style={{ left: position.x, top: position.y }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
        >
            <div className="relative group">
                <button
                    onClick={handleClick}
                    className="w-14 h-14 bg-green-500 hover:bg-green-400 rounded-full shadow-lg shadow-green-500/30 flex items-center justify-center transition-transform hover:scale-110"
                    title="WhatsApp ile İletişim"
                >
                    <MessageCircle className="w-7 h-7 text-white fill-white" />
                </button>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                    WhatsApp ile İletişim
                </div>

                {/* Close button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        setIsVisible(false)
                    }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                    <X className="w-3 h-3 text-white" />
                </button>
            </div>
        </div>
    )
}
