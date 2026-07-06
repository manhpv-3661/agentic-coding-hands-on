import Image from "next/image";
import { Montserrat } from "next/font/google";

/**
 * "Root Further" narrative content block — Homepage SAA.
 * MoMorph: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM
 * Section root node: `3204:10152` ("Frame 486").
 *
 * Static/presentational only — no external data prop. All copy is sourced
 * verbatim from the Figma design via MoMorph MCP (nodes `3204:10156`,
 * `3204:10161`, `3204:10162`).
 *
 * Font scoped locally (not a shared `fonts.ts`/`globals.css` token) so this
 * file stays self-contained per file-ownership rules for parallel section
 * agents on the same screen.
 *
 * Text-fill note: nodes `3204:10156` and `3204:10162` report their solid
 * white fill under MoMorph's `backgroundColor` field instead of `color` (an
 * export quirk for this section). Both are rendered as white text to match
 * the pull-quote (`3204:10161`), which carries the same
 * `--Details-Text-Secondary-1` (`#FFF`) token explicitly.
 */
const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["700"],
  display: "swap",
});

const BODY_PARAGRAPH_1 =
  "Đứng trước bối cảnh thay đổi như vũ bão của thời đại AI và yêu cầu ngày càng cao từ khách hàng, Sun* lựa chọn chiến lược đa dạng hóa năng lực để không chỉ nỗ lực trở thành tinh anh trong lĩnh vực của mình, mà còn hướng đến một cái đích cao hơn, nơi mọi Sunner đều là “problem-solver” - chuyên gia trong việc giải quyết mọi vấn đề, tìm lời giải cho mọi bài toán của dự án, khách hàng và xã hội.\nLấy cảm hứng từ sự đa dạng năng lực, khả năng phát triển linh hoạt cùng tinh thần đào sâu để bứt phá trong kỷ nguyên AI, “Root Further” đã được chọn để trở thành chủ đề chính thức của Lễ trao giải Sun* Annual Awards 2025.\nVượt ra khỏi nét nghĩa bề mặt, “Root Further” chính là hành trình chúng ta không ngừng vươn xa hơn, cắm rễ mạnh hơn, chạm đến những tầng “địa chất” ẩn sâu để tiếp tục tồn tại, vươn lên và nuôi dưỡng đam mê kiến tạo giá trị luôn cháy bỏng của người Sun*. Mượn hình ảnh bộ rễ liên tục đâm sâu vào lòng đất, mạnh mẽ len lỏi qua từng lớp “trầm tích” để thẩm thấu những gì tinh tuý nhất, người Sun* cũng đang “hấp thụ” dưỡng chất từ thời đại và những thử thách của thị trường để làm mới mình mỗi ngày, mở rộng năng lực và mạnh mẽ “bén rễ” vào kỷ nguyên AI - một tầng “địa chất” hoàn toàn mới, phức tạp và khó đoán, nhưng cũng hội tụ vô vàn tiềm năng cùng cơ hội.";

const PULL_QUOTE =
  " “A tree with deep roots fears no storm”\n (Cây sâu bén rễ, bão giông chẳng nề - Ngạn ngữ Anh)";

const BODY_PARAGRAPH_2 =
  "Trước giông bão, chỉ những tán cây có bộ rễ đủ mạnh mới có thể trụ vững. Một tổ chức với những cá nhân tự tin vào năng lực đa dạng, sẵn sàng kiến tạo và đón nhận thử thách, làm chủ sự thay đổi là tổ chức không chỉ vững vàng trước biến động, mà còn khai thác được mọi lợi thế, chinh phục các thách thức của thời cuộc. Không đơn thuần là tên gọi của chương mới trên hành trình phát triển tổ chức, “Root Further” còn như một lời cổ vũ, động viên mỗi chúng ta hãy dám tin vào bản thân, dám đào sâu, khai mở mọi tiềm năng, dám phá bỏ giới hạn, dám trở thành phiên bản đa nhiệm và xuất sắc nhất của mình. Bởi trong thời đại AI, đa dạng năng lực và tận dụng sức mạnh thời cuộc chính là điều kiện tiên quyết để trường tồn.\nKhông ai biết trước ẩn sâu trong “lòng đất” của ngành công nghệ và thị trường hiện đại còn biết bao tầng “địa chất” bí ẩn. Chỉ biết rằng khi “Root Further” đã trở thành tinh thần cội rễ, chúng ta sẽ không sợ hãi, mà càng thấy háo hức trước bất cứ vùng vô định nào trên hành trình tiến về phía trước. Vì ta luôn tin rằng, trong chính những miền vô tận đó, là bao điều kỳ diệu và cơ hội vươn mình đang chờ ta.";

export function RootFurtherContent() {
  return (
    // mm:3204:10152
    <section className={`${montserrat.className} flex w-full justify-center`}>
      <div className="flex w-full max-w-[1152px] flex-col items-center justify-center gap-8 rounded-[8px] px-[104px] py-[120px]">
        {/* mm:3204:10153 — "Root" / "Further" wordmark lockup */}
        <div className="relative h-[134px] w-[290px] shrink-0">
          {/* mm:3204:10155 */}
          <Image
            src="/homepage-saa/Root-Text.png"
            alt="Root"
            width={189}
            height={67}
            className="absolute top-0 left-[51px]"
          />
          {/* mm:3204:10154 */}
          <Image
            src="/homepage-saa/Further-Text.png"
            alt="Further"
            width={290}
            height={67}
            className="absolute top-[67px] left-0"
          />
        </div>

        {/* mm:5001:14827 */}
        <div className="flex w-full flex-col gap-8">
          {/* mm:3204:10156 */}
          <p className="text-justify text-[24px] leading-[32px] font-bold tracking-[0px] whitespace-pre-line text-white">
            {BODY_PARAGRAPH_1}
          </p>
          {/* mm:3204:10161 */}
          <p className="text-center text-[20px] leading-[32px] font-bold whitespace-pre-line text-white">
            {PULL_QUOTE}
          </p>
          {/* mm:3204:10162 */}
          <p className="text-justify text-[24px] leading-[32px] font-bold tracking-[0px] whitespace-pre-line text-white">
            {BODY_PARAGRAPH_2}
          </p>
        </div>
      </div>
    </section>
  );
}
