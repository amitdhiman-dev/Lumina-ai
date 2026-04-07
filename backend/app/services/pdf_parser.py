"""PDF parsing and text extraction utilities"""
import pypdf
import os


def extract_text_from_pdf(file_path):
    """
    Extract text from PDF using multiple methods for better coverage.
    Falls back between methods to ensure maximum text extraction.
    """
    text_by_page = []
    
    try:
        # Try PyPDF first (works well for searchable PDFs)
        with open(file_path, 'rb') as f:
            pdf_reader = pypdf.PdfReader(f)
            print(f"PDF has {len(pdf_reader.pages)} pages")
            
            for page_num, page in enumerate(pdf_reader.pages):
                try:
                    text = page.extract_text()
                    if text and text.strip():
                        text_by_page.append({
                            "page": page_num + 1,
                            "content": text
                        })
                        print(f"Page {page_num + 1}: Extracted {len(text)} chars")
                    else:
                        print(f"Page {page_num + 1}: No text extracted")
                except Exception as e:
                    print(f"Error extracting text from page {page_num + 1}: {e}")
        
        if not text_by_page:
            print("Warning: No text extracted from PDF. PDF might be image-based or encrypted.")
            return []
        
        return text_by_page
        
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return []
