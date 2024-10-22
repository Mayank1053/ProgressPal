import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const Quiz = ({ questions, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswerSelect = (index) => {
    setSelectedAnswer(index);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === questions[currentQuestion].correct_answer) {
      setScore(score + 1);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      onComplete(
        score +
          (selectedAnswer === questions[currentQuestion].correct_answer ? 1 : 0)
      );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Question {currentQuestion + 1}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-lg">
            {questions[currentQuestion].question_text}
          </p>
          <RadioGroup value={selectedAnswer} onValueChange={handleAnswerSelect}>
            {questions[currentQuestion].options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value={index} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
          {showExplanation && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <p className="font-semibold">Explanation:</p>
              <p>{questions[currentQuestion].explanation}</p>
            </div>
          )}
          <div className="mt-6 flex justify-between items-center">
            <Button onClick={() => setShowExplanation(!showExplanation)}>
              {showExplanation ? "Hide" : "Show"} Explanation
            </Button>
            <Button
              onClick={handleNextQuestion}
              disabled={selectedAnswer === null}
              className="flex items-center"
            >
              {currentQuestion < questions.length - 1
                ? "Next question"
                : "Finish"}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Quiz;
