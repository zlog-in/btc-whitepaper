// ==========================================
// SHA-256 哈希函数 (纯 JS 实现，支持 UTF-8)
// ==========================================
function sha256(message) {
    function utf8Encode(str) {
        const bytes = [];
        for (let i = 0; i < str.length; i++) {
            let c = str.charCodeAt(i);
            if (c < 128) {
                bytes.push(c);
            } else if (c < 2048) {
                bytes.push((c >> 6) | 192);
                bytes.push((c & 63) | 128);
            } else if (c < 65536) {
                bytes.push((c >> 12) | 224);
                bytes.push(((c >> 6) & 63) | 128);
                bytes.push((c & 63) | 128);
            } else {
                bytes.push((c >> 18) | 240);
                bytes.push(((c >> 12) & 63) | 128);
                bytes.push(((c >> 6) & 63) | 128);
                bytes.push((c & 63) | 128);
            }
        }
        return bytes;
    }

    function rightRotate(value, amount) {
        return (value >>> amount) | (value << (32 - amount));
    }

    let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
    let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

    const k = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];

    const bytes = utf8Encode(message);
    const bitLength = bytes.length * 8;

    bytes.push(0x80);
    while ((bytes.length % 64) !== 56) {
        bytes.push(0);
    }

    // 添加64位长度（大端序）
    // 注意：JavaScript 位移只支持 32 位，需要分开处理高32位和低32位
    const highBits = Math.floor(bitLength / 0x100000000);
    const lowBits = bitLength >>> 0;
    for (let i = 3; i >= 0; i--) {
        bytes.push((highBits >>> (i * 8)) & 0xff);
    }
    for (let i = 3; i >= 0; i--) {
        bytes.push((lowBits >>> (i * 8)) & 0xff);
    }

    for (let chunk = 0; chunk < bytes.length; chunk += 64) {
        const w = new Array(64);

        for (let i = 0; i < 16; i++) {
            w[i] = (bytes[chunk + i * 4] << 24) |
                   (bytes[chunk + i * 4 + 1] << 16) |
                   (bytes[chunk + i * 4 + 2] << 8) |
                   (bytes[chunk + i * 4 + 3]);
        }

        for (let i = 16; i < 64; i++) {
            const s0 = rightRotate(w[i-15], 7) ^ rightRotate(w[i-15], 18) ^ (w[i-15] >>> 3);
            const s1 = rightRotate(w[i-2], 17) ^ rightRotate(w[i-2], 19) ^ (w[i-2] >>> 10);
            w[i] = (w[i-16] + s0 + w[i-7] + s1) | 0;
        }

        let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;

        for (let i = 0; i < 64; i++) {
            const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
            const ch = (e & f) ^ (~e & g);
            const temp1 = (h + S1 + ch + k[i] + w[i]) | 0;
            const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
            const maj = (a & b) ^ (a & c) ^ (b & c);
            const temp2 = (S0 + maj) | 0;

            h = g; g = f; f = e; e = (d + temp1) | 0;
            d = c; c = b; b = a; a = (temp1 + temp2) | 0;
        }

        h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0;
        h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + h) | 0;
    }

    function toHex(n) {
        return ('00000000' + (n >>> 0).toString(16)).slice(-8);
    }

    return toHex(h0) + toHex(h1) + toHex(h2) + toHex(h3) +
           toHex(h4) + toHex(h5) + toHex(h6) + toHex(h7);
}

// ==========================================
// 哈希演示
// ==========================================
const hashInput = document.getElementById('hash-input');
const hashOutput = document.getElementById('hash-output');
const hashBinary = document.getElementById('hash-binary');
const hashVisual = document.getElementById('hash-visual');

let previousHash = '';

function hexToBinary(hex) {
    return hex.split('').map(c =>
        parseInt(c, 16).toString(2).padStart(4, '0')
    ).join('');
}

function updateHashDemo() {
    const input = hashInput.value;
    const hash = sha256(input);
    const binary = hexToBinary(hash);

    if (previousHash && previousHash !== hash) {
        let html = '';
        for (let i = 0; i < 64; i++) {
            const char = hash[i];
            const changed = previousHash[i] !== char;
            html += `<span class="${changed ? 'hash-char changed' : 'hash-char'}">${char}</span>`;
        }
        hashOutput.innerHTML = html;
        hashOutput.classList.add('hash-updated');
        setTimeout(() => hashOutput.classList.remove('hash-updated'), 300);
    } else {
        hashOutput.textContent = hash;
    }

    hashBinary.textContent = binary;
    previousHash = hash;

    // 可视化哈希
    hashVisual.innerHTML = '';
    for (let i = 0; i < 64; i++) {
        const bit = document.createElement('div');
        bit.className = 'hash-bit';
        const value = parseInt(hash[i], 16);
        const hue = (value / 15) * 360;
        bit.style.background = `hsl(${hue}, 70%, 50%)`;
        hashVisual.appendChild(bit);
    }
}

document.getElementById('hash-calc-btn').addEventListener('click', updateHashDemo);

// ==========================================
// 哈希函数特性 - 交互式演示
// ==========================================

// Demo 1: 确定性 (Deterministic)
(function() {
    const input = document.getElementById('det-input');
    const output = document.getElementById('det-output');
    const runBtn = document.getElementById('det-run-btn');
    const countEl = document.getElementById('det-count');
    const resultEl = document.getElementById('det-result');

    if (!runBtn) return;

    let count = 0;
    let lastHash = null;

    runBtn.addEventListener('click', function() {
        const text = input.textContent;
        const hash = sha256(text);
        count++;

        output.textContent = hash;

        const lang = document.documentElement.lang || 'zh-CN';
        const isZh = lang.startsWith('zh');

        countEl.textContent = isZh ? `计算次数: ${count}` : `Runs: ${count}`;

        if (lastHash === null) {
            lastHash = hash;
            resultEl.textContent = '';
        } else if (lastHash === hash) {
            resultEl.textContent = isZh ? '✓ 结果相同！' : '✓ Same result!';
            resultEl.className = 'demo-result success';
        }

        // 动画效果
        output.style.transform = 'scale(1.02)';
        setTimeout(() => output.style.transform = 'scale(1)', 200);
    });
})();

// Demo 2: 快速计算 (Fast)
(function() {
    const countEl = document.getElementById('fast-count');
    const rateEl = document.getElementById('fast-rate');
    const inputEl = document.getElementById('fast-input');
    const outputEl = document.getElementById('fast-output');
    const startBtn = document.getElementById('fast-start-btn');
    const stopBtn = document.getElementById('fast-stop-btn');

    if (!startBtn) return;

    let running = false;
    let totalCount = 0;
    let intervalId = null;
    let rateIntervalId = null;
    let lastCount = 0;

    function runBatch() {
        if (!running) return;

        const batchSize = 100;
        for (let i = 0; i < batchSize; i++) {
            const input = `test_${totalCount}_${Math.random()}`;
            const hash = sha256(input);
            totalCount++;

            if (i === batchSize - 1) {
                inputEl.textContent = input;
                outputEl.textContent = hash;
            }
        }

        countEl.textContent = totalCount.toLocaleString();

        if (running) {
            requestAnimationFrame(runBatch);
        }
    }

    function updateRate() {
        const rate = totalCount - lastCount;
        rateEl.textContent = rate.toLocaleString();
        lastCount = totalCount;
    }

    startBtn.addEventListener('click', function() {
        running = true;
        startBtn.disabled = true;
        stopBtn.disabled = false;
        lastCount = totalCount;

        runBatch();
        rateIntervalId = setInterval(updateRate, 1000);
    });

    stopBtn.addEventListener('click', function() {
        running = false;
        startBtn.disabled = false;
        stopBtn.disabled = true;

        if (rateIntervalId) {
            clearInterval(rateIntervalId);
            rateIntervalId = null;
        }
    });
})();

// Demo 3: 单向性 (One-way)
(function() {
    const inputEl = document.getElementById('oneway-input');
    const outputEl = document.getElementById('oneway-output');
    const unknownEl = document.getElementById('oneway-unknown');
    const demoBtn = document.getElementById('oneway-demo-btn');
    const resultEl = document.getElementById('oneway-result');

    if (!demoBtn) return;

    // 初始化显示
    const secretWord = 'Secret';
    const hash = sha256(secretWord);
    outputEl.textContent = hash.substring(0, 6) + '...';

    let attempts = 0;
    let searching = false;
    let animationId = null;

    demoBtn.addEventListener('click', function() {
        if (searching) return;

        searching = true;
        attempts = 0;

        const lang = document.documentElement.lang || 'zh-CN';
        const isZh = lang.startsWith('zh');

        function tryGuess() {
            if (attempts > 50) {
                unknownEl.textContent = '???';
                resultEl.textContent = isZh ? '✗ 无法反推！' : '✗ Cannot reverse!';
                resultEl.className = 'demo-result fail';
                searching = false;
                return;
            }

            // 显示随机尝试
            const chars = 'abcdefghijklmnopqrstuvwxyz';
            let guess = '';
            for (let i = 0; i < 6; i++) {
                guess += chars[Math.floor(Math.random() * chars.length)];
            }

            unknownEl.textContent = guess;
            attempts++;

            animationId = setTimeout(tryGuess, 50);
        }

        resultEl.textContent = isZh ? '尝试反推中...' : 'Trying to reverse...';
        resultEl.className = 'demo-result';
        tryGuess();
    });
})();

// Demo 4: 雪崩效应 (Avalanche)
(function() {
    const input1 = document.getElementById('avalanche-input1');
    const input2 = document.getElementById('avalanche-input2');
    const hash1El = document.getElementById('avalanche-hash1');
    const hash2El = document.getElementById('avalanche-hash2');
    const inputDiffEl = document.getElementById('avalanche-input-diff');
    const bitsDiffEl = document.getElementById('avalanche-bits-diff');
    const percentEl = document.getElementById('avalanche-percent');
    const visualEl = document.getElementById('avalanche-visual');
    const calcBtn = document.getElementById('avalanche-calc-btn');

    if (!calcBtn) return;

    function countBitDiff(hash1, hash2) {
        let diff = 0;
        const bits1 = hexToBinary(hash1);
        const bits2 = hexToBinary(hash2);

        for (let i = 0; i < bits1.length; i++) {
            if (bits1[i] !== bits2[i]) diff++;
        }
        return { diff, bits1, bits2 };
    }

    function levenshtein(a, b) {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    }

    calcBtn.addEventListener('click', function() {
        const text1 = input1.value;
        const text2 = input2.value;

        const hash1 = sha256(text1);
        const hash2 = sha256(text2);

        hash1El.textContent = hash1;
        hash2El.textContent = hash2;

        // 输入差异
        const inputDiff = levenshtein(text1, text2);

        const lang = document.documentElement.lang || 'zh-CN';
        const isZh = lang.startsWith('zh');

        inputDiffEl.textContent = isZh ? `${inputDiff} 字符` : `${inputDiff} char(s)`;

        // 位差异
        const { diff, bits1, bits2 } = countBitDiff(hash1, hash2);
        bitsDiffEl.textContent = `${diff} / 256 ${isZh ? '位' : 'bits'}`;

        // 百分比
        const percent = ((diff / 256) * 100).toFixed(1);
        percentEl.textContent = `${percent}%`;

        // 可视化
        visualEl.innerHTML = '';
        for (let i = 0; i < 256; i++) {
            const bit = document.createElement('div');
            bit.className = 'avalanche-bit ' + (bits1[i] === bits2[i] ? 'same' : 'diff');
            bit.style.animationDelay = `${i * 2}ms`;
            visualEl.appendChild(bit);
        }
    });

    // 输入变化时自动对比
    input1.addEventListener('input', () => calcBtn.click());
    input2.addEventListener('input', () => calcBtn.click());
})();

// Demo 5: 抗碰撞 (Collision)
(function() {
    const targetEl = document.getElementById('collision-target');
    const tryingEl = document.getElementById('collision-trying');
    const resultEl = document.getElementById('collision-result');
    const attemptsEl = document.getElementById('collision-attempts');
    const foundEl = document.getElementById('collision-found');
    const startBtn = document.getElementById('collision-start-btn');
    const stopBtn = document.getElementById('collision-stop-btn');

    if (!startBtn) return;

    let running = false;
    let attempts = 0;
    let found = 0;
    let target = '';

    function generateTarget() {
        const chars = '0123456789abcdef';
        let t = '';
        for (let i = 0; i < 6; i++) {
            t += chars[Math.floor(Math.random() * 16)];
        }
        return t;
    }

    function search() {
        if (!running) return;

        const batchSize = 50;
        for (let i = 0; i < batchSize; i++) {
            const input = `search_${attempts}_${Math.random()}`;
            const hash = sha256(input);
            attempts++;

            tryingEl.textContent = input.substring(0, 30);
            resultEl.textContent = hash;

            // 检查前6位是否匹配
            if (hash.substring(0, 6) === target) {
                found++;
                foundEl.textContent = found;
                resultEl.innerHTML = `<span style="color: var(--success); font-weight: bold;">${hash.substring(0, 6)}</span>${hash.substring(6)}`;

                // 生成新目标
                target = generateTarget();
                targetEl.textContent = target;
            }
        }

        attemptsEl.textContent = attempts.toLocaleString();

        if (running) {
            requestAnimationFrame(search);
        }
    }

    startBtn.addEventListener('click', function() {
        running = true;
        startBtn.disabled = true;
        stopBtn.disabled = false;

        // 生成新目标
        target = generateTarget();
        targetEl.textContent = target;

        search();
    });

    stopBtn.addEventListener('click', function() {
        running = false;
        startBtn.disabled = false;
        stopBtn.disabled = true;
    });
})();
