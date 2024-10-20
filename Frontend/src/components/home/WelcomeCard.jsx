import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const WelcomeCard = ({ onStartLearning }) => {
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">Welcome to ProgressPal</h2>
            <p className="text-muted-foreground mb-6">
              Learn something new every day. Start with a topic or concept
              you're interested in, and we'll help you master it.
            </p>
            <div className="flex space-x-2">
              <Input
                placeholder="What do you want to learn?"
                className="flex-grow transition-colors"
                onClick={onStartLearning}
                readOnly
              />
              {/* <Button onClick={onStartLearning}>
                <Search className="mr-2 h-4 w-4" /> Start
              </Button> */}
            </div>
          </div>
          <div className="hidden md:block">
            <Image
              src="/vite.svg"
              alt="Learning illustration"
              width={500}
              height={300}
              className="rounded-lg"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
