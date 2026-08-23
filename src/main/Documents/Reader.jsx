import { useState, useMemo } from "react";
import { fileStore, configuration } from "../../lib/config";
import { useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from 'react-pdf';
import '../../styles/Reader.css';
import { App } from "@capacitor/app";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  '/pdf.worker.min.mjs',
  import.meta.url
).toString();

export default function PDFViewer() {
  const navigate = useNavigate();
  const file = fileStore.get();

  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileView, setSetMobileView] = useState(configuration.get('show-document-mobile-view', false));
  const [showOptions, setShowOptions] = useState(configuration.get('show-document-options', false));

  const mobileScale = (window.innerWidth / 500) * 1.5;

  App.addListener('backButton', () => {
    navigate('/home');
  });

  function onDocumentLoadSuccess({ numPages }) {
    setTotalPages(numPages);
    setCurrentPage(1);
  }

  const toggleOptions = () => {
    const newState = !showOptions;
    configuration.save('show-document-options', newState);
    setShowOptions(newState);
  };

  const changePage = (offset) => {
    setCurrentPage((prev) => Math.min(Math.max(prev + offset, 1), totalPages));
  };

  const allPages = useMemo(() => {
    if (totalPages <= 0) return [];

    return Array.from(new Array(totalPages), (el, index) => {
      const pageNumber = index + 1;
      if (mobileView && pageNumber !== currentPage) {
        return null;
      }

      return (
        <div key={`page-wrapper-${pageNumber}`} className="page-container">
          <Page
            pageNumber={pageNumber}
            width={window.innerWidth}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            scale={mobileScale}
            loading={<div className="spinner"></div>}
          />
        </div>
      );
    });
  }, [totalPages, currentPage, mobileView, mobileScale]);

  return (
    <div className="main" id="Reader">
      <div className="top-bar toolbar" style={{ height: showOptions ? '' : '4.5em', transform: showOptions ? '' : 'translateY(-100%)', transition: '0.3s' }}>
        <svg onClick={() => navigate('/')} viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8" />
        </svg>
        <b>{file?.name || "Reader"}</b>
        <svg viewBox="0 0 16 16"><path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" /></svg>
      </div>

      <div 
        id="output-div" 
        onClick={toggleOptions} 
        className={mobileView ? 'mobile-mode' : 'scroll-mode'}
        style={{ paddingTop: mobileView ? '0' : '2em' }}
      >
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div className="spinner"></div>}
        >
          {allPages}
        </Document>

        {mobileView && (
          <>
            <div onClick={(e) => { e.stopPropagation(); changePage(-1); }} className="left-tap"></div>
            <div onClick={(e) => { e.stopPropagation(); changePage(1); }} className="right-tap"></div>
          </>
        )}
      </div>

      <div className="bottom-bar toolbar" style={{ height: showOptions ? '' : '4.5em', transform: showOptions ? '' : 'translateY(100%)', transition: '0.3s' }}>
        <i>{mobileView && `${currentPage} / ${totalPages}`}</i>
        <svg onClick={() => {
          const nextView = !mobileView;
          configuration.save('show-document-mobile-view', nextView);
          setSetMobileView(nextView);
        }} viewBox="0 0 16 16" style={{ fill: mobileView ? 'var(--accent-color)' : '' }}>
          <path d="M11 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
          <path d="M8 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2" />
        </svg>

        <svg onClick={(e) => { e.stopPropagation(); changePage(-1); }} viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0" />
        </svg>

        <svg onClick={(e) => { e.stopPropagation(); changePage(1); }} viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708" />
        </svg>
      </div>
    </div>
  );
}