/**
 * StudyQuest PDF Cheat Sheet Generator
 * Generates and shares clean, 1-page printable cheat sheets of
 * "What Generic AI Misses" for any subject and target exam.
 */

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export async function generateCheatSheetHtml(subject = 'General', targetExam = 'CBSE Class 12 Boards', topics = []) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const topicRows = topics.map((t, idx) => {
    const blindspot = t.aiBlindspots?.[0] || {
      point: 'Key Boundary Invariant',
      whatAiMisses: 'Examiners deduct marks if boundary exceptions and scientific units are omitted.',
      examinerRubric: 'Required for full marks.',
    };

    const coreConcept = t.coreConcepts?.[0] || t.summary || 'Core theorem and governing equation.';

    return `
      <div class="topic-row ${idx % 2 === 0 ? 'even' : 'odd'}">
        <div class="topic-left">
          <div class="topic-title">${idx + 1}. ${t.title}</div>
          <div class="topic-concept">${coreConcept}</div>
          <div class="topic-relevance">Relevance: ${t.examRelevance || 'High Probability'}</div>
        </div>
        <div class="topic-right">
          <div class="blindspot-title">&#9888; What Generic AI Leaves Out:</div>
          <div class="blindspot-body">${blindspot.whatAiMisses}</div>
          <div class="rubric-note"><strong>Examiner Key:</strong> ${blindspot.examinerRubric}</div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>StudyQuest Cheat Sheet - ${subject}</title>
        <style>
          @page {
            size: A4;
            margin: 14mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #111827;
            background: #FFFFFF;
            margin: 0;
            padding: 0;
            font-size: 11pt;
            line-height: 1.4;
          }
          .header-table {
            width: 100%;
            border-bottom: 2px solid #4F46E5;
            padding-bottom: 10px;
            margin-bottom: 14px;
          }
          .header-title {
            font-size: 18pt;
            font-weight: 800;
            color: #111827;
            letter-spacing: -0.5px;
            margin: 0;
          }
          .header-sub {
            font-size: 10pt;
            color: #4F46E5;
            font-weight: 600;
            margin-top: 3px;
          }
          .header-meta {
            text-align: right;
            font-size: 9pt;
            color: #6B7280;
          }
          .meta-badge {
            display: inline-block;
            background: #EEF2FF;
            color: #4338CA;
            font-weight: 700;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 9pt;
            margin-bottom: 3px;
          }
          .topic-row {
            display: flex;
            border: 1px solid #E5E7EB;
            border-radius: 6px;
            margin-bottom: 10px;
            page-break-inside: avoid;
            background: #FFFFFF;
          }
          .topic-row.even {
            background: #F9FAFB;
          }
          .topic-left {
            width: 44%;
            padding: 10px 12px;
            border-right: 1px solid #E5E7EB;
          }
          .topic-right {
            width: 56%;
            padding: 10px 12px;
            background: #FFFBEB;
            border-top-right-radius: 6px;
            border-bottom-right-radius: 6px;
          }
          .topic-title {
            font-weight: 700;
            font-size: 11pt;
            color: #1F2937;
            margin-bottom: 4px;
          }
          .topic-concept {
            font-size: 9.5pt;
            color: #4B5563;
            margin-bottom: 6px;
            line-height: 1.35;
          }
          .topic-relevance {
            font-size: 8.5pt;
            font-weight: 600;
            color: #D97706;
          }
          .blindspot-title {
            font-size: 9.5pt;
            font-weight: 800;
            color: #B45309;
            margin-bottom: 4px;
          }
          .blindspot-body {
            font-size: 9.5pt;
            color: #1F2937;
            margin-bottom: 6px;
            line-height: 1.35;
          }
          .rubric-note {
            font-size: 8.5pt;
            color: #047857;
            background: #ECFDF5;
            padding: 4px 6px;
            border-radius: 4px;
          }
          .footer {
            margin-top: 14px;
            border-top: 1px solid #E5E7EB;
            padding-top: 8px;
            text-align: center;
            font-size: 8.5pt;
            color: #9CA3AF;
          }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td>
              <h1 class="header-title">StudyQuest &bull; Exam Blindspot Cheat Sheet</h1>
              <div class="header-sub">${subject} &bull; Targeted for ${targetExam}</div>
            </td>
            <td class="header-meta">
              <div class="meta-badge">EXAM READY</div>
              <div>Generated: ${currentDate}</div>
            </td>
          </tr>
        </table>

        <div class="topics-container">
          ${topicRows}
        </div>

        <div class="footer">
          StudyQuest AI Exam Helper &bull; High-Yield Examiner Rubrics &copy; ${new Date().getFullYear()}
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate PDF and trigger native Share Sheet (WhatsApp, Save to Files, Email)
 */
export async function generateAndShareCheatSheetPdf(subject, targetExam, topics) {
  try {
    const html = await generateCheatSheetHtml(subject, targetExam, topics);
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
        dialogTitle: `StudyQuest Cheat Sheet - ${subject}`,
      });
      return { success: true, uri };
    } else {
      return { success: true, uri, fallback: true };
    }
  } catch (err) {
    console.warn('PDF Generation error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Send directly to wireless printer dialog
 */
export async function printCheatSheetDirect(subject, targetExam, topics) {
  try {
    const html = await generateCheatSheetHtml(subject, targetExam, topics);
    await Print.printAsync({ html });
    return { success: true };
  } catch (err) {
    console.warn('Direct print error:', err);
    return { success: false, error: err.message };
  }
}
