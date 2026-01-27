import { TabsCard } from "../../lib/TabsCard";
import { BookOpen, Gift, User } from "lucide-react";

const tabs = [
  { id: "tab1", label: "Livros", icon: BookOpen },
  { id: "tab2", label: "Presentes", icon: Gift },
  { id: "tab3", label: "Perfil", icon: User },
];

const getTabColor = (tabId: string) => {
  switch (tabId) {
    case "tab1": return "cm-blue";
    case "tab2": return "cm-green";
    case "tab3": return "cm-purple";
    default: return "cm-purple";
  }
};

export default function ExampleTabsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-xl">
        <TabsCard tabs={tabs} getTabColor={getTabColor}>
          <div>
            <h2 className="font-bold mb-2">Livros</h2>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Mauris consequat, velit eu dictum facilisis, sapien erat malesuada enim, nec dictum ex enim eu sem. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Mauris consequat, velit eu dictum facilisis, sapien erat malesuada enim, nec dictum ex enim eu sem. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Mauris consequat, velit eu dictum facilisis, sapien erat malesuada enim, nec dictum ex enim eu sem. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Mauris consequat, velit eu dictum facilisis, sapien erat malesuada enim, nec dictum ex enim eu sem.
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Mauris consequat, velit eu dictum facilisis, sapien erat malesuada enim, nec dictum ex enim eu sem. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Mauris consequat, velit eu dictum facilisis, sapien erat malesuada enim, nec dictum ex enim eu sem. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Mauris consequat, velit eu dictum facilisis, sapien erat malesuada enim, nec dictum ex enim eu sem. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Mauris consequat, velit eu dictum facilisis, sapien erat malesuada enim, nec dictum ex enim eu sem.
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Mauris consequat, velit eu dictum facilisis, sapien erat malesuada enim, nec dictum ex enim eu sem. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Mauris consequat, velit eu dictum facilisis, sapien erat malesuada enim, nec dictum ex enim eu sem. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Mauris consequat, velit eu dictum facilisis, sapien erat malesuada enim, nec dictum ex enim eu sem. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Mauris consequat, velit eu dictum facilisis, sapien erat malesuada enim, nec dictum ex enim eu sem.
            <br /><br />
            Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo.
          </div>
          <div>
            <h2 className="font-bold mb-2">Presentes</h2>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Mauris consequat, velit eu dictum facilisis, sapien erat malesuada enim, nec dictum ex enim eu sem. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Mauris consequat, velit eu dictum facilisis, sapien erat malesuada enim, nec dictum ex enim eu sem. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Mauris consequat, velit eu dictum facilisis, sapien erat malesuada enim, nec dictum ex enim eu sem. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Mauris consequat, velit eu dictum facilisis, sapien erat malesuada enim, nec dictum ex enim eu sem.
            <br /><br />
            Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo.
          </div>
          <div>
            <h2 className="font-bold mb-2">Perfil</h2>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Mauris consequat, velit eu dictum facilisis, sapien erat malesuada enim, nec dictum ex enim eu sem. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Mauris consequat, velit eu dictum facilisis, sapien erat malesuada enim, nec dictum ex enim eu sem. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Mauris consequat, velit eu dictum facilisis, sapien erat malesuada enim, nec dictum ex enim eu sem. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Mauris consequat, velit eu dictum facilisis, sapien erat malesuada enim, nec dictum ex enim eu sem.
            <br /><br />
            Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo.
          </div>
        </TabsCard>
      </div>
    </div>
  );
}
