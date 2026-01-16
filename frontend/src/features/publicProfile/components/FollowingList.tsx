import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface FollowingListProps {
  seguindo: Array<{ id: number; nome: string; turma: string; avatar: string | null }>;
  isOwnProfile: boolean;
}

export const FollowingList = ({ seguindo, isOwnProfile }: FollowingListProps) => {
  if (!isOwnProfile) return null;

  return (
    <div className="px-6 py-4">
      <h3 className="text-sm font-bold text-gray-900 uppercase mb-3">Seguindo</h3>
      <div className="space-y-2">
        {seguindo.slice(0, 3).map((pessoa) => (
          <div key={pessoa.id} className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              {pessoa.avatar ? (
                <AvatarImage src={pessoa.avatar} alt={pessoa.nome} />
              ) : null}
              <AvatarFallback className="bg-cm-blue text-white text-xs">
                {pessoa.nome?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <span className="text-sm text-gray-700 block truncate">{pessoa.nome}</span>
              <span className="text-xs text-gray-400">{pessoa.turma}</span>
            </div>
          </div>
        ))}
        {seguindo.length > 3 && (
          <button className="text-xs text-cm-purple hover:underline">
            Ver todos ({seguindo.length})
          </button>
        )}
        {seguindo.length === 0 && (
          <p className="text-xs text-gray-400 italic">Você não segue ninguém</p>
        )}
      </div>
    </div>
  );
};
