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
