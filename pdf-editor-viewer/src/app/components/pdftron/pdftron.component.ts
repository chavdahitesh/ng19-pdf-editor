import { Component, ElementRef, Input, OnInit } from '@angular/core';
import WebViewer from '@pdftron/webviewer';

@Component({
  selector: 'app-pdftron',
  imports: [],
  templateUrl: './pdftron.component.html',
  styleUrl: './pdftron.component.scss',
})
export class PdftronComponent implements OnInit {
  @Input() fileUrl!: string;
  @Input() licenseKey?: string;
  @Input() onSave?: (base64String: string) => void;
  private viewerInstance: any;

  constructor(private elRef: ElementRef) {}

  ngOnInit(): void {
    this.initializeWebwiver();
  }

  initializeWebwiver() {
    const viewerElement = this.elRef.nativeElement.querySelector('#viewer');
    WebViewer(
      {
        path: '/webviewer/public',
        fullAPI: true,
      },
      viewerElement
    ).then((instance) => {
      this.viewerInstance = instance;
      const { UI, Core } = this.viewerInstance;
      UI.setTheme('light');
      /** dark | light */

      const { documentViewer, annotationManager } = Core;

      // Listen for the documentLoaded event
      documentViewer.addEventListener('documentLoaded', () => {
        console.log('Document loaded successfully');
      });

      // const _docURL = 'https://pdftron.s3.amazonaws.com/downloads/pl/demo-annotated.pdf'
      const _docURL = 'files/covid19consent.pdf'
      this.loadDocument(_docURL)
    })
    .catch((error) => {
      console.error('Error initializing WebViewer:', error);
    });
  }

  loadDocument(doc:any){
    this.viewerInstance.UI.loadDocument(doc)
  }

  validateFields(): boolean {
    const { Core } = this.viewerInstance;
    const annotationManager = Core.annotationManager;
    const fieldManager = annotationManager.getFieldManager();;
    let isValid = true;

    annotationManager.exportAnnotations().then(() => {
      const fields = fieldManager.getFields();
      console.log('Fields:', fields);

      fields.forEach((field: any) => {
        const value = field.getValue();

        // Validate required fields
        if (field && (!value || value.trim() === '')) {
          isValid = false;
          alert(`Field "${field.name}" is required and cannot be empty.`);
        }

        // Custom validation: Check if the field is a date field
        if (field.name.toLowerCase().includes('date') && !this.isValidDate(value)) {
          isValid = false;
          alert(`Field "${field.name}" contains an invalid date. Please use the format YYYY-MM-DD.`);
        }

        // Custom validation: Check if the field is a signature field
        if (field.name.toLowerCase().includes('signature') ) {
          isValid = false;
          this.getSignatureValue(field.name)
          alert(`Field "${field.name}" must contain a signature.`);
        }
      });

      // Log final validation status
      if (isValid) {
        console.log('All fields are valid.');
      } else {
        console.error('Some fields are invalid. Please correct them.');
      }});
    return isValid;
  }

  isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  removeFields(fieldNames: string[]) {
    const { Core } = this.viewerInstance;
    const annotationManager = Core.annotationManager;

    annotationManager.getFieldManager().forEachField((field:any) => {
      if (fieldNames.includes(field.name)) {
        annotationManager.deleteAnnotation(field.annotation);
      }
    });
  }

  getSignatureValue(fieldName: string): string | null {
    debugger
    const { Core } = this.viewerInstance;
    const annotationManager = Core.annotationManager;
    const fieldManager = annotationManager.getFieldManager();

    const signatureField = fieldManager.getField(fieldName);
    if (!signatureField) {
      console.error(`Signature field "${fieldName}" not found.`);
      return null;
    }

    const associatedAnnot = signatureField?.annotation?.getAssociatedAnnotation();
    if (!associatedAnnot) {
      console.error(`No signature associated with field "${fieldName}".`);
      return null;
    }

    let signatureValue: string | null = null;

    if (associatedAnnot instanceof Core.Annotations.PathAnnotation) {
      // Drawn signature
      signatureValue = associatedAnnot.getPaths().map((path: any) => path.d).join(';');
      console.log('Drawn Signature:', signatureValue);
    } else if (associatedAnnot instanceof Core.Annotations.FreeTextAnnotation) {
      // Typed signature
      signatureValue = associatedAnnot.getContents();
      console.log('Typed Signature:', signatureValue);
    } else if (associatedAnnot instanceof Core.Annotations.StampAnnotation) {
      // Uploaded signature (image)
      signatureValue = associatedAnnot.ImageData; // Base64 encoded image
      console.log('Uploaded Signature (Base64):', signatureValue);
    } else {
      console.warn('Unknown signature type.');
    }

    return signatureValue;
  }


  async saveDocument() {
    const { Core } = this.viewerInstance;

    if (!this.validateFields()) {
      alert('Some fields are invalid or empty.');
      return;
    }

    // Get the file data as a base64 string
    const document = Core.documentViewer.getDocument();
    const data = await document.getFileData({ downloadType: 'blob' });
    const base64String = await this.blobToBase64(data);

    if (this.onSave) {
      this.onSave(base64String);
    } else {
      console.log('Base64 String:', base64String);
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(blob);
    });
  }

  ngOnDestroy(): void {
    if (this.viewerInstance) {
      this.viewerInstance.dispose();
    }
  }
}
