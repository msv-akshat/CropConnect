
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText } from "lucide-react";

const Documentation = () => {
  const [activeTab, setActiveTab] = useState("faq");

  const faqItems = [
    {
      question: "How do I submit a new crop update?",
      answer: "To submit a new crop update, navigate to your dashboard and click on the 'Add Crop Update' button. Fill in all required fields in the form including crop type, growth stage, quantity, and dates. Click Submit when you're done."
    },
    {
      question: "How long does verification usually take?",
      answer: "Verification typically takes 1-3 business days depending on the volume of submissions. You will receive a notification once your submission has been reviewed."
    },
    {
      question: "What should I do if my submission is rejected?",
      answer: "If your submission is rejected, you will see feedback explaining why. Review the feedback, make the necessary corrections, and submit a new update. Common reasons for rejection include incorrect data or missing information."
    },
    {
      question: "Can I edit a submission after it's been sent?",
      answer: "No, once a submission has been sent, it cannot be edited. If you need to change information, you should delete the original submission and create a new one with the correct information."
    },
    {
      question: "How do I export my data for reports?",
      answer: "You can export your data by using the PDF export feature available in the Reports tab. Select the data range you want to include and click the 'Export PDF' button."
    },
    {
      question: "How does the calendar integration work?",
      answer: "The calendar shows all your planting and expected harvest dates. You can export events to Google Calendar by clicking the 'Export to Google' button on the calendar page."
    },
    {
      question: "Can I print verification certificates for my approved submissions?",
      answer: "Yes, for any approved submission, you can generate a printable verification certificate by clicking the 'Generate Certificate' button in the submission details view."
    }
  ];

  const guides = [
    {
      title: "Getting Started",
      content: `
        <h3>Welcome to CropConnect!</h3>
        <p>This guide will help you get started with using the platform effectively.</p>
        <ol>
          <li>Create an account or login with your existing credentials.</li>
          <li>Complete your profile information to ensure proper verification.</li>
          <li>Explore the dashboard to view your submission history and stats.</li>
          <li>Submit your first crop update using the "Add Crop Update" button.</li>
        </ol>
      `
    },
    {
      title: "Submitting Crop Updates",
      content: `
        <h3>How to Submit Crop Updates</h3>
        <p>Follow these steps to submit crop updates correctly:</p>
        <ol>
          <li>Click the "Add Crop Update" button on your dashboard.</li>
          <li>Select the crop type from the dropdown menu.</li>
          <li>Choose the current growth stage of your crop.</li>
          <li>Enter the quantity in acres.</li>
          <li>Provide planting date and expected harvest date.</li>
          <li>Add any additional notes that might be helpful for verification.</li>
          <li>Click "Submit" to send your update for verification.</li>
        </ol>
      `
    },
    {
      title: "Understanding Verification",
      content: `
        <h3>The Verification Process</h3>
        <p>Here's what happens after you submit an update:</p>
        <ol>
          <li>Your submission enters the "Pending" status and is queued for review.</li>
          <li>A verifying officer will review your submission details.</li>
          <li>The officer may approve or reject your submission.</li>
          <li>If approved, you'll receive a confirmation notification.</li>
          <li>If rejected, you'll receive feedback on why it was rejected.</li>
          <li>You can view the status of all your submissions on your dashboard.</li>
        </ol>
      `
    },
    {
      title: "Using the Calendar",
      content: `
        <h3>Calendar Features</h3>
        <p>The calendar helps you track important dates for your crops:</p>
        <ul>
          <li>All planting dates are marked on the calendar.</li>
          <li>Expected harvest dates are highlighted.</li>
          <li>Different crops are color-coded for easy identification.</li>
          <li>Click on a date to see all events for that day.</li>
          <li>Export calendar events to Google Calendar for external reference.</li>
        </ul>
      `
    },
    {
      title: "Generating Reports",
      content: `
        <h3>Creating and Exporting Reports</h3>
        <p>Generate reports to track your farming activities:</p>
        <ol>
          <li>Navigate to the Reports section in your dashboard.</li>
          <li>Select the date range for your report.</li>
          <li>Choose the type of report you want (submission history, seasonal summary, etc.).</li>
          <li>Click "Generate Report" to view the report.</li>
          <li>Use the "Export PDF" button to download a copy of your report.</li>
          <li>For verification certificates, click "Generate Certificate" on any approved submission.</li>
        </ol>
      `
    }
  ];

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5" />
          Documentation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="guides">User Guides</TabsTrigger>
          </TabsList>
          
          <TabsContent value="faq" className="space-y-4">
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
          
          <TabsContent value="guides" className="space-y-4">
            <Accordion type="single" collapsible className="w-full">
              {guides.map((guide, index) => (
                <AccordionItem key={index} value={`guide-${index}`}>
                  <AccordionTrigger className="text-left">{guide.title}</AccordionTrigger>
                  <AccordionContent>
                    <div dangerouslySetInnerHTML={{ __html: guide.content }} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Documentation;
