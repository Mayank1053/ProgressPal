import React from "react";
import { Link } from "react-router-dom";
import { Home, Book, BarChart2, User2 } from "lucide-react";

export const BottomNav = () => {
  const currentPath = window.location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t">
      <div className="container mx-auto px-4 py-2">
        <ul className="flex justify-between items-center">
          <NavItem
            href="/"
            icon={<Home className="h-4 w-4" />}
            label="Home"
            active={currentPath === "/"}
          />
          <NavItem
            href="/courses"
            icon={<Book className="h-4 w-4" />}
            label="Courses"
            active={currentPath.startsWith("/courses")}
          />
          <NavItem
            href="/progress"
            icon={<BarChart2 className="h-4 w-4" />}
            label="Progress"
            active={currentPath === "/progress"}
          />
          <NavItem
            href="/profile"
            icon={<User2 className="h-4 w-4" />}
            label="Profile"
            active={currentPath === "/profile"}
          />
        </ul>
      </div>
    </nav>
  );
};

const NavItem = ({ href, icon, label, active }) => (
  <li>
    <Link
      to={href}
      className={`flex flex-col items-center ${
        active ? "text-primary" : "text-muted-foreground"
      }`}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </Link>
  </li>
);
