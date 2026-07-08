const DEFAULT_MESSAGE = "Hola! Quiero hacer un pedido.";

export default function WhatsAppFloatingButton() {
  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const href = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Hacé tu pedido por WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#25D366] py-3 pl-3 pr-4 text-sm font-semibold text-white shadow-lg transition hover:bg-[#1ebe5a] hover:shadow-xl sm:bottom-6 sm:right-6"
    >
      <WhatsAppIcon className="h-5 w-5 flex-shrink-0" />
      Hacé tu pedido
    </a>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12.004 2C6.477 2 2 6.477 2 12.004c0 2.12.634 4.096 1.72 5.744L2 22l4.36-1.688A9.955 9.955 0 0 0 12.004 22C17.53 22 22 17.523 22 12.004 22 6.477 17.53 2 12.004 2zm0 18.164a8.14 8.14 0 0 1-4.148-1.13l-.297-.176-3.055 1.184.813-2.984-.194-.306a8.14 8.14 0 0 1-1.264-4.348c0-4.507 3.665-8.172 8.172-8.172 4.507 0 8.172 3.665 8.172 8.172 0 4.507-3.665 8.172-8.172 8.172z" />
    </svg>
  );
}
