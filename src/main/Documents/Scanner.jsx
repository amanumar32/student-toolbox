import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DocumentScanner } from "@capgo/capacitor-document-scanner";
import { jsPDF } from "jspdf";
import '../../styles/Scanner.css';
import { device } from "../../lib/config";

export default function PDFScanner() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [images, setImages] = useState([]);
  const [documentTitle, setDocumentTitle] = useState(`student_toolbox_scan_-_${Date.now()}`);


  const generatePDF = async (images) => {
    setIsProcessing(true);
    let title = documentTitle;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();

    images.forEach((imgData, index) => {
      if (index > 0) pdf.addPage();

      pdf.addImage(`data:image/jpeg;base64,${imgData}`, 'JPEG', 0, 0, width, height, undefined, 'FAST');
    });

    setIsProcessing(false);
    if (!title) title = `student_toolbox_scan_-_${Date.now()}`
    pdf.save(title.endsWith('.pdf') ? title : `${title}.pdf`);
  };

  function removeImage(index) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function addImage() {
    setIsProcessing(true);
    try {
      const { scannedImages } = await DocumentScanner.scanDocument({
        letUserAdjustCrop: true,
        maxNumDocuments: 24,
        scannerMode: 'full',
        responseType: 'base64',
      });
      if (scannedImages.length > 0) {
        setImages((prev) => [...prev, ...scannedImages]);
      }
    } catch (error) {
      console.error("Scanning failed:", error);
      device.toast("Scanning failed. Attempting to convert images from files.");
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = true;
      input.onchange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
          Promise.all(files.map(file => {
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                const base64Data = reader.result.split(',')[1];
                resolve(base64Data);
              };
              reader.onerror = (err) => reject(err);
              reader.readAsDataURL(file);
            });
          })).then(base64Images => {
            setImages((prev) => [...prev, ...base64Images]);
          }).catch(err => {
            console.error("Failed to read files:", err);
            device.toast("Failed to read selected files.");
          });
        }
      };
      input.click();
    } finally {
      setIsProcessing(false);
    }
  }

  async function convertPDF() {
    if (images.length === 0) return;
    await generatePDF(images);
  }

  return (
    <div id="Scanner">
      {isProcessing && <div className="spinner"></div>}
      <div className="row top">
        <svg viewBox="0 0 16 16" onClick={() => { navigate('/') }}>
          <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8" />
        </svg>
        <input type="text" value={documentTitle} onInput={(e) => { setDocumentTitle(e.target.value) }} />
        <p>{images.length}</p>
      </div>
      <div className="panel">
        {
          images.map((img, index) => (
            <div key={index} className="scanned-image">
              <div className="remove-image" onClick={() => { removeImage(index) }}><svg viewBox="0 0 16 16"> <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" /> </svg></div>
              <img src={`data:image/jpeg;base64,${img}`} alt={`Scan ${index + 1}`} />
            </div>
          ))
        }
        <div className="empty-image" onClick={addImage}>
          <svg class="bi bi-plus-lg" viewBox="0 0 16 16"> <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" /> </svg>
        </div>
        {
          images.length > 0 && <div className="convert-image" onClick={convertPDF}>
            <svg viewBox="0 0 16 16">
              <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0" />
            </svg>
          </div>
        }
      </div>
    </div>
  );
}