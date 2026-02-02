import React from "react";
import { Book } from "@/types/book";

interface BookInfoCardProps {
  book: Book;
  style?: React.CSSProperties;
}

const BookInfoCard: React.FC<BookInfoCardProps> = ({ book, style }) => {
   const { title, volume, authors, code, is_reserved, available } = book;
   let statusLabel = '';
   let statusColor = '#228B22';
   if (is_reserved) {
      statusLabel = 'Reservado';
      statusColor = '#b657b3';
   } else if (available) {
      statusLabel = 'Disponível';
      statusColor = '#00c80e';
   } else {
      statusLabel = 'Emprestado';
      statusColor = '#eb0000';
   }
   return (
    <div
      style={{
        position: 'absolute',
        zIndex: 100,
        minWidth: 220,
        borderRadius: 8,
        padding: '16px 18px',
        color: 'bg-default-bg',
        fontSize: 15,
        ...style,
      }}
      className="bg-default-bg shadow-lg"
    >
      <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>
        {title}
        {volume && String(volume) !== '0' && <span>, vol. {volume}</span>}
      </div>
      <div style={{ fontStyle: 'italic', marginBottom: 4 }}>
        {authors}
      </div>
      {code && <div style={{marginBottom: 4 }}>{code}</div>}
      <div style={{ color: statusColor, fontWeight: 600 }}>
        {statusLabel}
      </div>
    </div>
   );
 };

export default BookInfoCard;
