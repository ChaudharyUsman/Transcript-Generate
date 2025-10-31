import { Document, Packer, Paragraph, TextRun } from 'docx';

interface DownloadButtonsProps {
  transcriptId: number;
  summary: string;
  highlights?: string[];
  title?: string;
}

export default function DownloadButtons({ transcriptId, summary, highlights, title }: DownloadButtonsProps) {
  const handleDownloadWord = async () => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'Summary:', bold: true })],
            }),
            new Paragraph({
              children: [new TextRun(summary)],
            }),
            new Paragraph({
              children: [new TextRun({ text: 'Highlights:', bold: true })],
            }),
            ...(highlights?.map(highlight => new Paragraph({
              children: [new TextRun(`- ${highlight}`)],
            })) || []),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'summary'}.docx`;
    a.click();
  };

  return (
    <div className="flex gap-4 mt-4 justify-center md:justify-start">
      <button
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl w-full sm:w-auto"
        onClick={handleDownloadWord}
      >
        Download Word File
      </button>
    </div>
  );
}
