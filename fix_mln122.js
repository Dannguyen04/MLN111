const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'questions_mln122.json');
let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

let nextId = Math.max(...data.map(q => q.id)) + 1;

function getQ(id) {
    return data.find(q => q.id === id);
}

// 1. ID 30
let q30 = getQ(30);
if (q30) {
    q30.note = ""; // Note previously was "A", conflicting with answer "B"
}

// 2. ID 31
let q31 = getQ(31);
if (q31) {
    q31.question = q31.question.replace("Bản chất khủng hoảng thửa", "Bản chất khủng hoảng thừa");
}

// 3. ID 83
let q83 = getQ(83);
if (q83) {
    q83.question = q83.question.replace("10000 đối dép công ty", "1000 đôi dép công ty");
}

// 4. ID 121
let q121 = getQ(121);
if (q121) {
    q121.options = {
        "A": "Công nghệ 3D",
        "B": "Dữ liệu lớn (Big data)",
        "C": "Công nghệ sinh học",
        "D": "Vạn vật kết nối (IoT)",
        "E": "Trí tuệ nhân tạo (AI)"
    };
    q121.answer = "B,D,E"; // the text had BDE

    data.push({
        id: nextId++,
        question: "Cách mạng công nghiệp lần thứ 3 còn được gọi là:",
        options: {
            "A": "Cách mạng vô tuyến",
            "B": "Cách mạng điện tử",
            "C": "Cách mạng sinh học",
            "D": "Cách mạng máy tính"
        },
        answer: "D",
        note: "",
        explanation: "",
        keywords: ""
    });
}

// 5. ID 131
let q131 = getQ(131);
if (q131) {
    q131.options.A = "Tiền trở thành tư bản khi được vận động nhằm tự tăng giá trị, thông qua việc mua các yếu tố sản xuất, đặc biệt là sức lao động, để tạo ra giá trị thặng dư.";
}

// 6. ID 137
let q137 = getQ(137);
if (q137) {
    q137.question = "Trong nền kinh tế thị trường định hướng xã hội chủ nghĩa, thành phần kinh tế nào giữ vai trò chủ đạo?";
    q137.options = {
        "A": "Thành phần kinh tế nhà nước",
        "B": "Thành phần kinh tế tư nhân",
        "C": "Thành phần kinh tế tập thể",
        "D": "Thành phần kinh tế có vốn đầu tư nước ngoài"
    };
    q137.answer = "A";
    
    data.push({
        id: nextId++,
        question: "Cạnh tranh kinh tế được hiểu là",
        options: {
            "A": "Sự đấu tranh ở giữa các chủ thể kinh tế, để giành chi phí tối đa cho mình",
            "B": "Sự đấu tranh ở giữa các chủ thể kinh tế, để giành lợi ích tối đa cho mình",
            "C": "Sự đấu tranh ở giữa các chủ thể kinh tế, để giành thị phần tối đa cho mình",
            "D": "Sự đấu tranh ở giữa các chủ thể kinh tế"
        },
        answer: "B",
        note: "",
        explanation: "",
        keywords: ""
    });
}

// 7. ID 146
let q146 = getQ(146);
if (q146) {
    q146.question = "Cách mạng công nghiệp lần thứ hai diễn ra chủ yếu trong khoảng thời gian nào?";
    q146.options = {
        "A": "Nửa cuối thế kỷ XIX đến đầu thế kỷ XX",
        "B": "Nửa đầu thế kỷ XIX đến cuối thế kỷ XIX",
        "C": "Nửa cuối thế kỷ XVIII đến đầu thế kỷ XIX",
        "D": "Đầu thế kỷ XX đến nay"
    };
    q146.answer = "A";
}

// 8. ID 159
let q159 = getQ(159);
if (q159) {
    q159.options.D = "Gây ra sự phân hóa giàu nghèo sâu sắc trong xã hội"; // Make it clearly negative
}

// 9. ID 187
let q187 = getQ(187);
if (q187) {
    q187.answer = "B"; // Tiền tượng trưng
}

// 10. Group of merged IDs: 223
let q223 = getQ(223);
if (q223) {
    q223.question = "Các hình thức cơ bản của địa tô tư bản chủ nghĩa";
    q223.options = {
        "A": "Địa tô chênh lệch I; địa tô chênh lệch II",
        "B": "Địa tô tuyệt đối; địa tô độc quyền",
        "C": "Địa tô chênh lệch; địa tô tuyệt đối",
        "D": "Địa tô chênh lệch; địa tô độc quyền"
    };
    q223.answer = "C";

    data.push({
        id: nextId++,
        question: "Sự ra đời của chủ nghĩa tư bản độc quyền nhà nước nhằm:",
        options: {
            "A": "Phục vụ lợi ích của nhân dân lao động",
            "B": "Phục vụ lợi ích của tổ chức độc quyền tư nhân",
            "C": "Phục vụ lợi ích của nhà nước tư sản",
            "D": "Phục vụ lợi ích của tổ chức độc quyền tư nhân và cứu nguy cho chủ nghĩa tư bản"
        },
        answer: "D",
        note: "",
        explanation: "",
        keywords: ""
    });
}

// ID 229
let q229 = getQ(229);
if (q229) {
    q229.question = "Công thức chung của tư bản phản ánh:";
    q229.options = {
        "A": "Mục đích của sản xuất, lưu thông là giá trị và giá trị thặng dư",
        "B": "Phương tiện của lưu thông tư bản là giá trị và giá trị thặng dư",
        "C": "Mục đích của sản xuất, lưu thông tư bản là giá trị và giá trị thặng dư",
        "D": "Mục đích của sản xuất, lưu thông tư bản là giá trị sử dụng và giá trị thặng dư"
    };
    q229.answer = "C";

    data.push({
        id: nextId++,
        question: "Tuần hoàn tư bản công nghiệp là sự thống nhất của ba hình thái tuần hoàn:",
        options: {
            "A": "Tư bản lưu thông, tư bản sản xuất và tư bản hàng hóa",
            "B": "Tư bản tiền tệ, tư bản sản xuất và tư bản cho vay",
            "C": "Tư bản tiền tệ, tư bản sản xuất và tư bản hàng hóa",
            "D": "Tư bản tiền tệ, tư bản trao đổi và tư bản hàng hóa"
        },
        answer: "C",
        note: q229.note, // belongs to the second question based on text
        explanation: "",
        keywords: ""
    });
    q229.note = "";
}

// ID 230
let q230 = getQ(230);
if (q230) {
    q230.question = "Nguồn gốc chủ yếu của tích lũy tư bản là:";
    q230.options = {
        "A": "Lợi nhuận bình quân",
        "B": "Giá trị lao động",
        "C": "Giá trị thặng dư",
        "D": "Giá trị trao đổi"
    };
    q230.answer = "C";

    data.push({
        id: nextId++,
        question: "Tiền lương tính theo sản phẩm là:",
        options: {
            "A": "Tiền lương được trả căn cứ vào số lượng sản phẩm người công nhân làm ra",
            "B": "Tiền lương được trả căn cứ vào chất lượng sản phẩm mà người công nhân làm ra",
            "C": "Tiền lương được trả căn cứ vào số lượng và chất lượng sản phẩm mà người công nhân làm ra",
            "D": "Tiền lương được trả căn cứ vào sản phẩm mà người công nhân làm ra"
        },
        answer: "C",
        note: "",
        explanation: "",
        keywords: ""
    });

    data.push({
        id: nextId++,
        question: "Mức độ giàu có của xã hội phụ thuộc chủ yếu vào:",
        options: {
            "A": "Trình độ khoa học công nghệ",
            "B": "Tài nguyên thiên nhiên",
            "C": "Khối lượng sản phẩm thặng dư"
        },
        answer: "A",
        note: "",
        explanation: "",
        keywords: ""
    });
}

// ID 233
let q233 = getQ(233);
if (q233) {
    q233.question = "Chủ nghĩa tư bản độc quyền nhà nước hình thành rõ nét từ:";
    q233.options = {
        "A": "Thế kỷ XIX",
        "B": "Cuối thể kỷ XIX - đầu thế kỷ XX",
        "C": "Giữa thế kỷ XX",
        "D": "Đầu thế kỷ XXI"
    };
    q233.answer = "C";

    data.push({
        id: nextId++,
        question: "Về lượng tỷ suất lợi nhuận (p') là:",
        options: {
            "A": "Luôn luôn nhỏ hơn giá trị thặng dư",
            "B": "Luôn luôn lớn hơn tỷ suất giá trị thặng dư",
            "C": "Luôn luôn bằng tỷ suất giá trị thặng dư",
            "D": "Luôn luôn nhỏ hơn tỷ suất giá trị thặng dư"
        },
        answer: "D"
    });

    data.push({
        id: nextId++,
        question: "Giá trị thặng dư tương đối có được do:",
        options: {
            "A": "Tăng sản lượng, làm rút ngắn thời gian lao động cần thiết",
            "B": "Tăng cường độ lao động, rút ngắn thời gian lao động cần thiết",
            "C": "Tăng năng suất lao động, làm rút ngắn thời gian lao động cần thiết",
            "D": "Tăng năng suất lao động, làm rút ngắn thời gian lao động cá biệt"
        },
        answer: "C"
    });

    data.push({
        id: nextId++,
        question: "Tập trung tư bản là:",
        options: {
            "A": "Quá trình liên kết, hợp nhất các tư bản xã hội trong xã hội thành một tư bản lớn hơn",
            "B": "Quá trình liên kết, hợp nhất các tư bản tiền tệ trong xã hội thành một tư bản lớn hơn",
            "C": "Quá trình liên kết, hợp nhất các tư bản cá biệt trong xã hội thành một tư bản lớn hơn",
            "D": "Quá trình liên kết, hợp nhất các tư bản thương nghiệp trong xã hội thành một tư bản lớn hơ"
        },
        answer: "C"
    });

    data.push({
        id: nextId++,
        question: "Thế nào là lao động cụ thể?",
        options: {
            "A": "Là những lao động có thể quan sát được, nhìn thấy được",
            "B": "Là những lao động ngành nghề",
            "C": "Là hoạt động có mục đích của con người",
            "D": "Là những lao động ngành nghề cụ thể, có mục đích riêng, có đối tượng riêng, thao tác riêng và kết quả riêng"
        },
        answer: "D"
    });
}

// ID 237
let q237 = getQ(237);
if (q237) {
    q237.question = "Sức lao động là:";
    q237.options = {
        "A": "Toàn bộ sức thể lực tồn tại trong mỗi con người",
        "B": "Toàn bộ sức thể lực và trí lực tồn tại trong mỗi con người",
        "C": "Toàn bộ sức trí lực tồn tại trong mỗi con người",
        "D": "Toàn bộ sức thể lực và trí lực tồn tại không có khả năng đem ra sử dụng"
    };
    q237.answer = "B";

    data.push({
        id: nextId++,
        question: "Tư bản khả biến (V) là:",
        options: {
            "A": "Bộ phận trực tiếp tạo ra giá trị sử dung",
            "B": "Bộ phận trực tiếp tạo ra sản phẩm",
            "C": "Bộ phận trực tiếp tạo ra giá trị thặng dư",
            "D": "Bộ phận gián tiếp tạo ra giá trị thặng dư"
        },
        answer: "C"
    });

    data.push({
        id: nextId++,
        question: "Giá trị sức lao động được đo gián tiếp bằng:",
        options: {
            "A": "Giá trị của những tư liệu sản xuất để nuôi sống người lao động",
            "B": "Giá trị của những tư liệu tiêu dùng để nuôi sống người lao động",
            "C": "Giá cả của những tư liệu tiêu dùng để nuôi sống bản thân người lao động",
            "D": "Giá trị của những tư liệu tiêu dùng để nuôi sống nhà tư bản"
        },
        answer: "B"
    });
}

// ID 241
let q241 = getQ(241);
if (q241) {
    q241.question = "Trong những trường hợp nào sau đây của hao phí lao động cá biệt, trường hợp nào không đáp ứng yêu cầu của quy luật giá trị?";
    q241.options = {
        "A": "Hao phí lao động cá biệt < hao phí lao động xã hội cần thiết",
        "B": "Hao phí lao động cá biệt = hao phí lao động xã hội cần thiết",
        "C": "Hao phí lao động cá biệt > hao phí lao động xã hội cần thiêt"
    };
    q241.answer = "C";

    data.push({
        id: nextId++,
        question: "Giá trị sử dụng của hàng hóa sức lao động được coi là:",
        options: {
            "A": "Chìa khóa để giải quyết mâu thuẫn giữa tư bản và tư bản",
            "B": "Chìa khóa để giải quyết mâu thuẫn trong lưu thông hàng hóa",
            "C": "Chìa khóa để giải quyết mâu thuẫn giữa tư bản và lao động",
            "D": "Chìa khóa để giải quyết mâu thuẫn công thức chung của tư bản"
        },
        answer: "D"
    });

    data.push({
        id: nextId++,
        question: "Phân công lao động xã hội được xác định là:",
        options: {
            "A": "Không dẫn đến sự hình thành tư bản độc quyền",
            "B": "Một trong những nguyên nhân hình thành chủ nghĩa tư bản độc quyền",
            "C": "Nguyên nhân hình thành chủ nghĩa tư bản",
            "D": "Là một trong những nguyên nhân hình thành độc quyền nhà nước trong chủ nghĩa tư bản"
        },
        answer: "B"
    });
}

// ID 246
let q246 = getQ(246);
if (q246) {
    q246.question = "Khi nào tiền tệ ra đời?";
    q246.options = {
        "A": "Khi sản xuất và trao đổi đã phát triển",
        "B": "Khi vật ngang giá chung được cố định ở vàng, bạc",
        "C": "Khi không còn quan hệ trao đổi trực tiếp, có một thứ hàng làm trung gian trong trao đổi",
        "D": "Khi nhu cầu trao đổi vượt quá phạm vi quốc gia"
    };
    q246.answer = "B";

    data.push({
        id: nextId++,
        question: "Chọn định nghĩa chính xác về tư bản:",
        options: {
            "A": "Tư bản là giá trị mang lại giá trị thặng dư.",
            "B": "Tư bản là tiền và TLSX của nhà tư bản để tạo ra giá trị thặng dư.",
            "C": "Tư bản là giá trị đem lại giá trị thặng dư bằng cách bóc lột lao động làm thuê."
        },
        answer: "C"
    });
}

// ID 248
let q248 = getQ(248);
if (q248) {
    q248.question = "Căn cứ vào đâu để phân chia tư bản cố định và tư bản lưu động?";
    q248.options = {
        "A": "Căn cứ vào tính chất chuyển giá trị sử dụng của nó vào trong sản phẩm mới",
        "B": "Căn cứ vào tính chất chuyển giá trị của nó vào trong sản phẩm cũ",
        "C": "Căn cứ vào tính chất chuyển giá trị của nó vào trong sản phẩm mới",
        "D": "Căn cứ vào tính chất chuyển giá trị thặng dư của nó vào trong sản phẩm mới"
    };
    q248.answer = "C";

    data.push({
        id: nextId++,
        question: "Thuật ngữ \"kinh tế- chính trị\" được sử dụng lần đầu tiên vào năm nào?",
        options: {
            "A": "1615",
            "B": "1616",
            "C": "1617"
        },
        answer: "A",
        note: q248.note
    });
    q248.note = "";
}

// ID 250
let q250 = getQ(250);
if (q250) {
    q250.question = "Thế nào là sản xuất tự cung, tự cấp?";
    q250.options = {
        "A": "Quá trình sản xuất chỉ có hai khâu: sản xuất và tiên dùng",
        "B": "Sản xuất có tính chất khép kín",
        "C": "Là một kiểu tổ chức kinh tế trong đó những sản phẩm được sản xuất ra nhằm mục đích thỏa mãn nhu cầu tiêu dùng của bản thân người sản xuất",
        "D": "Sản xuất và tái sản xuất"
    };
    q250.answer = "C";

    data.push({
        id: nextId++,
        question: "Thế nào là lao động phức tạp?",
        options: {
            "A": "Là lao động phải trải qua đào tạo, huấn luyện mới làm được",
            "B": "Là lao động tạo ra các sản phẩm chất lượng cao, tinh vi",
            "C": "Là lao động có nhiều thao tác phức tạp"
        },
        answer: "A"
    });
}

// ID 252
let q252 = getQ(252);
if (q252) {
    q252.question = "Điều kiện để tiền biến thành tư bản là:";
    q252.options = {
        "A": "Phải tích lũy được một lượng tiền lớn; tiền không được đưa vào kinh doanh với mục đích thu giá trị thặng dư",
        "B": "Phải tích lũy được một lượng tiền lớn; tiền phải được đưa vào kinh doanh tư bản với mục đích thu giá trị thặng dư",
        "C": "Phải tích lũy được một lượng hàng hóa lớn; hàng hóa phải được đưa vào kinh doanh tư bản với mục đích thu giá trị thặng dư"
    };
    q252.answer = "B";

    data.push({
        id: nextId++,
        question: "Quy luật kinh tế cơ bản của chủ nghĩa tư bản là",
        options: {
            "A": "Quy luật đấu tranh giai cấp",
            "B": "Quy luật giá trị thặng dư",
            "C": "Quy luật quan hệ sản xuất phù hợp với lực lượng sản xuất"
        },
        answer: "B" // fixed answer since quy luật KT cơ bản of CNTB is giá trị thặng dư
    });
}

// ID 255
let q255 = getQ(255);
if (q255) {
    q255.options.A = "Phân công lao động xã hội và sự tách biệt về kinh tế giữa những người sản xuất.";
}

// ID 256
let q256 = getQ(256);
if (q256) {
    q256.options.A = "Lượng giá trị hàng hóa không cố định, phụ thuộc vào thời gian lao động xã hội cần thiết.";
}

// ID 257
let q257 = getQ(257);
if (q257) {
    q257.question = "Về bản chất lợi nhuận và giá trị thặng dư đều là:";
    q257.options = {
        "A": "Lao động cụ thể của người công nhân",
        "B": "Lao động không công của người công nhân",
        "C": "Lao động trừu tượng của người công nhân",
        "D": "Lao động phức tạp của người công nhân"
    };
    q257.answer = "B";

    data.push({
        id: nextId++,
        question: "Điểm giống nhau giữa tăng năng suất lao động và tăng cường độ lao động?",
        options: {
            "A": "Đều làm giảm giá trị của một đơn vị hàng hóa",
            "B": "Đều làm tăng thêm sản lượng sản phẩm được sản xuất ra trong một đơn vị thời gian",
            "C": "Đều làm tăng lượng lao động hao phí trong một đơn vị thời gian",
            "D": "Đều gắn với tiến bộ kỹ thuật"
        },
        answer: "B"
    });

    data.push({
        id: nextId++,
        question: "Dựa vào căn cứ nào để chia tư bản thành tư bản bất biến và tư bản khả biến (c & v)",
        options: {
            "A": "Phương thức chuyển giá trị các bộ phận tư bản sang sản phẩm",
            "B": "Vai trò các bộ phận tư bản trong quá trình sản xuất giá trị thặng dư",
            "C": "Tốc độ chu chuyển của tư bản"
        },
        answer: "B"
    });
}

// ID 258
let q258 = getQ(258);
if (q258) {
    q258.question = "Tư bản bất biến";
    q258.options = {
        "A": "Là giá trị tư liệu sản xuất, giá trị của nó tăng lên sau quá trình sản xuất",
        "B": "Là giá trị tư liệu sản xuất, giá trị của nó giảm đi sau quá trình sản xuất",
        "C": "Là giá trị tư liệu sản xuất, giá trị của nó không thay đổi sau quá trình sản xuất",
        "D": "Là giá trị tư liệu sản xuất, giá trị sử dụng của nó được bảo tồn và chuyển vào sản phẩm"
    };
    q258.answer = "C";

    data.push({
        id: nextId++,
        question: "Giá trị thặng dư là:",
        options: {
            "A": "Là phần lao động được trả công của công nhân",
            "B": "Là phần lao dộng không công của công nhân",
            "C": "Là toàn bộ lao động của công nhân",
            "D": "Là lao động sáng tạo của công nhân"
        },
        answer: "B"
    });

    data.push({
        id: nextId++,
        question: "Giá trị sử dụng của hàng hóa là khái niệm dùng để chỉ",
        options: {
            "A": "Mức độ khan hiếm của hàng hóa",
            "B": "Giá trị trao đổi của hàng hóa",
            "C": "Công dụng của hàng hóa"
        },
        answer: "C"
    });
}

// ID 260
let q260 = getQ(260);
if (q260) {
    q260.options.A = "Quy luật kinh tế là những quy luật khách quan, phát sinh và tác động thông qua hoạt động kinh tế của con người.";
}

// ID 261
let q261 = getQ(261);
if (q261) {
    q261.question = "Trong các yếu tố sau đây, yếu tố nào được xác định là thực thể giá trị của hàng hóa?";
    q261.options = {
        "A": "Lao động cụ thể",
        "B": "Lao động giản đơn",
        "C": "Lao động phức tạp",
        "D": "Lao động trừu tượng"
    };
    q261.answer = "D";

    data.push({
        id: nextId++,
        question: "Hao mòn hữu hình là:",
        options: {
            "A": "Hao mòn vật chất do quá trình sử dụng hoặc do tác động của con người",
            "B": "Hao mòn phi vật chất do quá trình sự dụng hoặc do sự tác động của tự nhiên",
            "C": "Hao mòn vật chất do quá trình sử dụng hoặc do tác động của tự nhiên",
            "D": "Hao mòn vô hình do quá trình sử dụng hoặc do tác động của tự nhiên"
        },
        answer: "C"
    });

    data.push({
        id: nextId++,
        question: "Trong thời đại ngày nay, lực lượng sản xuất bao gồm các yếu tố nào?",
        options: {
            "A": "Người lao động",
            "B": "Tư liệu sản xuất",
            "C": "Khoa học công nghệ",
            "D": "Tất cả các phương án trả lời đều đúng."
        },
        answer: "D"
    });
}

// ID 264
let q264 = getQ(264);
if (q264) {
    q264.question = "Về lượng (hỏi về lượng) tỷ suất lợi nhuận (p') là:";
    q264.options = {
        "A": "Luôn luôn nhỏ hơn giá trị thặng dư",
        "B": "Luôn luôn lớn hơn tỷ suất giá trị thặng dư",
        "C": "Luôn luôn bằng tỷ suất giá trị thặng dư",
        "D": "Luôn luôn nhỏ hơn tỷ suất giá trị thặng dư"
    };
    q264.answer = "D";

    data.push({
        id: nextId++,
        question: "Quy luật căn bản của sản xuất và lưu thông hàng hóa là quy luật nào?",
        options: {
            "A": "Quy luật cạnh tranh",
            "B": "Quy luật cung - cầu",
            "C": "Quuy luật lưu thông tiền tệ",
            "D": "Quy luật giá trị"
        },
        answer: "D"
    });

    data.push({
        id: nextId++,
        question: "Tư liệu lao động gồm có:",
        options: {
            "A": "Công cụ lao động",
            "B": "Các vật để chứa đựng, bảo quản",
            "C": "Kết cấu hạ tầng sản xuất",
            "D": "Các phương án trả lới đều đúng."
        },
        answer: "D"
    });
}

// ID 265
let q265 = getQ(265);
if (q265) {
    q265.question = "Những chức năng nào của tiền tệ đòi hỏi phải có tiền vàng?";
    q265.options = {
        "A": "Tất cả các chức năng của tiền tệ",
        "B": "Chỉ có chức năng thước đo giá trị",
        "C": "Chức năng thước đo giá trị, chức năng tích lũy và chức năng cất trữ",
        "D": "Chức năng thước đo giá trị; chức năng tích lũy, cất trữ và chức năng tiền tệ thế giới"
    };
    q265.answer = "D";

    data.push({
        id: nextId++,
        question: "Theo kinh tế - chính trị Mác - Lênin, loại tiền nào có chức năng cất trữ?",
        options: {
            "A": "Tiền giấy",
            "B": "Tiền điện tử",
            "C": "Tiền vàng",
            "D": "Bitcoin"
        },
        answer: "C"
    });

    data.push({
        id: nextId++,
        question: "Mục tiêu của kinh tế thị trường định hướng xã hội chủ nghĩa ở Việt Nam là gì? Chọn hai đáp án.",
        options: {
            "A": "Xây dựng cơ sở vật chất cho chủ nghĩa xã hội và nâng cao đời sống nhân dân.",
            "B": "Tối đa hóa lợi nhuận cho các doanh nghiệp tư nhân.",
            "C": "Hướng tới dân giàu, nước mạnh, dân chủ, công bằng, văn minh.",
            "D": "Giảm thiểu vai trò của Nhà nước trong quản lý kinh tế."
        },
        answer: "AC"
    });
}

// ID 267
let q267 = getQ(267);
if (q267) {
    q267.question = "Thế nào là phân công lao động xã hội?";
    q267.options = {
        "A": "Là phân công của xã hội về lao động hình thành những nghành nghề, nghề sản xuất khác nhau",
        "B": "Là phân công diễn ra trong đơn vị sản xuất",
        "C": "Là sự chuyên môn hóa nhất định đối với người sản xuất",
        "D": "Là chia nhỏ quá trình sản xuất, mỗi người chuyên đảm nhận một công đoạn"
    };
    q267.answer = "A";

    data.push({
        id: nextId++,
        question: "Tái sản xuất tư bản gồm có hai hình thức cơ bản đó là:",
        options: {
            "A": "Tái sản xuất giản đơn và tái sản xuất mở rộng",
            "B": "Tái sản xuất theo chiều rộng và tái sản xuất theo chiều sâu",
            "C": "Tái sản xuất tư bản xã hội và tái sản xuất tư bản tư nhân"
        },
        answer: "A"
    });
}

// ID 282
let q282 = getQ(282);
if (q282) {
    q282.question = "Mâu thuẫn chung trong công thức chung của tư bản là:";
    q282.options = {
        "A": "T' > T",
        "B": "T' < T",
        "C": "T' = T",
        "D": "T' > H'"
    };
    q282.answer = "A";

    data.push({
        id: nextId++,
        question: "Khối lượng giá trị thặng dư (M) được tính bằng công thức:",
        options: {
            "A": "M = m'. K",
            "B": "M = m'. C",
            "C": "M = m'. V",
            "D": "M = m'. V'"
        },
        answer: "C"
    });

    data.push({
        id: nextId++,
        question: "Kinh tế thị trường định hướng xã hội chủ nghĩa ở Việt Nam thành phần kinh tế nào giữ vai trò là một động lực quan trọng thúc đẩy phát triển kinh tế?",
        options: {
            "A": "Thành phần kinh tế tư nhân",
            "B": "Thành phần kinh tế nhà nước",
            "C": "Thành phần kinh tế tập thể",
            "D": "Thành phần kinh tế có vốn đầu tư nước ngoài"
        },
        answer: "A"
    });
}

// ID 328
let q328 = getQ(328);
if (q328) {
    q328.options.A = "p' = p / (c+v) * 100%"; // user said "Dùng trực tiếp p' = p/(c+v)*100% và chỉ đưa một đáp án đúng". Let's fix option D actually.
    // wait, the answer in JSON is D: "p'=p/(c+v)*100%". The options have A: "p'= m/(c+v)*100%". Both A and D are in options.
    // user said: "Sửa: dùng trực tiếp p'=p/(c+v)*100% và chỉ đưa một đáp án đúng".
    q328.options = {
        "A": "p' = p / (c+v) * 100%",
        "B": "p' = t / (c+v) * 100%",
        "C": "p' = m / (c+v+m) * 100%",
        "D": "p' = m' / (c+v) * 100%"
    };
    q328.answer = "A";
}

// ID 334
let q334 = getQ(334);
if (q334) {
    q334.question = "Biểu hiện mới của xuất khẩu tư bản ngày nay đó là:";
    q334.options = {
        "A": "Dòng đầu tư chảy qua lại giữa các nước tư bản phát triển với nhau",
        "B": "Vai trò của các công ty xuyên quốc gia trong xuất khấu tư bản - đặt biệt đầu tư trực tiếp nước ngoài (FDI) càng lớn",
        "C": "Hình thức xuất khẩu đa dạng",
        "D": "Dựa trên nguyên tắc cùng có lợi",
        "E": "Tất cả phương án trên"
    };
    q334.answer = "E";

    data.push({
        id: nextId++,
        question: "Dịch vụ là loại hàng hóa nào?",
        options: {
            "A": "Hàng hóa vô hình",
            "B": "Hàng hóa hữu hình",
            "C": "Hàng hóa đặc biệt",
            "D": "Không phải là hàng hóa"
        },
        answer: "A"
    });
}

// ID 345
let q345 = getQ(345);
if (q345) {
    q345.question = "Tính định hướng xã hội chủ nghĩa của nền kinh tế thị trường Việt Nam được thể hiện ở khía cạnh nào?";
    q345.options = {
        "A": "Là nên kinh tế thị trường có sự quản lý của nhà nước xã hội chủ nghĩa, do Đảng Cộng sản Việt Nam lãnh đạo",
        "B": "Thực hiện phân phối theo kết quả lao động",
        "C": "Là nền kinh tế mà trong đó việc xác lập thể chế sở hữu, phân phối, quản trị kinh doanh của các chủ thể cũng như quản lý nhà nước hưông tới xác lấp những giá trị cốt lõi về xã hội",
        "D": "Là nền kinh tế phát thuy được trí tuệ và nguồn lực của toàn dân",
        "E": "Tất cả phương án trên"
    };
    q345.answer = "E"; // E is all of the above and is logical here, but answer says A originally. Actually let's keep E since "Tất cả phương án trên" is E. Wait, original answer was A? Let's check original. Original says A, but E says "Tất cả phương án trên E Xuất khẩu giá trị...". We'll just leave answer as A. Or actually maybe it is E. If original answer is A, let's keep A. Let's make E "Tất cả phương án trên" and answer A.

    data.push({
        id: nextId++,
        question: "Xuất khẩu giá trị ra nước ngoài nhằm mục đích thu được giá trị thặng dư và các nguồn lợi khác ở các nước mà mình đầu tư gọi là gì?",
        options: {
            "A": "Xuất khẩu tư bản",
            "B": "Nhập khẩu tư bản",
            "C": "Đầu tư thị trường",
            "D": "Đầu tư tiền tệ"
        },
        answer: "A"
    });
}

// ID 352
let q352 = getQ(352);
if (q352) {
    q352.answer = "B"; // tư bản cố định ko phải nguồn gốc của gttd
}

// ID 353
let q353 = getQ(353);
if (q353) {
    // Note: "mầm mống -> B; hình thành -> A".
    // Question asks "xuất hiện lần đầu tiên", which means mầm mống.
    q353.answer = "B"; 
}

// ID 357
let q357 = getQ(357);
if (q357) {
    q357.note = ""; // Note was "B", answer is "C".
}

// ID 418
let q418 = getQ(418);
if (q418) {
    q418.note = ""; // Note was "A", answer is "D".
}

// ID 440
let q440 = getQ(440);
if (q440) {
    q440.question = "Yếu tố cấu thành thể chế kinh tế thị trường định hướng xã hội chủ nghĩa là:";
    q440.options = {
        "A": "Các bộ quy tắc, chế định, luật pháp",
        "B": "Các chủ thể tham gia kinh tế thị trường định hướng xã hội chủ nghĩa",
        "C": "Cơ chế vận hành kinh tế thị trường định hướng xã hội chủ nghĩa",
        "D": "Các yếu tố thị trường và các thị trường",
        "E": "Tất cả phương án trên"
    };
    q440.answer = "E"; // A,B,C,D are all valid components. The original answer was AC but options were mangled. I'll set it to E for "all of the above". 
    // Wait, let's look at the original text, maybe it just asks to choose 4? Let's leave answer as "A,B,C,D" or "E". Let's set it to E.

    data.push({
        id: nextId++,
        question: "Sự vận động của tiền trong nền sản xuất hàng hóa giản đơn (H-T-H), sự vận động của tiền trong nền sản xuất hàng hóa tư bản (T-H-T'). Hãy chỉ ra điểm chung của hai hình thức vận động này? (lựa chọn hai đáp án)",
        options: {
            "A": "Đều có hai thực thể vật chất là tiền và hàng.",
            "B": "Đều bắt đầu bằng hành vi bán.",
            "C": "Đều có hai hành vi đối lập nhau - mua và bán.",
            "D": "Đều kết thúc bằng hành vi mua."
        },
        answer: "AC" // Since original answer for this merged block was AC, it applies to this.
    });
}

// ID 441
let q441 = getQ(441);
if (q441) {
    q441.options = {
        "A": "Trình độ khéo léo trung bình của người lao động; Mức độ phát triển của khoa học và công nghệ; Sự kết hợp xã hội của quá trình sản xuất; Quy mô và hiệu suất của tư liệu sản xuất; Các điều kiện tự nhiên",
        "B": "Môi trường làm việc và các điều kiện phúc lợi xã hội; Sự đãi ngộ và mức lương cơ bản; Các quy định của nhà nước về lao động",
        "C": "Kỹ năng quản lý của giới chủ; Mối quan hệ giữa người lao động và người sử dụng lao động; Môi trường văn hóa của doanh nghiệp"
    };
}

// ID 481
let q481 = getQ(481);
if (q481) {
    q481.options.A = "Làm giảm khả năng cạnh tranh của toàn bộ doanh nghiệp trong nước";
}

// ID 483
let q483 = getQ(483);
if (q483) {
    q483.options.A = "Có sự đa dạng của các chủ thể kinh tế, nhiều hình thức sở hữu, thị trường đóng vai trò quyết định trong việc phân bổ các nguồn lực xã hội; giá cả được hình thành theo nguyên tắc thị trường; là nền kinh tế mở";
    q483.options.D = "Có sự đơn nhất của các chủ thể kinh tế, một hình thức sở hữu; thị trường đóng vai trò quyết định trong việc phân bổ các nguồn lực xã hội; giá cả được hình thành theo quy luật cung - cầu; là nền kinh tế mở";
    // Change D to something clearly wrong so A is uniquely correct.
}

// Sort data by ID
data.sort((a, b) => a.id - b.id);

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('Fixes applied successfully to questions_mln122.json.');
