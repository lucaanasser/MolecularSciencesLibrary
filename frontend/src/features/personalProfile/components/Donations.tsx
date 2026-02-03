import { Gift } from "lucide-react";

export function Donations({ donations }) {
  if (!donations || donations.length === 0) {
    return (
      <div className="text-center py-12">
        <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p>Você ainda não fez nenhuma doação.</p>
        <a href="/ajude" className="link prose-md">
          Que tal doar um livro?
        </a>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {donations.map((donation) => (
        <div 
          key={donation.id} 
          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-library-purple/10 flex items-center justify-center">
              <Gift className="w-5 h-5 text-library-purple" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{donation.title}</p>
              <p className="text-sm text-gray-500">{donation.author}</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              donation.status === "aceita" 
                ? "bg-cm-green/10 text-cm-green" 
                : "bg-cm-yellow/20 text-cm-orange"
            }`}>
              {donation.status === "aceita" ? "Aceita" : "Em análise"}
            </span>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(donation.date).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
