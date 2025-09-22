"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FormattedText, { EXAMPLE_MESSAGES } from "./formatted-text";
import { Copy, Check, Eye, Code } from "lucide-react";

export default function FormattingDemo() {
  const [selectedExample, setSelectedExample] = useState(0);
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const formatTypes = [
    {
      format: "*text*",
      description: "Actions & Descriptions",
      example: "*She leaned closer, eyes sparkling*",
      color: "text-muted-foreground italic",
    },
    {
      format: '"text"',
      description: "Spoken Dialogue",
      example: '"Hello there, traveler!"',
      color: "text-foreground font-medium",
    },
    {
      format: "(text)",
      description: "Inner Thoughts",
      example: "(I wonder what they want...)",
      color: "text-muted-foreground/80 italic text-sm",
    },
    {
      format: "text",
      description: "Narration",
      example: "The room fell silent as magic filled the air.",
      color: "text-foreground/95",
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Message Formatting System
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Enhanced text formatting for immersive AI chat responses with clear
            distinction between actions and dialogue.
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="preview">Live Preview</TabsTrigger>
              <TabsTrigger value="guide">Format Guide</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Example Message:
                  </label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRaw(!showRaw)}
                    >
                      <Code className="w-4 h-4 mr-1" />
                      {showRaw ? "Hide" : "Show"} Raw
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(EXAMPLE_MESSAGES[selectedExample])
                      }
                    >
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2">
                  {EXAMPLE_MESSAGES.map((_, index) => (
                    <Button
                      key={index}
                      variant={
                        selectedExample === index ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedExample(index)}
                      className="justify-start text-left h-auto py-2"
                    >
                      Example {index + 1}
                    </Button>
                  ))}
                </div>

                {showRaw && (
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <pre className="text-xs whitespace-pre-wrap text-muted-foreground">
                        {EXAMPLE_MESSAGES[selectedExample]}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-gradient-to-r from-background to-muted/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold">AI</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <FormattedText
                          content={EXAMPLE_MESSAGES[selectedExample]}
                          isUserMessage={false}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="guide" className="space-y-4">
              <div className="grid gap-4">
                {formatTypes.map((type, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="font-mono">
                            {type.format}
                          </Badge>
                          <span className="font-medium">
                            {type.description}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Example input:
                        </p>
                        <code className="block p-2 bg-muted rounded text-xs">
                          {type.example}
                        </code>
                        <p className="text-sm text-muted-foreground">
                          Rendered output:
                        </p>
                        <div className={`p-2 border rounded ${type.color}`}>
                          <FormattedText
                            content={type.example}
                            isUserMessage={false}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="examples" className="space-y-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  AI models are now instructed to use this formatting
                  automatically. Here are examples of properly formatted
                  responses:
                </p>

                {EXAMPLE_MESSAGES.map((message, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        Example {index + 1}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-3 bg-muted/50 rounded">
                          <FormattedText content={message} />
                        </div>
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                            View raw markup
                          </summary>
                          <pre className="mt-2 p-2 bg-background border rounded overflow-x-auto">
                            {message}
                          </pre>
                        </details>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
