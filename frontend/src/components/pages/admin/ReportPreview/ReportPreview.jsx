import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePrivacy } from '../../../../contexts/PrivacyContext';
import Swal from 'sweetalert2';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import styles from './ReportPreview.module.css';
import exportStyles from './ReportExport.module.css';

export default function ReportPreview() {
    const location = useLocation();
    const navigate = useNavigate();
    const { anonymizeName } = usePrivacy();
    const [zoom, setZoom] = useState(100);
    const [exporting, setExporting] = useState(false);

    const state = location.state || {};
    const {
        reportTitle = 'Generated Report',
        columns = [],
        data = [],
        isConfidential = false,
        paperSize = 'A4',
        orientation = 'portrait',
        layout = 'table'
    } = state;

    const dateStr = new Date().toLocaleString();

    /* ── PDF Page Dimensions (mm) ──────────────────────────────── */
    const getPageDimensions = () => {
        const sizes = {
            a4:     { w: 210,   h: 297   },
            letter: { w: 215.9, h: 279.4 },
            legal:  { w: 215.9, h: 355.6 }
        };
        const size = sizes[paperSize.toLowerCase()] || sizes.a4;
        return orientation === 'landscape'
            ? { width: size.h, height: size.w }
            : { width: size.w, height: size.h };
    };

    /* ── Save as PDF ── page-by-page via html2canvas + jsPDF ──── */
    const saveAsPDF = () => {
        if (exporting) return;
        setExporting(true);

        // Show fullscreen loading popup immediately via SweetAlert2
        Swal.fire({
            title: 'Generating PDF...',
            html: `<div style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:10px 0">
                <div style="width:56px;height:56px;border:4px solid rgba(56,189,248,0.15);border-top:4px solid #38bdf8;border-radius:50%;animation:swal-spin 0.9s linear infinite"></div>
                <p style="color:#94a3b8;font-size:14px;margin:0">Preparing document for export...</p>
            </div>
            <style>@keyframes swal-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style>`,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            background: '#1e293b',
            color: '#f1f5f9',
            backdrop: 'rgba(15,23,42,0.75)',
            width: 380,
            showClass: { popup: 'swal2-show' },
            customClass: { popup: 'swal-export-popup' }
        });

        const docArea = document.querySelector(`.${styles.documentArea}`);
        if (!docArea) { Swal.close(); setExporting(false); return; }

        // Add exporting class to flatten layout for capture
        docArea.classList.add(exportStyles.isExporting);

        // Use requestAnimationFrame + delay to guarantee DOM repaint before capture
        requestAnimationFrame(() => {
            setTimeout(async () => {
                try {
                    const pageEls = docArea.querySelectorAll('[class*="reportPage"]');
                    if (pageEls.length === 0) throw new Error('No report pages found');

                    const { width: pdfW, height: pdfH } = getPageDimensions();
                    const orient = orientation === 'landscape' ? 'l' : 'p';

                    const doc = new jsPDF({
                        orientation: orient,
                        unit: 'mm',
                        format: paperSize.toLowerCase(),
                        compress: true
                    });

                    for (let i = 0; i < pageEls.length; i++) {
                        Swal.update({
                            html: `<div style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:10px 0">
                                <div style="width:56px;height:56px;border:4px solid rgba(56,189,248,0.15);border-top:4px solid #38bdf8;border-radius:50%;animation:swal-spin 0.9s linear infinite"></div>
                                <p style="color:#f1f5f9;font-size:15px;font-weight:600;margin:0">Rendering page ${i + 1} of ${pageEls.length}...</p>
                                <p style="color:#64748b;font-size:12px;margin:0">Please wait while the document compiles</p>
                            </div>
                            <style>@keyframes swal-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style>`
                        });

                        const canvas = await html2canvas(pageEls[i], {
                            scale: 2,
                            useCORS: true,
                            allowTaint: true,
                            logging: false,
                            backgroundColor: '#ffffff'
                        });

                        const imgData = canvas.toDataURL('image/jpeg', 0.92);
                        if (i > 0) doc.addPage(paperSize.toLowerCase(), orient);
                        doc.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH, undefined, 'FAST');
                    }

                    const filename = `${reportTitle.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
                    doc.save(filename);

                    Swal.fire({
                        icon: 'success',
                        title: 'PDF Saved!',
                        text: `${pageEls.length} pages exported successfully.`,
                        timer: 2000,
                        showConfirmButton: false,
                        background: '#1e293b',
                        color: '#f1f5f9'
                    });
                } catch (err) {
                    console.error('PDF export failed:', err);
                    Swal.fire({
                        icon: 'error',
                        title: 'PDF Export Failed',
                        text: err.message || 'An unknown error occurred.',
                        background: '#1e293b',
                        color: '#f1f5f9'
                    });
                } finally {
                    docArea.classList.remove(exportStyles.isExporting);
                    setExporting(false);
                }
            }, 500);
        });
    };

    /* ── Save as DOCS ── Word-compatible HTML export ─────────── */
    const saveAsDOCS = () => {
        if (exporting) return;
        setExporting(true);

        Swal.fire({
            title: 'Compiling Word Document...',
            html: `<div style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:10px 0">
                <div style="width:56px;height:56px;border:4px solid rgba(56,189,248,0.15);border-top:4px solid #38bdf8;border-radius:50%;animation:swal-spin 0.9s linear infinite"></div>
                <p style="color:#94a3b8;font-size:14px;margin:0">Preparing .doc file for download...</p>
            </div>
            <style>@keyframes swal-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style>`,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            background: '#1e293b',
            color: '#f1f5f9',
            backdrop: 'rgba(15,23,42,0.75)',
            width: 380,
            customClass: { popup: 'swal-export-popup' }
        });

        setTimeout(() => {
            try {
                const docArea = document.querySelector(`.${styles.documentArea}`);
                if (!docArea) throw new Error('Document area not found');

                const htmlContent = docArea.innerHTML;

                // Word-compatible page sizes using pt (most reliable for Word)
                const pageSizes = {
                    'A4-portrait':      { size: '595.3pt 841.9pt' },
                    'A4-landscape':     { size: '841.9pt 595.3pt' },
                    'letter-portrait':  { size: '612pt 792pt' },
                    'letter-landscape': { size: '792pt 612pt' },
                    'legal-portrait':   { size: '612pt 1008pt' },
                    'legal-landscape':  { size: '1008pt 612pt' }
                };
                const sizeKey = `${paperSize}-${orientation}`;
                const pageInfo = pageSizes[sizeKey] || pageSizes['A4-portrait'];

                const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office'
                      xmlns:w='urn:schemas-microsoft-com:office:word'
                      xmlns='http://www.w3.org/TR/REC-html40'>
                <head>
                    <title>${reportTitle}</title>
                    <!--[if gte mso 9]>
                    <xml>
                        <w:WordDocument>
                            <w:View>Print</w:View>
                            <w:Zoom>100</w:Zoom>
                            <w:DoNotOptimizeForBrowser/>
                        </w:WordDocument>
                    </xml>
                    <![endif]-->
                    <style>
                        @page Section1 {
                            size: ${pageInfo.size};
                            margin: 0.6in 0.5in 0.6in 0.5in;
                            mso-header-margin: .3in;
                            mso-footer-margin: .3in;
                            mso-page-orientation: ${orientation};
                        }
                        div.Section1 { page: Section1; }
                        body {
                            font-family: 'Segoe UI', Arial, sans-serif;
                            font-size: 10pt;
                            color: #333;
                            line-height: 1.3;
                        }
                        h1 { font-size: 18pt; color: #0f172a; margin: 0 0 4px 0; }
                        h2 { font-size: 13pt; color: #475569; margin: 0 0 16px 0; font-weight: 500; }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 10px 0;
                            font-size: 9pt;
                        }
                        th, td {
                            border: 1px solid #94a3b8;
                            padding: 5px 6px;
                            text-align: center;
                            vertical-align: middle;
                        }
                        th {
                            background-color: #f1f5f9;
                            font-weight: bold;
                            color: #334155;
                            font-size: 8pt;
                            text-transform: uppercase;
                        }
                        .page-break {
                            page-break-after: always;
                            break-after: page;
                        }
                    </style>
                </head>
                <body>
                <div class="Section1">`;

                const footer = '</div></body></html>';

                // Inject page breaks between report pages
                const wrapper = document.createElement('div');
                wrapper.innerHTML = htmlContent;
                const pages = wrapper.querySelectorAll('[class*="reportPage"]');
                pages.forEach((p, idx) => {
                    if (idx > 0) {
                        const pb = document.createElement('br');
                        pb.style.cssText = 'mso-special-character:line-break; page-break-before:always';
                        pb.className = 'page-break';
                        p.parentNode.insertBefore(pb, p);
                    }
                });

                const source = header + wrapper.innerHTML + footer;
                const blob = new Blob(['\ufeff' + source], {
                    type: 'application/msword;charset=utf-8'
                });

                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${reportTitle.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.doc`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                Swal.fire({
                    icon: 'success',
                    title: 'Word Document Saved!',
                    text: 'Your .doc file has been downloaded.',
                    timer: 2000,
                    showConfirmButton: false,
                    background: '#1e293b',
                    color: '#f1f5f9'
                });
            } catch (err) {
                console.error('DOCS export failed:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'DOCS Export Failed',
                    text: err.message || 'An unknown error occurred.',
                    background: '#1e293b',
                    color: '#f1f5f9'
                });
            } finally {
                setExporting(false);
            }
        }, 500);
    };

    // Ensure we handle confidential data
    const processValue = (key, value) => {
        if (!isConfidential) return value;
        if (key.toLowerCase().includes('name') || key.toLowerCase().includes('email') || key.toLowerCase().includes('owner')) {
            return anonymizeName(value);
        }
        return value;
    };

    // Helper functions for parsing timeline data
    const parseHour = (timeStr) => {
        if (!timeStr) return -1;
        const match = timeStr.match(/^(\d{1,2}):(\d{2}):?(\d{2})?\s*(AM|PM)?$/i);
        if (!match) return -1;
        let hour = parseInt(match[1]);
        const ampm = (match[4] || '').toUpperCase();
        if (ampm === 'AM' && hour === 12) hour = 0;
        else if (ampm === 'PM' && hour !== 12) hour += 12;
        return hour;
    };

    const getShift = (timeStr) => {
        const hour = parseHour(timeStr);
        if (hour < 0) return 'night';
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 18) return 'afternoon';
        return 'night';
    };

    const shortTime = (timeStr) => {
        if (!timeStr) return '—';
        const match = timeStr.match(/^(\d{1,2}):(\d{2}):?\d{0,2}\s*(AM|PM)?$/i);
        if (!match) return timeStr;
        return `${parseInt(match[1])}:${match[2]} ${match[3] || ''}`.trim();
    };

    const formatId = (id) => {
        if (!id || id === '—') return '—';
        if (id.startsWith('CSU-')) return id;
        return `CSU-${id}`;
    };

    const timeToSeconds = (timeStr) => {
        if (!timeStr) return 0;
        const match = timeStr.match(/^(\d{1,2}):(\d{2}):?(\d{2})?\s*(AM|PM)?$/i);
        if (!match) return 0;
        let hour = parseInt(match[1]);
        const min = parseInt(match[2]);
        const sec = match[3] ? parseInt(match[3]) : 0;
        const ampm = (match[4] || '').toUpperCase();
        if (ampm === 'AM' && hour === 12) hour = 0;
        else if (ampm === 'PM' && hour !== 12) hour += 12;
        return hour * 3600 + min * 60 + sec;
    };

    // Calculate/flatten timeline rows if we are using the timeline layout
    const timelineData = useMemo(() => {
        if (layout !== 'timeline') return { rows: [], morningCount: 0, afternoonCount: 0, nightCount: 0 };

        const groupedByUser = data.reduce((acc, curr) => {
            const key = curr.owner_name && curr.owner_name !== 'Unknown'
                ? curr.owner_name
                : (curr.plate || curr.license_plate || curr.plate_number || 'Unknown');
            if (!acc[key]) {
                acc[key] = {
                    name: curr.owner_name && curr.owner_name !== 'Unknown' ? curr.owner_name : key,
                    role: curr.owner_role || curr.role || curr.status || 'Unknown',
                    plate: curr.plate || curr.license_plate || curr.plate_number || '',
                    vehicleType: curr.vehicle_type || '',
                    idNumber: curr.owner_id_number || curr.institutional_id || curr.id_number || '—',
                    shift: curr.shift || 'Day',
                    ownerStatus: curr.owner_status || 'Active',
                    records: []
                };
            }
            acc[key].records.push(curr);
            return acc;
        }, {});

        const rows = [];
        let morningCount = 0, afternoonCount = 0, nightCount = 0;

        Object.values(groupedByUser).forEach(userGroup => {
            const recordsByDay = {};
            userGroup.records.forEach(rec => {
                const d = rec.date || 'Unknown Date';
                if (!recordsByDay[d]) {
                    recordsByDay[d] = {
                        morning: { in: [], out: [] },
                        afternoon: { in: [], out: [] },
                        night: { in: [], out: [] }
                    };
                }
                const shift = getShift(rec.time);
                const isEntry = (rec.direction || '').toLowerCase() === 'entry'
                    || (rec.type || '').toLowerCase() === 'entry';

                if (shift === 'morning') morningCount++;
                else if (shift === 'afternoon') afternoonCount++;
                else nightCount++;

                if (isEntry) {
                    recordsByDay[d][shift].in.push(rec.time);
                } else {
                    recordsByDay[d][shift].out.push(rec.time);
                }
            });

            // Sort times chronologically for each shift
            Object.values(recordsByDay).forEach(dayShifts => {
                ['morning', 'afternoon', 'night'].forEach(s => {
                    dayShifts[s].in.sort((a, b) => timeToSeconds(a) - timeToSeconds(b));
                    dayShifts[s].out.sort((a, b) => timeToSeconds(a) - timeToSeconds(b));
                });
            });

            // Flatten days into rows
            Object.entries(recordsByDay).forEach(([day, shifts]) => {
                rows.push({
                    name: userGroup.name,
                    idNumber: userGroup.idNumber,
                    role: userGroup.role,
                    plate: userGroup.plate,
                    vehicleType: userGroup.vehicleType,
                    ownerStatus: userGroup.ownerStatus,
                    day,
                    shifts
                });
            });
        });

        // Sort rows by Date descending, then Name ascending
        rows.sort((a, b) => new Date(b.day) - new Date(a.day) || a.name.localeCompare(b.name));

        return { rows, morningCount, afternoonCount, nightCount };
    }, [data, layout]);

    // Deterministic Pagination logic
    const pages = useMemo(() => {
        const isLandscape = orientation === 'landscape';
        const isTimeline = layout === 'timeline';

        let firstPageLimit = 22;
        let otherPageLimit = 28;

        if (isTimeline) {
            if (isLandscape) {
                firstPageLimit = 11;
                otherPageLimit = 14;
            } else {
                firstPageLimit = 16;
                otherPageLimit = 20;
            }
        } else {
            if (isLandscape) {
                firstPageLimit = 15;
                otherPageLimit = 20;
            }
        }

        const sourceItems = isTimeline ? timelineData.rows : data;
        const chunks = [];
        let currentIndex = 0;
        let pageNum = 1;

        while (currentIndex < sourceItems.length) {
            const limit = pageNum === 1 ? firstPageLimit : otherPageLimit;
            chunks.push(sourceItems.slice(currentIndex, currentIndex + limit));
            currentIndex += limit;
            pageNum++;
        }

        if (chunks.length === 0) chunks.push([]); // Ensure at least one empty page if no records
        return chunks;
    }, [data, timelineData, layout, orientation]);

    const renderTimeList = (times) => {
        if (!times || times.length === 0) return '—';
        return (
            <div className={styles.timeStack}>
                {times.map((t, idx) => (
                    <div key={idx} className={styles.timeStackItem}>
                        {shortTime(t)}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className={styles.pageContainer}>

            <div className={styles.toolbar}>
                <div className={styles.toolbarTitle}>
                    📄 Report Preview
                    <small>{reportTitle} — {data.length} records</small>
                </div>

                {/* Premium Word-style Zoom Controls */}
                <div className={styles.zoomControls}>
                    <button
                        className={styles.btnZoom}
                        onClick={() => setZoom(prev => Math.max(50, prev - 10))}
                        title="Zoom Out"
                    >
                        ➖
                    </button>
                    <span
                        className={styles.zoomValue}
                        onClick={() => setZoom(100)}
                        title="Reset to 100%"
                    >
                        {zoom}%
                    </span>
                    <button
                        className={styles.btnZoom}
                        onClick={() => setZoom(prev => Math.min(150, prev + 10))}
                        title="Zoom In"
                    >
                        ➕
                    </button>
                </div>

                <div className={styles.toolbarActions}>
                    <button className={`${styles.btn} ${styles.btnPrint}`} onClick={() => window.print()} disabled={exporting}>🖨️ Print</button>
                    <button className={`${styles.btn} ${styles.btnDownload}`} onClick={saveAsPDF} disabled={exporting}>📥 Save as PDF</button>
                    <button className={`${styles.btn} ${styles.btnWord}`} onClick={saveAsDOCS} disabled={exporting}>📝 Save as DOCS</button>
                    <button className={`${styles.btn} ${styles.btnClose}`} onClick={() => navigate(-1)} disabled={exporting}>✕ Close</button>
                </div>
            </div>

            <div className={styles.documentArea} style={{ '--report-zoom': zoom / 100 }}>
                {pages.map((pageRows, pageIdx) => {
                    const isFirstPage = pageIdx === 0;
                    const pageNum = pageIdx + 1;
                    const totalPages = pages.length;

                    return (
                        <div
                            key={pageIdx}
                            className={`${styles.reportPage} ${styles[paperSize]} ${styles[orientation]} ${pageIdx > 0 ? styles.nextPage : ''}`}
                        >
                            {/* Page Header */}
                            {isFirstPage ? (
                                <div className={styles.header}>
                                    <div className={styles.headerLeft}>
                                        <h1>CSUCC ANPR System</h1>
                                        <h2>{reportTitle}</h2>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.miniHeader}>
                                    <span>CSUCC ANPR System — {reportTitle}</span>
                                    <span>Page {pageNum} of {totalPages}</span>
                                </div>
                            )}

                            {/* Meta information (Only on Page 1) */}
                            {isFirstPage && (
                                <div className={styles.meta}>
                                    <div><strong>Generated:</strong> {dateStr}</div>
                                    <div><strong>Total Records:</strong> {data.length}</div>
                                </div>
                            )}

                            {/* Table content */}
                            <div className={styles.tableContainer}>
                                {layout === 'timeline' ? (
                                    <div className={styles.excelContainer}>
                                        <div className={styles.excelTableWrapper}>
                                            <table className={styles.excelTable}>
                                                <colgroup>
                                                    <col style={{ width: '13%' }} /> {/* Owner Name */}
                                                    <col style={{ width: '12%' }} /> {/* Institutional ID */}
                                                    <col style={{ width: '10%' }} /> {/* Role badge */}
                                                    <col style={{ width: '9%' }} />  {/* Plate Number */}
                                                    <col style={{ width: '6%' }} />  {/* Vehicle Type */}
                                                    <col style={{ width: '10%' }} /> {/* Date */}
                                                    <col style={{ width: '6.6%' }} />{/* Morning In */}
                                                    <col style={{ width: '6.6%' }} />{/* Morning Out */}
                                                    <col style={{ width: '6.6%' }} />{/* Afternoon In */}
                                                    <col style={{ width: '6.6%' }} />{/* Afternoon Out */}
                                                    <col style={{ width: '6.8%' }} />{/* Night In */}
                                                    <col style={{ width: '6.8%' }} />{/* Night Out */}
                                                </colgroup>
                                                <thead>
                                                    <tr className={styles.excelHeaderRow}>
                                                        <th className={styles.excelTh}>Owner Name</th>
                                                        <th className={styles.excelTh}>Institutional ID</th>
                                                        <th className={styles.excelTh}>Role</th>
                                                        <th className={styles.excelTh}>Plate Number</th>
                                                        <th className={styles.excelTh}>Type</th>
                                                        <th className={styles.excelTh}>Date</th>
                                                        <th colSpan="2" className={styles.excelColMorning}>Morning</th>
                                                        <th colSpan="2" className={styles.excelColAfternoon}>Afternoon</th>
                                                        <th colSpan="2" className={styles.excelColNight}>Night</th>
                                                    </tr>
                                                    <tr className={styles.excelSubHeaderRow}>
                                                        <th className={styles.excelSubTh}></th>
                                                        <th className={styles.excelSubTh}></th>
                                                        <th className={styles.excelSubTh}></th>
                                                        <th className={styles.excelSubTh}></th>
                                                        <th className={styles.excelSubTh}></th>
                                                        <th className={styles.excelSubTh}></th>
                                                        <th className={styles.excelSubTh}>In</th>
                                                        <th className={styles.excelSubTh}>Out</th>
                                                        <th className={styles.excelSubTh}>In</th>
                                                        <th className={styles.excelSubTh}>Out</th>
                                                        <th className={styles.excelSubTh}>In</th>
                                                        <th className={styles.excelSubTh}>Out</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {pageRows.map((row, idx) => {
                                                        const displayName = processValue('name', row.name);
                                                        const idText = formatId(row.idNumber);
                                                        return (
                                                            <tr key={idx} className={styles.excelTr}>
                                                                <td className={`${styles.excelTd} ${styles.excelName}`}>{displayName}</td>
                                                                <td className={styles.excelTd}>{idText}</td>
                                                                <td className={styles.excelTd}>
                                                                    <span className={`${styles.excelRoleBadge} ${styles[row.role.toLowerCase()] || ''}`}>
                                                                        {row.role}
                                                                    </span>
                                                                </td>
                                                                <td className={`${styles.excelTd} ${styles.excelPlate}`}>{row.plate || '—'}</td>
                                                                <td className={styles.excelTd}>{row.vehicleType || '—'}</td>
                                                                <td className={`${styles.excelTd} ${styles.excelDate}`}>{row.day}</td>

                                                                <td className={`${styles.excelTd} ${row.shifts.morning.in.length > 0 ? styles.excelCellMorningData : ''}`}>
                                                                    {renderTimeList(row.shifts.morning.in)}
                                                                </td>
                                                                <td className={`${styles.excelTd} ${row.shifts.morning.out.length > 0 ? styles.excelCellMorningData : ''}`}>
                                                                    {renderTimeList(row.shifts.morning.out)}
                                                                </td>

                                                                <td className={`${styles.excelTd} ${row.shifts.afternoon.in.length > 0 ? styles.excelCellAfternoonData : ''}`}>
                                                                    {renderTimeList(row.shifts.afternoon.in)}
                                                                </td>
                                                                <td className={`${styles.excelTd} ${row.shifts.afternoon.out.length > 0 ? styles.excelCellAfternoonData : ''}`}>
                                                                    {renderTimeList(row.shifts.afternoon.out)}
                                                                </td>

                                                                <td className={`${styles.excelTd} ${row.shifts.night.in.length > 0 ? styles.excelCellNightData : ''}`}>
                                                                    {renderTimeList(row.shifts.night.in)}
                                                                </td>
                                                                <td className={`${styles.excelTd} ${row.shifts.night.out.length > 0 ? styles.excelCellNightData : ''}`}>
                                                                    {renderTimeList(row.shifts.night.out)}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <table className={styles.table}>
                                        <thead>
                                            <tr>
                                                {columns.map(col => <th key={col.key}>{col.label}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pageRows.map((row, idx) => (
                                                <tr key={idx}>
                                                    {columns.map(col => {
                                                        const val = row[col.key];
                                                        return <td key={col.key}>{val !== null && val !== undefined ? processValue(col.key, val) : '—'}</td>;
                                                    })}
                                                </tr>
                                            ))}
                                            {pageRows.length === 0 && (
                                                <tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: '20px' }}>No records found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            {/* Summary Cards (Only on the VERY LAST Page) */}
                            {pageNum === totalPages && layout === 'timeline' && (
                                <div className={styles.excelSummaryRow}>
                                    <div className={`${styles.excelSummaryCard} ${styles.excelSummaryMorning}`}>
                                        <h4>{timelineData.morningCount}</h4>
                                        <p>Morning Detections</p>
                                    </div>
                                    <div className={`${styles.excelSummaryCard} ${styles.excelSummaryAfternoon}`}>
                                        <h4>{timelineData.afternoonCount}</h4>
                                        <p>Afternoon Detections</p>
                                    </div>
                                    <div className={`${styles.excelSummaryCard} ${styles.excelSummaryNight}`}>
                                        <h4>{timelineData.nightCount}</h4>
                                        <p>Night Detections</p>
                                    </div>
                                    <div className={`${styles.excelSummaryCard} ${styles.excelSummaryTotal}`}>
                                        <h4>{data.length}</h4>
                                        <p>Total Records</p>
                                    </div>
                                </div>
                            )}

                            {/* Elegant Page Footer */}
                            <div className={styles.pageFooter}>
                                <div className={styles.footerText}>
                                    * CONFIDENTIAL — This document contains sensitive system information and is intended for authorized use only. *
                                </div>
                                <div className={styles.pageNumber}>
                                    Page {pageNum} of {totalPages}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
