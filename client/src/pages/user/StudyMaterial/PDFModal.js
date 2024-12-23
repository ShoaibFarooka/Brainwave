import { useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import ReactModal from "react-modal";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@2.15.349/build/pdf.worker.min.js`;

const PDFModal = ({ modalIsOpen, closeModal, documentUrl }) => {
  const canvasRef = useRef(null);

  const renderPDF = (url) => {
    const loadingTask = pdfjsLib.getDocument(url);  
    loadingTask.promise
      .then((pdf) => {
        console.log("PDF loaded");

        return pdf.getPage(1);
      })
      .then((page) => {
        console.log("Page loaded");

        const scale = 1.5; 
        const viewport = page.getViewport({ scale: scale });

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        page.render(renderContext);
      })
      .catch((error) => {
        console.error("Error loading PDF:", error);
      });
  };

  useEffect(() => {
    if (modalIsOpen && documentUrl) {
      renderPDF(documentUrl); 
    }
  }, [modalIsOpen, documentUrl]);

  return (
    <ReactModal
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      contentLabel="Document Preview"
      style={{
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          marginRight: "-50%",
          transform: "translate(-50%, -50%)",
          width: "50%",
          height: "80%",
          padding: "20px",
          borderRadius: "10px",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <button
        onClick={closeModal}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "transparent",
          border: "none",
          fontSize: "20px",
          cursor: "pointer",
        }}
      >
        X
      </button>

      <div style={{ flex: "1", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "auto" }} />
      </div>

     
    </ReactModal>
  );
};

export default PDFModal;
