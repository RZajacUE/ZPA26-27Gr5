import React, { useState, useRef, useId, useEffect } from 'react';
import { FaBolt, FaArrowTrendUp, FaArrowTrendDown } from 'react-icons/fa6';

/**
 * High-performance, zero-dependency SVG Recharts implementation tailored for React 19.
 * Implements ResponsiveContainer, ComposedChart, LineChart, AreaChart, BarChart,
 * XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, Area, Bar, ReferenceLine.
 */

export function ResponsiveContainer({ children, width = '100%', height = 300, className = '' }) {
  return (
    <div 
      className={`recharts-responsive-wrapper ${className}`} 
      style={{ width, height, position: 'relative', overflow: 'hidden' }}
    >
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, { containerHeight: typeof height === 'number' ? height : 300 });
      })}
    </div>
  );
}

export function ComposedChart({ data = [], events = [], themeColor = '#E11A27', children, containerHeight = 320, margin = { top: 15, right: 18, left: 36, bottom: 22 }, className = '' }) {
  return <BaseSvgChart data={data} events={events} themeColor={themeColor} containerHeight={containerHeight} margin={margin} className={`recharts-composed ${className}`}>{children}</BaseSvgChart>;
}

export function LineChart({ data = [], events = [], themeColor = '#E11A27', children, containerHeight = 320, margin = { top: 15, right: 18, left: 36, bottom: 22 }, className = '' }) {
  return <BaseSvgChart data={data} events={events} themeColor={themeColor} containerHeight={containerHeight} margin={margin} className={`recharts-line ${className}`}>{children}</BaseSvgChart>;
}

export function AreaChart({ data = [], events = [], themeColor = '#E11A27', children, containerHeight = 320, margin = { top: 15, right: 18, left: 36, bottom: 22 }, className = '' }) {
  return <BaseSvgChart data={data} events={events} themeColor={themeColor} containerHeight={containerHeight} margin={margin} className={`recharts-area ${className}`}>{children}</BaseSvgChart>;
}

export function BarChart({ data = [], events = [], themeColor = '#E11A27', children, containerHeight = 320, margin = { top: 15, right: 18, left: 36, bottom: 22 }, className = '' }) {
  return <BaseSvgChart data={data} events={events} themeColor={themeColor} containerHeight={containerHeight} margin={margin} className={`recharts-bar ${className}`}>{children}</BaseSvgChart>;
}

export function XAxis() { return null; }
export function YAxis() { return null; }
export function CartesianGrid() { return null; }
export function Tooltip() { return null; }
export function Legend() { return null; }
export function ReferenceLine() { return null; }
export function Line() { return null; }
export function Area() { return null; }
export function Bar() { return null; }

function BaseSvgChart({ 
  data = [], 
  events = [], 
  themeColor = '#E11A27', 
  children, 
  containerHeight = 320, 
  margin = { top: 15, right: 18, left: 36, bottom: 22 }, 
  className = '' 
}) {
  const chartId = useId();
  const [hoverIndex, setHoverIndex] = useState(null);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [chartWidth, setChartWidth] = useState(1000);

  // Dynamically measure actual container width to prevent chart squeeze
  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        const w = containerRef.current.getBoundingClientRect().width;
        if (w > 50) {
          setChartWidth(Math.round(w));
        }
      }
    };

    updateWidth();

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 50) {
          setChartWidth(Math.round(entry.contentRect.width));
        }
      }
    });

    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Extract config from child elements
  const childArray = React.Children.toArray(children);
  const xAxisChild = childArray.find(c => c.type === XAxis);
  const yAxisChildren = childArray.filter(c => c.type === YAxis);
  const leftYAxis = yAxisChildren.find(c => c.props.orientation !== 'right') || yAxisChildren[0];
  const rightYAxis = yAxisChildren.find(c => c.props.orientation === 'right');
  const gridChild = childArray.find(c => c.type === CartesianGrid);
  const tooltipChild = childArray.find(c => c.type === Tooltip);
  const legendChild = childArray.find(c => c.type === Legend);
  const refLines = childArray.filter(c => c.type === ReferenceLine);

  const seriesChildren = childArray.filter(c => c.type === Line || c.type === Area || c.type === Bar);
  const isBarChart = seriesChildren.some(s => s.type === Bar);

  const xKey = xAxisChild?.props?.dataKey || 'date';
  const width = Math.max(300, chartWidth);
  const height = containerHeight;

  const padLeft = margin.left !== undefined ? margin.left : 36;
  const padRight = margin.right !== undefined ? margin.right : 18;
  const padTop = margin.top !== undefined ? margin.top : 15;
  const padBottom = margin.bottom !== undefined ? margin.bottom : (isBarChart ? 50 : 22);

  const usableW = Math.max(10, width - padLeft - padRight);
  const usableH = Math.max(10, height - padTop - padBottom);

  // Extract observation timestamps for accurate event positioning
  const observationTimestamps = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map(d => {
      const raw = d[xKey];
      if (!raw) return null;
      if (typeof raw === 'string') {
        if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
          const parts = raw.split('-');
          return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime();
        }
        if (/^\d{4}-\d{2}$/.test(raw)) {
          const parts = raw.split('-');
          return new Date(Number(parts[0]), Number(parts[1]) - 1, 15).getTime();
        }
        if (/^\d{4}$/.test(raw)) {
          return new Date(Number(raw), 6, 1).getTime();
        }
        if (raw.includes('.')) {
          const parts = raw.split('.');
          if (parts.length === 3) {
            return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime();
          }
        }
      }
      const t = new Date(raw).getTime();
      return isNaN(t) ? null : t;
    });
  }, [data, xKey]);

  // X coordinate calculation
  const getX = (idx) => {
    if (isBarChart) {
      return padLeft + ((idx + 0.5) / Math.max(1, data.length)) * usableW;
    }
    return padLeft + (idx / Math.max(1, data.length - 1)) * usableW;
  };

  // Map a timestamp to continuous X coordinate
  const getXForTime = (targetTime) => {
    if (!targetTime || observationTimestamps.length < 2) return null;
    const firstTime = observationTimestamps[0];
    const lastTime = observationTimestamps[observationTimestamps.length - 1];
    if (!firstTime || !lastTime) return null;

    if (targetTime <= firstTime) return padLeft;
    if (targetTime >= lastTime) return padLeft + usableW;

    for (let i = 0; i < observationTimestamps.length - 1; i++) {
      const t1 = observationTimestamps[i];
      const t2 = observationTimestamps[i + 1];
      if (t1 && t2 && targetTime >= t1 && targetTime <= t2) {
        const frac = t2 > t1 ? (targetTime - t1) / (t2 - t1) : 0;
        const continuousIdx = i + frac;
        return padLeft + (continuousIdx / Math.max(1, data.length - 1)) * usableW;
      }
    }
    return null;
  };

  // Compute event geometry
  const computedEvents = React.useMemo(() => {
    if (!events || events.length === 0 || observationTimestamps.length < 2) return [];
    const firstTime = observationTimestamps[0];
    const lastTime = observationTimestamps[observationTimestamps.length - 1];
    if (!firstTime || !lastTime) return [];

    return events.map((evt, idx) => {
      let startTime = evt.dateObj ? evt.dateObj.getTime() : new Date(evt.date).getTime();
      let endTime = evt.endDate ? evt.endDate.getTime() : (startTime + (evt.durationDays || 30) * 86400000);

      if (endTime < firstTime || startTime > lastTime) {
        return null; // out of scope for this chart
      }

      const clampedStart = Math.max(firstTime, startTime);
      const clampedEnd = Math.min(lastTime, endTime);

      const xStart = getXForTime(clampedStart);
      const xEnd = getXForTime(clampedEnd);

      if (xStart === null) return null;
      const effectiveXEnd = xEnd !== null && xEnd > xStart ? xEnd : Math.min(padLeft + usableW, xStart + 24);

      return {
        ...evt,
        uniqueId: evt.id || `evt_${idx}`,
        xStart,
        xEnd: effectiveXEnd,
        width: Math.max(8, effectiveXEnd - xStart),
      };
    }).filter(Boolean);
  }, [events, observationTimestamps, usableW, padLeft]);

  if (!data || data.length === 0) {
    return (
      <div className={`chart-empty-state ${className}`} style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Brak danych do wykreślenia</span>
      </div>
    );
  }

  // Calculate Y min & max for left axis (default) and right axis
  let leftMin = Infinity;
  let leftMax = -Infinity;
  let rightMin = Infinity;
  let rightMax = -Infinity;

  seriesChildren.forEach(s => {
    const key = s.props.dataKey;
    const isRight = s.props.yAxisId === 'right';

    data.forEach(d => {
      const v = d[key];
      if (typeof v === 'number' && !isNaN(v)) {
        if (isRight) {
          if (v < rightMin) rightMin = v;
          if (v > rightMax) rightMax = v;
        } else {
          if (v < leftMin) leftMin = v;
          if (v > leftMax) leftMax = v;
        }
      }
      // Check confidence bands or upper/lower bound keys
      if (s.props.upperKey && typeof d[s.props.upperKey] === 'number') {
        if (d[s.props.upperKey] > leftMax) leftMax = d[s.props.upperKey];
      }
      if (s.props.lowerKey && typeof d[s.props.lowerKey] === 'number') {
        if (d[s.props.lowerKey] < leftMin) leftMin = d[s.props.lowerKey];
      }
    });
  });

  // Default fallbacks if no values found
  if (leftMin === Infinity) leftMin = 0;
  if (leftMax === -Infinity) leftMax = 10;
  if (rightMin === Infinity) rightMin = 0;
  if (rightMax === -Infinity) rightMax = 100;

  // Add padding to domain
  const leftDomain = leftYAxis?.props?.domain;
  const effectiveLeftMin = leftDomain && leftDomain[0] !== 'auto' ? leftDomain[0] : (leftMin > 0 ? leftMin * 0.96 : leftMin * 1.04);
  const effectiveLeftMax = leftDomain && leftDomain[1] !== 'auto' ? leftDomain[1] : (leftMax * 1.04);
  const leftSpan = effectiveLeftMax - effectiveLeftMin || 1;

  const rightDomain = rightYAxis?.props?.domain;
  const effectiveRightMin = rightDomain && rightDomain[0] !== 'auto' ? rightDomain[0] : (rightMin * 0.95);
  const effectiveRightMax = rightDomain && rightDomain[1] !== 'auto' ? rightDomain[1] : (rightMax * 1.05);
  const rightSpan = effectiveRightMax - effectiveRightMin || 1;

  // Y coordinate calculation
  const getY = (val, isRight = false) => {
    if (val === null || val === undefined || isNaN(val)) return null;
    const min = isRight ? effectiveRightMin : effectiveLeftMin;
    const span = isRight ? rightSpan : leftSpan;
    const norm = (val - min) / span;
    return padTop + usableH - norm * usableH;
  };

  // Generate SVG path for a line or area
  const generatePath = (key, isArea = false, lowerKey = null, isRight = false) => {
    const validPoints = [];
    data.forEach((d, idx) => {
      const v = d[key];
      if (typeof v === 'number' && !isNaN(v)) {
        const x = getX(idx);
        const y = getY(v, isRight);
        validPoints.push({ x, y, idx, val: v });
      }
    });

    if (validPoints.length === 0) return '';

    let d = `M ${validPoints[0].x} ${validPoints[0].y}`;
    for (let i = 1; i < validPoints.length; i++) {
      d += ` L ${validPoints[i].x} ${validPoints[i].y}`;
    }

    if (isArea) {
      if (lowerKey) {
        // Shaded ribbon between upper and lower keys (e.g. confidence interval)
        for (let i = validPoints.length - 1; i >= 0; i--) {
          const rawRow = data[validPoints[i].idx];
          const lowVal = rawRow[lowerKey];
          const lowY = typeof lowVal === 'number' ? getY(lowVal, isRight) : (padTop + usableH);
          d += ` L ${validPoints[i].x} ${lowY}`;
        }
        d += ' Z';
      } else {
        // Area down to bottom baseline
        const lastX = validPoints[validPoints.length - 1].x;
        const firstX = validPoints[0].x;
        const baseY = padTop + usableH;
        d += ` L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
      }
    }

    return d;
  };

  // Grid lines
  const gridLinesCount = 5;
  const gridYSteps = Array.from({ length: gridLinesCount }, (_, i) => i / (gridLinesCount - 1));

  // Handle Mouse Hover
  const handleMouseMove = (e) => {
    if (!containerRef.current || !data || data.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const mouseX = e.clientX - rect.left;
    const clampedRelX = Math.max(padLeft, Math.min(padLeft + usableW, mouseX));
    const normX = usableW > 0 ? (clampedRelX - padLeft) / usableW : 0;
    const closestIdx = isBarChart 
      ? Math.max(0, Math.min(data.length - 1, Math.floor(normX * data.length)))
      : Math.max(0, Math.min(data.length - 1, Math.round(normX * (data.length - 1))));

    if (closestIdx >= 0 && closestIdx < data.length) {
      setHoverIndex(closestIdx);
    }
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  // Sample X-Axis labels to prevent overlap
  const xStep = Math.max(1, Math.ceil(data.length / 8));
  const activeHoverData = (hoverIndex !== null && hoverIndex >= 0 && hoverIndex < data.length) ? data[hoverIndex] : null;

  return (
    <div 
      ref={containerRef}
      className={`recharts-container-svg ${className}`} 
      style={{ position: 'relative', width: '100%', height }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}
      >
        {gridChild && (
          <g className="recharts-grid" opacity={0.65}>
            {gridYSteps.map((step, i) => {
              const y = padTop + step * usableH;
              return (
                <line
                  key={i}
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke={gridChild.props.stroke || '#E2E8F0'}
                  strokeDasharray={gridChild.props.strokeDasharray || '3 3'}
                />
              );
            })}
          </g>
        )}
        {refLines.map((refLine, idx) => {
          if (refLine.props.y !== undefined) {
            const y = getY(refLine.props.y, refLine.props.yAxisId === 'right');
            if (y === null || isNaN(y)) return null;
            return (
              <g key={idx} className="recharts-reference-line">
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke={refLine.props.stroke || '#EF4444'}
                  strokeDasharray={refLine.props.strokeDasharray || '4 4'}
                  strokeWidth={1.5}
                />
                {refLine.props.label && (
                  <text
                    x={width - padRight - 5}
                    y={y - 5}
                    textAnchor="end"
                    fill={refLine.props.stroke || '#EF4444'}
                    fontSize="11"
                    fontWeight="700"
                  >
                    {refLine.props.label}
                  </text>
                )}
              </g>
            );
          }
          return null;
        })}
        <g className="recharts-y-axis-left" fontSize="11" fill="#64748B" fontWeight="600">
          {gridYSteps.map((step, i) => {
            const y = padTop + (1 - step) * usableH;
            const val = effectiveLeftMin + step * leftSpan;
            const formatter = leftYAxis?.props?.tickFormatter || ((v) => v.toFixed(2));
            return (
              <text key={i} x={padLeft - 8} y={y + 4} textAnchor="end">
                {formatter(val)}
              </text>
            );
          })}
        </g>
        {rightYAxis && (
          <g className="recharts-y-axis-right" fontSize="11" fill="#64748B" fontWeight="600">
            {gridYSteps.map((step, i) => {
              const y = padTop + (1 - step) * usableH;
              const val = effectiveRightMin + step * rightSpan;
              const formatter = rightYAxis.props.tickFormatter || ((v) => `${v.toFixed(0)}%`);
              return (
                <text key={i} x={width - padRight + 8} y={y + 4} textAnchor="start">
                  {formatter(val)}
                </text>
              );
            })}
          </g>
        )}
        <g className="recharts-x-axis" fontSize={isBarChart && data.length > 8 ? "9.5" : "11"} fill="#64748B" fontWeight="600">
          {data.map((d, idx) => {
            if (!d) return null;
            if (!isBarChart && (idx % xStep !== 0 && idx !== data.length - 1)) return null;
            const x = getX(idx);
            const val = d[xKey];
            const formatter = xAxisChild?.props?.tickFormatter;
            let formatted = val ?? '';
            if (formatter && val !== undefined && val !== null) {
              try {
                formatted = formatter(val);
              } catch {
                formatted = val;
              }
            }
            const isAngled = isBarChart && data.length > 8;
            const labelY = isAngled ? padTop + usableH + 16 : height - 8;
            return (
              <text 
                key={idx} 
                x={x} 
                y={labelY} 
                textAnchor={isAngled ? "end" : "middle"}
                transform={isAngled ? `rotate(-35 ${x} ${labelY})` : undefined}
              >
                {String(formatted)}
              </text>
            );
          })}
        </g>
        {seriesChildren.filter(s => s.type === Bar).map((barChild, bIdx) => {
          const key = barChild.props.dataKey;
          const isRight = barChild.props.yAxisId === 'right';
          const fillCol = barChild.props.fill || '#3B82F6';
          const bandW = usableW / Math.max(1, data.length);
          const barW = Math.max(6, Math.min(32, bandW * 0.65));

          const zeroY = getY(0, isRight);
          const bottomY = padTop + usableH;
          const baseY = (zeroY !== null && zeroY <= bottomY && zeroY >= padTop) ? zeroY : bottomY;

          return (
            <g key={`bar-${bIdx}`} className="recharts-bar-group">
              {data.map((d, dIdx) => {
                const v = d[key];
                if (typeof v !== 'number' || isNaN(v)) return null;
                const x = getX(dIdx) - barW / 2;
                const valY = getY(v, isRight);
                if (valY === null || isNaN(valY)) return null;

                const y = Math.min(baseY, valY);
                const h = Math.max(2, Math.abs(baseY - valY));

                return (
                  <rect
                    key={dIdx}
                    x={x}
                    y={y}
                    width={barW}
                    height={h}
                    fill={fillCol}
                    rx={barChild.props.radius || 4}
                    opacity={hoverIndex === null || hoverIndex === dIdx ? 0.95 : 0.4}
                  />
                );
              })}
            </g>
          );
        })}
        {seriesChildren.filter(s => s.type === Area).map((areaChild, aIdx) => {
          const key = areaChild.props.dataKey;
          const lowerKey = areaChild.props.lowerKey || null;
          const isRight = areaChild.props.yAxisId === 'right';
          const pathD = generatePath(key, true, lowerKey, isRight);
          const fillCol = areaChild.props.fill || '#007B3B';
          const fillOp = areaChild.props.fillOpacity !== undefined ? areaChild.props.fillOpacity : 0.14;
          const strokeCol = areaChild.props.stroke || 'transparent';

          return (
            <g key={`area-${aIdx}`} className="recharts-area-group">
              <path d={pathD} fill={fillCol} fillOpacity={fillOp} />
              {strokeCol !== 'transparent' && (
                <path d={generatePath(key, false, null, isRight)} fill="none" stroke={strokeCol} strokeWidth={areaChild.props.strokeWidth || 1.5} />
              )}
            </g>
          );
        })}
        {seriesChildren.filter(s => s.type === Line).map((lineChild, lIdx) => {
          const key = lineChild.props.dataKey;
          const isRight = lineChild.props.yAxisId === 'right';
          const pathD = generatePath(key, false, null, isRight);
          const strokeCol = lineChild.props.stroke || '#0F172A';
          const strokeW = lineChild.props.strokeWidth || 2;
          const dash = lineChild.props.strokeDasharray || 'none';

          const activeVal = hoverIndex !== null && data[hoverIndex] ? data[hoverIndex][key] : null;
          const activeY = typeof activeVal === 'number' && !isNaN(activeVal) ? getY(activeVal, isRight) : null;

          return (
            <g key={`line-${lIdx}`} className="recharts-line-group">
              <path
                d={pathD}
                fill="none"
                stroke={strokeCol}
                strokeWidth={strokeW}
                strokeDasharray={dash}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {activeY !== null && !isNaN(activeY) && (
                <circle
                  cx={getX(hoverIndex)}
                  cy={activeY}
                  r={5}
                  fill={strokeCol}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  className="recharts-active-dot"
                />
              )}
            </g>
          );
        })}
        {computedEvents.map((evt) => {
          const isHovered = hoveredEvent?.uniqueId === evt.uniqueId;
          const strokeCol = themeColor || '#E11A27';

          return (
            <g 
              key={evt.uniqueId} 
              className="chart-event-group"
              onMouseEnter={() => setHoveredEvent(evt)}
              onMouseLeave={() => setHoveredEvent(null)}
            >
              <rect
                x={evt.xStart}
                y={padTop}
                width={evt.width}
                height={usableH}
                fill={strokeCol}
                fillOpacity={isHovered ? 0.22 : 0.08}
                stroke={strokeCol}
                strokeDasharray="4 4"
                strokeWidth={1.5}
                style={{ cursor: 'pointer', transition: 'fill-opacity 0.2s' }}
              />
              <line
                x1={evt.xStart}
                y1={padTop}
                x2={evt.xStart}
                y2={padTop + usableH}
                stroke={strokeCol}
                strokeDasharray="3 3"
                strokeWidth={1.8}
                pointerEvents="none"
              />
              <g 
                transform={`translate(${evt.xStart}, ${padTop + 14})`} 
                style={{ cursor: 'pointer' }}
              >
                <circle
                  r={isHovered ? 12 : 9.5}
                  fill={strokeCol}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  style={{ transition: 'all 0.15s ease' }}
                />
                <path
                  d="M-1.5 -4.5 L1.8 -0.5 L-0.4 0.3 L1.5 4.5 L-1.8 0.5 L0.4 -0.3 Z"
                  fill="#FFFFFF"
                  pointerEvents="none"
                />
              </g>
            </g>
          );
        })}
        {hoverIndex !== null && hoverIndex >= 0 && hoverIndex < data.length && (
          <line
            x1={getX(hoverIndex)}
            y1={padTop}
            x2={getX(hoverIndex)}
            y2={padTop + usableH}
            stroke="#94A3B8"
            strokeDasharray="3 3"
            strokeWidth={1.5}
            pointerEvents="none"
          />
        )}
      </svg>
      {tooltipChild && activeHoverData && hoverIndex !== null && (
        <ChartTooltipOverlay
          data={activeHoverData}
          xKey={xKey}
          seriesChildren={seriesChildren}
          xPos={(getX(hoverIndex) / width) * 100}
          customFormatter={tooltipChild.props.formatter}
          customLabelFormatter={tooltipChild.props.labelFormatter}
          customContent={tooltipChild.props.content}
        />
      )}
      {hoveredEvent && (
        <EventTooltipOverlay
          event={hoveredEvent}
          themeColor={themeColor}
          chartWidth={width}
        />
      )}
      {legendChild && (
        <div className="recharts-legend-wrapper">
          {seriesChildren.map((s, idx) => {
            const name = s.props.name || s.props.dataKey;
            const color = s.props.stroke || s.props.fill || '#334155';
            const isDashed = Boolean(s.props.strokeDasharray && s.props.strokeDasharray !== 'none');
            return (
              <div key={idx} className="legend-item">
                <span 
                  className={`legend-indicator ${isDashed ? 'dashed' : ''}`} 
                  style={{ background: isDashed ? 'transparent' : color, borderColor: color }}
                />
                <span className="legend-text">{name}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ChartTooltipOverlay({ data, xKey, seriesChildren, xPos, customFormatter, customLabelFormatter, customContent }) {
  if (!data) return null;
  if (customContent && React.isValidElement(customContent)) {
    return React.cloneElement(customContent, { active: true, payload: [{ payload: data }] });
  }

  let label = data[xKey] ?? '';
  if (customLabelFormatter) {
    try {
      label = customLabelFormatter(label, data);
    } catch {
      label = data[xKey] ?? '';
    }
  }

  const safeXPct = Math.max(0, Math.min(100, isNaN(xPos) ? 50 : xPos));
  const isRightSide = safeXPct > 55;

  return (
    <div 
      className={`recharts-default-tooltip ${isRightSide ? 'align-left' : 'align-right'}`}
      style={{
        position: 'absolute',
        top: 20,
        left: isRightSide ? 'auto' : `calc(${safeXPct}% + 14px)`,
        right: isRightSide ? `calc(${100 - safeXPct}% + 14px)` : 'auto',
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      <div className="tooltip-title">{String(label)}</div>
      <div className="tooltip-rows">
        {seriesChildren.map((s, idx) => {
          const key = s.props.dataKey;
          const val = data[key];
          if (val === undefined || val === null || (typeof val === 'number' && isNaN(val))) return null;

          const color = s.props.stroke || s.props.fill || '#0F172A';
          const name = s.props.name || key;
          let displayVal = typeof val === 'number' ? val.toFixed(2) : String(val);
          let displayName = name;

          if (customFormatter) {
            try {
              const res = customFormatter(val, name, data);
              if (Array.isArray(res)) {
                displayVal = res[0] !== undefined ? res[0] : displayVal;
                if (res[1]) displayName = res[1];
              } else if (res !== undefined) {
                displayVal = res;
              }
            } catch {
              displayVal = String(val);
            }
          }

          return (
            <div key={idx} className="tooltip-row">
              <span className="tooltip-bullet" style={{ background: color }} />
              <span className="tooltip-name">{displayName}:</span>
              <span className="tooltip-val">{displayVal}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EventTooltipOverlay({ event, themeColor, chartWidth }) {
  if (!event) return null;
  const safeChartW = Math.max(1, chartWidth || 1000);
  const rawXPct = (event.xStart / safeChartW) * 100;
  const safeXPct = Math.max(0, Math.min(100, isNaN(rawXPct) ? 50 : rawXPct));
  const isRightSide = safeXPct > 55;

  return (
    <div
      className={`recharts-event-tooltip ${isRightSide ? 'align-left' : 'align-right'}`}
      style={{
        position: 'absolute',
        top: 15,
        left: isRightSide ? 'auto' : `calc(${safeXPct}% + 14px)`,
        right: isRightSide ? `calc(${100 - safeXPct}% + 14px)` : 'auto',
        maxWidth: 360,
        zIndex: 60,
        pointerEvents: 'none',
      }}
    >
      <div className="event-tooltip-badge" style={{ borderColor: themeColor, color: themeColor }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <FaBolt size={10} /> WYDARZENIE / POLITYKA RYNKOWA
        </span>
      </div>
      <div className="event-tooltip-desc">
        {event.description}
      </div>
      <div className="event-tooltip-details">
        <div className="event-detail-item">
          <span className="detail-lbl">Początek:</span>
          <span className="detail-val">{event.date}</span>
        </div>
        <div className="event-detail-item">
          <span className="detail-lbl">Czas trwania:</span>
          <span className="detail-val">{event.durationDays} dni ({event.endDateStr})</span>
        </div>
        {event.startVal !== undefined && event.startVal !== null && (
          <div className="event-detail-item">
            <span className="detail-lbl">Cena początkowa:</span>
            <span className="detail-val">{typeof event.startVal === 'number' ? event.startVal.toFixed(2) : event.startVal} zł</span>
          </div>
        )}
        {event.endVal !== undefined && event.endVal !== null && (
          <div className="event-detail-item">
            <span className="detail-lbl">Cena pod koniec:</span>
            <span className="detail-val">{typeof event.endVal === 'number' ? event.endVal.toFixed(2) : event.endVal} zł</span>
          </div>
        )}
        {event.pctChange !== undefined && event.pctChange !== null && (
          <div className="event-detail-item change">
            <span className="detail-lbl">Różnica:</span>
            <span className={`detail-val-badge ${event.pctChange > 0 ? 'up' : 'down'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              {event.pctChange > 0 ? (
                <>
                  <FaArrowTrendUp size={9} />
                  <span>+{event.pctChange}%</span>
                </>
              ) : (
                <>
                  <FaArrowTrendDown size={9} />
                  <span>{event.pctChange}%</span>
                </>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

