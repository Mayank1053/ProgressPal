import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import UserMenu from "../UserMenu";

export const Header = () => {
  return (
    <header className="border-b fixed top-0 left-0 right-0 bg-background z-10">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img
            src="https://i.ibb.co/1JH8J1H/logo.png"
            alt="ProgressPal Logo"
            width={50}
            height={50}
          />
          <h1 className="text-2xl font-bold">ProgressPal</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
};