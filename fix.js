const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'questions.json');
let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

let nextId = Math.max(...data.map(q => q.id)) + 1;

function getQ(id) {
    return data.find(q => q.id === id);
}

// A. Lỗi kiến thức
let q71 = getQ(71); if (q71) q71.answer = "D";

let q126 = getQ(126); 
if (q126) {
    q126.options.E = "Mối quan hệ giữa lý luận và thực tiễn";
    q126.answer = "E";
}

let q158 = getQ(158); if (q158) q158.answer = "B";
let q160 = getQ(160); if (q160) q160.answer = "C";

let q255 = getQ(255); 
if (q255) {
    q255.options.E = "Tư liệu sản xuất";
    q255.answer = "E";
}

let q344 = getQ(344); if (q344) q344.answer = "C";

let q446 = getQ(446); 
if (q446) q446.options.C = "Vật chất và ý thức";

let q456 = getQ(456); if (q456) q456.answer = "A";

let q492 = getQ(492); 
if (q492) {
    q492.question = q492.question.replace(/427\s*-\s*374/, "460–370").replace(/427\s*-\s*374/, "460–370");
}

let q517 = getQ(517); if (q517) q517.answer = "C";
let q545 = getQ(545); if (q545) q545.answer = "D";

let q556 = getQ(556); 
if (q556) {
    q556.question = "\"Triết học\" là thuật ngữ được sử dụng lần đầu tiên bởi ai?";
    q556.options = {
        "A": "Pythagoras",
        "B": "Socrates",
        "C": "Heraclitus",
        "D": "Thales"
    };
    q556.answer = "A";
}

// B. Lỗi logic / đáp án – giải thích không khớp
let q25 = getQ(25); 
if (q25) {
    q25.explanation = "Việc con người chạy theo lượt xem, lượt thích, bị chi phối bởi các giá trị lệch chuẩn và đánh mất các giá trị/khả năng nhân văn của mình có thể được xem là biểu hiện của tha hóa con người.";
    q25.question = q25.question.replace("không có ch", "không có chuẩn mực");
}

let q48 = getQ(48); 
if (q48) {
    q48.explanation = "Chủ nghĩa xã hội hướng tới giải phóng người lao động, đưa họ lên địa vị làm chủ xã hội trên mọi phương diện.";
}

let q99 = getQ(99); 
if (q99) {
    q99.options = {
        "A": "Tính phong phú, đa dạng",
        "B": "Tính khách quan",
        "C": "Tính tương đối",
        "D": "Tính cụ thể"
    };
}

let q103 = getQ(103); 
if (q103) {
    q103.question = "Trong xã hội có giai cấp, tính chất kế thừa của ý thức xã hội có gắn với tính chất giai cấp không?";
    q103.options = {
        "A": "Không gắn với tính giai cấp",
        "B": "Tùy trường hợp cụ thể",
        "C": "Luôn gắn với tính giai cấp"
    };
}

let q144 = getQ(144); 
if (q144) {
    q144.explanation = "Công xã nguyên thủy, Chiếm hữu nô lệ, Phong kiến, Tư bản chủ nghĩa, Cộng sản chủ nghĩa (giai đoạn đầu là chủ nghĩa xã hội)";
    q144.note = "(Kiểu hỏi khác: Theo quan điểm của chủ nghĩa duy vật lịch sử, loài người đã và đang trải qua bao nhiêu hình thái kinh tế - xã hội?)";
    q144.question = "Hãy xác định luận điểm nào sai khi đề cập đến \"mối quan hệ biện chứng giữa cơ sở hạ tầng và kiến trúc thượng tầng\"?";
}

let q171 = getQ(171); 
if (q171) {
    const q171Options = q171.options;
    q171.question = "Một sinh viên chuẩn bị bài thuyết trình trong một tháng theo cách thức: Tuần đầu phác thảo đề cương và hàng ngày dành 30 phút sửa chữa bổ sung hoàn thiện. Vào buổi thuyết trình sinh viên đã có một bản thảo hoàn chỉnh. Công việc trên đã diễn ra theo quy luật, nguyên lý nào?";
    q171.options = {
        "A": "Quy luật lượng chất",
        "B": "Quy luật mâu thuẫn",
        "C": "Quy luật phủ định của phủ định",
        "D": "Quy luật phát triển"
    };
    q171.answer = "A";

    data.push({
        id: nextId++,
        question: "Đặc trưng chủ yếu của cách mạng xã hội là gì?",
        options: q171Options,
        answer: "C",
        note: "",
        explanation: "",
        keywords: ""
    });
}

let q197 = getQ(197); 
if (q197) {
    q197.options = {
        "A": "Tác phẩm của Nguyễn Du",
        "B": "Tác phẩm thơ lục bát",
        "C": "Tác phẩm có bìa màu xanh",
        "D": "Tác phẩm ra đời vào thế kỷ XVIII"
    };
    q197.answer = "B";
}

let q202 = getQ(202); 
if (q202) {
    const q202Options = q202.options;
    q202.question = "\"Tất cả cái gì đang vận động, đều vận động nhờ một cái khác nào đó\". Nhận định này gắn liền với hệ thống triết học nào? Hãy chọn phương án sai?";
    q202.options = {
        "A": "Triết học duy vật.",
        "B": "Triết học duy tâm.",
        "C": "Triết học duy tâm khách quan.",
        "D": "Triết học duy tâm chủ quan."
    };
    q202.answer = "A";

    data.push({
        id: nextId++,
        question: "Phép biện chứng của triết học Hêghen là:",
        options: q202Options,
        answer: "D",
        note: q202.note,
        explanation: "",
        keywords: ""
    });
    q202.note = "";
}

let q203 = getQ(203); 
if (q203) {
    const q203Options = q203.options;
    q203.question = "Chọn luận điểm thể hiện lập trường triết học duy tâm lịch sử:";
    q203.options = {
        "A": "Quan hệ sản xuất mang tính vật chất.",
        "B": "Yếu tố kinh tế quyết định lịch sử.",
        "C": "Sự vận động và phát triển của xã hội, suy cho cùng là do tư tưởng của con người quyết định.",
        "D": "Kiến trúc thương tầng chỉ đóng vai trò thụ động trong lịch sử."
    };
    q203.answer = "C";

    data.push({
        id: nextId++,
        question: "Triết học trong xã hội có giai cấp được hiểu như thế nào?",
        options: q203Options,
        answer: "A",
        note: "",
        explanation: "",
        keywords: ""
    });
}

let q299 = getQ(299); 
if (q299) {
    q299.explanation = "Nguyên nhân tạo ra kết quả, nhưng để nguyên nhân sinh ra kết quả thì cần phải có những điều kiện nhất định. Nguyên nhân tác động trong những điều kiện càng ít khác nhau thì kết quả sinh ra càng giống nhau.";
}

let q343 = getQ(343); 
if (q343) {
    q343.explanation = "Quá trình quang hợp và hô hấp là hai quá trình trái ngược nhau (hấp thụ/thải ra Oxi và Cacbonic, tổng hợp/phân giải chất hữu cơ) nhưng lại tồn tại thống nhất trong cùng một cơ thể cây, làm tiền đề cho nhau để duy trì sự sống. Đây là biểu hiện của quy luật thống nhất và đấu tranh giữa các mặt đối lập.";
}

let q421 = getQ(421); 
if (q421) {
    const q421Options = q421.options;
    q421.question = "Ai là người khẳng định: \"lao động đã sáng tạo ra bản thân con người\"?";
    q421.options = {
        "A": "Ph.Ăngghen",
        "B": "L.Phoiobác",
        "C": "Immanuel Kant",
        "D": "Béccdren"
    };
    q421.answer = "A";

    data.push({
        id: nextId++,
        question: "Theo quan niệm duy vật biện chứng về lịch sử thì để giải thích đúng đắn các vấn đề của đời sống xã hội thì phải tìm nguyên nhân cuối cùng từ thực trạng phát triển của nền sản xuất vật chất của xã hội đó, mà căn bản là từ trình độ phát triển của:",
        options: q421Options,
        answer: "A",
        note: "",
        explanation: "",
        keywords: ""
    });
}

let q549 = getQ(549); 
if (q549) {
    q549.question = "Theo V.I.Lênin, để có quan niệm đúng, vững chắc về sự phát triển của các hình thái kinh tế - xã hội là một quá trình lịch sử - tự nhiên thì cần phải:";
    q549.options.C = "Quy những quan hệ xã hội vào những quan hệ sản xuất và quy những quan hệ sản xuất vào trình độ phát triển của kỹ thuật, công nghệ hiện thời";
    q549.options.D = "Quy những quan hệ xã hội vào những quan hệ sản xuất và quy những quan hệ sản xuất vào trình độ phát triển của lực lượng sản xuất";
}

let q552 = getQ(552); 
if (q552) {
    q552.question += " (Chọn 2 đáp án)";
}

// C. Lỗi ngữ pháp / diễn đạt / thuật ngữ
let q1 = getQ(1); if (q1) q1.question = q1.question.replace("trường phải", "trường phái");
let q3 = getQ(3); if (q3) q3.question = "Một sinh viên tóm tắt nội dung Quy luật về sự phù hợp giữa quan hệ sản xuất với trình độ phát triển của lực lượng sản xuất như sau. Đáp án nào sau đây là đúng?";
let q8 = getQ(8); if (q8) q8.question = q8.question.replace("cân bằng chi", "cân bằng chỉ").replace("chữ không phải", "chứ không phải");
let q20 = getQ(20); if (q20) q20.options.A = q20.options.A.replace("sự vật khia", "sự vật kia");

let q23 = getQ(23); 
if (q23) {
    q23.question = q23.question.replace("ăn, uống, ở và mặ động, trước khi có thể đấu tranh để giành quyền thống trị, trước khi có thể hoạt động chính tr học...", "ăn, uống, ở và mặc, trước khi có thể làm chính trị, khoa học, nghệ thuật, tôn giáo...");
}

let q42 = getQ(42); 
if (q42) {
    q42.question = q42.question.replace("quản lý xã hộ lĩnh vực bằng", "quản lý xã hội trên các lĩnh vực bằng pháp luật");
}

let q221 = getQ(221); if (q221) q221.options.C = "Tính nhân quả";
let q328 = getQ(328); if (q328) q328.options.D = "Kiến trúc thượng tầng";

// Sort data by ID to keep it clean
data.sort((a, b) => a.id - b.id);

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('Fixes applied successfully.');
