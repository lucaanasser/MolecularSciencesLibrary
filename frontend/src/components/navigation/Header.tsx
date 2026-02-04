import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useHeaderState } from "@/hooks/useHeaderState";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";
import { cn } from "@/lib/utils";

const Navigation: React.FC = () => {
  const user = useCurrentUser();
  const headerState = useHeaderState(user);

  return (
    <nav className={cn("sticky top-0 z-50 w-full transition-colors duration-300", headerState.navbarBg, headerState.textColor)}>
      <div className="content-container px-4 sm:px-6 lg:px-8 relative z-20 flex justify-between h-24">
        <DesktopNav user={user} headerState={headerState} />
        <MobileNav user={user} headerState={headerState} />
      </div>
    </nav>
  );
};

export default Navigation;
