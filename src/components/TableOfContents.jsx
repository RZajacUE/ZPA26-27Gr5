import React from 'react';
import { 
  FaChartColumn, 
  FaFilter, 
  FaTable, 
  FaChartLine, 
  FaListOl 
} from 'react-icons/fa6';

export default function TableOfContents({ sections, activeSection, onSelectSection, theme = 'orlen' }) {
  const iconMap = {
    stats: <FaChartColumn size={12} />,
    chart: <FaChartLine size={12} />,
    filters: <FaFilter size={12} />,
    table: <FaTable size={12} />,
  };

  return (
    <nav className={`toc-container ${theme}-theme`} aria-label="Spis treści sekcji">
      <div className="toc-inner">
        <div className="toc-title">
          <FaListOl size={13} className="toc-title-icon" />
          <span>Spis sekcji:</span>
        </div>
        <div className="toc-pills-list">
          {sections.map(section => (
            <button
              key={section.id}
              type="button"
              className={`toc-pill ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => {
                onSelectSection?.(section.id);
                const el = document.getElementById(section.id);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            >
              <span className="toc-pill-icon">{iconMap[section.type] || <FaTable size={12} />}</span>
              <span>{section.label}</span>
              {section.badge && <span className="toc-pill-badge">{section.badge}</span>}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

