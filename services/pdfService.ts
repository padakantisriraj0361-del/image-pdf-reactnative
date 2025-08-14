import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { ImageItem } from '@/stores/imageStore';

class PDFService {
  async createPDF(images: ImageItem[]): Promise<string> {
    try {
      // For web platform, we'll use a simple approach
      if (Platform.OS === 'web') {
        return await this.createWebPDF(images);
      }
      
      // For mobile platforms, use react-native-pdf-lib
      return await this.createMobilePDF(images);
    } catch (error) {
      console.error('Error creating PDF:', error);
      throw new Error('Failed to create PDF');
    }
  }

  private async createWebPDF(images: ImageItem[]): Promise<string> {
    // For web, we'll create a simple HTML-based PDF approach
    // In a real app, you'd use a proper PDF library
    const htmlContent = this.generateHTMLContent(images);
    
    const fileName = `document_${Date.now()}.html`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
    await FileSystem.writeAsStringAsync(fileUri, htmlContent);
    return fileUri;
  }

  private async createMobilePDF(images: ImageItem[]): Promise<string> {
    // For mobile, we'll simulate PDF creation
    // In a real app, you'd use react-native-pdf-lib or similar
    const fileName = `document_${Date.now()}.pdf`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
    // Create a simple text file as PDF placeholder
    const pdfContent = this.generatePDFContent(images);
    await FileSystem.writeAsStringAsync(fileUri, pdfContent);
    
    return fileUri;
  }

  private generateHTMLContent(images: ImageItem[]): string {
    const imageHtml = images.map(img => 
      `<div class="page">
        <img src="${img.uri}" style="max-width: 100%; height: auto; margin: 20px 0;" />
        <p>Captured: ${new Date(img.timestamp).toLocaleString()}</p>
      </div>`
    ).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Generated Document</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .page { page-break-after: always; text-align: center; }
            h1 { color: #333; margin-bottom: 30px; }
          </style>
        </head>
        <body>
          <h1>Camera Document</h1>
          ${imageHtml}
        </body>
      </html>
    `;
  }

  private generatePDFContent(images: ImageItem[]): string {
    return JSON.stringify({
      type: 'pdf_document',
      created_at: new Date().toISOString(),
      images: images.map(img => ({
        id: img.id,
        timestamp: img.timestamp,
        uri: img.uri
      })),
      total_images: images.length
    }, null, 2);
  }
}

export const pdfService = new PDFService();