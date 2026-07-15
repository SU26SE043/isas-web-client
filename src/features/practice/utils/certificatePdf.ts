function escapePdfText(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

export function buildCertificatePdfBlob(lines: string[]): Blob {
  const textOps = lines
    .map((line, index) => {
      const y = 720 - index * 18;
      return `1 0 0 1 72 ${y} Tm (${escapePdfText(line)}) Tj`;
    })
    .join('\n');
  const stream = `BT\n/F1 12 Tf\n${textOps}\nET`;
  const streamLength = stream.length;

  const pdf = `%PDF-1.4
1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj
2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj
3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>endobj
4 0 obj<< /Length ${streamLength} >>stream
${stream}
endstream
endobj
5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj
xref
0 6
0000000000 65535 f 
trailer<< /Size 6 /Root 1 0 R >>
startxref
0
%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}
