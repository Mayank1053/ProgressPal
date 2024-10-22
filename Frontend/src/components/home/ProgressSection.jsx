import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";

export const ProgressSection = () => {
  const subjects = ["Algebra", "Art History", "Spanish"];

  return (
    <>
      <h3 className="text-2xl font-semibold mb-4">Your Progress</h3>
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {subjects.map((subject, index) => (
          <Card key={subject}>
            <CardContent className="p-4">
              <Image
                src="/vite.svg"
                alt={subject}
                width={200}
                height={200}
                className="rounded-lg mb-4"
              />
              <h4 className="font-semibold mb-2">{subject}</h4>
              <Progress value={33} className="mb-2" />
              <p className="text-sm text-muted-foreground">
                {index + 1}/10 lessons completed
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};
