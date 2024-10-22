import React, { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const Quiz = ({ questions, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [wrongAnswered, setWrongAnswered] = useState([]);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);

  const handleAnswerSelect = (index) => {
    setSelectedAnswer(index);
    setIsAnswerLocked(true);
    const correct = index === questions[currentQuestion].correct_answer;
    if (correct) {
      setScore(score + 1);
    } else {
      setWrongAnswered([
        ...wrongAnswered,
        questions[currentQuestion].question_text,
      ]);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsAnswerLocked(false);
    } else {
      onComplete(score, wrongAnswered);
    }
  };

  return (
    <div className="bg-background text-foreground pt-16">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Question {currentQuestion + 1}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-lg">
            {questions[currentQuestion].question_text}
          </p>
          <RadioGroup
            value={selectedAnswer}
            onValueChange={handleAnswerSelect}
            disabled={isAnswerLocked}
          >
            {questions[currentQuestion].options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <RadioGroupItem
                  value={index}
                  id={`option-${index}`}
                  className={
                    selectedAnswer !== null
                      ? index === questions[currentQuestion].correct_answer
                        ? "border-green-500"
                        : index === selectedAnswer
                        ? "border-red-500"
                        : ""
                      : ""
                  }
                />
                <Label
                  htmlFor={`option-${index}`}
                  className={
                    selectedAnswer !== null
                      ? index === questions[currentQuestion].correct_answer
                        ? "text-green-500"
                        : index === selectedAnswer
                        ? "text-red-500"
                        : ""
                      : ""
                  }
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {selectedAnswer !== null && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <p className="font-semibold">Explanation:</p>
              <p>{questions[currentQuestion].explanation}</p>
            </div>
          )}
          <div className="mt-6 flex justify-end items-center">
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
