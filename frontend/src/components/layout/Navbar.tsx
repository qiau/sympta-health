import { HamburgerMenu } from "iconsax-reactjs";
import logo from "../../assets/logosympta.png";
import type { User } from "../../types/userType";

type NavbarProps = {
  user: User | null;
  onOpenSidebar: () => void;
};

export default function Navbar({ user, onOpenSidebar }: NavbarProps) {
  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b-1 border-gray-200">
        <nav className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button onClick={onOpenSidebar} className="hover:text-gray-700">
              <HamburgerMenu size={24} />
            </button>
            <img src={logo} alt="Sympta Logo" className="h-8 w-auto" />
          </div>

          <div className="text-gray-600 text-sm md:text-base">
            {user ? <>Hai, {user.username}</> : <>Hai, User</>}
          </div>
        </nav>
      </header>
    </>
  );
}
