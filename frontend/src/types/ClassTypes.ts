export interface Activity {
  id: string;
  name: string;
  color: string;
  pdfFile?: File | null;
  websiteLink?: string;
  canvasContent?: string;
}