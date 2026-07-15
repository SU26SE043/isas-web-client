/** Rich mock HTML for Theory Detail reader (en / vi). */
export function buildLessonHtml(title: string, titleVi: string): { content: string; contentVi: string } {
  const content = `
<h2>Overview</h2>
<p>This lesson covers the core ideas behind <strong>${escapeHtml(title)}</strong>. Read carefully, then mark the lesson complete when you are ready for Practice.</p>
<blockquote><p><strong>Tip:</strong> Focus on mental models first. Syntax details become easier once the concepts are clear.</p></blockquote>
<h3>Key concepts</h3>
<ul>
  <li>Declare intent with the right constructs</li>
  <li>Understand mutability and scope</li>
  <li>Prefer explicit types when clarity matters</li>
</ul>
<h3>Example</h3>
<pre><code>const score = 92;
let attempts = 0;
attempts += 1;
console.log(score, attempts);</code></pre>
<p>Inline values like <code>const</code> and <code>let</code> stay readable in prose.</p>
<h3>Comparison</h3>
<table>
  <thead>
    <tr><th>Keyword</th><th>Reassignable</th><th>Scope</th></tr>
  </thead>
  <tbody>
    <tr><td><code>const</code></td><td>No</td><td>Block</td></tr>
    <tr><td><code>let</code></td><td>Yes</td><td>Block</td></tr>
    <tr><td><code>var</code></td><td>Yes</td><td>Function</td></tr>
  </tbody>
</table>
<h3>Checklist</h3>
<ol>
  <li>Read the definitions above</li>
  <li>Try the snippet mentally with different values</li>
  <li>Note one question for Practice</li>
</ol>
<hr />
<p>Learn more on <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types">MDN Grammar and types</a>.</p>
<p><img src="https://placehold.co/800x320/1c1c20/e8e8ea?text=Variables+%26+Types" alt="Variables and types illustration" /></p>
`.trim();

  const contentVi = `
<h2>Tổng quan</h2>
<p>Bài học này giải thích các ý tưởng cốt lõi của <strong>${escapeHtml(titleVi)}</strong>. Đọc kỹ, rồi đánh dấu hoàn thành khi sẵn sàng sang Practice.</p>
<blockquote><p><strong>Gợi ý:</strong> Ưu tiên hiểu mô hình tư duy trước. Cú pháp sẽ dễ hơn khi khái niệm đã rõ.</p></blockquote>
<h3>Khái niệm chính</h3>
<ul>
  <li>Khai báo đúng intentional với construct phù hợp</li>
  <li>Hiểu tính mutable và phạm vi (scope)</li>
  <li>Dùng kiểu tường minh khi cần rõ ràng</li>
</ul>
<h3>Ví dụ</h3>
<pre><code>const score = 92;
let attempts = 0;
attempts += 1;
console.log(score, attempts);</code></pre>
<p>Các giá trị inline như <code>const</code> và <code>let</code> vẫn dễ đọc trong đoạn văn.</p>
<h3>So sánh</h3>
<table>
  <thead>
    <tr><th>Keyword</th><th>Gán lại được?</th><th>Scope</th></tr>
  </thead>
  <tbody>
    <tr><td><code>const</code></td><td>Không</td><td>Block</td></tr>
    <tr><td><code>let</code></td><td>Có</td><td>Block</td></tr>
    <tr><td><code>var</code></td><td>Có</td><td>Function</td></tr>
  </tbody>
</table>
<h3>Checklist</h3>
<ol>
  <li>Đọc các định nghĩa phía trên</li>
  <li>Chạy thử snippet trong đầu với giá trị khác nhau</li>
  <li>Ghi lại một câu hỏi cho phần Practice</li>
</ol>
<hr />
<p>Tham khảo thêm trên <a href="https://developer.mozilla.org/vi/docs/Web/JavaScript/Guide/Grammar_and_types">MDN Grammar and types</a>.</p>
<p><img src="https://placehold.co/800x320/1c1c20/e8e8ea?text=Bien+%26+Kieu+du+lieu" alt="Minh họa biến và kiểu dữ liệu" /></p>
`.trim();

  return { content, contentVi };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
