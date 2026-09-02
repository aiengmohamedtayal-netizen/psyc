import React from 'react'

/**
 * Component to present evidence-based psychiatric citations (e.g. PubMed, NIMH, APA).
 *
 * @param {object} props
 * @param {object} props.reference
 * @param {string} [props.reference.source]
 * @param {string} props.reference.citation
 * @param {string} [props.reference.summary]
 * @param {string} [props.reference.url]
 */
export default function ClinicalCard({ reference }) {
  if (!reference) return null

  const sourceName = reference.source || 'Medical Evidence'

  return (
    <div className="clinical-ref-container">
      <details className="clinical-details">
        <summary className="clinical-summary">
          <span className="clinical-icon">📑</span>
          <span className="clinical-title">
            مرجع سريري موثوق ({sourceName})
          </span>
          <span className="clinical-toggle-icon">▾</span>
        </summary>

        <div className="clinical-body">
          <div className="clinical-citation">
            <strong>الدراسة / المصدر:</strong> {reference.citation}
          </div>

          {reference.summary && (
            <p className="clinical-finding">
              <strong>الخلاصة السريرية:</strong> {reference.summary}
            </p>
          )}

          {reference.url && (
            <a
              href={reference.url}
              target="_blank"
              rel="noopener noreferrer"
              className="clinical-link"
            >
              <span>قراءة البحث الكامل على {sourceName}</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          )}
        </div>
      </details>
    </div>
  )
}
